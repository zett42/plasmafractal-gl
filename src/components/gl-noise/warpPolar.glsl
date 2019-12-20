// Most sample code for domain warping simply adds noise values to the fragment position. 
// This is a variation where we are interpreting the noise values as angle and length to
// produce more fluid-looking results. 

vec2 warpPolar( vec2 pos, WarpParams warp ) {

	vec2 noise = NOISE_FUN( vec3( pos, warp.anim ), warp.basic );

	float warpAngle = noise.x * warp.rotation;
	return pos.xy + vec2( sin( warpAngle ), cos( warpAngle ) ) * noise.y * warp.amplitude;
}

#pragma glslify: export(warpPolar)