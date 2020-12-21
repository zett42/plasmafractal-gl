#version 300 es
#define SHADER_NAME glPlasmaFragShader.glsl

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

#pragma glslify: Perlin3D              = require('./gl-noise/Perlin3D.glsl')
#pragma glslify: DerivPerlin3D         = require('./gl-noise/Perlin3D_Deriv.glsl')
#pragma glslify: SimplexPerlin3D       = require('./gl-noise/SimplexPerlin3D.glsl')
#pragma glslify: DerivSimplexPerlin3D  = require('./gl-noise/SimplexPerlin3D_Deriv.glsl')
#pragma glslify: Value3D               = require('./gl-noise/Value3D.glsl')
#pragma glslify: DerivValue3D          = require('./gl-noise/Value3D_Deriv.glsl')
#pragma glslify: Cellular3D            = require('./gl-noise/Cellular3D.glsl')
#pragma glslify: DerivCellular3D       = require('./gl-noise/Cellular3D_Deriv.glsl')

// Common parameter types
#pragma glslify: import('./gl-noise/FbmNoiseParams.glsl')

// Through preprocessor variables which are passed from JS via injectDefines(), we select from the above noise functions
// to compose the FBM functions.
// NOTE: whitespace within require() should not be changed, as glslify breaks when more than 1 space character appears after comma!

#pragma glslify: fbmNoise3D = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=BASE_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)

//·············································································································
// Noise and transform functions for warp

#pragma glslify: fbmNoise3D_warp = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=WARP_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDual3D_warp = require('./gl-noise/FbmNoiseDual3D.glsl', NOISE_FUN=WARP_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDeriv3D_warp = require('./gl-noise/FbmNoiseDeriv3D.glsl', NOISE_FUN=WARP_NOISE_DERIV_FUN, FbmNoiseParams=FbmNoiseParams)

#pragma glslify: _warpRegular = require('./gl-noise/warpRegular.glsl', NOISE_FUN=fbmNoiseDual3D_warp, WarpParams=WarpParams)
#pragma glslify: _warpPolar = require('./gl-noise/warpPolar.glsl', NOISE_FUN=fbmNoiseDual3D_warp, WarpParams=WarpParams)
#pragma glslify: _warpVortex = require('./gl-noise/warpVortex.glsl', NOISE_FUN=fbmNoise3D_warp, WarpParams=WarpParams)
#pragma glslify: _warpVortexInverse = require('./gl-noise/warpVortexInverse.glsl', NOISE_FUN=fbmNoise3D_warp, WarpParams=WarpParams)
#pragma glslify: _warpDerivatives = require('./gl-noise/warpDerivatives.glsl', NOISE_FUN=fbmNoiseDeriv3D_warp, WarpParams=WarpParams)

// Wrapper functions so we can select from the functions at runtime, without having to know the suffix
// that is added by glslify to the 'require'd functions, which it does to avoid duplicate identifiers.
vec2 warpRegular( vec2 pos, WarpParams warp )        { return _warpRegular( pos, warp ); }
vec2 warpPolar( vec2 pos, WarpParams warp )          { return _warpPolar( pos, warp ); }
vec2 warpVortex( vec2 pos, WarpParams warp )         { return _warpVortex( pos, warp ); }
vec2 warpVortexInverse( vec2 pos, WarpParams warp )  { return _warpVortexInverse( pos, warp ); }
vec2 warpDerivatives( vec2 pos, WarpParams warp )    { return _warpDerivatives( pos, warp ); }

//·············································································································
// Noise and transform functions for warp2

#pragma glslify: fbmNoise3D_warp2 = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=WARP2_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDual3D_warp2 = require('./gl-noise/FbmNoiseDual3D.glsl', NOISE_FUN=WARP2_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDeriv3D_warp2 = require('./gl-noise/FbmNoiseDeriv3D.glsl', NOISE_FUN=WARP2_NOISE_DERIV_FUN, FbmNoiseParams=FbmNoiseParams)

#pragma glslify: _warpRegular2 = require('./gl-noise/warpRegular.glsl', NOISE_FUN=fbmNoiseDual3D_warp2, WarpParams=WarpParams)
#pragma glslify: _warpPolar2 = require('./gl-noise/warpPolar.glsl', NOISE_FUN=fbmNoiseDual3D_warp2, WarpParams=WarpParams)
#pragma glslify: _warpVortex2 = require('./gl-noise/warpVortex.glsl', NOISE_FUN=fbmNoise3D_warp2, WarpParams=WarpParams)
#pragma glslify: _warpVortexInverse2 = require('./gl-noise/warpVortexInverse.glsl', NOISE_FUN=fbmNoise3D_warp2, WarpParams=WarpParams)
#pragma glslify: _warpDerivatives2 = require('./gl-noise/warpDerivatives.glsl', NOISE_FUN=fbmNoiseDeriv3D_warp2, WarpParams=WarpParams)

