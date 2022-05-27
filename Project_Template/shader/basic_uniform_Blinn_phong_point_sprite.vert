#version 460

layout (location = 0) in vec3 VertexPosition;



out vec3 Vertices;


uniform mat4 ModelViewMatrix;


void main()
{
    gl_Position = ModelViewMatrix * vec4(VertexPosition,1.0);

}