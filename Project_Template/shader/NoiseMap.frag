#version 460

#define PI 3.14159265

//VARIABLES_____________________________________________________________

//IN
layout (location = 2) in vec2 TexCoord;


layout(binding=4) uniform sampler2D NoiseTex;

//OUT
//layout (location = 0) out vec4 FragColour;
layout (location = 5) out vec4 NoiseData;


uniform vec4 Colour1 = vec4(0.0,0.0,0.0,1.0);
uniform vec4 Colour2 = vec4(1.0,1.0,1.0,1.0);


void makeTexture()
{
	vec4 noise = texture(NoiseTex,TexCoord);
	float t = (cos(noise.a * PI) + 1) / 2;
	vec4 colour = mix(Colour1, Colour2, t);

	NoiseData = vec4(colour.rgb, 1.0);
}

void main()
{
	makeTexture();

	//FragColour = NoiseData;
}
