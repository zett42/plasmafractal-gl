#version 300 es
#define SHADER_NAME glPlasmaFrag.glsl

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

// Regular noise parameters.
uniform int   u_octaves;           // number of octaves for fractal noise
uniform float u_octavesFract;      // fractional part of octaves value
uniform float u_frequency;         // noise frequency
uniform float u_amplitude;         // noise amplitude
uniform float u_gain;              // amplitude factor for each octave
uniform float u_lacunarity;        // frequency factor for each octave
uniform float u_noiseAnim;            // Z-position in 3D noise, for animation
uniform float u_turbulence;        // "boiling" effect of noise animation 

// Domain warping parameters.
uniform int   u_warp_octaves;           // number of octaves for fractal noise
uniform float u_warp_octavesFract;      // fractional part of octaves value
uniform float u_warp_frequency;         // noise frequency
uniform float u_warp_amplitude;         // directional amplitude
uniform float u_warp_rotation;          // rotational amplitude
uniform float u_warp_gain;              // amplitude factor for each octave
uniform float u_warp_lacunarity;        // frequency factor for each octave
uniform float u_warp_anim;              // Y-position in 2D noise, for animation
uniform float u_warp_turbulence;        // "boiling" effect of noise animation 

// Texture that defines the palette.
uniform sampler2D u_paletteTexture;
uniform float u_paletteOffset;     // offset for palette rotation animation

// Fragment coordinates passed in from the vertex shader.
in vec2 fragCoord;

// Output of this fragment shader.
out vec4 fragColor;

const float PI = 3.1415926535897932384626433832795;

//·············································································································
// Imports

#pragma glslify: Perlin3D        = require('./gl-noise/Perlin3D.glsl')
#pragma glslify: SimplexPerlin3D = require('./gl-noise/SimplexPerlin3D.glsl')
#pragma glslify: Value3D         = require('./gl-noise/Value3D.glsl')
#pragma glslify: Cellular3D      = require('./gl-noise/Cellular3D.glsl')

// These imports select from the above noise functions via preprocessor variables NOISE_FUN and WARP_FUN passed from JS 
// via injectDefines()
#pragma glslify: fbmNoise3D          = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=NOISE_FUN)
#pragma glslify: fbmNoise3D_warp     = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=WARP_NOISE_FUN)
#pragma glslify: fbmNoiseDual3D_warp = require('./gl-noise/FbmNoiseDual3D.glsl', NOISE_FUN=WARP_NOISE_FUN)

//·············································································································
// Regular domain warping. Just offset coordinates by noise values.

vec2 warpRegular( vec2 pos ) {
	vec2 warp = fbmNoiseDual3D_warp( vec3( pos, u_warp_anim ), u_warp_octaves, u_warp_octavesFract, u_warp_frequency * u_frequency, u_warp_lacunarity, u_warp_gain, u_warp_turbulence );
	return pos + warp * u_warp_amplitude;
}

//·············································································································
// Most sample code for domain warping simply adds noise values to the fragment position. 
// This is a variation where we are interpreting the noise values as angle and length to
// produce more fluid-looking results. 

vec2 warpPolar( vec2 pos ) {
	vec2 warp = fbmNoiseDual3D_warp( vec3( pos, u_warp_anim ), u_warp_octaves, u_warp_octavesFract, u_warp_frequency * u_frequency, u_warp_lacunarity, u_warp_gain, u_warp_turbulence );

	float angle = warp.x * PI * u_warp_rotation;
	return pos + vec2( sin( angle ), cos( angle ) ) * warp.x * u_warp_amplitude;
}

//·············································································································
// Most sample code for domain warping simply adds noise values to the fragment position. 
// This is a variation where we are using the noise value for a helix transformation.
// Creates results similar to warpPolar, but requires only a single noise function, reducing GPU load!

vec2 warpHelix( vec2 pos ) {
	float warp = fbmNoise3D_warp( vec3( pos, u_warp_anim ), u_warp_octaves, u_warp_octavesFract, u_warp_frequency * u_frequency, u_warp_amplitude, u_warp_lacunarity, u_warp_gain, u_warp_turbulence );

	// Most sample code for domain warping simply adds noise values to the fragment position. 
	// Interpreting the warp.xy values as angle and length instead produces more interesting results. 
	float angle = warp * PI * u_warp_rotation;
	return pos + vec2( sin( angle ), cos( angle ) ) * warp;
}

//·············································································································

vec2 warpNone( vec2 pos ) {
	return pos;
}

//·············································································································

void main() { 

	vec2 pos = WARP_TRANSFORM_FUN( fragCoord.xy );

	float n = fbmNoise3D( vec3( pos, u_noiseAnim ), u_octaves, u_octavesFract, u_frequency, u_amplitude, u_lacunarity, u_gain, u_turbulence );

	// Actual color is defined by palette
	fragColor = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );
}