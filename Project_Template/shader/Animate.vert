#version 460

//VARIABLES

layout (location = 0) in vec3 VertexPosition;
layout (location = 1) in vec3 VertexNormal;
layout (location = 2) in vec2 VertexTexCoord;

layout (location = 0) out vec3 Position;
layout (location = 1) out vec3 Normal;
layout (location = 2) out vec2 TexCoord;
 

uniform float Time;

uniform float Freq = 0.5;
uniform float Velocity = 1.5;
uniform float Amp = 0.6;

uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;

void main()
{
    

    vec3 pos = VertexPosition;

    float u = (Freq *  (pos.x)  - Velocity * (Time));
    float v = (Freq * (pos.z ) - Velocity * (Time));

    pos.y = Amp * ( sin(u) + sin(v) );
    

    vec3 norm = vec3(0.0);
    norm.xy = normalize(vec2(cos(u) +cos(v) ,1.0));
    

    Position = ( vec4(pos,1.0)).xyz;
    Normal = normalize(NormalMatrix * norm);   
    
    TexCoord = VertexTexCoord;

    gl_Position = MVP * vec4(pos,1.0);

}