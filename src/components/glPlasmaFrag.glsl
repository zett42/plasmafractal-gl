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

//·············································································································
// Imports

#pragma glslify: Perlin3D        = require('./gl-noise/Perlin3D.glsl')
#pragma glslify: SimplexPerlin3D = require('./gl-noise/SimplexPerlin3D.glsl')
#pragma glslify: Value3D         = require('./gl-noise/Value3D.glsl')
#pragma glslify: Cellular3D      = require('./gl-noise/Cellular3D.glsl')

// Common parameter types
#pragma glslify: import('./gl-noise/FbmNoiseParams.glsl')

// Through preprocessor variables BASE_NOISE_FUN, WARP_NOISE_FUN and WARP2_NOISE_FUN which are passed from JS 
// via injectDefines(), we select from the above noise functions to compose the FBM functions.
// NOTE: formatting should not be changed, as glslify breaks when more than 1 space character appears after comma!

#pragma glslify: fbmNoise3D = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=BASE_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)

#pragma glslify: fbmNoise3D_warp = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=WARP_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDual3D_warp = require('./gl-noise/FbmNoiseDual3D.glsl', NOISE_FUN=WARP_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)

#pragma glslify: _warpRegular = require('./gl-noise/warpRegular.glsl', NOISE_FUN=fbmNoiseDual3D_warp, WarpParams=WarpParams)
#pragma glslify: _warpPolar = require('./gl-noise/warpPolar.glsl', NOISE_FUN=fbmNoiseDual3D_warp, WarpParams=WarpParams)
#pragma glslify: _warpVortex = require('./gl-noise/warpVortex.glsl', NOISE_FUN=fbmNoise3D_warp, WarpParams=WarpParams)
#pragma glslify: _warpVortexInverse = require('./gl-noise/warpVortexInverse.glsl', NOISE_FUN=fbmNoise3D_warp, WarpParams=WarpParams)

#pragma glslify: fbmNoise3D_warp2 = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=WARP2_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDual3D_warp2 = require('./gl-noise/FbmNoiseDual3D.glsl', NOISE_FUN=WARP2_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)

#pragma glslify: _warp2Regular = require('./gl-noise/warpRegular.glsl', NOISE_FUN=fbmNoiseDual3D_warp2, WarpParams=WarpParams)
#pragma glslify: _warp2Polar = require('./gl-noise/warpPolar.glsl', NOISE_FUN=fbmNoiseDual3D_warp2, WarpParams=WarpParams)
#pragma glslify: _warp2Vortex = require('./gl-noise/warpVortex.glsl', NOISE_FUN=fbmNoise3D_warp2, WarpParams=WarpParams)
#pragma glslify: _warp2VortexInverse = require('./gl-noise/warpVortexInverse.glsl', NOISE_FUN=fbmNoise3D_warp2, WarpParams=WarpParams)

//·············································································································
// Wrapper functions so we can select from the functions at runtime, without having to know the suffix
// that is added by glslify to the 'require'd functions, which it does to avoid duplicate identifiers.

vec2 warpRegular( vec2 pos, WarpParams warp )        { return _warpRegular( pos, warp ); }
vec2 warpPolar( vec2 pos, WarpParams warp )          { return _warpPolar( pos, warp ); }
vec2 warpVortex( vec2 pos, WarpParams warp )         { return _warpVortex( pos, warp ); }
vec2 warpVortexInverse( vec2 pos, WarpParams warp )  { return _warpVortexInverse( pos, warp ); }

vec2 warp2Regular( vec2 pos, WarpParams warp )       { return _warp2Regular( pos, warp ); }
vec2 warp2Polar( vec2 pos, WarpParams warp )         { return _warp2Polar( pos, warp ); }
vec2 warp2Vortex( vec2 pos, WarpParams warp )        { return _warp2Vortex( pos, warp ); }
vec2 warp2VortexInverse( vec2 pos, WarpParams warp ) { return _warp2VortexInverse( pos, warp ); }

//·············································································································

float clampZeroOne( float value ) {
	return clamp( value, 0.0, 1.0 );
}

//·············································································································

float mapToPaletteMinusOneToOne( float value ) {
	return value / 2.0 + 0.5;	
}

//·············································································································
// Identity functions to switch off certain effects.

float identity( float value ) {	return value; }

vec2 identity( vec2 value ) { return value; }

vec2 identity( vec2 value, WarpParams warp ) { return value; }

//·············································································································
// Shader parameters

// Regular noise parameters.
uniform NoiseParams u_noise;

// Domain warping parameters.
uniform WarpParams u_warp;
uniform WarpParams u_warp2;

// Texture that defines the palette.
uniform sampler2D u_paletteTexture;
uniform float     u_paletteOffset;     // offset for palette rotation animation

// Fragment coordinates passed in from the vertex shader.
in vec2 fragCoord;

// Output of this fragment shader.
out vec4 fragColor;

//·············································································································

void main() { 

	vec2 pos = fragCoord.xy;

	pos = WARP2_TRANSFORM_FUN( pos, u_warp2 );
	pos = WARP_TRANSFORM_FUN( pos, u_warp );

	float n = fbmNoise3D( vec3( pos, u_noise.anim ), u_noise.basic ) * u_noise.amplitude;
						
	// Adjust for differences in noise function range (-1..1 or 0..1).
	n = MAP_TO_PALETTE_FUN( n );

	// Optionally clamp to 0..1
	n = NOISE_CLAMP_FUN( n );

	// Actual color is defined by palette
	fragColor = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );
}