#version 300 es
#define SHADER_NAME glPostFragShader.glsl

/*
PlasmaFractal. Copyright (c) 2019 zett42.
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

// Fragment shaders don't have a default precision so we need to pick one.
precision highp float;
precision highp sampler2D;

//·············································································································
// Shader parameters

// Texture where the noise has been rendered into.
uniform sampler2D u_renderTexture;

// Fragment coordinates passed in from the vertex shader.
in vec2 fragCoord;

// Output of this fragment shader.
out vec4 fragColor;

//·············································································································

void main() { 

	vec4 color = texture( u_renderTexture, fragCoord );

    // TODO: optionally apply palette

    fragColor = color;
}