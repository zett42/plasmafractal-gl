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
uniform float u_noiseAnim;            // Z-position in 3D noise, for animation
uniform float u_turbulence;        // "boiling" effect of noise animation 

// domain warping parameters
uniform int   u_warp_octaves;           // number of octaves for fractal noise
uniform float u_warp_octavesFract;      // fractional part of octaves value
uniform float u_warp_frequency;         // noise frequency
uniform float u_warp_amplitude;         // directional amplitude
uniform float u_warp_rotation;          // rotational amplitude
uniform float u_warp_gain;              // amplitude factor for each octave
uniform float u_warp_lacunarity;        // frequency factor for each octave
uniform float u_warp_anim;              // Y-position in 2D noise, for animation
uniform float u_warp_turbulence;        // "boiling" effect of noise animation 

// texture that defines the palette
uniform sampler2D u_paletteTexture;
uniform float u_paletteOffset;     // offset for palette rotation animation

// fragment coordinates passed in from the vertex shader
in vec2 fragCoord;

// declare output of the fragment shader
out vec4 fragColor;

const float PI = 3.1415926535897932384626433832795;

// NOTE: We select from these noise functions by preprocessor variables NOISE_FUN and WARP_FUN passed from JS 
// via injectDefines()
#pragma glslify: Perlin3D        = require('./gl-noise/Perlin3D.glsl')
#pragma glslify: SimplexPerlin3D = require('./gl-noise/SimplexPerlin3D.glsl')
#pragma glslify: Value3D         = require('./gl-noise/Value3D.glsl')
#pragma glslify: Cellular3D      = require('./gl-noise/Cellular3D.glsl')

//·············································································································

float fbm_noise( vec3 pos, int octaves, float octavesFract, float frequency, float amplitude, float lacunarity, float gain,
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
	vec3 p = vec3( pos.xy * freq, z );
	result += NOISE_FUN( p ) * amp * octavesFract;

	return result;
}

//·············································································································

vec2 fbm_warp( vec3 pos, int octaves, float octavesFract, float frequency, float lacunarity, float gain,
               float turbulence ) {

	vec2 result = vec2( 0 );

	float freq = frequency;
	float amp  = 1.0;
	float z    = pos.z;

	// Z-increment to "randomize" each octave for avoiding artefacts that originate from coords 0,0
	// due to the pseudo-random nature of the noise.
	// This value has been choosen by trial and error.
	const float zInc = 7.0;

	// Randomize noise for Y direction.
	const float yInc = 4.8;

	// Create fractal noise by adding multiple octaves of noise.
	for( int i = 0; i < octaves; ++i ) {                

		vec3 p = vec3( pos.xy * freq, z );
		float nx = WARP_FUN( vec3( pos.xy * freq, z ) );
		float ny = WARP_FUN( vec3( pos.xy * freq, z + yInc ) );

		result += vec2( nx, ny ) * amp;

		freq   *= lacunarity;
		amp    *= gain;
		z      += zInc;
		z      *= turbulence;
	}

	// Fractional part of octave value is used for smooth transition.
	vec3 p = vec3( pos.xy * freq, z );
	float nx = WARP_FUN( vec3( pos.xy * freq, z ) );
	float ny = WARP_FUN( vec3( pos.xy * freq, z + yInc ) );

	result += vec2( nx, ny ) * amp * octavesFract;

	return result;
}

//·············································································································

vec2 fbm_warp_none( vec3 pos, int octaves, float octavesFract, float frequency, float lacunarity, float gain,
                    float turbulence )
{
	return vec2( 0 );
}

//·············································································································

void main() { 

	vec2 pos = fragCoord.xy;

	vec2 warp = FBM_WARP_FUN( vec3( pos, u_warp_anim ), u_warp_octaves, u_warp_octavesFract, u_warp_frequency * u_frequency, u_warp_lacunarity, u_warp_gain, u_warp_turbulence );

	// Most sample code for domain warping simply adds noise values to the fragment position. 
	// Instead, we are interpreting the warp.xy values as angle and length, which produces more interesting results. 
	float angle = warp.x * PI * u_warp_rotation;
	pos += vec2( sin( angle ), cos( angle ) ) * warp.y * u_warp_amplitude;

	float n = fbm_noise( vec3( pos, u_noiseAnim ), u_octaves, u_octavesFract, u_frequency, u_amplitude, u_lacunarity, u_gain, u_turbulence );

	// Actual color is defined by palette
	fragColor = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );
}