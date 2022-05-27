#version 430

layout (location = 0) in vec3 VertexPosition;
layout (location = 1) in vec3 VertexNormal;



out vec3 Vertices;
out vec3 Normals;


uniform mat4 ModelViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;


void main()
{
    Normals = normalize(NormalMatrix * VertexNormal);

    Vertices = (ModelViewMatrix * vec4(VertexPosition,1.0)).xyz;

    gl_Position = MVP * vec4(VertexPosition,1.0);

}