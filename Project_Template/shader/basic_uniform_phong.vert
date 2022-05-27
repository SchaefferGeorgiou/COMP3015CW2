#version 430

layout (location = 0) in vec3 VertexPosition;
//layout (location = 1) in vec3 VertexColor;
layout (location = 1) in vec3 VertexNormal;

//out vec3 Color;
//out vec3 LightIntensity;
out vec4 FragVertexPosition;
out vec3 FragVertexNormal;



uniform mat4 ModelViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 MVP;




//out uniform struct MaterialInfo;
//out uniform struct LightInfo;

void main()
{
    
    FragVertexNormal = normalize( NormalMatrix * VertexNormal);

    FragVertexPosition = ModelViewMatrix * vec4(VertexPosition,1.0);

    gl_Position = MVP * vec4(VertexPosition,1.0);
}

//GOROUD
//void main()
//{
//    //Color = VertexColor;
//
//    vec3 n = normalize( NormalMatrix * VertexNormal);
//
//    vec4 pos = ModelViewMatrix * vec4(VertexPosition,1.0);
//    
//    vec3 s = normalize((Light.Position - pos).xyz);
//
//    float sDotn = max(dot(s,n), 0.0);
//
//    diffuse = Material.Kd * Light.Ld * sDotn;
//
//    //vec3 r = normalize( -s + 2*(sDotn)*n); 
//
//    if (sDotn > 0)
//    {
//        vec4 r = reflect(vec4(s,1.0),vec4(n,1.0));
//
//        float rDotv = max(dot(r,pos),0.0f);
//
//        specular = Material.Ks * Light.Ls * pow(rDotv,0.9f);//Because rDotv is a value between 0 and 1, increasing the size of the exponent too much causes the number to be near-zero. defaulting it to black.  
//    }
//
//    LightIntensity =  diffuse + specular;
//
//    gl_Position = MVP * vec4(VertexPosition,1.0);
//}