#version 460


uniform struct LightInfo {

	vec4 Position;
	vec3 Intensity;

}Light;


uniform struct MaterialInfo {

	vec3 Ka;
	vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;

uniform sampler2DShadow ShadowMap;

in vec4 Position;
in vec3 Normal;
in vec4 ShadowCoord;

layout (location = 0) out vec4 FragColour;

vec3 blinnPhong()
{
	vec3 s = normalize(((Light.Position).xyz - Position.xyz)); //calculate s vector   
    
    float sDotn = max(dot(s,Normal), 0.0f) ; //calculate dot product between s and n
    
    vec3 diffuse = Material.Kd * sDotn; //calculate the diffuse
        
    vec3 specular = vec3(0.0f);
    
    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-Position.xyz);
        vec3 h = normalize(v + s);
        specular = Material.Ks * pow(max( dot(h,Normal), 0.0), Material.Shininess); 
    }

    return Light.Intensity *(diffuse + specular);
}

subroutine void RenderPassType();
subroutine uniform RenderPassType RenderPass;

subroutine (RenderPassType)
void shadeWithShadow()
{
    
    vec3 ambient = Material.Ka * Light.Intensity;
    vec3 diffAndSpec = blinnPhong();

    float shadow = 1.0;
    if(ShadowCoord.z >= 0)
    {
        shadow = textureProj(ShadowMap,ShadowCoord);
    }

    FragColour = vec4(diffAndSpec * shadow + ambient,1.0);

    FragColour = pow(FragColour, vec4(1.0/2.2));
}

subroutine (RenderPassType)
void recordDepth()
{

}

void main()
{
	
	RenderPass();

}
