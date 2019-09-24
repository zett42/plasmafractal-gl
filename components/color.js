/*
Color and image manipulation utilities. Copyright (c) 2019 zett42.
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
	const module = self.z42color = {};
	
	//----------------------------------------------------------------------------------------------------------------
	/// Fill a one-dimensional RGBA Uint32Array with a single gradient.
	/// Wraps around in case index is out of range. 
	/// Returns start + count.
	
	module.makePaletteGradientRGBA = function( outPaletteUint32, start, count, startColor, endColor, easeFunction )
	{		
		if( count <= 0 ) 
			return;
		if( count > outPaletteUint32.length )
			count = outPaletteUint32.length;

		for( let i = 0; i < count; ++i )
		{		
			const pos = module.mod( i + start, outPaletteUint32.length );

			const r = Math.round( easeFunction( i, startColor.r, endColor.r - startColor.r, count - 1 ) );
			const g = Math.round( easeFunction( i, startColor.g, endColor.g - startColor.g, count - 1 ) );
			const b = Math.round( easeFunction( i, startColor.b, endColor.b - startColor.b, count - 1 ) );

			// Note: alpha component is in 0..1 range, so we have to multiply with 255.
			const a = Math.round( easeFunction( i, startColor.a, endColor.a - startColor.a, count - 1 ) * 255 );
		
			outPaletteUint32[ pos ] = r | ( g << 8 ) | ( b << 16 ) | ( a << 24 );
		}

		return start + count;
	}

	//----------------------------------------------------------------------------------------------------------------
	/// Fill a one-dimensional RGBA Uint32Array with multiple consecutive gradients.
	///
	/// Wraps around in case index is out of range. 
	///
	/// Argument for inputPalette must be an array of objects:
	/// { 
	///		pos,      // 0..1
	///		color,    // { r, g, b, a } where rgb values are in range 0..255 and a is in range 0..1
	///		easeFun,  // ease function
	/// }
	///
	/// A temporary clone of the inputPalette will be made and the clone be sorted by positions.

	module.makePaletteMultiGradientRGBA = function( outPaletteUint32, count, inputPalette )
	{
		// shallow clone is sufficient here, as we don't modify properties of array elements
		let sortedPalette = [ ...inputPalette ];
		sortedPalette.sort( ( a, b ) => a.pos - b.pos );

		for( let i = 0; i < sortedPalette.length; ++i ) {
			const start = sortedPalette[ i ];
			const end   = sortedPalette[ ( i + 1 ) % sortedPalette.length ];

			const startIndex = Math.trunc( start.pos * count );
			const endIndex   = Math.trunc( end.pos   * count );
			let dist         = endIndex - startIndex;

			if( dist != 0 || sortedPalette.length == 1 ){
				if( dist <= 0 )
					dist = count - startIndex + endIndex;  // wrap-around
					
				z42color.makePaletteGradientRGBA( outPaletteUint32, startIndex, dist, start.color, end.color, start.easeFun );
			}
		}	
	}
	
	//----------------------------------------------------------------------------------------------------------------
	/// Rotate palette paletteUint32Src by given offset and store result in paletteUint32Dest.
	/// Palettes can have different sizes.
	/// If paletteUint32Dest is smaller than paletteUint32Src, the output will be clipped.
	/// If paletteUint32Dest is larger than paletteUint32Src, the input will be repeated in the output. 
	
	module.rotatePalette = function( paletteUint32Src, paletteUint32Dest, offset )
	{
		if( paletteUint32Src.length === 0 || paletteUint32Dest.length === 0 )
			return;
		
		offset = Math.floor( offset );
		
		for( let iDest = 0; iDest < paletteUint32Dest.length; ++iDest )
		{
			let iSrc = module.mod( iDest - offset, paletteUint32Src.length );
			
			paletteUint32Dest[ iDest ] = paletteUint32Src[ iSrc ];
		}
	}
	
	//----------------------------------------------------------------------------------------------------------------
	/// Blend two palettes (inFirstPaletteUint32, inSecondPaletteUint32) and store the result in another palette
	/// (outPaletteUint32). 
	/// Alpha must be in the 0..1 range.

	module.blendPalette = function( inFirstPaletteUint32, inSecondPaletteUint32, outPaletteUint32, alphaFloat )
	{
		if( inFirstPaletteUint32.length != inSecondPaletteUint32.length ||
			inFirstPaletteUint32.length != outPaletteUint32.length )
		{
			console.assert( false, "Palette arguments must have same size" );
			return;
		}
		
		for( let i = 0; i < inFirstPaletteUint32.length; ++i )
		{
			outPaletteUint32[ i ] = module.blendColorRGBA_Uint32( inFirstPaletteUint32[ i ], inSecondPaletteUint32[ i ], alphaFloat );
		}		
	}

	//----------------------------------------------------------------------------------------------------------------
	/// Blend two palettes definitions (inFirstPalette, inSecondPalette) and store the result in another 
	/// palette def (outPalette). 
	/// Alpha must be in the 0..1 range.

	module.blendPaletteDef = function( inFirstPalette, inSecondPalette, alphaFloat )
	{
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
	
	module.blendColorRGBA = function( c1, c2, alphaFloat )
	{
		return {
			r: Math.round( c1.r + ( c2.r - c1.r ) * alphaFloat ),
			g: Math.round( c1.g + ( c2.g - c1.g ) * alphaFloat ),
			b: Math.round( c1.b + ( c2.b - c1.b ) * alphaFloat ),
			a: Math.round( c1.a + ( c2.a - c1.a ) * alphaFloat ),
		}
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// Blend two RGB colors in Uint32 format and return the result. Alpha must be in the 0..1 range.
	
	module.blendColorRGBA_Uint32 = function( color1Uint32, color2Uint32, alphaFloat )
	{
		let r1 = color1Uint32 & 0xFF;
		let r2 = color2Uint32 & 0xFF;
		let g1 = ( color1Uint32 >>  8 ) & 0xFF;
		let g2 = ( color2Uint32 >>  8 ) & 0xFF;
		let b1 = ( color1Uint32 >> 16 ) & 0xFF;
		let b2 = ( color2Uint32 >> 16 ) & 0xFF;
		let a1 = ( color1Uint32 >> 24 ) & 0xFF;
		let a2 = ( color2Uint32 >> 24 ) & 0xFF;
		
		let r = Math.round( r1 + ( r2 - r1 ) * alphaFloat );
		let g = Math.round( g1 + ( g2 - g1 ) * alphaFloat );
		let b = Math.round( b1 + ( b2 - b1 ) * alphaFloat );
		let a = Math.round( a1 + ( a2 - a1 ) * alphaFloat );
		
		return r | ( g << 8 ) | ( b << 16 ) | ( a << 24 );
	}
	
	//----------------------------------------------------------------------------------------------------------------
	/// Draw a Uint16 grayscale image into a Uint32 RGBA image by using colors from given palette.
	/// Source image pixel values must be in range of palette!
	
	module.drawImageUint16WithPalette = function( destPixelsUint32, sourcePixelsUint16, sourcePaletteUint32 )
	{
		if( destPixelsUint32.length != sourcePixelsUint16.length )
		{
			console.assert( false, "Source and dest image must have same size" );
			return;
		}
		
		let i = 0;
		for( const value of sourcePixelsUint16 )
		{	
			destPixelsUint32[ i++ ] = sourcePaletteUint32[ value ];
		}
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// Convert HSV input to RGB result, then increment hue of input color by golden ratio.
	
	module.nextGoldenRatioColorRGBA = function( hsva ) 
	{ 
		let result = tinycolor( hsva ).toRgb();
		
		const golden_ratio = 0.618033988749895 * 360;
		hsva.h = ( hsva.h + golden_ratio ) % 360; 

		return result;
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// True modulo function that only returns positive numbers
	/// (compare with JS "%" operator which returns the remainder instead, which can be negative).

	module.mod = function( a, n ) 
	{
		return a - ( n * Math.floor( a / n ) );
	}	

	//----------------------------------------------------------------------------------------------------------------
	/// Clamp x to min and max.

	module.clamp = function( x, min, max )
	{
		if( x < min ) return min;
		if( x > max ) return max;
		return x;
	}
	
})();