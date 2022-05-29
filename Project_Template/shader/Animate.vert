#version 460


//VARIABLES
//IN
layout (location = 0) in vec3 VertexPosition;
layout (location = 2) in vec2 VertexTexCoord;

//OUT
layout (location = 0) out vec3 Position;
layout (location = 1) out vec3 Normal;
layout (location = 2) out vec2 TexCoord;
 

//UNIFORMS
uniform float Time;

//WAVE
uniform float Freq = 0.5;
uniform float Velocity = 1.5;
uniform float Amp = 0.6;

//MATRICES
uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;


void main()
{
    vec3 pos = VertexPosition;

    float u = (Freq *  (pos.x)  - Velocity * (Time));//Wave in x direction
    float v = (Freq * (pos.z ) - Velocity * (Time));//Wave in z direction

    pos.y = Amp * ( sin(u) + sin(v) );//Combine

    vec3 norm = vec3(0.0);
    norm.xy = normalize(vec2(cos(u) +cos(v) ,1.0));//Calc new normal (not sure if correct but looks close enough/ is cool)
    
    Position = ((ModelMatrix * ViewMatrix) * vec4(pos,1.0)).xyz;//Use new Position
    Normal = normalize(NormalMatrix * norm);//Use new normal   
    
    TexCoord = VertexTexCoord;

    gl_Position = MVP * vec4(pos,1.0);

}