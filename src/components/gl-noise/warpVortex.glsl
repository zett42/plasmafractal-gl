// Most sample code for domain warping simply adds noise values to the fragment position. 
// This is a variation where we are using the noise value for a vortex (spiral) transformation.
// Creates results similar to warpPolar, but requires only a single noise function, reducing GPU load!

vec2 warpVortex( vec2 pos, WarpParams warp ) {
	
	float noise = NOISE_FUN( vec3( pos, warp.anim ), warp.basic );

	float angle = noise * warp.rotation;
	float dist  = noise * warp.amplitude;

	return pos + vec2( sin( angle ), cos( angle ) ) * dist;
}

#pragma glslify: export(warpVortex)