#version 460



in vec3 Vertices;
in vec3 Normals;
in vec2 TexCoord;

layout (location = 0) out vec4 FragColour;
layout (location = 1) out vec3 PositionData;
layout (location = 2) out vec3 NormalData;
layout (location = 3) out vec3 ColourData;

uniform int Pass;

layout(binding=0) uniform sampler2D PositionTex;
layout(binding=1) uniform sampler2D NormalTex;
layout(binding=2) uniform sampler2D ColourTex;


uniform struct LightInfo
{
    vec4 Position;
    vec3 La;
    vec3 L;   
    
}Light;


uniform struct MaterialInfo
{
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;

//ONLY DIFFUSE
vec3 blinnPhong(vec3 position, vec3 n, vec3 colour) 
{
    
    vec3 diffuse = vec3(0.0f); //calculate the diffuse
        
    vec3 specular = vec3(0.0f);

    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector    

    vec3 ambient = colour * Light.La; 
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
    
    diffuse = Light.L * colour * sDotn; //calculate the diffuse

    
//    if( sDotn > 0.0 )
//    {
//        vec3 v = normalize(-position.xyz);
//        vec3 h = normalize(v + s);
//        specular = colour * pow(max( dot(h,n), 0.0), Material.Shininess); 
//    }     

    return  ambient +  diffuse ;//+ specular;
}


// The render pass
void pass1()
{
    // Store position, normal, and diffuse color in textures
    PositionData = Vertices;
    NormalData = normalize(Normals);
    ColourData = Material.Kd;
}


// Bright-pass filter (write to BlurTex1)
void pass2()
{
    // Retrieve position and normal information from textures
    vec3 pos = vec3( texture( PositionTex, TexCoord ) );
    vec3 norm = vec3( texture( NormalTex, TexCoord ) );
    vec3 diffColour = vec3( texture(ColourTex, TexCoord) );
    FragColour = vec4( blinnPhong(pos,norm,diffColour), 1.0 );
}



void main()
{
    if(Pass == 1)
       pass1();
    else if(Pass == 2)
       pass2();
}
