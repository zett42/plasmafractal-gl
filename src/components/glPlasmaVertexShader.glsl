#version 300 es

#define SHADER_NAME glPlasmaVertexShader.glsl

precision highp float;

// Scale factor to adjust for screen aspect ratio and orientation.
uniform vec2 u_scale;

// An attribute is an input (in) to a vertex shader.
// It will receive data from a buffer.
in vec2 a_position;

// Used to pass the noise coordinates to the fragment shader.
out vec2 noiseCoord;
// Used to pass the feedback texture coordinates to the fragment shader.
out vec2 feedbackTexCoord;

void main() {

	// Define position of the current vertex by assigning to global variable gl_Position 
	gl_Position = vec4( a_position, 0, 1 );

	// Pass noise coords to the fragment shader.
	// The GPU will interpolate this value between points.
	// Scale to adjust for screen aspect ratio and orientation.
	noiseCoord = a_position * u_scale;

	// Pass the texture coordinates to the fragment shader.
	// Position coords range from -1.0 to 1.0 -> transform to texture range of 0.0 to 1.0.
	// The GPU will interpolate this value between points.
	feedbackTexCoord = a_position * 0.5 + 0.5;
}