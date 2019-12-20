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
import createShader from 'gl-shader';
import injectDefines from 'glsl-inject-defines';

import * as z42color from './color.js'; 
import * as z42easing  from "./easing.js";
import * as z42glu from './glUtils.js'; 
import * as z42glcolor from './glColor.js'; 

import vertexShaderSrc from './glPlasmaVertex.glsl'
import fragShaderSrc from './glPlasmaFrag.glsl'

//===================================================================================================================
// This is the class for generating and animating a plasma. 

class PlasmaFractal2D {
	constructor( params ){

		this._noiseSeed = params.noiseSeed;
		this._warpSeed  = params.warpSeed;
		this._warpSeed2 = params.warpSeed2;
		this._options   = _.cloneDeep(params.options);

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

		// Disable unused features
		gl.disable( gl.BLEND );
		gl.disable( gl.DEPTH_TEST );
		gl.depthMask( gl.FALSE );
		gl.stencilMask( gl.FALSE );

		this._positionBuffer     = gl.createBuffer();
		this._texCoordBuffer     = gl.createBuffer();
		
		this._paletteTexture     = gl.createTexture();
		// Palette texture is 1-dimensional so we could use max. possible size for best quality.
		// I still like to have some control over this value, so I limit it anyway.
		this._paletteTextureSize = Math.min( gl.getParameter( gl.MAX_TEXTURE_SIZE ), 32768 );
		
		this._rebuildShaders();
	}

	//-------------------------------------------------------------------------------------------------------------------

