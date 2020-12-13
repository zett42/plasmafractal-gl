// Domain warping by noise derivatives.

vec2 warpDerivatives( vec2 pos, WarpParams warp ) {

	vec4 noise = NOISE_FUN( vec3( pos, warp.anim ), warp.basic );
    
    // noise.x   = noise value
    // noise.yzw = derivatives (x,y,z)
    vec2 deriv = vec2( noise.y, noise.z );

	return pos + deriv * warp.amplitude;
}

#pragma glslify: export(warpDerivatives)