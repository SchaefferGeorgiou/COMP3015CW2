#version 460


//VARIABLES

//IN
in vec3 Position;
in vec3 Normal;

//OUT
layout (location = 0) out vec4 FragColour;
layout (location = 1) out vec3 PositionData;
layout (location = 2) out vec3 NormalData;
layout (location = 3) out vec3 ColourData;
layout (location = 4) out vec3 SpecularData;



//STRUCTS

uniform struct MaterialInfo
{
    vec3 Kd;
    vec3 Ks;

}Material;


//METHODS

void saveData()
{

}



void main()
{
    saveData();

    FragColour = vec4(1.0,0.0,0.0,1.0);
    
}
