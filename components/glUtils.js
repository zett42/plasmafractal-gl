/*
WebGL utilities. Copyright (c) 2019 zett42
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
//----------------------------------------------------------------------------------------------

(function(){
	'use strict';

	// For compatibility with WebWorkers, where 'window' is not available, use 'self' instead.
	// Also module import from WebWorkers isn't widely supported yet, so we keep this an "old-school" module. 
	const module = self.z42glUtils = {};

    //----------------------------------------------------------------------------------------------

    module.buildShaderProgram = function( gl, vertexShaderSrc, fragmentShaderSrc ) {
        const program = gl.createProgram();

        const vShader = module.compileShader( gl, vertexShaderSrc,   gl.VERTEX_SHADER );
        const fShader = module.compileShader( gl, fragmentShaderSrc, gl.FRAGMENT_SHADER );

        if( vShader ) 
            gl.attachShader( program, vShader );
        if( fShader ) 
            gl.attachShader( program, fShader );

        gl.linkProgram( program );

        if( ! gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
            throw new Error( "Error linking shader program:\n" + gl.getProgramInfoLog( program ) );
        }

        return program;
    }

    //----------------------------------------------------------------------------------------------

    module.compileShader = function( gl, code, type ) {
        const shader = gl.createShader(type);

        gl.shaderSource( shader, code );
        gl.compileShader( shader );

        if ( ! gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
            console.error( `Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:` );
            console.error( gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    //----------------------------------------------------------------------------------------------

    module.setBufferStaticRectangle = function( gl, x, y, width, height ) {
        let x1 = x;
        let x2 = x + width;
        let y1 = y;
        let y2 = y + height;
        gl.bufferData( gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2 
        ]), gl.STATIC_DRAW );
    }

    //----------------------------------------------------------------------------------------------
    // Render the given multi-gradient palette to the currently bound texture, generating mipmaps.

    module.setPaletteTexture = function( gl, textureWidth, paletteDef ) {

        textureWidth = Math.trunc( textureWidth );

        // Loop to generate mipmaps (can't use gl.generateMipmap for non-square texture)
        for( let mipLevel = 0; 
             textureWidth >= 1; 
             textureWidth = Math.trunc( textureWidth / 2 ), ++mipLevel ) {

            const buffer = new ArrayBuffer( textureWidth * 4 );
            const paletteUint32 = new Uint32Array( buffer );
            z42color.makePaletteMultiGradientRGBA( paletteUint32, paletteUint32.length, paletteDef );
                
            const paletteUint8 = new Uint8Array( buffer );
            gl.texImage2D( gl.TEXTURE_2D, mipLevel, gl.RGBA, textureWidth, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, paletteUint8, 0 );
        }

        // Set texture parameters
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
    }
    
    //----------------------------------------------------------------------------------------------
   
})();