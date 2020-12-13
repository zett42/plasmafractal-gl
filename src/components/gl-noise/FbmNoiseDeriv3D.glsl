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

// Fractal brownian motion noise and derivatives.
// This variant also returns the accumulated noise (x) aswell as derivatives of the noise function (yzw), 
// for a given coordinate.
// Requires NOISE_FUN argument in require() call to define noise function to use.

vec4 fmbNoiseDeriv3D( vec3 pos, FbmNoiseParams noise ) {

	vec4 result = vec4( .0, .0, .0, .0 );
	float amp   = 1.0;
	float freq  = 1.0;
	float z     = pos.z;

	// Z-increment to "randomize" each octave for avoiding artefacts that originate from coords 0,0
	// due to the pseudo-random nature of the noise.
	// This value has been choosen by trial and error.
	const float zInc = 7.2;

	mat2 rot = mat2( cos( noise.angle ), sin( noise.angle ), -sin( noise.angle ), cos( noise.angle ) );

	vec2 p = pos.xy * noise.frequency;

	// Create fractal noise by adding multiple octaves of noise.
	for( int i = 0; i < noise.octaves; ++i ) {                

        // Calculate noise (x) and derivatives (y, z, w)
        vec4 n = NOISE_FUN( vec3( p, z ) ) * amp;

		result.x   += n.x;           // accumulate noise
        result.yzw += n.yzw * freq;  // accumulate derivatives 

		p    *= rot * noise.lacunarity;
		amp  *= noise.gain;
        freq *= noise.lacunarity;
		z    += zInc;
		z    *= noise.turbulence;
	}

	// Fractional part of octave value is used for smooth transition.

    vec4 n = NOISE_FUN( vec3( p, z ) ) * amp * noise.octavesFract;

    result.x   += n.x;           // accumulate noise
    result.yzw += n.yzw * freq;  // accumulate derivatives 

	return result;
}

#pragma glslify: export(fmbNoiseDeriv3D)