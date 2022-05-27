#version 430

layout (location = 0) in vec3 Position;
layout (location = 1) in vec3 Normal;



out vec3 VertexPosition;
out vec3 VertexNormal;



uniform mat4 ModelViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;


void main()
{
    VertexNormal = normalize(NormalMatrix * Normal);

    VertexPosition = (ModelViewMatrix * vec4(Position,1.0)).xyz;

    gl_Position = MVP * vec4(Position,1.0);

}