#version 300 es

precision highp float;

// Scale factor to adjust for screen aspect ratio and orientation.
uniform vec2 u_scale;

// An attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;

// Used to pass the texture coordinates to the fragment shader
out vec2 fragCoord;

void main() {
	// Scale to adjust for screen aspect ratio and orientation.
	vec2 pos = a_position * u_scale;

	// Define position of the current vertex by assigning to global variable gl_Position 
	gl_Position = vec4( pos, 0, 1 );

	// pass the texCoord to the fragment shader
	// The GPU will interpolate this value between points.
	fragCoord = a_texCoord;
}