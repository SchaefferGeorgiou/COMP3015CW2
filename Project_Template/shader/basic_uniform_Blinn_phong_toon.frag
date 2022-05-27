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

uniform struct MaterialInfo
{
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;

const int levels = 4;
const float scaleFactor = 1.0f/levels;



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

vec3 blinnPhongToon(vec3 position, vec3 n) 
{

    vec3 ambient = Material.Ka * Light.La; 
    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n

//    vec3 diffuse = vec3(0.0f);
    
//    if (sDotn > 0.50f)
//    {
//        diffuse = Light.Ld * Material.Kd * sDotn;
//
//        if (sDotn > 0.25f)
//        {
//            diffuse = Light.Ld * Material.Kd * sDotn;
//        }
//    }
    vec3 diffuse = Material.Kd * floor( sDotn * levels ) * scaleFactor;

    return ambient + diffuse;
}


void main()
{

   FragColour = vec4(blinnPhongToon((Position).xyz, Normal),0); 
    
}
