#version 430


//in vec3 Colour;
in vec3 Position;
in vec3 Normal;
in vec2 TexCoord;

layout (location = 0) out vec4 FragColour;
layout (binding = 0) uniform sampler2D BaseTex;
layout (binding = 1) uniform sampler2D AlphaTex;

uniform struct LightInfo
{
    vec3 Position;
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

vec3 blinnPhong(vec3 position, vec3 n) 
{

    
    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector

    vec3 texColour = texture(BaseTex, TexCoord).rgb;

   

    vec3 ambient = Light.La * texColour; 
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
    
    vec3 diffuse = Light.Ld * texColour * sDotn; //calculate the diffuse
        
    vec3 specular = vec3(0.0f);
    
    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess); 
    }     

    return ambient + diffuse + specular;
}


void main()
{

    vec4 alphaMap = texture(AlphaTex, TexCoord).rgba;

    if(alphaMap.a < 0.15)
    {
        discard;
    }
    else
    {
        if(gl_FrontFacing)
        {
            FragColour = vec4(blinnPhong(Position.xyz, Normal),1.0f);
        }
        else
        {
            FragColour = vec4(blinnPhong(Position.xyz, -Normal),1.0f);
        }
        
    }

    
    
}