	_rebuildShaders() {
	
		let mapToPaletteFun = 'mapToPaletteMinusOneToOne';
		if( this._options.noise.noiseFunction == 'Cellular3D' ) {
			mapToPaletteFun = 'identity';
		}

		const fragShaderSrcTransformed = injectDefines(fragShaderSrc, {
			BASE_NOISE_FUN     : this._options.noise.noiseFunction,
			NOISE_CLAMP_FUN    : this._options.noise.isClamp ? 'clampZeroOne' : 'identity',
			MAP_TO_PALETTE_FUN : mapToPaletteFun,
			WARP_NOISE_FUN     : this._options.warp.noiseFunction,
			WARP_TRANSFORM_FUN : this._options.warp.isEnabled ? this._options.warp.transformFunction : 'identity',
			WARP2_NOISE_FUN    : this._options.warp2.noiseFunction,
			WARP2_TRANSFORM_FUN: this._options.warp2.isEnabled ? this._options.warp2.transformFunction : 'identity',
		});

		//console.log('vertexShaderSrc', vertexShaderSrc)		
		console.log('fragShaderSrcTransformed: ', fragShaderSrcTransformed)		

		if( this._shader ) {
			this._shader.update( vertexShaderSrc, fragShaderSrcTransformed )
		}
		else {
			this._shader = createShader( this._gl, vertexShaderSrc, fragShaderSrcTransformed );
		}

		//console.log( "uniforms:", this._shader.uniforms );

		this._updateStaticShaderData();
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Update shader data that normally doesn't change between frames. 

	_updateStaticShaderData() {
		// Activate the pair of vertex and fragment shaders.
		this._shader.bind();

		this._updateShaderVar_coords();
		this._updateShaderVar_scale();
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Update vertex shader variables for geometry and texture coordinates.

	_updateShaderVar_coords() {

		const gl = this._gl;

		// (Re-)create and activate vertex array object (VAO) that records the following vertex buffer objects (VBO).
		if( this._vao ) gl.deleteVertexArray( this._vao );
		this._vao = gl.createVertexArray();

		gl.bindVertexArray( this._vao );

		//--- Set a vertex buffer to store rectangle coordinates ---
		gl.bindBuffer( gl.ARRAY_BUFFER, this._positionBuffer );
		// Assign data to the buffer.
		z42glu.setBufferRectangle( gl, -1.0, -1.0, 2.0, 2.0 );
		// Tell the attribute how to get data out of the buffer (ARRAY_BUFFER)
		this._shader.attributes.a_position.pointer(
			gl.FLOAT,   // the data is 32bit floats
			false,      // don't normalize the data
			0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
			0           // start at the beginning of the buffer
		);

		//--- Set a vertex buffer to store texture coordinates ---
		gl.bindBuffer( gl.ARRAY_BUFFER, this._texCoordBuffer );
		// Assign data to the buffer.
		z42glu.setBufferRectangle( gl, -1.0, -1.0, 2.0, 2.0 );
		// Tell the attribute how to get data out of the buffer (ARRAY_BUFFER)
		this._shader.attributes.a_texCoord.pointer(
			gl.FLOAT, // the data is 32bit floats
			false,    // don't normalize the data
			0,        // 0 = move forward size * sizeof(type) each iteration to get the next position
			0         // start at the beginning of the buffer
		);

		// We are finished setting up the VAO. It is not required, but considered good practice to
		// set the current VAO to null.
		gl.bindVertexArray( null ); 
	}	

	//-------------------------------------------------------------------------------------------------------------------
	// Update vertex shader variable to adjust for canvas aspect ratio and orientation.

	_updateShaderVar_scale() {
		const width  = this._canvas.width;
		const height = this._canvas.height;
	
		if( width > height ){
			if( height > 0 )
				this._shader.uniforms.u_scale = [ 1.0, width / height ];
		}
		else {
			if( width > 0 )
				this._shader.uniforms.u_scale = [ height / width, 1.0 ];
		}
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

		this._gl.viewport( 0, 0, width, height );

		this._updateShaderVar_scale();
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Draw animation frame in given 32-bit RGBA image buffer.

	drawAnimationFrame() {

		// Current time in seconds since start of plasma.
		const time = performance.now() / 1000.0 - this._startTime;

		const gl = this._gl;

		// Tell WebGL to use our program (pair of shaders).
		this._shader.bind();

		//····· Set noise parameters ····································································

		this.setShaderArgs_noise( 'u_noise', this._options.noise, this._options.noiseAnim, this._noiseSeed, time );

		//····· Set domain warp parameters ····································································

		if( this._options.warp.isEnabled ) {
			this.setShaderArgs_warp( 'u_warp',  this._options.warp,  this._options.warpAnim,  this._warpSeed,  time );
		}
		if( this._options.warp2.isEnabled ) {
			this.setShaderArgs_warp( 'u_warp2', this._options.warp2, this._options.warpAnim2, this._warpSeed2, time );
		}

		//····· Apply palette options ··························································· 

		this.setShaderArgs_palette( time );

		//····· Render ············································································· 
		
		// Clear the canvas.
		gl.clearColor( 0, 0, 0, 0 );
		gl.clear( gl.COLOR_BUFFER_BIT) ;
		
		// Bind the attribute/buffer set we want.
		gl.bindVertexArray( this._vao );

		// Draw the rectangle from the vertex and texture coordinates buffers.
		gl.drawArrays( gl.TRIANGLES, 0, 6 );
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Set shader arguments for base noise.

	setShaderArgs_noise( uniformName, warpOpt, warpAnimOpt, warpSeed, time ) {

		const uf = this._shader.uniforms[ uniformName ];

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

		const uf = this._shader.uniforms[ uniformName ];

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

		if( this._options.paletteAnim.isRotaEnabled && ! this._options.noise.isClamp ) {
			const sizeFactor = this._paletteTextureSize / 4096;
			this._shader.uniforms.u_paletteOffset = time * this._options.paletteAnim.rotaSpeed * sizeFactor;
		}
		else {
			this._shader.uniforms.u_paletteOffset = 0.0;
		}

		// Tell the shader which texture units to use.
		this._shader.uniforms.u_paletteTexture = 0;

		let paletteToUse = this._grayScalePalette;
		if( ! this._options.palette.isGrayScale ) {	
			paletteToUse = this._animatePalette();
		}

		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this._paletteTexture );

		// If palette has changed, render it into texture.

		const paletteIsRepeat = ! this._options.noise.isClamp;

		if( ! _.isEqual([ this._currentPalette, this._currentPaletteIsRepeat ],
						[ paletteToUse,         paletteIsRepeat  ]) ) {

			this._currentPalette = _.cloneDeep( paletteToUse );
			this._currentPaletteIsRepeat = paletteIsRepeat;	

			z42glcolor.setPaletteTexture( gl, this._paletteTextureSize, paletteToUse, paletteIsRepeat );
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

		const needRebuildShaders = ! _.isEqual( 
			[ this._options.warp.isEnabled, this._options.warp.noiseFunction, this._options.warp.transformFunction ], 
			[ opt.isEnabled               , opt.noiseFunction,                opt.transformFunction                ] 
		);

		this._options.warp = _.cloneDeep( opt );

		if( needRebuildShaders ) {
			this._rebuildShaders();
		}
	}

	get options$warp2() {
		return _.cloneDeep(this._options.warp2);
	}

	set options$warp2(opt) {

		const needRebuildShaders = !_.isEqual(
			[this._options.warp2.isEnabled, this._options.warp2.noiseFunction, this._options.warp2.transformFunction],
			[opt.isEnabled, opt.noiseFunction, opt.transformFunction]
		);

		this._options.warp2 = _.cloneDeep(opt);

		if (needRebuildShaders) {
			this._rebuildShaders();
		}
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