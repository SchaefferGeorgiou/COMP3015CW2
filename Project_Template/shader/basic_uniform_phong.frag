#version 430


//in vec3 Color;
in vec4 FragVertexPosition;
in vec3 FragVertexNormal;

layout (location = 0) out vec4 FragColor;

uniform struct LightInfo
{
    vec4 Position;
    vec3 Ld;
    vec3 Ls;   
    
}Light;

uniform struct MaterialInfo
{
    
    vec3 Kd;
    vec3 Ks;

}Material;

vec3 LightIntensity;
vec3 diffuse;
vec3 specular;


void main()
{

    
    vec3 s = normalize((Light.Position - FragVertexPosition).xyz);

    float sDotn = max(dot(s,normalize(FragVertexNormal)), 0.0);

    diffuse = Material.Kd * Light.Ld * sDotn;

    //vec3 r = normalize( -s + 2*(sDotn)*n); 

    if (sDotn > 0)
    {
        vec4 r = reflect(vec4(s,1.0),vec4(FragVertexNormal,1.0));

        float rDotv = max(dot(r,FragVertexPosition),0.0f);

        specular = Material.Ks * Light.Ls * pow(rDotv,0.9f);//Because rDotv is a value between 0 and 1, increasing the size of the exponent too much causes the number to be near-zero. defaulting it to black.  
    }
    
    LightIntensity =  diffuse + specular;

    FragColor = vec4(LightIntensity, 1.0);
}
