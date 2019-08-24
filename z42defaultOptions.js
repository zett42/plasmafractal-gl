function getDefaultPlasmaOptions()
{
	return {
		noiseOpt: {
			frequency  : 2,    // increase for smaller structures
			octaves    : 8,    // number of passes (level of detail, typically 1 to 8)
			gain       : 0.4,  // how much amplification for each pass (typically 0.3 to 0.7, default 0.5)
			lacunarity : 2,    // frequency multiplicator for each pass (default 2)	
			amplitude  : 1     // output of noise function (default 1)
		},
		paletteOpt: {
			easeFunctionBgToFg : "InCubic",   // function from 'z42ease.js' without 'ease' prefix
			easeFunctionFgToBg : "OutExpo2",  // function from 'z42ease.js' without 'ease' prefix
			
			saturation         : 0.5,
			brightness         : 0.75,
			
			backgroundRGBA     : { r: 0, g: 0, b: 0, a: 255 },
			
			isGrayScale        : false  // Set true for debugging, to see true output of noise function before palette gets applied.
		},
		paletteAnimOpt: {		
			rotaDuration       : 20 * 1000,  // Time in ms for a full palette rotation.
			constDuration      : 10 * 1000,  // Time in ms during which palette colors won't change.
			transitionDuration :  5 * 1000,  // Time in ms for palette color transition.
		},
		noiseAnimOpt: {
			constDuration      : 15 * 1000,  // Time in ms during which canvas is not cross-faded.
			transitionDuration :  5 * 1000   // Time in ms for canvas cross-fading.
		}
	}
}