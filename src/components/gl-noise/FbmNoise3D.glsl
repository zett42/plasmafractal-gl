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

// Fractal brownian motion noise.
// Requires NOISE_FUN argument in require() call to define noise function to use.

float fbmNoise3D( vec3 pos, int octaves, float octavesFract, float frequency, float amplitude, float angle, float lacunarity, float gain,
                  float turbulence ) {

	float result = 0.0;

	float freq = frequency;
	float amp  = amplitude;
	float z    = pos.z;

	// Z-increment to "randomize" each octave for avoiding artefacts that originate from coords 0,0
	// due to the pseudo-random nature of the noise.
	// This value has been choosen by trial and error.
	const float zInc = 7.2;

	mat2 rot = mat2( cos( angle ), sin( angle ), -sin( angle ), cos( angle ) );

	vec2 p2 = pos.xy * frequency;

	// Create fractal noise by adding multiple octaves of noise.
	for( int i = 0; i < octaves; ++i ) {                

		result += NOISE_FUN( vec3( p2, z ) ) * amp;

		p2  *= rot * lacunarity;
		amp *= gain;
		z   += zInc;
		z   *= turbulence;
	}

	// Fractional part of octave value is used for smooth transition.
	result += NOISE_FUN( vec3( p2, z ) ) * amp * octavesFract;

	return result;
}

#pragma glslify: export(fbmNoise3D)