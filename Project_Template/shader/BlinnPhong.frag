#version 460

//VARIABLES
const vec3 ambient = vec3(0.01f,0.01f,0.01f);
//IN
layout (location = 2) in vec2 TexCoord;

//
layout(binding=0) uniform sampler2D PositionTex1;
layout(binding=1) uniform sampler2D NormalTex1;
layout(binding=2) uniform sampler2D ColourTex1;
layout(binding=3) uniform sampler2D SpecularTex1;



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
    //vec3 s = normalize(Light.Position.xyz);

    float sDotn = max(dot(s,normal), 0.0f) ; //calculate dot product between s and n
    
    diffuse =  (colour * sDotn) ; //calculate the diffuse

    if( sDotn > 0.0f )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = spec * pow(max( dot(h,normal), 0.0), Material.Shininess); 
    }     

    return ambient + (Light.Intensity * (diffuse + specular));
}



void main()
{
    vec4 pos1 = texture(PositionTex1, TexCoord);
    vec4 norm1 = texture(NormalTex1, TexCoord);
    vec4 diff1 = texture(ColourTex1,TexCoord);
    vec4 spec1 = texture(SpecularTex1,TexCoord);
    
    vec4 colour1 = vec4(blinnPhong(pos1.xyz , norm1.xyz, diff1.xyz , spec1.xyz),1.0);



    
    
    



    FragColour = colour1 ;
    

    

    
}
