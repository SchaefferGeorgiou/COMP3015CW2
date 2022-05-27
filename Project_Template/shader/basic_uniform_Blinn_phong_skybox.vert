#version 430

layout (location = 0) in vec3 VertexPosition;


out vec3 Vertices;


uniform struct LightInfo
{
    vec4 Position;
    vec3 La;
    vec3 Ld;  
    
}Light;

uniform struct MaterialInfo
{
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;



uniform mat4 ModelViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 ProjectionMatrix;
uniform mat4 MVP;

void main()
{
    Vertices = VertexPosition;

    gl_Position = MVP * vec4(VertexPosition,1.0);

}