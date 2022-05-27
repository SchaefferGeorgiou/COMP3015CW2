#version 430


uniform struct LightInfo {

	vec4 Position;
	vec3 Intensity;

}Light;


uniform struct MaterialInfo {

	vec3 Ka;
	vec3 Kd;

}Material;

uniform vec4 LineColour;

in vec3 GeomPosition;
in vec3 GeomNormal;

flat  in int GIsEdge;

layout (location = 0) out vec4 FragColour;
const int levels = 3;
const float scaleFactor = 1.0 / levels;

vec3 toonShade()
{
    vec3 s = normalize (Light.Position.xyz - GeomPosition.xyz);
    vec3 ambient = Material.Ka;
    float cosine = dot(s, GeomNormal);
    vec3 diffuse = Material.Kd * ceil(cosine * levels) * scaleFactor;


    return (Light.Intensity) * (ambient + diffuse);
}

void main()
{
	
	if(GIsEdge == 1)
	{
		FragColour = LineColour;
	}
	else
	{
		FragColour = vec4(toonShade(),1.0);
	}

}
