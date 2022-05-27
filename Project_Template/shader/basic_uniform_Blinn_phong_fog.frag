#version 430


//in vec3 Colour;
in vec3 Position;
in vec3 Normal;

layout (location = 0) out vec4 FragColour;


uniform struct LightInfo
{
    vec3 Position;
    vec3 La;
    vec3 Ld;  
    
}Light;

uniform struct FogInfo
{
    float MaxDist; //max distance
    float MinDist; //min distance
    vec3 Colour; //colour of the fog
} Fog;

uniform struct MaterialInfo
{
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;


//vec3 phongModel(vec3 position, vec3 n)
//{
//    
//    vec3 ambient = Material.Ka * Spot.La;
//    
//    vec3 s = normalize(((Spot.Position).xyz - position));
//
//    float sDotn = max(dot(s,n), 0.0);
//
//    
//    vec3 diffuse = Spot.Ld * Material.Kd * sDotn;
//
//    vec3 specular = vec3(0.0f);
//
//    if (sDotn > 0)
//    {
//
//        vec3 v = normalize(-position.xyz);
//        vec3 h = normalize(v + s);
//        specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess);        
//
//     }
//
//    return ambient + diffuse + specular;
//}

vec3 blinnPhong(vec3 position, vec3 n) 
{

    vec3 ambient = Material.Ka * Light.La; 
    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
    
    vec3 diffuse = Light.Ld * Material.Kd * sDotn; //calculate the diffuse
        
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

    float dist = abs( Position.z ); //distance calculations

    //fogFactor calculation based on the formula presented earlier
    float fogFactor = (Fog.MaxDist - dist) / (Fog.MaxDist - Fog.MinDist);
    fogFactor = clamp( fogFactor, 0.0, 1.0 ); //we clamp values

    //colour we receive from blinnPhong calculation
    vec3 shadeColour = blinnPhong(Position, normalize(Normal));

    //we assign a colour based on the fogFactor using mix
    vec3 color = mix( Fog.Colour, shadeColour, fogFactor);

    FragColour = vec4(color, 1.0); //final colour
    
}
