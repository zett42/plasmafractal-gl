/*
2D fractal noise image generation and animation. Copyright (c) 2019 zett42.
https://github.com/zett42/plasmafractal-gl

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 
*/

import MersenneTwister from 'mersennetwister';
import * as tinycolor from 'tinycolor2';
import * as _ from 'lodash';
import injectDefines from 'glsl-inject-defines';

import * as z42color from './color.js'; 
import * as z42easing  from "./easing.js";
import * as z42glu from './glUtils.js'; 
import * as z42glcolor from './glColor.js'; 

import plasmaVertexShaderSrc from './glPlasmaVertexShader.glsl'
import plasmaFragShaderSrc from './glPlasmaFragShader.glsl'

import postVertexShaderSrc from './glPostVertexShader.glsl'
import postFragShaderSrc from './glPostFragShader.glsl'

//===================================================================================================================
// This is the class for generating and animating a plasma. 

class PlasmaFractal2D {
	constructor( params ){

		this._noiseSeed    = params.noiseSeed;
		this._warpSeed     = params.warpSeed;
		this._warpSeed2    = params.warpSeed2;
		this._feedbackSeed = params.feedbackSeed;
		this._options      = _.cloneDeep(params.options);

		this._startTime = performance.now() / 1000;

		this._initPalettes( params.colorSeed );

		this._initCanvasGl( params.canvas );

		this.resize( params.width, params.height, true );
	}

	//-------------------------------------------------------------------------------------------------------------------

	_initPalettes( colorSeed ) {

		this._paletteRndColorCount = 2;
		
		this._startPalette      = [];
		this._nextPalette       = [];
		this._currentPalette    = [];

		this._grayScalePalette = [
			{   
				pos: 0.0,
				color: { r: 0, g: 0, b: 0, a: 1 },
				easeFun: z42easing.linear
			},
			{   
				pos: 1.0,
				color: { r: 255, g: 255, b: 255, a: 1 },
				easeFun: z42easing.linear
			}			
		];

		this._paletteCurrentFirstHue = 0;

		this._colorRnd = new MersenneTwister( Math.trunc( colorSeed * 0xFFFFFFFF ) );
		
		// Generate initial palette.
		this._startPalette = this._generatePalette( this._colorRnd.random() * 360 ); 
		
		this._isPaletteTransition = false;     // Palette currently transitioning to next palette?
		this._paletteStartTime = this._startTime;  // Start time of current phase (constant or transition).

		this._currentPaletteIsRepeat = null;
	}

	//-------------------------------------------------------------------------------------------------------------------

	_initCanvasGl( canvas ) {
		this._canvas = canvas;

		const gl = this._gl = canvas.getContext( "webgl2" );

		//--- Disable unused features ---

		gl.disable( gl.BLEND );
		gl.disable( gl.DEPTH_TEST );
		gl.depthMask( gl.FALSE );
		gl.stencilMask( gl.FALSE );

		//--- Enable extensions ---

		this._extColorBufferFloat = gl.getExtension( 'EXT_color_buffer_float' );		
		console.log( 'EXT_color_buffer_float:', this._extColorBufferFloat );

		this._extTextureFloatLinear = gl.getExtension( 'OES_texture_float_linear' );		
		console.log( 'OES_texture_float_linear:', this._extTextureFloatLinear );

		this._isFloatTexture = this._extColorBufferFloat && this._extTextureFloatLinear;

		//--- Create vertex and texture coordinate buffers ---

		this._positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this._positionBuffer );
		z42glu.setBufferRectangle( gl, -1.0, -1.0, 2.0, 2.0 );    // fills entire viewport
		
		//--- Create and configure textures ---

		this._paletteTexture     = gl.createTexture();	
		this._renderTexture      = gl.createTexture();
		this._feedbackTexture    = gl.createTexture();

		gl.activeTexture( gl.TEXTURE0 );

