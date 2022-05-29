#version 460

//VARIABLES
//IN
layout (location = 0) in vec3 VertexPosition;
layout( location = 2) in vec2 VertexTexCoord;

//OUT
out vec2 TexCoord;


//MATRICES
uniform mat4 MVP;


void main()
{
	TexCoord = VertexTexCoord;	

    gl_Position = MVP * vec4(VertexPosition,1.0);
}