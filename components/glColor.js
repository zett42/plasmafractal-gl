/*
WebGL utilities. Copyright (c) 2019 zett42
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
//----------------------------------------------------------------------------------------------

(function(){
	'use strict';

	// For compatibility with WebWorkers, where 'window' is not available, use 'self' instead.
	// Also module import from WebWorkers isn't widely supported yet, so we keep this an "old-school" module. 
    const module = self.z42glcolor = {};
    
     //----------------------------------------------------------------------------------------------
    // Render the given multi-gradient palette to the currently bound texture, generating mipmaps.

    module.setPaletteTexture = function( gl, textureWidth, paletteDef ) {

        textureWidth = Math.trunc( textureWidth );

        let paletteBuffer = new ArrayBuffer( textureWidth * 4 );
        let paletteUint32 = new Uint32Array( paletteBuffer );
        z42color.renderPaletteDef( paletteUint32, paletteUint32.length, paletteDef );

        // Loop to generate mipmaps (can't use gl.generateMipmap for non-square texture)
        for( let mipLevel = 0; textureWidth >= 1; ++mipLevel ) {
               
            const paletteUint8 = new Uint8Array ( paletteBuffer );
            gl.texImage2D( gl.TEXTURE_2D, mipLevel, gl.RGBA, textureWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, paletteUint8, 0 );

            const scaledTextureWidth = Math.trunc( textureWidth / 2 );
            if( scaledTextureWidth >= 1 ) {
                // Scale palette down to half the size for next mip level.

                const scaledPaletteBuffer = new ArrayBuffer( scaledTextureWidth * 4 );
                const scaledPaletteUint32 = new Uint32Array( scaledPaletteBuffer );

                for( let iDst = 0, iSrc = 0; iDst < scaledTextureWidth; ++iDst, iSrc += 2 ) {
                    
                    // Averaging 3 samples seems to be the sweet spot between aliasing and too much blur.
                    const c1 = samplePaletteClamp( paletteUint32, iSrc - 1, textureWidth );
                    const c2 = samplePaletteClamp( paletteUint32, iSrc + 0, textureWidth );
                    const c3 = samplePaletteClamp( paletteUint32, iSrc + 1, textureWidth );

                    const c = roundColor( mulColor( sumColors([ c1, c2, c3 ]), 1 / 3 ) );

                    scaledPaletteUint32[ iDst ] = ( c.a << 24 ) | ( c.r << 16 ) | ( c.g << 8 ) | c.b;
                } 
                
                paletteBuffer = scaledPaletteBuffer;
                paletteUint32 = scaledPaletteUint32;
            }

            textureWidth = scaledTextureWidth;
        }

        // Set texture parameters
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    }
    
    //----------------------------------------------------------------------------------------------
    // Utility functions.

    function splitColor( c ) {
        return {
            a: ( c >> 24 ),
            r: ( c >> 16 ) & 0xFF,
            g: ( c >> 8  ) & 0xFF,
            b: ( c & 0xFF ),
        };
    }

    function sumColors( colors ) {
        let r = { a: 0, r: 0, g: 0, b: 0 };
        for( let c of colors ) {
            r.a += c.a;
            r.r += c.r;
            r.g += c.g;
            r.b += c.b;
        }
        return r;
    }

    function mulColor( c, f ) {
        return { 
            a: c.a * f, 
            r: c.r * f, 
            g: c.g * f, 
            b: c.b * f,
        };
    }

    function roundColor( c ) {
        return { 
            a: Math.round( c.a ), 
            r: Math.round( c.r ), 
            g: Math.round( c.g ), 
            b: Math.round( c.b ),
        };
    }

    function samplePaletteClamp( pal, i, iMax ) {
        if( i < 0 || i >= iMax )
            return { a: 1, r: 0, g: 0, b: 0 };
        
        return splitColor( pal[ i ] );
    }

})();