		gl.bindTexture( gl.TEXTURE_2D, this._renderTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

		gl.bindTexture( gl.TEXTURE_2D, this._feedbackTexture );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

		// Palette texture is 1-dimensional so we could use max. possible size for best quality.
		// I still like to have some control over this value, so I limit it anyway.
		this._paletteTextureSize = Math.min( gl.getParameter( gl.MAX_TEXTURE_SIZE ), 32768 );

		//--- Create the framebuffer and assign the render texture ---

		this._frameBuffer = gl.createFramebuffer();
		gl.bindFramebuffer( gl.FRAMEBUFFER, this._frameBuffer );		
		gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._renderTexture, 0 );		

		//--- Create initial version of shaders ---

		this._rebuildShaders();
	}

	//-------------------------------------------------------------------------------------------------------------------

	_rebuildShaders() {
	
		// Create defines that are used to compose the shader of functions which can be selected by options.

		const useFunctionIf = ( condition, functionName ) => condition ? functionName : 'identity';

		const plasmaFragShaderSrcTransformed = injectDefines( plasmaFragShaderSrc, {
			BASE_NOISE_FUN         : this._options.noise.noiseFunction,
			NOISE_CLAMP_FUN        : useFunctionIf( this._options.noise.isClamp, 'clampZeroOne' ),
			MAP_TO_PALETTE_FUN     : useFunctionIf( this._options.noise.noiseFunction != 'Cellular3D', 'mapToPaletteMinusOneToOne' ),

			WARP_NOISE_FUN         : this._options.warp.noiseFunction,
			WARP_NOISE_DERIV_FUN   : 'Deriv' + this._options.warp.noiseFunction,
			WARP_TRANSFORM_FUN     : useFunctionIf( this._options.warp.isEnabled, this._options.warp.transformFunction ),

			WARP2_NOISE_FUN        : this._options.warp2.noiseFunction,
			WARP2_NOISE_DERIV_FUN  : 'Deriv' + this._options.warp2.noiseFunction,
			WARP2_TRANSFORM_FUN    : useFunctionIf( this._options.warp2.isEnabled, `${this._options.warp2.transformFunction}2` ),

			FEEDBACK_FUN           : useFunctionIf( this._options.feedback.isEnabled, 'applyFeedback' ),

			WARPFB_NOISE_FUN       : this._options.feedback.warp.noiseFunction,
			WARPFB_NOISE_DERIV_FUN : 'Deriv' + this._options.feedback.warp.noiseFunction,
			WARPFB_TRANSFORM_FUN   : useFunctionIf( this._options.feedback.isEnabled && this._options.feedback.warp.isEnabled,
													`${this._options.feedback.warp.transformFunction}FB` ),
		});

		//console.log( 'plasmaVertexShaderSrc', plasmaVertexShaderSrc )		
		//console.log( 'plasmaFragShaderSrcTransformed: ', plasmaFragShaderSrcTransformed )		

		this._plasmaShader = z42glu.createOrUpdateShader( this._gl, this._plasmaShader, plasmaVertexShaderSrc, plasmaFragShaderSrcTransformed );
		//console.log( "plasmaShader uniforms:", this._plasmaShader.uniforms );

		this._postShader = z42glu.createOrUpdateShader( this._gl, this._postShader, postVertexShaderSrc, postFragShaderSrc );
		//console.log( "postShader uniforms:", this._postShader.uniforms );
	}

	//===================================================================================================================
	// Public methods

	//-------------------------------------------------------------------------------------------------------------------
	// Resize the canvas, update WebGL viewport and scale.

	resize( width, height, force = false ) {

		if( width == this._canvas.width && height == this._canvas.height && ! force ) {
			return;
		}
		if( width <= 0 || height <= 0 )
			return;

		width  = Math.trunc( width );
		height = Math.trunc( height );
		
		this._canvas.width  = width;
		this._canvas.height = height;

		const gl = this._gl;

		gl.viewport( 0, 0, width, height );
		

		// Resize textures

		gl.activeTexture( gl.TEXTURE0 );

		gl.bindTexture( gl.TEXTURE_2D, this._renderTexture );
		if( this._isFloatTexture ) {
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null );
		}
		else {
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
		}

		gl.bindTexture( gl.TEXTURE_2D, this._feedbackTexture );
		if( this._isFloatTexture ) {
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null );
		}
		else {
			gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
		}
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Draw animation frame in given 32-bit RGBA image buffer.

	drawAnimationFrame() {

		// Current time in seconds since start of plasma.
		const time = performance.now() / 1000.0 - this._startTime;

		const gl = this._gl;

		// Tell WebGL to use our program (pair of shaders).
		this._plasmaShader.bind();
		

		//····· Set scale factors to adjust for screen aspect ratio ······

		const width  = this._canvas.width;
		const height = this._canvas.height;
	
		if( width > height ){
			if( height > 0 )
				this._plasmaShader.uniforms.u_scale = [ 1.0, height / width ];
		}
		else {
			if( width > 0 )
				this._plasmaShader.uniforms.u_scale = [ width / height, 1.0 ];
		}		


		//····· Apply shader options ·····

		this.setShaderArgs_noise( 'u_noise', this._options.noise, this._options.noiseAnim, this._noiseSeed, time );

		if( this._options.warp.isEnabled ) {
			this.setShaderArgs_warp( 'u_warp',  this._options.warp,  this._options.warpAnim,  this._warpSeed,  time );
		}
		
		if( this._options.warp2.isEnabled ) {
			this.setShaderArgs_warp( 'u_warp2', this._options.warp2, this._options.warpAnim2, this._warpSeed2, time );
		}

		if( this._options.feedback.isEnabled ) {
			this._plasmaShader.uniforms.u_fbInputBrightness  = this._options.feedback.blending.inputBrightness;
			this._plasmaShader.uniforms.u_feedbackBrightness = this._options.feedback.blending.feedbackBrightness;

			if( this._options.feedback.warp.isEnabled ) {
				this.setShaderArgs_warp( 'u_warpFB', this._options.feedback.warp, this._options.feedbackAnim, this._feedbackSeed, time );
			}
		}

		this.setShaderArgs_palette( time );


		//····· Draw noise in render texture ····· 

		// activate frame buffer to render to texture
		gl.bindFramebuffer( gl.FRAMEBUFFER, this._frameBuffer );
		
		// Clear the framebuffer.
		gl.clearColor( 0, 0, 0, 0 );
		gl.clear( gl.COLOR_BUFFER_BIT) ;
		
		// Bind the textures that the fragment shader will use.

		this._plasmaShader.uniforms.u_paletteTexture  = 0;
		this._plasmaShader.uniforms.u_feedbackTexture = 1;

		gl.activeTexture( gl.TEXTURE0 + this._plasmaShader.uniforms.u_paletteTexture );
		gl.bindTexture( gl.TEXTURE_2D, this._paletteTexture );

		gl.activeTexture( gl.TEXTURE0 + this._plasmaShader.uniforms.u_feedbackTexture );
		gl.bindTexture( gl.TEXTURE_2D, this._feedbackTexture );

		// Bind the position buffer.

		gl.bindBuffer( gl.ARRAY_BUFFER, this._positionBuffer );
		this._plasmaShader.attributes.a_position.pointer();		

		// Draw the rectangle from the vertex and texture coordinates buffers.
		gl.drawArrays( gl.TRIANGLES, 0, 6 );


		if( this._options.feedback.isEnabled ) {

			//····· Copy render texture to feedback texture ····· 

			gl.activeTexture( gl.TEXTURE0 + this._plasmaShader.uniforms.u_feedbackTexture );
			gl.bindTexture( gl.TEXTURE_2D, this._feedbackTexture );
			gl.copyTexSubImage2D( gl.TEXTURE_2D, 0, 0, 0, 0, 0, width, height ); 
		}

		//····· Draw render texture in canvas ·····
		
		// Deactivate the frame buffer to render to the canvas
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );		

		// Clear the canvas
		gl.clearColor( 0, 0, 0, 0 );
		gl.clear( gl.COLOR_BUFFER_BIT) ;

		// Tell WebGL to use our program (pair of shaders).
		this._postShader.bind();

		// Bind the texture that the fragment shader will use.

		this._postShader.uniforms.u_renderTexture = 0;
		gl.activeTexture( gl.TEXTURE0 + this._postShader.uniforms.u_renderTexture );
		gl.bindTexture( gl.TEXTURE_2D, this._renderTexture );

		// Bind the position buffer.

		gl.bindBuffer( gl.ARRAY_BUFFER, this._positionBuffer );
		this._postShader.attributes.a_position.pointer();

		// Draw the rectangle from the vertex and texture coordinates buffers.
		gl.drawArrays( gl.TRIANGLES, 0, 6 );
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Set shader arguments for base noise.

	setShaderArgs_noise( uniformName, warpOpt, warpAnimOpt, warpSeed, time ) {

		const uf = this._plasmaShader.uniforms[ uniformName ];

		uf.basic.octaves = Math.trunc(this._options.noise.octaves);
		uf.basic.octavesFract = this._options.noise.octaves % 1;
		uf.basic.frequency = this._options.noise.frequency / 2;
		uf.basic.gain = this._options.noise.gain;
		uf.basic.lacunarity = this._options.noise.lacunarity;
		uf.basic.angle = this._options.noise.angle * 2 * Math.PI / 360;
		uf.amplitude = this._options.noise.amplitude;

		// Set parameters for noise animation.
		let anim = this._noiseSeed * 50.0;
		let turbulence = 1.0;

		if (this._options.noiseAnim.isEnabled) {
			anim += time * this._options.noiseAnim.noiseSpeed / 3;
			turbulence = this._options.noiseAnim.turbulence;
		}

		uf.anim = anim;
		uf.basic.turbulence = turbulence;
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Set shader arguments for domain warping.

	setShaderArgs_warp( uniformName, warpOpt, warpAnimOpt, warpSeed, time ) {

		const uf = this._plasmaShader.uniforms[ uniformName ];

		uf.basic.octaves = Math.trunc( warpOpt.octaves );
		uf.basic.octavesFract = warpOpt.octaves % 1;
		uf.basic.frequency = warpOpt.frequency * this._options.noise.frequency;
		uf.basic.gain = warpOpt.gain;
		uf.basic.lacunarity = warpOpt.lacunarity;
		uf.amplitude = warpOpt.amplitude * 0.01;
		uf.rotation = warpOpt.rotation * Math.PI;

		let anim = warpSeed * 50.0;
		let turbulence = 1.0;

		if( warpAnimOpt.isEnabled ) {
			anim += time * warpAnimOpt.noiseSpeed / 3;
			turbulence = warpAnimOpt.turbulence;
		}

		uf.anim = anim;
		uf.basic.turbulence = turbulence;
	}	

	//-------------------------------------------------------------------------------------------------------------------
	// Set shader arguments for palette and set palette texture.

	setShaderArgs_palette( time ) {

		const gl = this._gl;

		// Set palette animation.

		if( this._options.paletteAnim.isRotaEnabled && ! this._options.noise.isClamp ) {
			const sizeFactor = this._paletteTextureSize / 4096;
			this._plasmaShader.uniforms.u_paletteOffset = time * this._options.paletteAnim.rotaSpeed * sizeFactor;
		}
		else {
			this._plasmaShader.uniforms.u_paletteOffset = 0.0;
		}

		// If palette has changed, render it into texture.

		let paletteToUse = this._grayScalePalette;
		if( ! this._options.palette.isGrayScale ) {	
			paletteToUse = this._animatePalette();
		}

		const paletteIsRepeat = ! this._options.noise.isClamp;

		if( ! _.isEqual([ this._currentPalette, this._currentPaletteIsRepeat ],
						[ paletteToUse,         paletteIsRepeat  ]) ) {

			this._currentPalette = _.cloneDeep( paletteToUse );
			this._currentPaletteIsRepeat = paletteIsRepeat;	

			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, this._paletteTexture );

			z42glcolor.setPaletteTexture( gl, this._paletteTextureSize, paletteToUse, paletteIsRepeat );
			//z42glcolor.setPaletteTexture( gl, this._paletteTextureSize, paletteToUse, paletteIsRepeat, this._isFloatTexture );
		}
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set noise options.

	get options$noise()	{
		return _.cloneDeep( this._options.noise );
	}

	set options$noise( opt ) {

		const needRebuildShaders = ! _.isEqual(
			[ this._options.noise.noiseFunction, this._options.noise.isClamp ], 
			[ opt.noiseFunction,                 opt.isClamp ]);

		this._options.noise = _.cloneDeep( opt );

		if( needRebuildShaders ) {
			this._rebuildShaders();
		}
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set domain warp options.

	get options$warp() {
		return _.cloneDeep( this._options.warp );
	}

	set options$warp( opt )	{

		const needRebuildShaders = this._needRebuildShaderForWarpOptions( this._options.warp, opt );

		this._options.warp = _.cloneDeep( opt );

		if( needRebuildShaders ) {
			this._rebuildShaders();
		}
	}

	get options$warp2() {
		return _.cloneDeep(this._options.warp2);
	}

	set options$warp2(opt) {

		const needRebuildShaders = this._needRebuildShaderForWarpOptions( this._options.warp2, opt );

		this._options.warp2 = _.cloneDeep(opt);

		if (needRebuildShaders) {
			this._rebuildShaders();
		}
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set feedback options.

	get options$feedback() {
		return _.cloneDeep(this._options.feedback);
	}

	set options$feedback(opt) {

		const needRebuildShaders = this._needRebuildShaderForWarpOptions( this._options.feedback.warp, opt );

		this._options.feedback = _.cloneDeep(opt);

		if (needRebuildShaders) {
			this._rebuildShaders();
		}
	}

	//-------------------------------------------------------------------------------------------------------------------

	_needRebuildShaderForWarpOptions( warpOld, warpNew ) {

		return ! _.isEqual( 
			[ warpOld.isEnabled, warpOld.noiseFunction, warpOld.transformFunction ], 
			[ warpNew.isEnabled, warpNew.noiseFunction, warpNew.transformFunction ] 
		);		
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set palette options.

	get options$palette() {
		return _.cloneDeep( this._options.palette );
	}

	set options$palette( opt ) {
		this._options.palette = _.cloneDeep( opt );

		// (Re-)generate the palette without changing the current hue.
		this._startPalette = this._generatePalette( this._paletteCurrentFirstHue );
		
		// We reset the transition animation for simplicity.
		this._isPaletteTransition = false;
		this._paletteStartTime = performance.now() / 1000;		
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set animation options.

	get options$paletteAnim() {
		return _.cloneDeep( this._options.paletteAnim );
	}

	set options$paletteAnim( opt ) {
		if( opt.transitionDelay != this._options.paletteAnim.transitionDelay ||
			opt.transitionDuration != this._options.paletteAnim.transitionDuration )
		{
			// reset plaette transition animation to avoid some issues
			this._isPaletteTransition = false;  
			this._paletteStartTime = performance.now() / 1000;
		}
		
		this._options.paletteAnim = _.cloneDeep( opt );
		// Values will be used when drawing next animation frame.
	}

	get options$noiseAnim()	{
		return _.cloneDeep( this._options.noiseAnim );
	}	

	set options$noiseAnim( opt ) {
		this._options.noiseAnim = _.cloneDeep( opt );
	}

	get options$warpAnim()	{
		return _.cloneDeep( this._options.warpAnim );
	}	

	set options$warpAnim( opt ) {
		this._options.warpAnim = _.cloneDeep( opt );
	}

	get options$warpAnim2() {
		return _.cloneDeep(this._options.warpAnim2);
	}

	set options$warpAnim2(opt) {
		this._options.warpAnim2 = _.cloneDeep(opt);
	}

	get options$feedbackAnim() {
		return _.cloneDeep(this._options.feedbackAnim);
	}

	set options$feedbackAnim(opt) {
		this._options.feedbackAnim = _.cloneDeep(opt);
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Rotate and cross-fade the palette.

	_animatePalette() {

		const curTime         = performance.now() / 1000;
		const paletteDuration = curTime - this._paletteStartTime;		
	
		if( this._isPaletteTransition ) {
			if( paletteDuration <= this._options.paletteAnim.transitionDuration ) {
				// Still in transition phase.
				const alpha = paletteDuration / this._options.paletteAnim.transitionDuration;
				return z42color.blendPaletteDef( this._startPalette, this._nextPalette, alpha );
			}
			else {
				// Transition phase finished. Start the constant phase.
				this._isPaletteTransition = false;
				this._paletteStartTime = curTime;
				
				// swap this._startPalette, this._nextPalette
				[ this._startPalette, this._nextPalette ] = [ this._nextPalette, this._startPalette ];

				return this._startPalette;
			}			
		}
		else {
			if( paletteDuration > this._options.paletteAnim.transitionDelay ) {
				// Constant phase finished. Start the transition phase.
				this._isPaletteTransition = true;
				this._paletteStartTime = curTime;

				this._nextPalette = this._generatePalette( this._colorRnd.random() * 360 ); 
			}
			// else still in constant phase. Nothing to do.

			return this._startPalette;
		}
	}
		
	//-------------------------------------------------------------------------------------------------------------------

	_generatePalette( firstHue )
	{
		this._paletteCurrentFirstHue = firstHue;

		if( this._options.palette.isCustom )
			return this._generatePaletteCustom( firstHue );
		else
			return this._generatePaletteRandom( firstHue );
	}

	// Generate palette from custom palette options.

	_generatePaletteCustom( firstHue )	{
		// Create a cloned palette with ease function names resolved to actual functions.
		const result = this._options.palette.customPalette.map( item => {
			const res = _.cloneDeep( item );
			res.easeFun = z42easing[ res.easeFun ] || z42easing.linear 
			return res;
		});

		if( this._options.palette.isCustomPaletteAnimated ) {
			for( let item of result ){
				let hsv = tinycolor( item.color ).toHsv();
				hsv.h = ( hsv.h + firstHue ) % 360;
				item.color = tinycolor( hsv ).toRgb();
			}
		}

		return result;
	}

	// Generate a beautiful loopable palette with random start color. Subsequent colors will be generated by adding
	// golden ratio to hue value, which creates nices contrasts.
	
	_generatePaletteRandom( firstHue )	{
		let result = [];

		let colorHsv = { 
			h : firstHue,   
			s : this._options.palette.saturation, 
			v : this._options.palette.brightness,
			a : 1  // alpha
		};

		const bgToFgFunction = z42easing[ this._options.palette.easeFunctionBgToFg ];
		const fgToBgFunction = z42easing[ this._options.palette.easeFunctionFgToBg ];
		
		const subRange = 1.0 / this._paletteRndColorCount;
		const subRangeHalf = subRange / 2;

		for( let i = 0; i < this._paletteRndColorCount; ++i ){
			const colorRGBA = z42color.nextGoldenRatioColorRGBA( colorHsv ); 
		
			result.push({
				pos: i * subRange,
				color: { ...this._options.palette.bgColor },
				easeFun: bgToFgFunction || z42easing.linear 
			});
			result.push({
				pos: i * subRange + subRangeHalf,
				color: colorRGBA,
				easeFun: fgToBgFunction || z42easing.linear 
			});
		}

		return result;
	}	
}

//-------------------------------------------------------------------------------------------------------------------

export {
	PlasmaFractal2D
}