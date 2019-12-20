// Regular domain warping. Just offset coordinates by noise values.

vec2 warpRegular( vec2 pos, WarpParams warp ) {

	vec2 noise = NOISE_FUN( vec3( pos, warp.anim ), warp.basic );
									  
	return pos + noise * warp.amplitude;
}

#pragma glslify: export(warpRegular)