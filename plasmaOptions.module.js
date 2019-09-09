/*
PlasmaFractal options module. Copyright (c) 2019 zett42.
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

import * as z42opt from './components/optionsDescriptorValues.module.js'

//------------------------------------------------------------------------------------------------
// Ease functions from 'z42ease.js' to use (excluded some which doesn't look good).
// Map to short keys for serializing to URL params.

const paletteEaseFunctionNames = {
	Linear       : "l",
	InQuad       : "i2",
	OutQuad      : "o2",
	InOutQuad    : "io2",
	InCubic      : "i3",
	OutCubic     : "o3",
	InOutCubic   : "io3",
	InQuart      : "i4",
	OutQuart     : "o4",
	InOutQuart   : "io4",
	InQuint      : "i5",
	OutQuint     : "o5",
	InOutQuint   : "io5",
	InSine       : "is",
	OutSine      : "os",
	InOutSine    : "ios",
	InOutSine2_3 : "ios23",
	InOutSine2_5 : "ios25",
	InOutSine2_9 : "ios29",
	InOutSine2_13: "ios213",
	InExpo       : "ie",
	OutExpo      : "oe",
	InOutExpo    : "ioe",
	InExpo2      : "ie2",
	OutExpo2     : "oe2",
	InOutExpo2   : "ioe2",
	InCirc       : "ic",
	OutCirc      : "oc",
	InOutCirc    : "ioc",
	InBounce     : "ib",
	OutBounce    : "ob",
	InOutBounce  : "iob",
};

//------------------------------------------------------------------------------------------------
// Describes all available options, e. g. default values, constraints, mapping to URL params, etc.
// It does NOT store actual option values!

const optionsDescriptor = new z42opt.Node( {}, {
	noise: new z42opt.Node( {}, {
		frequency: new z42opt.FloatOpt({ 
			uniqueShortKey: "f",
			title: "Frequency",
			min: 0.01,
			max: 15,
			maxFractionDigits: 2,
			isScale: true,
			scaleNormalPos: 0.33,
			isSlow: true,
			defaultVal: 1.5,
		}),
		octaves: new z42opt.IntOpt({
			uniqueShortKey: "o",
			title: "Octaves",
			min: 1,
			max: 15,
			isSlow: true,
			defaultVal: 5,
		}),
		gain: new z42opt.FloatOpt({
			uniqueShortKey: "g",
			title: "Gain",
			min: 0.2,
			max: 0.8,
			maxFractionDigits: 3,
			isSlow: true,
			defaultVal: 0.5,
		}),
		lacunarity: new z42opt.FloatOpt({
			uniqueShortKey: "l",
			title: "Lacunarity",
			min: 1,
			max: 10,
			maxFractionDigits: 2,
			isSlow: true,
			defaultVal: 2,
		}),
		amplitude: new z42opt.FloatOpt({
			uniqueShortKey: "a",
			title: "Amplitude",
			min: 1,
			max: 100,
			maxFractionDigits: 2,
			isSlow: true,
			defaultVal: 1,
		}),
	}),
	palette: new z42opt.Node( {}, {
		easeFunctionBgToFg: new z42opt.EnumOpt({
			uniqueShortKey: "pbf",
			title: "Background to foreground easing",
			values: paletteEaseFunctionNames,
			defaultVal: "InBounce",
		}),
		easeFunctionFgToBg: new z42opt.EnumOpt({
			uniqueShortKey: "pfb",
			title: "Foreground to background easing",
			values: paletteEaseFunctionNames,
			defaultVal: "OutBounce",
		}),
		saturation: new z42opt.FloatOpt({
			uniqueShortKey: "ps",
			title: "Saturation",
			min: 0,
			max: 1,
			maxFractionDigits: 2,
			defaultVal: 0.5,
		}),
		brightness: new z42opt.FloatOpt({
			uniqueShortKey: "pb",
			title: "Brightness",
			min: 0,
			max: 1,
			maxFractionDigits: 2,
			defaultVal: 0.75,
		}),
		bgColor: new z42opt.ColorOpt({
			uniqueShortKey: "pbg",
			title: "Background color",
			defaultVal: { r: 0, g: 0, b: 0, a: 1 },
		}),
		isGrayScale: new z42opt.BoolOpt({
			uniqueShortKey: "pg",
			title: "Show original grayscale image",
			defaultVal: false,
		}),
	}),
	noiseAnim: new z42opt.Node( {}, {
		// TODO: these should be FloatOpt instead		
		transitionDelay: new z42opt.IntOpt({
			uniqueShortKey: "ntde",
			title: "Noise transition delay",
			min: 0,
			max: 30000,
			displayFactor: 0.001,
			displayUnit: "s",
			maxFractionDigits: 1,
			step: 100,
			isSlow: true,
			defaultVal: 3 * 1000,
		}),
		transitionDuration: new z42opt.IntOpt({
			uniqueShortKey: "ntd",
			title: "Noise transition duration",
			min: 100,
			max: 30000,
			displayFactor: 0.001,
			displayUnit: "s",
			maxFractionDigits: 1,
			step: 100,
			isSlow: true,
			defaultVal: 10 * 1000,
		}),
	}),
	paletteAnim: new z42opt.Node( {}, {
		// TODO: these should be FloatOpt instead		
		rotaDuration: new z42opt.IntOpt({
			uniqueShortKey: "prd",
			title: "Palette rotation duration",
			min: 2 * 1000,
			max: 120 * 1000,
			displayFactor: 0.001,
			displayUnit: "s",
			maxFractionDigits: 1,
			step: 100,
			defaultVal: 80 * 1000,
		}),
		transitionDelay: new z42opt.IntOpt({
			uniqueShortKey: "ptde",
			title: "Palette transition delay",
			min: 0,
			max: 30 * 1000,
			displayFactor: 0.001,
			displayUnit: "s",
			maxFractionDigits: 1,
			step: 100,
			isSlow: true,
			defaultVal: 10 * 1000,
		}),
		transitionDuration: new z42opt.IntOpt({
			uniqueShortKey: "ptd",
			title: "Palette transition duration",
			min: 100,
			max: 30 * 1000,
			displayFactor: 0.001,
			displayUnit: "s",
			maxFractionDigits: 1,
			step: 100,
			isSlow: true,
			defaultVal: 5 * 1000,
		}),
	}),
});

//------------------------------------------------------------------------------------------------
// Describes the GUI structure of the options.

const optionsView = {
	title: "PlasmaFractal Options",
	moreInfoLinkUrl: "https://github.com/zett42/PlasmaFractal2",
	moreInfoLinkText: "GitHub Project",
	
	//Group components can be customized, this is the default:
	//component: "z42opt-tabs",

	groups: {
		noiseTab: {
			title: "Noise",
			options: [ "noise" ]
		},
		paletteTab: {
			title: "Palette",
			options: [ "palette" ]
		},
		animTab: {
			title: "Animation",

			// This creates a flat view of the palette and noise anim options:
			options: [ "paletteAnim", "noiseAnim" ],

			/* This would create nested tabs instead:
			groups: {
				paletteAnimGrp: {
					title: "Palette",
					options: [ "paletteAnim" ]
				},
				noiseAnimGrp: {
					title: "Noise",
					options: [ "noiseAnim" ]
				}
			},
			*/
		},
	}
};

//------------------------------------------------------------------------------------------------

export {
	optionsDescriptor,
	optionsView,
}