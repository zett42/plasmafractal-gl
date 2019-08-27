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
				
				bgColor            : 0x000000,
				
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
		
		console.log( "Default options:", JSON.parse( JSON.stringify( res ) ) );

		// Deserialize and validate URL parameters.
		const par = module.urlParamsMapper.parseUrlParams( window.location.search );
		if( par )
		{
			console.log( "URL params:", JSON.parse( JSON.stringify( par ) ) );

			z42opt.mergeObjectData( res, par );

			console.log( "Merged options:", JSON.parse( JSON.stringify( res ) ) );
		}

		return res;
	}		
	
	//------------------------------------------------------------------------------------------------
	// Ease functions from 'z42ease.js' to use (excluded some which doesn't look good).
	
	module.availablePaletteEaseFunctions = [
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
	
	//------------------------------------------------------------------------------------------------
	// Define mapping of options to URL parameters for permalinks.

	module.urlParamsMapper = new z42ObjectToUrlParams({
		"noise.frequency": { 
			urlKey: "f",
			type: "float",
			min: 0.001,
			max: 1000,
			maxFractionDigits: 3
		},
		"noise.octaves": {
			urlKey: "o",
			type: "int",
			min: 1,
			max: 32
		},
		"noise.gain": {
			urlKey: "g",
			type: "float",
			min: 0.001,
			max: 100,
			maxFractionDigits: 3
		},
		"noise.lacunarity": {
			urlKey: "l",
			type: "float",
			min: 0.001,
			max: 100,
			maxFractionDigits: 3
		},
		"noise.amplitude": {
			urlKey: "a",
			type: "float",
			min: 0.001,
			max: 100,
			maxFractionDigits: 3
		},
		"palette.easeFunctionBgToFg": {
			urlKey: "pbf",
			type: "enum",
			enumValues: module.availablePaletteEaseFunctions
		},
		"palette.easeFunctionFgToBg": {
			urlKey: "pfb",
			type: "enum",
			enumValues: module.availablePaletteEaseFunctions
		},
		"palette.saturation": {
			urlKey: "ps",
			type: "float",
			min: 0,
			max: 1,
			maxFractionDigits: 3
		},
		"palette.brightness": {
			urlKey: "pb",
			type: "float",
			min: 0,
			max: 1,
			maxFractionDigits: 3
		},
		"palette.bgColor": {
			urlKey: "pbg",
			type: "rgbColor"
		},
		"palette.isGrayScale": {
			urlKey: "pg",
			type: "boolean"
		},
		"paletteAnim.rotaDuration": {
			urlKey: "prd",
			type: "int"
		},
		"paletteAnim.transitionDelay": {
			urlKey: "ptde",
			type: "int"
		},
		"paletteAnim.transitionDuration": {
			urlKey: "ptd",
			type: "int"
		},
		"noiseAnim.transitionDelay": {
			urlKey: "ntde",
			type: "int"
		},
		"noiseAnim.transitionDuration": {
			urlKey: "ntd",
			type: "int"
		}
	});
	

})(this);
