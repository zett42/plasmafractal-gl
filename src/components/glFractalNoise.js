/*
WebGL fragment shader to generate fractal noise. Copyright (c) 2019 zett42
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
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// For syntax highlighting with glsl-literal extension of VSCode we need to define a glsl template tag.
const glsl = ( strings, ...values ) => String.raw( strings, ...values );

//-------------------------------------------------------------------------------------------------------
// Returns fragment shader to generate fractal noise.
// Argument for noiseFunctionSource must contain source of single GLSL function with signature:
//    float noise( vec3 pos ) 

export function fragmentShader( noiseFunctionSource ){ 
    return glsl`#version 300 es

    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default. It means "medium precision"
    precision highp float;
    precision highp sampler2D;

    // noise parameters
    uniform int   u_octaves;           // number of octaves for fractal noise
    uniform float u_octavesFract;      // fractional part of octaves value
    uniform float u_frequency;         // noise frequency
    uniform float u_amplitude;         // noise amplitude
    uniform float u_gain;              // amplitude factor for each octave
    uniform float u_lacunarity;        // frequency factor for each octave
    uniform float u_noiseZ;            // Z-position in 3D noise, for animation
    uniform float u_turbulence;        // "boiling" effect of noise animation 
    uniform float u_paletteOffset;     // offset for palette rotation animation

    // texture that defines the palette
    uniform sampler2D u_paletteTexture;
    
    // fragment coordinates passed in from the vertex shader
    in vec2 fragCoord;

    // declare output of the fragment shader
    out vec4 fragColor;

    ${noiseFunctionSource}

    void main() { 
        float n = 0.0;
        float z = u_noiseZ;
        float freq = u_frequency;
        float amp = u_amplitude;
        
        // Z-increment to "randomize" each octave for avoiding artefacts that originate from coords 0,0
        // due to the pseudo-random nature of the noise.
        // This value has been choosen by trial and error.
        const float zInc = 42.0;

        // Create fractal noise by adding multiple octaves of noise.
        for( int i = 0; i < u_octaves; ++i ) {                

            vec3 p = vec3( fragCoord.xy * freq, z );
            n += noise( p ) * amp;

            freq   *= u_lacunarity;
            amp    *= u_gain;
            z      += zInc;
            z      *= u_turbulence;
        }

        // Fractional part of octave value is used for smooth transition.
        vec3 p1 = vec3( fragCoord.xy * freq, z );
        n += noise( p1 ) * amp * u_octavesFract;
    
        // Actual color is defined by palette
        fragColor = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );
    }
`}    
