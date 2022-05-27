#version 430

#define PI 3.14159265



uniform vec4 Colour;

uniform sampler2D NoiseTex;

uniform vec4 SkyColour = vec4(0.3,0.3,0.9,1.0);
uniform vec4 CloudColour = vec4(1.0,1.0,1.0,1.0);

in vec2 TexCoord;

layout (location = 0) out vec4 FragColour;


void main()
{
	vec4 noise = texture(NoiseTex,TexCoord);
	float t = (cos(noise.a * PI) + 1.0) / 2.0;
	vec4 colour = mix(SkyColour, CloudColour, t);

	FragColour = vec4(colour.rgb, 1.0);
}