// Wrapper functions so we can select from the functions at runtime, without having to know the suffix
// that is added by glslify to the 'require'd functions, which it does to avoid duplicate identifiers.
vec2 warpRegular2( vec2 pos, WarpParams warp )       { return _warpRegular2( pos, warp ); }
vec2 warpPolar2( vec2 pos, WarpParams warp )         { return _warpPolar2( pos, warp ); }
vec2 warpVortex2( vec2 pos, WarpParams warp )        { return _warpVortex2( pos, warp ); }
vec2 warpVortexInverse2( vec2 pos, WarpParams warp ) { return _warpVortexInverse2( pos, warp ); }
vec2 warpDerivatives2( vec2 pos, WarpParams warp )   { return _warpDerivatives2( pos, warp ); }

//·············································································································
// Noise and transform functions for feedback

#pragma glslify: fbmNoise3D_FB = require('./gl-noise/FbmNoise3D.glsl', NOISE_FUN=WARP2_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDual3D_FB = require('./gl-noise/FbmNoiseDual3D.glsl', NOISE_FUN=WARP2_NOISE_FUN, FbmNoiseParams=FbmNoiseParams)
#pragma glslify: fbmNoiseDeriv3D_FB = require('./gl-noise/FbmNoiseDeriv3D.glsl', NOISE_FUN=WARP2_NOISE_DERIV_FUN, FbmNoiseParams=FbmNoiseParams)

#pragma glslify: _warpRegularFB = require('./gl-noise/warpRegular.glsl', NOISE_FUN=fbmNoiseDual3D_FB, WarpParams=WarpParams)
#pragma glslify: _warpPolarFB = require('./gl-noise/warpPolar.glsl', NOISE_FUN=fbmNoiseDual3D_FB, WarpParams=WarpParams)
#pragma glslify: _warpVortexFB = require('./gl-noise/warpVortex.glsl', NOISE_FUN=fbmNoise3D_FB, WarpParams=WarpParams)
#pragma glslify: _warpVortexInverseFB = require('./gl-noise/warpVortexInverse.glsl', NOISE_FUN=fbmNoise3D_FB, WarpParams=WarpParams)
#pragma glslify: _warpDerivativesFB = require('./gl-noise/warpDerivatives.glsl', NOISE_FUN=fbmNoiseDeriv3D_FB, WarpParams=WarpParams)

// Wrapper functions so we can select from the functions at runtime, without having to know the suffix
// that is added by glslify to the 'require'd functions, which it does to avoid duplicate identifiers.
vec2 warpRegularFB( vec2 pos, WarpParams warp )       { return _warpRegularFB( pos, warp ); }
vec2 warpPolarFB( vec2 pos, WarpParams warp )         { return _warpPolarFB( pos, warp ); }
vec2 warpVortexFB( vec2 pos, WarpParams warp )        { return _warpVortexFB( pos, warp ); }
vec2 warpVortexInverseFB( vec2 pos, WarpParams warp ) { return _warpVortexInverseFB( pos, warp ); }
vec2 warpDerivativesFB( vec2 pos, WarpParams warp )   { return _warpDerivativesFB( pos, warp ); }

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

// Feedback warping parameters.
uniform WarpParams u_warpFB;

// Texture that defines the palette.
uniform sampler2D u_paletteTexture;
uniform float     u_paletteOffset;     // offset for palette rotation animation

uniform sampler2D u_feedbackTexture;

// Fragment coordinates passed in from the vertex shader.
in vec2 noiseCoord;
in vec2 feedbackTexCoord;

// Output of this fragment shader.
out vec4 fragColor;

//·············································································································

void main() { 

	vec2 pos = noiseCoord;

	pos = WARP2_TRANSFORM_FUN( pos, u_warp2 );
	pos = WARP_TRANSFORM_FUN( pos, u_warp );

	float n = fbmNoise3D( vec3( pos, u_noise.anim ), u_noise.basic ) * u_noise.amplitude;
						
	// Adjust for differences in noise function range (-1..1 or 0..1).
	n = MAP_TO_PALETTE_FUN( n );

	// Optionally clamp to 0..1
	n = NOISE_CLAMP_FUN( n );

	// Actual color is defined by palette
	vec4 color = texture( u_paletteTexture, vec2( n + u_paletteOffset, 0 ) );

	// TODO: need to transform based on centered coords and only afterwards scale to tex coord system?
	vec2 fbCoord = WARPFB_TRANSFORM_FUN( feedbackTexCoord, u_warpFB );
	vec4 fbColor = texture( u_feedbackTexture, fbCoord );

	color += fbColor * 0.99;   // TODO: various blending functions
	
	fragColor = color;
}