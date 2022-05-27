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
    vec3 Direction;
    float Exponent;
    float Cutoff;
    
}Spot;

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

vec3 blinnPhongSpot(vec3 position, vec3 n) 
{

    vec3 ambient = Material.Ka * Spot.La ; 
    vec3 s = normalize(((Spot.Position).xyz - position)); //calculate s vector
    float cosAng = dot(-s, normalize(Spot.Direction)); //cosine of the angle
    float angle = acos( cosAng ); //gives you the actual angle
    float spotScale = 0.0f;

    vec3 diffuse = vec3(0.0f);
    vec3 specular = vec3(0.0f);

    if(angle < Spot.Cutoff )
    {
        spotScale = pow( cosAng, Spot.Exponent);
        float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
        diffuse = Spot.Ld * Material.Kd * sDotn; //calculate the diffuse
        
        specular = vec3(0.0f);
    
        if( sDotn > 0.0 )
        {
            vec3 v = normalize(-position.xyz);
            vec3 h = normalize(v + s);
            specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess); 
        }

     }

    return ambient + (spotScale * Spot.La) * (diffuse + specular);
}
void main()
{

   FragColour = vec4(blinnPhongSpot((Position).xyz, Normal),0); //+= to deep fry 

    
}
