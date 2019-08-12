/*
Color and image manipulation utilities. Copyright (c) 2019 zett42.
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

(function(global){
	'use strict';
	
	var module = global.z42color = {};
	
	//----------------------------------------------------------------------------------------------------------------
	/// Make a RGBA color gradient for a range of palette entries.
	/// Returns start + count.
	
	module.makePaletteGradientRGBA = function( paletteUint32, start, count, startColor, endColor, easeFunction )
	{		
		if( count <= 0 || start < 0 || start >= paletteUint32.length ) 
			return;

		let overflow = start + count - paletteUint32.length;
		if( overflow > 0 )
			count -= overflow;

		for( let i = 0; i < count; ++i )
		{		
			let r = easeFunction( i, startColor.r, endColor.r - startColor.r, count - 1 );
			let g = easeFunction( i, startColor.g, endColor.g - startColor.g, count - 1 );
			let b = easeFunction( i, startColor.b, endColor.b - startColor.b, count - 1 );
			let a = easeFunction( i, startColor.a, endColor.a - startColor.a, count - 1 );
		
			paletteUint32[ i + start ] = r | ( g << 8 ) | ( b << 16 ) | ( a << 24 );
		}

		return start + count;
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
	/// Blend two colors and return the result. Alpha must be in the 0..1 range.
	
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
		let result = module.hsva_to_rgba( hsva );
		
		const golden_ratio = 0.618033988749895;
		hsva.h = ( hsva.h + golden_ratio ) % 1; 

		return result;
	}	
	
	//----------------------------------------------------------------------------------------------------------------
	/// Standard HSV to RGB conversion with alpha component.
	/// Parameters:
	/// 	h  Object = { h, s, v, a }
	/// OR 
	/// 	h, s, v, a
	
	module.hsva_to_rgba = function( h, s, v, a ) 
	{
		var r, g, b, i, f, p, q, t;
		if( arguments.length === 1 ) 
		{
			s = h.s, v = h.v, a = h.a, h = h.h;
		}
		
		i = Math.floor( h * 6 );
		f = h * 6 - i;
		p = v * ( 1 - s );
		q = v * ( 1 - f * s );
		t = v * ( 1 - ( 1 - f ) * s );

		switch( i % 6 ) 
		{
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}
		return {
			r: Math.round( r * 255 ),
			g: Math.round( g * 255 ),
			b: Math.round( b * 255 ),
			a: Math.round( a * 255 )
		};
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
	
})(this);
