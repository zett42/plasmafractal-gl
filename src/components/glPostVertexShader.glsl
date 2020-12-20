#version 300 es
#define SHADER_NAME glPostVertexShader.glsl

precision highp float;

// An attribute is an input (in) to a vertex shader.
// It will receive data from a buffer.
in vec2 a_position;
in vec2 a_texCoord;

// Used to pass the texture coordinates to the fragment shader
out vec2 fragCoord;

void main() {
	// Define position of the current vertex by assigning to global variable gl_Position 
	gl_Position = vec4( a_position, 0, 1 );

	// pass the texCoord to the fragment shader
	// The GPU will interpolate this value between points.
	fragCoord = a_texCoord;
}