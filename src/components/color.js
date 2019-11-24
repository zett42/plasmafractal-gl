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

import * as tinycolor from 'tinycolor2';
import FractalNoiseGen from './fractalNoise.js';

//----------------------------------------------------------------------------------------------------------------
/// Render a palette segment into a one-dimensional RGBA Uint32Array.
/// Wraps around in case index is out of range. 
/// Returns startIndex + count.

function renderPaletteSegment( outPaletteUint32, startIndex, count, startColor, endColor, 
							   easeFunction, noiseFunction ) {		
	if( count <= 0 ) 
		return;
	if( count > outPaletteUint32.length )
		count = outPaletteUint32.length;

	for( let i = 0; i < count; ++i ) {
		const pos = mod( i + startIndex, outPaletteUint32.length );

		const ec = {
			r: easeFunction( i, startColor.r, endColor.r - startColor.r, count ),
			g: easeFunction( i, startColor.g, endColor.g - startColor.g, count ),
			b: easeFunction( i, startColor.b, endColor.b - startColor.b, count ),
			a: easeFunction( i, startColor.a, endColor.a - startColor.a, count ),
		};

		const nc = noiseFunction( i / count, ec );

		const r = Math.round( nc.r );
		const g = Math.round( nc.g );
		const b = Math.round( nc.b );
		// Note: alpha component is in 0..1 range, so we have to multiply with 255 for final output.
		const a = Math.round( nc.a * 255 );

		outPaletteUint32[ pos ] = r | ( g << 8 ) | ( b << 16 ) | ( a << 24 );
	}

	return startIndex + count;
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

function renderPaletteDef( outPaletteUint32, count, inputPaletteDef ) {

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
			outPaletteUint32[ startIndex ] = start.color;
		}
		else {
			let noiseFun = ( pos, rgb ) => rgb;
			if( start.isNoisy && start.noise ) {
				noiseFun = makeNoiseFun( start.noise );
			}
			renderPaletteSegment( outPaletteUint32, startIndex, dist, start.color, end.color, start.easeFun, noiseFun );
		}
	}	
}

//----------------------------------------------------------------------------------------------------------------
// Generate a noise function.

function makeNoiseFun( noiseOpt ) {

	const noiseGen = new FractalNoiseGen( noiseOpt.octaves, noiseOpt.seed );

	return function( pos, rgb ){

		const y = 0;  // possible future extension: animate y

		const n = noiseGen.noise( pos, y, noiseOpt.frequency, noiseOpt.gain, noiseOpt.lacunarity, 
									noiseOpt.amplitude );
									
		return adjustRgbLightness( rgb, n );									  
	}
}

//----------------------------------------------------------------------------------------------------------------
/// Blend two palettes definitions (inFirstPalette, inSecondPalette) and return the result as a new palette.
/// Alpha must be in the 0..1 range.

function blendPaletteDef( inFirstPalette, inSecondPalette, alphaFloat ){
	if( inFirstPalette.length != inSecondPalette.length )
	{
		console.assert( false, "Palette arguments must have same size" );
		return null;
	}

	let result = _.cloneDeep( inSecondPalette );
	
	for( let i = 0; i < inFirstPalette.length; ++i )
	{
		result[ i ].color = blendColorRGBA( 
			inFirstPalette[ i ].color, inSecondPalette[ i ].color, alphaFloat );
	}		

	return result;
}

//----------------------------------------------------------------------------------------------------------------
/// Blend two RGB color objects and return the result. Alpha must be in the 0..1 range.

function blendColorRGBA( c1, c2, alphaFloat ) {
	return {
		r: Math.round( c1.r + ( c2.r - c1.r ) * alphaFloat ),
		g: Math.round( c1.g + ( c2.g - c1.g ) * alphaFloat ),
		b: Math.round( c1.b + ( c2.b - c1.b ) * alphaFloat ),
		a: Math.round( c1.a + ( c2.a - c1.a ) * alphaFloat ),
	}
}	

//----------------------------------------------------------------------------------------------------------------
/// Convert HSV input to RGB result, then increment hue of input color by golden ratio.

