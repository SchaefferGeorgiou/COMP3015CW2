#version 460

in vec2 TexCoord;

uniform sampler2D SpriteTex;

layout (location = 0) out vec4 FragColour;


void main()
{
	FragColour =  texture(SpriteTex, TexCoord);
}
