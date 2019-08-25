function getDefaultPlasmaOptions()
{
	return {
		noiseOpt: {
			frequency  : 0.3,    // increase for smaller structures
			octaves    : 4,    // number of passes (level of detail, typically 1 to 8)
			gain       : 0.5,  // how much amplification for each pass (typically 0.3 to 0.7, default 0.5)
			lacunarity : 2,    // frequency multiplicator for each pass (default 2)	
			amplitude  : 8     // output of noise function (default 1)
		},
		paletteOpt: {
			easeFunctionBgToFg : "InBounce",   // function from 'z42ease.js' without 'ease' prefix
			easeFunctionFgToBg : "OutBounce",  // function from 'z42ease.js' without 'ease' prefix
			
			saturation         : 0.5,
			brightness         : 0.75,
			
			backgroundRGBA     : { r: 0, g: 0, b: 0, a: 255 },
			
			isGrayScale        : false  // Set true for debugging, to see true output of noise function before palette gets applied.
		},
		paletteAnimOpt: {		
			rotaDuration       : 20 * 1000,  // Time in ms for a full palette rotation.
			transitionDelay    : 10 * 1000,  // Time in ms during which palette colors won't change.
			transitionDuration :  5 * 1000,  // Time in ms for palette color transition.
		},
		noiseAnimOpt: {
			transitionDelay    :  3 * 1000,  // Time in ms during which canvas is not cross-faded.
			transitionDuration : 10 * 1000   // Time in ms for canvas cross-fading.
		}
	}
}