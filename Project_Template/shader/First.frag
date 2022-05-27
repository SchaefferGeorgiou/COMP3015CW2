#version 460



//VARIABLES_____________________________________________________________

//IN
in vec4 Position;
in vec3 Normal;

//OUT
layout (location = 0) out vec4 FragColour;


//STRUCTS_______________________________________________________________

uniform struct LightInfo
{
    vec4 Position;
    float Intensity;
    
}Light;

uniform struct MaterialInfo
{
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;



//METHODS_______________________________________________________________

vec3 blinnPhong(vec3 position, vec3 n) 
{

    vec3 ambient = Material.Ka; 
    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
    
    vec3 diffuse = Material.Kd * sDotn; //calculate the diffuse
        
    vec3 specular = vec3(0.0f);
    
    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess); 
    }     

    return Light.Intensity * (ambient + diffuse + specular);
}

//_____________________________________________________________________



void main()
{

   FragColour = vec4(blinnPhong((Position).xyz, Normal),0); //+= to deep fry 

    
}
