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

import createShader from 'gl-shader';

//----------------------------------------------------------------------------------------------

export function setBufferRectangle( gl, x, y, width, height, usage = gl.STATIC_DRAW ) {
    let x1 = x;
    let x2 = x + width;
    let y1 = y;
    let y2 = y + height;
    gl.bufferData( gl.ARRAY_BUFFER, 
        new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2 
        ]), 
        usage 
    );
}

//----------------------------------------------------------------------------------------------

export function createOrUpdateShader( gl, shader, vertexShaderSrc, fragShaderSrc ) {

    if( shader ) {
        shader.update( vertexShaderSrc, fragShaderSrc );
    }
    else {
        shader = createShader( gl, vertexShaderSrc, fragShaderSrc );
    }

    return shader;
}