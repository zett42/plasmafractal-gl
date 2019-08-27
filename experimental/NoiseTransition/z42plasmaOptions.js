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

/*
Dependencies:
	z42optionUtils.js
*/

(function(global){
	'use strict';
	
	var module = global.z42plasmaOptions = {};

	//------------------------------------------------------------------------------------------------
	
	module.getDefaultOptions = function()
	{
		let res = {
			noise: {
				frequency  : 0.4,  // increase for smaller structures
				octaves    : 4,    // number of passes (level of detail, typically 1 to 8)
				gain       : 0.5,  // how much amplification for each pass (typically 0.3 to 0.7, default 0.5)
				lacunarity : 2,    // frequency multiplicator for each pass (default 2)	
				amplitude  : 8     // output of noise function (default 1)
			},
			palette: {
				easeFunctionBgToFg : "InBounce",   // function from 'z42ease.js' without 'ease' prefix
				easeFunctionFgToBg : "OutBounce",  // function from 'z42ease.js' without 'ease' prefix
				
				saturation         : 0.5,
				brightness         : 0.75,
				
				bgColor            : 0xff000000,
				
				isGrayScale        : false  // Set true for debugging, to see true output of noise function before palette gets applied.
			},
			paletteAnim: {		
				rotaDuration       : 20 * 1000,  // Time in ms for a full palette rotation.
				transitionDelay    : 10 * 1000,  // Time in ms during which palette colors won't change.
				transitionDuration :  5 * 1000,  // Time in ms for palette color transition.
			},
			noiseAnim: {
				transitionDelay    :  3 * 1000,  // Time in ms during which canvas is not cross-faded.
				transitionDuration : 10 * 1000   // Time in ms for canvas cross-fading.
			}
		};

		// Function from jquery-bbq to deserialize URL parameters.
		const par = module.urlParamsMapper.parseUrlParams( window.location.search );
		if( par )
		{
			console.log( "URL params:", par );

			mergeOptions( res, par );
		}

		console.log( "Merged options:", res );
		return res;
	}
	
	//------------------------------------------------------------------------------------------------

	function mergeOptions( opt, par )
	{
		// Merge default options with URL params.
		// For security, we don't use an automatic method like jQuery.extend(), but validate the parameters individually.
		
		if( par.noise )
		{
			z42opt.mergeNumOption( opt, par, "noise.frequency", 0.001, 1000 );
			z42opt.mergeNumOption( opt, par, "noise.octaves", 1, 32 );
			z42opt.mergeNumOption( opt, par, "noise.gain", 0, 100 );
			z42opt.mergeNumOption( opt, par, "noise.lacunarity", 0.001, 100 );
			z42opt.mergeNumOption( opt, par, "noise.amplitude", 0.001, 100 );
		}
		if( par.palette )
		{
			const allEaseFunctions = module.getAvailablePaletteEaseFunctions();
			
			z42opt.mergeEnumOption( opt, par, "palette.easeFunctionBgToFg", allEaseFunctions );
			z42opt.mergeEnumOption( opt, par, "palette.easeFunctionFgToBg", allEaseFunctions );
			z42opt.mergeNumOption ( opt, par, "palette.saturation", 0, 1 );
			z42opt.mergeNumOption ( opt, par, "palette.brightness", 0, 1 );
			z42opt.mergeNumOption ( opt, par, "palette.bgColor", 0, 0xffffffff );
			z42opt.mergeBoolOption( opt, par, "palette.isGrayScale" );
		}
		if( par.paletteAnim )
		{
			z42opt.mergeNumOption( opt, par, "paletteAnim.rotaDuration" );
			z42opt.mergeNumOption( opt, par, "paletteAnim.transitionDelay" );
			z42opt.mergeNumOption( opt, par, "paletteAnim.transitionDuration" );
		}
		if( par.noiseAnim )
		{
			z42opt.mergeNumOption( opt, par, "noiseAnim.transitionDelay" );
			z42opt.mergeNumOption( opt, par, "noiseAnim.transitionDuration" );
		}
	}

	//------------------------------------------------------------------------------------------------
	
	module.getAvailablePaletteEaseFunctions = function()
	{
		// Ease functions from 'z42ease.js' to use (excluded some which doesn't look good).
		return [
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
	}		
	
	//------------------------------------------------------------------------------------------------

	module.urlParamsMapper = new z42ObjectToUrlParams({
		"noise.frequency"                : "f",
		"noise.octaves"                  : "o",
		"noise.gain"                     : "g",
		"noise.lacunarity"               : "l",
		"noise.amplitude"                : "a",
		"palette.easeFunctionBgToFg"     : "pbf",
		"palette.easeFunctionFgToBg"     : "pfb",
		"palette.saturation"             : "ps",
		"palette.brightness"             : "pb",
		"palette.bgColor"                : "pbg",
		"palette.isGrayScale"            : "pg",
		"paletteAnim.rotaDuration"       : "prd",
		"paletteAnim.transitionDelay"    : "ptde",
		"paletteAnim.transitionDuration" : "ptd",
		"noiseAnim.transitionDelay"      : "ntde",
		"noiseAnim.transitionDuration"   : "ntd"
	});

})(this);
