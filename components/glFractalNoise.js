/*
WebGL fragment shader to generate fractal noise. Copyright (c) 2019 zett42
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
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

(function(){
	'use strict';

    // For syntax highlighting with glsl-literal extension of VSCode we need to define a glsl template tag.
    const glsl = ( strings, ...values ) => String.raw( strings, ...values );

	// For compatibility with WebWorkers, where 'window' is not available, use 'self' instead.
	// Also module import from WebWorkers isn't widely supported yet, so we keep this an "old-school" module. 
	const module = self.z42glFractalNoise = {};

    //-------------------------------------------------------------------------------------------------------
    // Returns fragment shader to generate fractal noise.
    // Argument for noiseFunctionSource must contain source of single GLSL function with signature:
    //    float noise( vec3 pos ) 

    module.fragmentShader = function( noiseFunctionSource ){ 
        return glsl`#version 300 es
    
        // fragment shaders don't have a default precision so we need
        // to pick one. mediump is a good default. It means "medium precision"
        precision highp float;
        precision highp sampler2D;
    
        // noise parameters
        uniform float u_time;              // current time in seconds
        uniform float u_seed;              // random number of range -1..1
        uniform int   u_octaves;           // number of octaves for fractal noise
        uniform float u_frequency;         // noise frequency
        uniform float u_amplitude;         // noise amplitude
        uniform float u_gain;              // amplitude factor for each octave
        uniform float u_lacunarity;        // frequency factor for each octave
        uniform float u_noiseSpeed;        // speed of noise mutation
        uniform float u_turbulence;        // "boiling" effect of noise animation 
        uniform float u_paletteOffset;     // offset for palette rotation
    
        // texture that defines the palette
        uniform sampler2D u_paletteTexture;
       
        // fragment coordinates passed in from the vertex shader
        in vec2 fragCoord;
    
        // declare output of the fragment shader
        out vec4 fragColor;
    
        ${noiseFunctionSource}
    
        // Create fractal noise by adding multiple u_octaves of noise.
        float fractalNoise( vec3 pos ){
            float result = 0.0;
            float freq   = u_frequency;
            float amp    = u_amplitude;
            float z      = pos.z;

            // Z-increment to "randomize" each octave for avoiding artefacts that originate from coords 0,0
            // due to the pseudo-random nature of the noise.
            // This value has been choosen by trial and error.
            const float zInc = 42.0;
    
            for( int i = 0; i < u_octaves; ++i ) {                

                vec3 p = vec3( pos.xy * freq, z );

                result += noise( p ) * amp;

                freq   *= u_lacunarity;
                amp    *= u_gain;
                z      += zInc;
                z      *= u_turbulence;
            }
    
            return result;
        }
    
        void main() { 
            vec3 p = vec3( fragCoord.xy, u_time * u_noiseSpeed + u_seed * 100.0 );
    
            float n = fractalNoise( p );
            
            fragColor = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );
        }
    `}    

})();