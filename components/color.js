/*
Color and image manipulation utilities. Copyright (c) 2019 zett42.
https://github.com/zett42/plasmafractal-gl

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
	const module = self.z42color = {};
	
	//----------------------------------------------------------------------------------------------------------------
	/// Render a palette segment into a one-dimensional RGBA Uint32Array.
	/// Wraps around in case index is out of range. 
	/// Returns start + count.
	
	module.renderPaletteSegment = function( outPaletteUint32, start, count, startColor, endColor, easeFunction ) {		
		if( count <= 0 ) 
			return;
		if( count > outPaletteUint32.length )
			count = outPaletteUint32.length;

		for( let i = 0; i < count; ++i ) {
			const pos = module.mod( i + start, outPaletteUint32.length );

			const r = Math.round( easeFunction( i, startColor.r, endColor.r - startColor.r, count ) );
			const g = Math.round( easeFunction( i, startColor.g, endColor.g - startColor.g, count ) );
			const b = Math.round( easeFunction( i, startColor.b, endColor.b - startColor.b, count ) );

			// Note: alpha component is in 0..1 range, so we have to multiply with 255.
			const a = Math.round( easeFunction( i, startColor.a, endColor.a - startColor.a, count ) * 255 );
		
			outPaletteUint32[ pos ] = r | ( g << 8 ) | ( b << 16 ) | ( a << 24 );
		}

		return start + count;
	}

	//----------------------------------------------------------------------------------------------------------------
	/// Render a palette definition into a one-dimensional RGBA Uint32Array.
	///
	/// Wraps around in case index is out of range. 
	///
	/// Argument for inputPaletteDef must be an array of objects:
	/// { 
	///		pos,      // 0..1
	///		color,    // { r, g, b, a } where rgb values are in range 0..255 and a is in range 0..1
	///		easeFun,  // ease function
	/// }
	///
	/// Before rendering, a temporary clone of the inputPalette will be made and sorted by positions.

	module.renderPaletteDef = function( outPaletteUint32, count, inputPaletteDef )	{

		// shallow clone is sufficient here, as we don't modify properties of array elements
		let sortedPalette = [ ...inputPaletteDef ];
		sortedPalette.sort( ( a, b ) => a.pos - b.pos );

		for( let i = 0; i < sortedPalette.length; ++i ) {
			const iEnd = ( i + 1 ) % sortedPalette.length;

			const start = sortedPalette[ i ];
			const end   = sortedPalette[ iEnd ];

			const startPos   = start.pos * count;
			const endPos     = end.pos   * count;
			const startIndex = Math.round( startPos );
			const endIndex   = Math.round( endPos );
			let   dist       = endIndex - startIndex;

			if( iEnd <= i ) {
				// wrap-around
				dist = count - startIndex + endIndex;  
			}

			if( dist <= 0 ){
				// TODO: assign weighted avg of all colors at same index 
				outPaletteUint32[ startIndex ] = start.color;				
			}
			else {
				z42color.renderPaletteSegment( outPaletteUint32, startIndex, dist, start.color, end.color, start.easeFun );
			}
		}	
	}
	
	//----------------------------------------------------------------------------------------------------------------
	/// Blend two palettes definitions (inFirstPalette, inSecondPalette) and return the result as a new palette.
	/// Alpha must be in the 0..1 range.

	module.blendPaletteDef = function( inFirstPalette, inSecondPalette, alphaFloat ){
		if( inFirstPalette.length != inSecondPalette.length )
		{
			console.assert( false, "Palette arguments must have same size" );
			return null;
		}

		let result = _.cloneDeep( inSecondPalette );
		
		for( let i = 0; i < inFirstPalette.length; ++i )
		{
			result[ i ].color = module.blendColorRGBA( 
				inFirstPalette[ i ].color, inSecondPalette[ i ].color, alphaFloat );
		}		

		return result;
	}
	
	//----------------------------------------------------------------------------------------------------------------
	/// Blend two RGB color objects and return the result. Alpha must be in the 0..1 range.
	
	module.blendColorRGBA = function( c1, c2, alphaFloat ) {
		return {
			r: Math.round( c1.r + ( c2.r - c1.r ) * alphaFloat ),
			g: Math.round( c1.g + ( c2.g - c1.g ) * alphaFloat ),
			b: Math.round( c1.b + ( c2.b - c1.b ) * alphaFloat ),
			a: Math.round( c1.a + ( c2.a - c1.a ) * alphaFloat ),
		}
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// Convert HSV input to RGB result, then increment hue of input color by golden ratio.
	
	module.nextGoldenRatioColorRGBA = function( hsva ) { 
		let result = tinycolor( hsva ).toRgb();
		
		const golden_ratio = 0.618033988749895 * 360;
		hsva.h = ( hsva.h + golden_ratio ) % 360; 

		return result;
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// True modulo function that only returns positive numbers
	/// (compare with JS "%" operator which returns the remainder instead, which can be negative).

	module.mod = function( a, n ) {
		return a - ( n * Math.floor( a / n ) );
	}	

	//----------------------------------------------------------------------------------------------------------------
	/// Clamp x to min and max.

	module.clamp = function( x, min, max ) {
		if( x < min ) return min;
		if( x > max ) return max;
		return x;
	}
	
})();