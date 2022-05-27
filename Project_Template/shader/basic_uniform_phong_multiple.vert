#version 430

//layout (location = 0) in vec3 VertexPosition;
//layout (location = 1) in vec3 VertexColor;
//layout (location = 1) in vec3 VertexNormal;


//out vec3 Colour;


//Goroud
//uniform struct LightInfo
//{
//    vec4 Position;
//    vec3 La;
//    vec3 Ld;  
//    
//}Lights[3];
//
//uniform struct MaterialInfo
//{
//    vec3 Ka;
//    vec3 Kd;
//    vec3 Ks;
//    float Shininess;
//
//}Material;
//
//
//
//
//vec3 phongModel(int light, vec3 position, vec3 n)
//{
//    
//    vec3 ambient = Material.Ka * Lights[light].La;
//    
//    vec3 s = normalize(((Lights[light].Position).xyz - position));
//
//    float sDotn = max(dot(s,n), 0.0);
//
//    
//    vec3 diffuse = Lights[light].Ld * Material.Kd * sDotn;
//
//    vec3 specular = vec3(0.0f);
//
//    if (sDotn > 0)
//    {
//
//        vec3 v = normalize(-position.xyz);
//        vec3 r = reflect(-s,n);
//        specular = Material.Ks * pow(max( dot(r,v), 0.0), Material.Shininess);        
//
//     }
//
//    return ambient + diffuse + specular;
//}

//Goroud
//uniform mat4 ModelViewMatrix;
//uniform mat3 NormalMatrix;
//uniform mat4 MVP;


//GOROUD
//void main()
//{   
//
//    vec3 n = normalize( NormalMatrix * VertexNormal);
//
//    vec4 pos = ModelViewMatrix * vec4(VertexPosition,1.0f);
//    
//    Colour = vec3(0.0);//Leave out for ambient rave
//
//    for (int i = 0; i < 3; i++)
//    {
//        Colour += phongModel(i, pos.xyz, n);
//    } 
//
//    gl_Position = MVP * vec4(VertexPosition,1.0);
//}



layout (location = 0) in vec3 VertexPosition;
layout (location = 1) in vec3 VertexNormal;

out vec3 Position;
out vec3 Normal;

uniform mat4 ModelViewMatrix;
uniform mat3 NormalMatrix;
uniform mat4 ProjectionMatrix;
uniform mat4 MVP;

void main()
{ 
	 Normal = normalize( NormalMatrix * VertexNormal);
	 Position = (ModelViewMatrix * vec4(VertexPosition,1.0)).xyz;
	 gl_Position = MVP * vec4(VertexPosition,1.0);
}