#version 460

layout (location = 0) in vec3 VertexPosition;
layout (location = 1) in vec3 VertexNormal;
layout( location = 2 ) in vec2 VertexTexCoord;


out vec3 Vertices;
out vec3 Normals;
out vec2 TexCoord;

uniform mat4 ModelViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;

void main()
{
    Normals = normalize( NormalMatrix * VertexNormal);

    Vertices = (ModelViewMatrix * vec4(VertexPosition,1.0)).xyz;

    TexCoord = VertexTexCoord;

    gl_Position = MVP * vec4(VertexPosition,1.0);

}