function nextGoldenRatioColorRGBA( hsva ) { 
	let result = tinycolor( hsva ).toRgb();
	
	const golden_ratio = 0.618033988749895 * 360;
	hsva.h = ( hsva.h + golden_ratio ) % 360; 

	return result;
}	

//----------------------------------------------------------------------------------------------------------------
/// True modulo function that only returns positive numbers
/// (compare with JS "%" operator which returns the remainder instead, which can be negative).

function mod( a, n ) {
	return a - ( n * Math.floor( a / n ) );
}	

//----------------------------------------------------------------------------------------------------------------
/// Clamp x to min and max.

function clamp( x, min, max ) {
	if( x < min ) return min;
	if( x > max ) return max;
	return x;
}

//----------------------------------------------------------------------------------------------------------------
// Linear interpolation.

function lerp( start, end, alpha ) {
	return start + ( end - start ) * alpha;
}

//----------------------------------------------------------------------------------------------------------------
// Linear interpolation applied two times.

function doubleLerp( start, end1, alpha1, end2, alpha2 ) {
	return lerp( lerp( start, end1, alpha1 ),
						end2, alpha2 ); 
}

//----------------------------------------------------------------------------------------------------------------
// Calculate HSL lightness of RGB color. Result is in range 0..1.

function rgbToHslLightness( color ) {
	return ( Math.max( color.r, color.g, color.b ) + 
			 Math.min( color.r, color.g, color.b ) ) / 255 / 2;
}

//----------------------------------------------------------------------------------------------------------------
// Set absolute lightness of RGB color according to HSL model, without leaving the RGB space.
// Lightness must be in range of 0..1.
// This is implemented by blending the given color with black and/or white. 

function setRgbLightness( color, lightness, 
						  baseLightness = rgbToHslLightness( color ) ) {

	baseLightness = baseLightness * 2 - 1;    // 0..1 => -1..1
	
	if( baseLightness < 0 ){
		// Handle edge case that would cause div by zero
		if( baseLightness === -1 ) {
			lightness *= 255;
			return { r: lightness, g: lightness, b: lightness, a: color.a };
		} 
		lightness    = lightness * 2 - 1;   // 0..1 => -1..1
		const a      = -baseLightness;
		const b      = -Math.min( lightness, 0 );   
		const alpha1 = ( b - a ) / ( 1 - a );      // percentage of fade with black
		const alpha2 = Math.max( lightness, 0 );   // percentage of fade with white

		return{
			r: doubleLerp( color.r, 0, alpha1, 255, alpha2 ),
			g: doubleLerp( color.g, 0, alpha1, 255, alpha2 ),
			b: doubleLerp( color.b, 0, alpha1, 255, alpha2 ),
			a: color.a
		}	
	}
	else {
		// Handle edge case that would cause div by zero
		if( baseLightness === 1 ) {
			lightness *= 255;
			return { r: lightness, g: lightness, b: lightness, a: color.a };
		}
		lightness    = lightness * 2 - 1;   // 0..1 => -1..1
		const a      = baseLightness;
		const b      = Math.max( lightness, 0 );     
		const alpha1 = ( b - a ) / ( 1 - a );       // percentage of fade with white
		const alpha2 = -Math.min( lightness, 0 );   // percentage of fade with black

		return{
			r: doubleLerp( color.r, 255, alpha1, 0, alpha2 ),
			g: doubleLerp( color.g, 255, alpha1, 0, alpha2 ),
			b: doubleLerp( color.b, 255, alpha1, 0, alpha2 ),
			a: color.a
		}	
	}
}

//----------------------------------------------------------------------------------------------------------------
// Adjust relative lightness (+/- offset) of RGB color according to HSL model.

function adjustRgbLightness( color, relativeLightness ) { 
	const baseLightness = rgbToHslLightness( color );
	const lightness = clamp( baseLightness + relativeLightness, 0, 1 );
	return setRgbLightness( color, lightness, baseLightness );
}

//----------------------------------------------------------------------------------------------------------------

export {
	renderPaletteSegment,
	renderPaletteDef,
	blendPaletteDef,
	blendColorRGBA,
	nextGoldenRatioColorRGBA,
	mod,
	clamp,
	lerp,
	doubleLerp,
	rgbToHslLightness,
	setRgbLightness,
	adjustRgbLightness,
}