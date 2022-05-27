#version 430

layout (location = 0) in vec3 VertexPosition;
//layout (location = 1) in vec3 VertexColor;
layout (location = 1) in vec3 VertexNormal;

//out vec3 Color;
out vec3 LightIntensity;

uniform vec4 LightPosition;
uniform vec3 Kd;
uniform vec3 Ld;
uniform mat4 ModelViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;


void main()
{
    //Color = VertexColor;


    vec3 n = normalize( NormalMatrix * VertexNormal);

    vec4 pos = ModelViewMatrix * vec4(VertexPosition,1.0);
    
    vec3 s = normalize(vec3(LightPosition - pos));

    float sDotn = max(dot(s,n), 0.0);

    vec3 diffuse = Ld * Kd * sDotn;

    LightIntensity = diffuse;  

    gl_Position = MVP * vec4(VertexPosition,1.0);
}
