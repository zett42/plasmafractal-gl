#version 300 es

#define SHADER_NAME glPlasmaFrag.glsl

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

// NOTE: We select one of these noise functions by preprocessor variable NOISE_FUN passed from JS via injectDefines()
#pragma glslify: Perlin3D   = require('./gl-noise/Perlin3D.glsl')
#pragma glslify: Value3D    = require('./gl-noise/Value3D.glsl')
#pragma glslify: Cellular3D = require('./gl-noise/Cellular3D.glsl')

//·············································································································

float fbm( vec3 pos, int octaves, float octavesFract, float frequency, float amplitude, float lacunarity, float gain,
           float turbulence ) {

	float result = 0.0;

	float freq = frequency;
	float amp  = amplitude;
	float z    = pos.z;

	// Z-increment to "randomize" each octave for avoiding artefacts that originate from coords 0,0
	// due to the pseudo-random nature of the noise.
	// This value has been choosen by trial and error.
	const float zInc = 7.0;

	// Create fractal noise by adding multiple octaves of noise.
	for( int i = 0; i < octaves; ++i ) {                

		vec3 p = vec3( pos.xy * freq, z );
		result += NOISE_FUN( p ) * amp;

		freq   *= lacunarity;
		amp    *= gain;
		z      += zInc;
		z      *= turbulence;
	}

	// Fractional part of octave value is used for smooth transition.
	vec3 p1 = vec3( pos.xy * freq, z );
	result += NOISE_FUN( p1 ) * amp * octavesFract;

	return result;
}

//·············································································································

void main() { 
	float n = fbm( vec3( fragCoord.xy, u_noiseZ ), u_octaves, u_octavesFract, u_frequency, u_amplitude, u_lacunarity, u_gain, u_turbulence );

	// Actual color is defined by palette
	fragColor = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );
}