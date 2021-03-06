#version 460

//VARIABLES
//IN
layout (location = 0) in vec3 VertexPosition;
layout (location = 1) in vec3 VertexNormal;
layout (location = 2) in vec2 VertexTexCoord;

//OUT
layout (location = 0) out vec3 Position;
layout (location = 1) out vec3 Normal;
layout (location = 2) out vec2 TexCoord;


//UNIFORMS
//MATRICES
uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;


void main()
{
    Position = (( ModelMatrix * ViewMatrix) * vec4(VertexPosition,1.0)).xyz;
    Normal = normalize(NormalMatrix * VertexNormal);   
    
    TexCoord = VertexTexCoord;

    gl_Position = MVP * vec4(VertexPosition,1.0);
}