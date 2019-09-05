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
	// Ease functions from 'z42ease.js' to use (excluded some which doesn't look good).
	
	module.paletteEaseFunctionNames = [
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

	// This describes all available options, e. g. default values, constraints, mapping to URL params.
	// It does NOT store actual option values!

	module.optionsDescriptor = new z42opt.Group({ title: "PlasmaFractal Options" }, {
		noise: new z42opt.Group({ title: "Noise" }, {
			frequency: new z42opt.FloatOpt({ 
				shortKey: "f",
				title: "Frequency",
				min: 0.001,
				max: 1000,
				maxFractionDigits: 3,
				defaultVal: 1
			}),
			octaves: new z42opt.IntOpt({
				shortKey: "o",
				title: "Octaves",
				min: 1,
				max: 32,
				defaultVal: 4
			}),
			gain: new z42opt.FloatOpt({
				shortKey: "g",
				title: "Gain",
				min: 0.001,
				max: 100,
				maxFractionDigits: 3,
				defaultVal: 0.5
			}),
			lacunarity: new z42opt.FloatOpt({
				shortKey: "l",
				title: "Lacunarity",
				min: 0.001,
				max: 100,
				maxFractionDigits: 3,
				defaultVal: 2
			}),
			amplitude: new z42opt.FloatOpt({
				shortKey: "a",
				title: "Amplitude",
				min: 0.001,
				max: 100,
				maxFractionDigits: 3,
				defaultVal: 8
			})
		}),
		palette: new z42opt.Group({ title: "Palette" }, {
			easeFunctionBgToFg: new z42opt.EnumOpt({
				shortKey: "pbf",
				title: "BG to FG easing",
				enumValues: module.paletteEaseFunctionNames,
				defaultVal: "InBounce"
			}),
			easeFunctionFgToBg: new z42opt.EnumOpt({
				shortKey: "pfb",
				title: "FG to BG easing",
				enumValues: module.paletteEaseFunctionNames,
				defaultVal: "OutBounce"
			}),
			saturation: new z42opt.FloatOpt({
				shortKey: "ps",
				title: "Saturation",
				min: 0,
				max: 1,
				maxFractionDigits: 3,
				defaultVal: 0.5
			}),
			brightness: new z42opt.FloatOpt({
				shortKey: "pb",
				title: "Brightness",
				min: 0,
				max: 1,
				maxFractionDigits: 3,
				defaultVal: 0.75
			}),
			bgColor: new z42opt.ColorOpt({
				shortKey: "pbg",
				title: "Background color",
				defaultVal: { r: 0, g: 0, b: 0, a: 1 },
			}),
			isGrayScale: new z42opt.BoolOpt({
				shortKey: "pg",
				title: "Show original grayscale image",
				defaultVal: false
			})
		}),
		paletteAnim: new z42opt.Group({ title: "Palette Animation" }, {
			rotaDuration: new z42opt.IntOpt({
				shortKey: "prd",
				title: "Palette rotation duration",
				min: 2000,
				max: 30000,
				defaultVal: 30 * 1000
			}),
			transitionDelay: new z42opt.IntOpt({
				shortKey: "ptde",
				title: "Palette transition delay",
				min: 0,
				max: 30000,
				defaultVal: 10 * 1000
			}),
			transitionDuration: new z42opt.IntOpt({
				shortKey: "ptd",
				title: "Palette transition duration",
				min: 100,
				max: 30000,
				defaultVal: 5 * 1000
			}),
		}),
		noiseAnim: new z42opt.Group({ title: "Noise Animation" }, {
			transitionDelay: new z42opt.IntOpt({
				shortKey: "ntde",
				title: "Noise transition delay",
				min: 0,
				max: 30000,
				defaultVal: 3 * 1000
			}),
			transitionDuration: new z42opt.IntOpt({
				shortKey: "ntd",
				title: "Noise transition duration",
				min: 100,
				max: 30000,
				defaultVal: 10 * 1000
			})
		})
	});

	//------------------------------------------------------------------------------------------------
	
	module.getDefaultOptions = function()
	{
		let result = {};
		z42opt.setDefaultOptions( result, module.optionsDescriptor );

		console.log( "Default options:", JSON.parse( JSON.stringify( result ) ) );

		// Deserialize and validate URL parameters.	
		const par = z42opt.optionsFromUrlParams( window.location.search, module.optionsDescriptor );
		if( par )
		{
			console.log( "URL params:", JSON.parse( JSON.stringify( par ) ) );

			z42opt.mergeObjectData( result, par );

			console.log( "Merged options:", JSON.parse( JSON.stringify( result ) ) );
		}

		return result;
	}	
	
})(this);
