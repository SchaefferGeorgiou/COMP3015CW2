#version 460

//VARIABLES

//IN
layout (location = 2) in vec2 TexCoord;

layout(binding=0) uniform sampler2D PositionTex;
layout(binding=1) uniform sampler2D NormalTex;
layout(binding=2) uniform sampler2D ColourTex;
layout(binding=3) uniform sampler2D SpecularTex;
layout(binding=4) uniform sampler2D NoiseTex;

//OUT
layout (location = 0) out vec4 FragColour;


//STRUCTS

uniform struct LightInfo
{
    vec4 Position;
    float Intensity;

}Light;

uniform struct MaterialInfo
{
    float Shininess;

}Material;

//METHODS
vec3 blinnPhong(vec3 position, vec3 normal, vec3 colour, vec3 spec) 
{
    
    vec3 diffuse = vec3(0.0f);
        
    vec3 specular = vec3(0.0f);

    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector       
    
    float sDotn = max(dot(s,normal), 0.0f) ; //calculate dot product between s and n
    
    diffuse = colour * sDotn; //calculate the diffuse

    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = spec * pow(max( dot(h,normal), 0.0), Material.Shininess); 
    }     

    return Light.Intensity * (diffuse + specular);
}



void main()
{
    vec3 pos = vec3(texture(PositionTex, TexCoord));
    vec3 norm = vec3(texture(NormalTex, TexCoord));
    vec3 diff = vec3(texture(ColourTex,TexCoord));
    vec3 spec = vec3(texture(SpecularTex,TexCoord));
    vec4 noise = texture(NoiseTex,TexCoord);

    


    FragColour = vec4(blinnPhong(pos , norm, noise.rgb , spec),1.0);

    
}
