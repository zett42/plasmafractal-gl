/*
2D fractal noise image generation and animation. Copyright (c) 2019 zett42.
https://github.com/zett42/PlasmaFractal2

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

import '../external/mersennetwister/MersenneTwister.js';
import '../external/tinycolor/tinycolor.js';
import '../external/lodash/lodash.min.js';
import './color.js'; 
import './easing.js'; 
import './glUtils.js'; 
import './glColor.js'; 
import './glNoise.js'; 
import './glFractalNoise.js'; 

// For syntax highlighting with glsl-literal extension of VSCode we need to define a glsl template tag.
const glsl = ( strings, ...values ) => String.raw( strings, ...values );

//===================================================================================================================
// This is the class for generating and animating a plasma. 

class PlasmaFractal2D {
	constructor( params ){

		this._noiseSeed = params.noiseSeed;
		this._options = _.cloneDeep( params.options );

		this._startTime = performance.now() / 1000;

		this._paletteTextureSize = 4096;

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

		this._positionBuffer  = gl.createBuffer();
		this._texCoordBuffer  = gl.createBuffer();
		this._paletteTexture  = gl.createTexture();

		this._rebuildShaders();
	}

	//-------------------------------------------------------------------------------------------------------------------

	_rebuildShaders() {
		if( this._program )	{
			this._gl.deleteProgram( this._program );
			this._program = null;
		}

		const noiseFunSrc = z42glNoise[ this._options.noise.noiseFunction ]();
		const fragShaderSrc = z42glFractalNoise.fragmentShader( noiseFunSrc );

		this._program = z42glu.buildShaderProgram( this._gl, this.vertexShaderSrc(), fragShaderSrc );

		this._uf = new z42glu.Uniforms( this._gl, this._program );

		this._updateStaticShaderData();
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Update shader data that normally doesn't change between frames. 

	_updateStaticShaderData() {
		// Activate the pair of vertex and fragment shaders.
		this._gl.useProgram( this._program );		

		this._updateShaderVar_coords();
		this._updateShaderVar_scale();
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Update vertex shader variables for geometry and texture coordinates.

	_updateShaderVar_coords() {

		const gl = this._gl;

		// Look up shader variables.
		const a_position = gl.getAttribLocation ( this._program, "a_position" );
		const a_texCoord = gl.getAttribLocation ( this._program, "a_texCoord" );

		// (Re-)create and activate vertex array object (VAO) that records the following vertex buffer objects (VBO).
		if( this._vao ) gl.deleteVertexArray( this._vao );
		this._vao = gl.createVertexArray();

		gl.bindVertexArray( this._vao );

		//--- Set a vertex buffer to store rectangle coordinates ---
		gl.bindBuffer( gl.ARRAY_BUFFER, this._positionBuffer );
		// Assign data to the buffer.
		z42glu.setBufferRectangle( gl, -1.0, -1.0, 2.0, 2.0 );
		// Enable the attribute.
		gl.enableVertexAttribArray( a_position );
		// Tell the attribute how to get data out of the buffer (ARRAY_BUFFER)
		gl.vertexAttribPointer( a_position, 
			2,          // 2 components per iteration
			gl.FLOAT,   // the data is 32bit floats
			false,      // don't normalize the data
			0,          // 0 = move forward size * sizeof(type) each iteration to get the next position
			0           // start at the beginning of the buffer
		);

		//--- Set a vertex buffer to store texture coordinates ---
		gl.bindBuffer( gl.ARRAY_BUFFER, this._texCoordBuffer );
		// Assign data to the buffer.
		z42glu.setBufferRectangle( gl, -1.0, -1.0, 2.0, 2.0 );
		// Enable the attribute.
		gl.enableVertexAttribArray( a_texCoord );
		// Tell the attribute how to get data out of the buffer (ARRAY_BUFFER)
		gl.vertexAttribPointer( a_texCoord, 
			2,        // 2 components per iteration
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
		const gl     = this._gl;
		const width  = this._canvas.width;
		const height = this._canvas.height;
	
		const u_scale = gl.getUniformLocation( this._program, "u_scale" );

		if( width > height ){
			if( height > 0 )
				gl.uniform2f( u_scale, 1.0, width / height );
		}
		else {
			if( width > 0 )
				gl.uniform2f( u_scale, height / width, 1.0 );
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

		const gl = this._gl;

		// Clear the canvas.
		gl.clearColor( 0, 0, 0, 0 );
		gl.clear( gl.COLOR_BUFFER_BIT) ;

		// Tell it to use our program (pair of shaders).
		gl.useProgram( this._program );
	
		// Bind the attribute/buffer set we want.
		gl.bindVertexArray( this._vao );

		// Set noise parameters.
		this._uf.uniform1i( "u_octaves",    this._options.noise.octaves );
		this._uf.uniform1f( "u_frequency",  this._options.noise.frequency / 2 );         
		this._uf.uniform1f( "u_amplitude",  this._options.noise.amplitude );         
		this._uf.uniform1f( "u_gain",       this._options.noise.gain );              
		this._uf.uniform1f( "u_lacunarity", this._options.noise.lacunarity );     

		// Current time in seconds since start of plasma.
		const time = performance.now() / 1000.0 - this._startTime;

		// Set parameters for noise animation.
		let noiseZ = this._noiseSeed * 50.0;
		let turbulence = 1.0;

		if( this._options.noiseAnim.isNoiseMutation ) {
			noiseZ += time * this._options.noiseAnim.noiseSpeed / 3;
			turbulence = this._options.noiseAnim.turbulence;
		}

		this._uf.uniform1f( "u_noiseZ", noiseZ );
		this._uf.uniform1f( "u_turbulence", turbulence );

		if( this._options.paletteAnim.isRotaEnabled ) {
			const sizeFactor = this._paletteTextureSize / 4096;
			this._uf.uniform1f( "u_paletteOffset", time * this._options.paletteAnim.rotaSpeed * sizeFactor );
		}
		else {
			this._uf.uniform1f( "u_paletteOffset", 0 );
		}

		// Tell the shader which texture units to use.
		this._uf.uniform1i( "u_paletteTexture", 0 );

		let paletteToUse = this._grayScalePalette;
		if( ! this._options.palette.isGrayScale ) {	
			paletteToUse = this._animatePalette();
		}

		// If palette has changed, render it into texture.
		if( ! _.isEqual( this._currentPalette, paletteToUse ) ) {
			this._currentPalette = _.cloneDeep( paletteToUse );

			gl.activeTexture( gl.TEXTURE0 );
			gl.bindTexture( gl.TEXTURE_2D, this._paletteTexture );
			z42glcolor.setPaletteTexture( gl, this._paletteTextureSize, paletteToUse ); 
		}
		
		// Draw the rectangle from the vertex and texture coordinates buffers.
		gl.drawArrays( gl.TRIANGLES, 0, 6 );
	}

	//----------------------------------------------------------------------------------------------

	vertexShaderSrc(){ return glsl`#version 300 es

		precision highp float;

		// Scale factor to adjust for screen aspect ratio and orientation.
		uniform vec2 u_scale;

		// An attribute is an input (in) to a vertex shader.
		// It will receive data from a buffer
		in vec2 a_position;
		in vec2 a_texCoord;

		// Used to pass the texture coordinates to the fragment shader
		out vec2 fragCoord;

		void main() {
			// Scale to adjust for screen aspect ratio and orientation.
			vec2 pos = a_position * u_scale;

			// Define position of the current vertex by assigning to global variable gl_Position 
			gl_Position = vec4( pos, 0, 1 );

			// pass the texCoord to the fragment shader
			// The GPU will interpolate this value between points.
			fragCoord = a_texCoord;
		}
	`}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set noise options.

	get options$noise()
	{
		return _.cloneDeep( this._options.noise );
	}

	set options$noise( opt )
	{
		const needRebuildShaders = ! _.isEqual( this._options.noise.noiseFunction, opt.noiseFunction );

		this._options.noise = _.cloneDeep( opt );

		if( needRebuildShaders ) {
			this._rebuildShaders();
		}
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set palette options.

	get options$palette()
	{
		return _.cloneDeep( this._options.palette );
	}

	set options$palette( opt )
	{
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

	//-------------------------------------------------------------------------------------------------------------------
	// Recreate noise image with new seed.

	reseed( seed ) {
		this._noiseSeed = seed;
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

	// Render a custom palette.

	_generatePaletteCustom( firstHue )	{
		// Create a cloned palette with ease function names resolved to actual functions.
		let result = this._options.palette.customPalette.map( item => ({ 
			pos     : item.pos, 
			color   : { ...item.color },
			easeFun : z42easing[ item.easeFun ] || z42easing.linear
		}));

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