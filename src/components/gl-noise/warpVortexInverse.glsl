// Variation of warpVortex. 

vec2 warpVortexInverse( vec2 pos, WarpParams warp ) {

	float noise = NOISE_FUN( vec3( pos, warp.anim ), warp.basic );

	noise = 1.0 - abs( clamp( noise, -1.0, 1.0 ) );

	float angle = noise * warp.rotation;
	float dist  = noise * warp.amplitude;

	return pos + vec2( sin( angle ), cos( angle ) ) * dist;
}

#pragma glslify: export(warpVortexInverse)