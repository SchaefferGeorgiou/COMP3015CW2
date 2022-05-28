#version 460

//VARIABLES

//IN
layout (location = 2) in vec2 TexCoord;

//
layout(binding=0) uniform sampler2D PositionTex1;
layout(binding=1) uniform sampler2D NormalTex1;
layout(binding=2) uniform sampler2D ColourTex1;
layout(binding=3) uniform sampler2D SpecularTex1;

//
layout(binding=5) uniform sampler2D PositionTex2;
layout(binding=6) uniform sampler2D NormalTex2;
layout(binding=7) uniform sampler2D ColourTex2;
layout(binding=8) uniform sampler2D SpecularTex2;


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
    
    vec3 ambient = vec3(0.0f,0.0f,0.0f);

    vec3 diffuse = vec3(0.0f);
        
    vec3 specular = vec3(0.0f);

    //vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector       
    vec3 s = normalize(Light.Position.xyz);

    float sDotn = max(dot(s,normal), 0.0f) ; //calculate dot product between s and n
    
    diffuse =  (colour * sDotn) ; //calculate the diffuse

    if( sDotn > 0.0f )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = spec * pow(max( dot(h,normal), 0.0), Material.Shininess); 
    }     

    return ambient + (Light.Intensity *( diffuse + specular));
}



void main()
{
    vec3 pos1 = vec3(texture(PositionTex1, TexCoord));
    vec3 norm1 = vec3(texture(NormalTex1, TexCoord));
    vec3 diff1 = vec3(texture(ColourTex1,TexCoord));
    vec3 spec1 = vec3(texture(SpecularTex1,TexCoord));

    vec3 pos2 = vec3(texture(PositionTex2, TexCoord));
    vec3 norm2 = vec3(texture(NormalTex2, TexCoord));
    vec3 diff2 = vec3(texture(ColourTex2,TexCoord));
    vec3 spec2 = vec3(texture(SpecularTex2,TexCoord));
    
    vec3 colour1 = blinnPhong(pos1 , norm1, diff1 , spec1);
    vec3 colour2 = blinnPhong(pos2 , norm2, diff2 , spec2);
    


    FragColour = vec4((colour1 + colour2),1.0);

    
}
