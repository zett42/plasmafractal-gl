/*
2D fractal noise image generation. Copyright (c) 2019 zett42.
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

(function(){
	'use strict';
	
	// For compatibility with WebWorkers, where 'window' is not available, use 'self' instead.
	// Also module import from WebWorkers isn't widely supported yet, so we keep this an "old-school" module. 
	var module = self.z42fractalNoise = {};
	
	//----------------------------------------------------------------------------------------------------------------
	/// Generate a grayscale fractal noise image.
	
	module.generateFractalNoiseImageUint16 = function( destPixelsUint16, width, height, outputRange, params )
	{
		if( destPixelsUint16.length < width * height )
		{
			console.assert( false, "Array argument destPixelsUint16 is too small" );
			return;
		}
		
		const period = 1.0 / ( width > height ? width : height );
		const scale = period * params.frequency;
		const amp   = params.amplitude * outputRange;
	
		let i = 0;
		for( let y = 0; y < height; ++y )
		{
			const yn = y * scale;
		
			for( let x = 0; x < width; ++x, ++i )
			{
				const xn = x * scale;
					
				const value = module.fractalNoiseHighContrast( xn, yn, 0, params.octaves, params.gain, params.lacunarity );
				
				destPixelsUint16[ i ] = module.mod( value * amp, outputRange );
			}
		}
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// Return fractal noise value in range of 0..1.

	module.fractalNoise = function( x, y, z, octaves, gain, lacunarity ) 
	{
		let res  = 0;  // result
		let f    = 1;  // frequency  
		let a    = 1;  // amplitude
		let aSum = 0;  // amplitude sum

		for( let i = 0; i < octaves; i++ )
		{
			// All noise functions return values in the range of -1 to 1. Normalize to 0..1.
			let n = 0.5 + noise.perlin2( x * f, y * f ) * 0.5;
			res += n * a;			
			aSum += a;
			a *= gain;
			f *= lacunarity;
		}
		
		return res / aSum;  // rescale back to 0..1
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// Return fractal noise value in range of 0..1.
	/// This function generates higher contrast output than fractalNoise() but values may occassionally 
	/// be outside of 0..1 range!
	
	module.fractalNoiseHighContrast = function( x, y, z, octaves, gain, lacunarity ) 
	{
		let res  = 0;  // result
		let f    = 1;  // frequency  
		let a    = 1;  // amplitude

		for( let i = 0; i < octaves; i++ )
		{
			// All noise functions return values in the range of -1 to 1.
			let n = noise.perlin2( x * f, y * f );
			res += n * a;			
			a *= gain;
			f *= lacunarity;
		}
		
		// scale to 0..1 (approx.)
		return ( res + 1 ) * 0.5;  
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// True modulo function that only returns positive numbers
	/// (compare with JS "%" operator which returns the remainder instead, which can be negative).

	module.mod = function( a, n ) 
	{
		return a - ( n * Math.floor( a / n ) );
	}

})();
