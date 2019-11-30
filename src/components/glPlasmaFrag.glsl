#version 300 es

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
		n += NOISE_FUN( p ) * amp;

		freq   *= u_lacunarity;
		amp    *= u_gain;
		z      += zInc;
		z      *= u_turbulence;
	}

	// Fractional part of octave value is used for smooth transition.
	vec3 p1 = vec3( fragCoord.xy * freq, z );
	n += NOISE_FUN( p1 ) * amp * u_octavesFract;

	// Actual color is defined by palette
	fragColor = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );
}