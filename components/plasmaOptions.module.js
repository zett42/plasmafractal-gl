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

import * as z42opt from './optionsDescriptorValues.module.js'
import * as z42pal from './optionsDescriptorPalette.module.js'

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

const noiseFunctions = {
	perlin3D   : { shortKey: "p3", title: "Perlin 3D" },
	value3D    : { shortKey: "v3", title: "Value 3D" },
	cellular3D : { shortKey: "c3", title: "Cellular 3D" },
};

//------------------------------------------------------------------------------------------------
// Describes all available options, e. g. default values, constraints, mapping to URL params, etc.
// It does NOT store actual option values!

const optionsDescriptor = new z42opt.Node( {}, {
	noise: new z42opt.Node( {}, {
		noiseFunction: new z42opt.EnumOpt({
			shortKey: "n",
			title: "Noise function",
			values: noiseFunctions,
			defaultVal: "perlin3D",
		}),
		frequency: new z42opt.FloatOpt({ 
			shortKey: "f",
			title: "Frequency",
			min: 0.01,
			max: 15,
			maxDecimals: 2,
			isScale: true,
			scaleNormalPos: 0.33,
			defaultVal: 1.5,
		}),
		octaves: new z42opt.IntOpt({
			shortKey: "o",
			title: "Octaves",
			min: 1,
			max: 15,
			defaultVal: 10,
		}),
		gain: new z42opt.FloatOpt({
			shortKey: "g",
			title: "Gain",
			min: 0.1,
			max: 1.0,
			maxDecimals: 2,
			defaultVal: 0.5,
		}),
		lacunarity: new z42opt.FloatOpt({
			shortKey: "l",
			title: "Lacunarity",
			min: 1,
			max: 10,
			maxDecimals: 2,
			defaultVal: 2,
		}),
		amplitude: new z42opt.FloatOpt({
			shortKey: "a",
			title: "Amplitude",
			min: 1,
			max: 100,
			maxDecimals: 1,
			defaultVal: 1,
		}),
	}),
	palette: new z42opt.Node( {}, {
		isGrayScale: new z42opt.BoolOpt({
			shortKey: "pg",
			title: "Show original grayscale image",
			defaultVal: false,
		}),
		isCustom: new z42opt.BoolOpt({
			shortKey: "icp",
			title: "Custom palette",
			defaultVal: false,
			isRendered: options => ! options.palette.isGrayScale,
		}),		
		easeFunctionBgToFg: new z42opt.EnumOpt({
			shortKey: "pbf",
			title: "Background to foreground easing",
			values: paletteEaseFunctions,
			defaultVal: "inBounce",
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		easeFunctionFgToBg: new z42opt.EnumOpt({
			shortKey: "pfb",
			title: "Foreground to background easing",
			values: paletteEaseFunctions,
			defaultVal: "outBounce",
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		saturation: new z42opt.FloatOpt({
			shortKey: "ps",
			title: "Saturation",
			min: 0,
			max: 1,
			maxDecimals: 2,
			defaultVal: 0.5,
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		brightness: new z42opt.FloatOpt({
			shortKey: "pb",
			title: "Brightness",
			min: 0,
			max: 1,
			maxDecimals: 2,
			defaultVal: 1.0,
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		bgColor: new z42opt.ColorOpt({
			shortKey: "pbg",
			title: "Background color",
			defaultVal: { r: 0, g: 0, b: 0, a: 1 },
			isRendered: options => ! options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		customPalette: new z42pal.PaletteOpt({
			shortKey: "cp",
			easeFunctions: paletteEaseFunctions,
			defaultEaseFunction: "linear",
			defaultVal: [],
			isRendered: options => options.palette.isCustom && ! options.palette.isGrayScale,
		}),
		isCustomPaletteAnimated: new z42opt.BoolOpt({
			shortKey: "acp",
			title: "Animate custom palette (random hue offset)",
			defaultVal: false,
			isRendered: options => options.palette.isCustom && ! options.palette.isGrayScale,
		}),		
	}),
	noiseAnim: new z42opt.Node( {}, {
		isNoiseMutation: new z42opt.BoolOpt({
			shortKey: "inm",
			title: "Mutate noise",
			defaultVal: true,
		}),
		noiseSpeed: new z42opt.FloatOpt({
			shortKey: "ns",
			title: "Noise mutation speed",
			min: 0,
			max: 1,
			maxDecimals: 2,
			isSlow: true,
			defaultVal: 0.05,
			isRendered: options => options.noiseAnim.isNoiseMutation
		}),
		turbulence: new z42opt.FloatOpt({
			shortKey: "ntu",
			title: "Noise turbulence",
			min: 1.0,
			max: 2.5,
			maxDecimals: 2,
			isSlow: true,
			defaultVal: 1.85,
			isRendered: options => options.noiseAnim.isNoiseMutation
		}),
	}),
	paletteAnim: new z42opt.Node( {}, {
		isRotaEnabled: new z42opt.BoolOpt({
			shortKey: "ipr",
			title: "Rotate palette",
			defaultVal: false,
		}),		
		rotaSpeed: new z42opt.FloatOpt({
			shortKey: "prs",
			title: "Palette rotation speed",
			min: 0,
			max: 1,
			maxDecimals: 2,
			isSlow: true,
			defaultVal: 0.1,
			isRendered: options => options.paletteAnim.isRotaEnabled,
		}),
		transitionDelay: new z42opt.DurationOpt({
			shortKey: "ptde",
			title: "Palette transition delay",
			min: 0,
			max: 30,
			displayUnit: "s",
			maxDecimals: 1,
			isSlow: true,
			defaultVal: 10,
			isRendered: options => ! options.palette.isCustom || options.palette.isCustomPaletteAnimated,
		}),
		transitionDuration: new z42opt.DurationOpt({
			shortKey: "ptd",
			title: "Palette transition duration",
			min: 0.1,
			max: 30,
			displayUnit: "s",
			maxDecimals: 1,
			isSlow: true,
			defaultVal: 5,
			isRendered: options => ! options.palette.isCustom || options.palette.isCustomPaletteAnimated,
		}),
	}),
});

//------------------------------------------------------------------------------------------------
// Describes the GUI structure of the options.

const optionsView = {
	title: "PlasmaFractal Options",
	moreInfoLinkUrl: "https://github.com/zett42/plasmafractal-gl",
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
			options: [ "noiseAnim", "paletteAnim" ],

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
