#version 460

//VARIABLES
layout (location = 0) in vec3 Position;
layout (location = 1) in vec3 Normal;
layout (location = 2) in vec2 TexCoord;

//OUT
layout (location = 1) out vec3 PositionData;
layout (location = 2) out vec3 NormalData;
layout (location = 3) out vec3 ColourData;
layout (location = 4) out vec3 SpecularData;

layout(binding=4) uniform sampler2D NoiseTex;


//STRUCTS
uniform struct MaterialInfo
{
    vec3 Kd;
    vec3 Ks;

}Material;


//METHODS

void saveData()
{
    vec4 noise = texture(NoiseTex,TexCoord);
    PositionData = Position.xyz;
    NormalData = normalize(Normal);
    ColourData = Material.Kd * noise.a;
    SpecularData = Material.Ks;
}



void main()
{
    saveData();

    
    
}
