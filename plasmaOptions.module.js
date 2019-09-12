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
import * as z42pal from './components/optionsDescriptorPalette.module.js'

//------------------------------------------------------------------------------------------------
// Ease functions from 'z42ease.js' to use (excluded some which doesn't look good).
// Map to short keys for serializing to URL params.

const paletteEaseFunctions = {
	linear       : { shortKey: "l"     , title: "Linear"                        },
	inQuad       : { shortKey: "i2"    , title: "Quadratic [in]"                },
	outQuad      : { shortKey: "o2"    , title: "Quadratic [out]"               },
	inOutQuad    : { shortKey: "io2"   , title: "Quadratic [in/out]"            },
	inCubic      : { shortKey: "i3"    , title: "Cubic [in]"                    },
	outCubic     : { shortKey: "o3"    , title: "Cubic [out]"                   },
	inOutCubic   : { shortKey: "io3"   , title: "Cubic [in/out]"                },
	inQuart      : { shortKey: "i4"    , title: "Quartic [in]"                  },
	outQuart     : { shortKey: "o4"    , title: "Quartic [out]"                 },
	inOutQuart   : { shortKey: "io4"   , title: "Quartic [in/out]"              },
	inQuint      : { shortKey: "i5"    , title: "Quintic [in]"                  },
	outQuint     : { shortKey: "o5"    , title: "Quintic [out]"                 },
	inOutQuint   : { shortKey: "io5"   , title: "Quintic [in/out]"              },
	inSine       : { shortKey: "is"    , title: "Sine [in]"                     },
	outSine      : { shortKey: "os"    , title: "Sine [out]"                    },
	inOutSine    : { shortKey: "ios"   , title: "Sine [in/out]"                 },
	inOutSine2_3 : { shortKey: "ios23" , title: "Sine(x) + Sine(x*3)  [in/out]" },
	inOutSine2_5 : { shortKey: "ios25" , title: "Sine(x) + Sine(x*5)  [in/out]" },
	inOutSine2_9 : { shortKey: "ios29" , title: "Sine(x) + Sine(x*9)  [in/out]" },
	inOutSine2_13: { shortKey: "ios213", title: "Sine(x) + Sine(x*13) [in/out]" },
	inExpo       : { shortKey: "ie"    , title: "Exponential [in]"              },
	outExpo      : { shortKey: "oe"    , title: "Exponential [out]"             },
	inOutExpo    : { shortKey: "ioe"   , title: "Exponential [in/out]"          },
	inExpo2      : { shortKey: "ie2"   , title: "Double Exponential [in]"       },
	outExpo2     : { shortKey: "oe2"   , title: "Double Exponential [out]"      },
	inOutExpo2   : { shortKey: "ioe2"  , title: "Double Exponential [in/out]"   },
	inCirc       : { shortKey: "ic"    , title: "Circular [in]"                 },
	outCirc      : { shortKey: "oc"    , title: "Circular [out]"                },
	inOutCirc    : { shortKey: "ioc"   , title: "Circular [in/out]"             },
	inBounce     : { shortKey: "ib"    , title: "Bounce [in]"                   },
	outBounce    : { shortKey: "ob"    , title: "Bounce [out]"                  },
	inOutBounce  : { shortKey: "iob"   , title: "Bounce [in/out]"               },
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
			min: 0.1,
			max: 1.0,
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
		isGrayScale: new z42opt.BoolOpt({
			uniqueShortKey: "pg",
			title: "Show original grayscale image",
			defaultVal: false,
		}),
		isCustom: new z42opt.BoolOpt({
			uniqueShortKey: "icp",
			title: "Custom palette",
			defaultVal: false,
			isRendered: options => ! options.palette.isGrayScale,
		}),		
		easeFunctionBgToFg: new z42opt.EnumOpt({
			uniqueShortKey: "pbf",
			title: "Background to foreground easing",
			values: paletteEaseFunctions,
			defaultVal: "inBounce",
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		easeFunctionFgToBg: new z42opt.EnumOpt({
			uniqueShortKey: "pfb",
			title: "Foreground to background easing",
			values: paletteEaseFunctions,
			defaultVal: "outBounce",
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		saturation: new z42opt.FloatOpt({
			uniqueShortKey: "ps",
			title: "Saturation",
			min: 0,
			max: 1,
			maxFractionDigits: 2,
			defaultVal: 0.5,
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		brightness: new z42opt.FloatOpt({
			uniqueShortKey: "pb",
			title: "Brightness",
			min: 0,
			max: 1,
			maxFractionDigits: 2,
			defaultVal: 0.75,
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		bgColor: new z42opt.ColorOpt({
			uniqueShortKey: "pbg",
			title: "Background color",
			defaultVal: { r: 0, g: 0, b: 0, a: 1 },
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		customPalette: new z42pal.PaletteOpt({
			uniqueShortKey: "cp",
			easeFunctions: paletteEaseFunctions,
			defaultEaseFunction: "linear",
			defaultVal: [],
			isRendered: options => options.palette.isCustom && ! options.palette.isGrayScale,
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
			isRendered: options => ! options.palette.isCustom,
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
			isRendered: options => ! options.palette.isCustom,
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