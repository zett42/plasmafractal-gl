/*
2D fractal noise image generation and animation. Copyright (c) 2019 zett42.
https://github.com/zett42/PlasmaFractal

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
//-----------------------------------------------------------------------------------------------------------------------
// Dependencies:
//   external/perlin.js
//   external/mersennetwister/MersenneTwister.js
//   z42easing.js	
//   z42color.js
//   z42FractalNoise.js
//-----------------------------------------------------------------------------------------------------------------------
//
// This is the class for generating and animating a plasma. 
// Create an instance of it by calling "new z42plasma()".
//
// The pattern used for encapsulation is described by Douglas Crockford:
// http://crockford.com/javascript/private.html ("Private Members in JavaScript")

function z42Plasma( params ){
	'use strict';
	
	//===================================================================================================================
	// Private options
	//===================================================================================================================
	
	let m_noiseOpt = {
		frequency  : 2,    // increase for smaller structures
		octaves    : 8,    // number of passes (level of detail, typically 1 to 8)
		gain       : 0.4,  // how much amplification for each pass (typically 0.3 to 0.7, default 0.5)
		lacunarity : 2,    // frequency multiplicator for each pass (default 2)	
		amplitude  : 1     // output of noise function (default 1)
	};
	
	const m_easeFunctions = [
		"Linear",
		"InQuad",
		"OutQuad",
		"InOutQuad",
		"InCubic",
		"OutCubic",
		"InOutCubic",
		"InQuart",
		"OutQuart",
		"InOutQuart",
		"InQuint",
		"OutQuint",
		"InOutQuint",
		"InSine",
		"OutSine",
		"InOutSine",
		"InOutSine2_3",
		"InOutSine2_5",
		"InOutSine2_9",
		"InOutSine2_13",
		"InExpo",
		"OutExpo",
		"InOutExpo",
		"InExpo2",
		"OutExpo2",
		"InOutExpo2",
		"InCirc",
		"OutCirc",
		"InOutCirc",
		"InBounce",
		"OutBounce",
		"InOutBounce"
	];

	let m_paletteOpt = {

		easeFunctionBgToFg : "InCubic",
		easeFunctionFgToBg : "OutExpo2",
		
		saturation         : 0.5,
		brightness         : 1.0,
		
		backgroundRGBA     : { r: 0, g: 0, b: 0, a: 255 },
		
		isGrayScale        : false  // Set true for debugging, to see true output of noise function before palette gets applied.
	};

	// Not an option yet, as it is currently bugged for uneven numbers
	const m_paletteColorCount = 2;
	
	let m_animationOpt = {
		
		paletteRotationSpeed    : 0.15,          // Palette rotation speed.
		
		paletteConstantMillis   : 10 * 1000,  // Time in ms during which palette won't change.
		paletteTransitionMillis :  5 * 1000   // Time in ms for palette transition.
	};
	
	//===================================================================================================================
	// Private state variables
	//===================================================================================================================
	
	let m_width  = null;
	let m_height = null;
	let m_plasmaPixels = null;
	
	// Palette size must be big enough to allow for multiple smooth gradients. 
	// 256 entries per color are way too little, because ease function "compress" gradients. In the result, gradients 
	// wouldn't be smooth! For good results the minimum is 1024 entries.
	let m_startPalette      = new Uint32Array( new ArrayBuffer( m_paletteColorCount * 2048 * Uint32Array.BYTES_PER_ELEMENT ) );
	let m_nextPalette       = new Uint32Array( new ArrayBuffer( m_startPalette.length * Uint32Array.BYTES_PER_ELEMENT ) );
	let m_transitionPalette = new Uint32Array( new ArrayBuffer( m_startPalette.length * Uint32Array.BYTES_PER_ELEMENT ) );
	let m_currentPalette    = new Uint32Array( new ArrayBuffer( m_startPalette.length * Uint32Array.BYTES_PER_ELEMENT ) );
	let m_grayScalePalette  = new Uint32Array( new ArrayBuffer( m_startPalette.length * Uint32Array.BYTES_PER_ELEMENT ) );
	let m_paletteCurrentFirstHue = 0;
	
	let m_isPaletteTransition = false;     // Palette currently transitioning to next palette?

	const m_startTime = performance.now();
	let m_paletteStartTime = m_startTime;  // Start time of current phase (constant or transition).

	let m_colorRnd = new MersenneTwister( Math.trunc( params.colorSeed * 0xFFFFFFFF ) );

	// Generate initial palette.
	generatePalette( m_startPalette, m_colorRnd.random() ); 
	z42color.makePaletteGradientRGBA( m_grayScalePalette, 0, m_grayScalePalette.length, {r:0,g:0,b:0,a:255}, {r:255,g:255,b:255,a:255}, z42easing.easeLinear );

	//===================================================================================================================
	// Private Functions
	//===================================================================================================================
	
	// Rotate and cross-fade the palette.

	function animatePalette()
	{
		const curTime         = performance.now();
		const totalDuration   = curTime - m_startTime;
		const paletteDuration = curTime - m_paletteStartTime;		
		let paletteOffset     = totalDuration * m_animationOpt.paletteRotationSpeed * m_startPalette.length / 4096;
	
		let paletteToRotate = null;
	
		if( m_isPaletteTransition )
		{
			if( paletteDuration <= m_animationOpt.paletteTransitionMillis )
			{
				// Still in transition phase.
				let alpha = paletteDuration / m_animationOpt.paletteTransitionMillis;
				z42color.blendPalette( m_startPalette, m_nextPalette, m_transitionPalette, alpha );

				paletteToRotate = m_transitionPalette;
			}
			else
			{
				// Transition phase finished. Start the constant phase.
				m_isPaletteTransition = false;
				m_paletteStartTime = curTime;
				
				// swap m_startPalette, m_nextPalette
				[ m_startPalette, m_nextPalette ] = [ m_nextPalette, m_startPalette ];

				paletteToRotate = m_startPalette;
			}			
		}
		else
		{
			if( paletteDuration > m_animationOpt.paletteConstantMillis )
			{
				// Constant phase finished. Start the transition phase.
				m_isPaletteTransition = true;
				m_paletteStartTime = curTime;

				generatePalette( m_nextPalette, m_colorRnd.random() ); 
			}
			// else still in constant phase. Nothing to do.

			paletteToRotate = m_startPalette;
		}

		z42color.rotatePalette( paletteToRotate, m_currentPalette, paletteOffset );
	}
	
	//-------------------------------------------------------------------------------------------------------------------
	// (Re-)generate the palette without changing the current hue. For simplicity this resets transition animation.

	function updatePalette()
	{
		generatePalette( m_startPalette, m_paletteCurrentFirstHue );
		
		m_isPaletteTransition = false;
		m_paletteStartTime = performance.now();		
	}
	
	//-------------------------------------------------------------------------------------------------------------------
	// Generate a beautiful loopable palette with random start color. Subsequent colors will be generated by adding
	// golden ratio to hue value, which creates nices contrasts.

	function generatePalette( palette, firstHue )
	{
		m_paletteCurrentFirstHue = firstHue;
	
		let colorHsv = { 
			h : firstHue,   
			s : m_paletteOpt.saturation, 
			v : m_paletteOpt.brightness,
			a : 1  // alpha
		};

		const bgToFgFunction = z42easing[ "ease" + m_paletteOpt.easeFunctionBgToFg ];
		const fgToBgFunction = z42easing[ "ease" + m_paletteOpt.easeFunctionFgToBg ];
		
		let palIndex = 0;
		const palRange = palette.length / m_paletteColorCount / 2;

		for( let i = 0; i < m_paletteColorCount; ++i )
		{
			const colorRGBA = z42color.nextGoldenRatioColorRGBA( colorHsv ); 
		
			palIndex = z42color.makePaletteGradientRGBA( palette, palIndex, palRange, m_paletteOpt.backgroundRGBA, colorRGBA, bgToFgFunction );
			palIndex = z42color.makePaletteGradientRGBA( palette, palIndex, palRange, colorRGBA, m_paletteOpt.backgroundRGBA, fgToBgFunction );			
		}
	}
	
	//===================================================================================================================
	// Public functions
	//===================================================================================================================

	// Resize the image buffers to the given size and recreate fractal noise image (grayscale).

	this.resize = function( width, height )
	{
		m_width  = width;
		m_height = height;
		
		m_plasmaPixels = new Uint16Array( new ArrayBuffer( m_width * m_height * Uint16Array.BYTES_PER_ELEMENT ) );

		this.generateNoiseImage();
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Draw animation frame in given 32-bit RGBA image buffer.

	this.drawAnimationFrame = function( targetPixels ) 
	{
		if( m_paletteOpt.isGrayScale )
		{
			z42color.drawImageUint16WithPalette( targetPixels, m_plasmaPixels, m_grayScalePalette );		
		}
		else
		{
			animatePalette();
	
			z42color.drawImageUint16WithPalette( targetPixels, m_plasmaPixels, m_currentPalette );
		}
	}	
	
	//-------------------------------------------------------------------------------------------------------------------
	// (Re-)generate the underlying 16-bit grayscale fractal noise image (typically after call to noise.seed()).
	
	this.generateNoiseImage = function()
	{
		const fracStartTime = performance.now();

		z42fractal.generateFractalNoiseImageUint16( m_plasmaPixels, m_width, m_height, m_currentPalette.length, m_noiseOpt ); 

		console.log( "Fractal generation took %d ms", performance.now() - fracStartTime );
	}
	
	//-------------------------------------------------------------------------------------------------------------------
	// Get / set noise options.

	this.getNoiseOptions = function()
	{
		return m_noiseOpt;
	}

	this.setNoiseOptions = function( opt )
	{
		m_noiseOpt = opt;
		this.generateNoiseImage();
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set palette options.

	this.getPaletteOptions = function()
	{
		return m_paletteOpt;
	}

	this.setPaletteOptions = function( opt )
	{
		m_paletteOpt = opt;
		updatePalette();
	}
	
	// get available ease function names
	this.getAllPaletteEaseFunctions = function()
	{
		return m_easeFunctions;
	}

	//-------------------------------------------------------------------------------------------------------------------
	// Get / set animation options.

	this.getAnimationOptions = function()
	{
		return m_animationOpt;
	}

	this.setAnimationOptions = function( opt )
	{
		if( opt.paletteConstantMillis   != m_animationOpt.paletteConstantMillis ||
		    opt.paletteTransitionMillis != m_animationOpt.paletteTransitionMillis )
		{
			// reset plaette transition animation to avoid some issues
			m_isPaletteTransition = false;  
			m_paletteStartTime = performance.now();
		}
		
		m_animationOpt = opt;
		// Values will be used when drawing next animation frame.
	}
};
