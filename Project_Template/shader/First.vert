#version 460


//VARIABLES_____________________________________________________________

//IN
layout (location = 0) in vec3 VertexPosition;
layout (location = 1) in vec3 VertexNormal;

//OUT
out vec4 Position;
out vec3 Normal;

//CALC
uniform mat4 MVP;
uniform mat3 NormalMatrix;
uniform mat4 ModelViewMatrix;


//_____________________________________________________________________



void main()
{

    Position = (ModelViewMatrix * vec4(VertexPosition,1.0));
    Normal = normalize(NormalMatrix * VertexNormal);

    gl_Position = MVP * vec4(VertexPosition,1.0);

}