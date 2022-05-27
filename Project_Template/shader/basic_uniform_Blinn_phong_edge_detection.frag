#version 430



in vec3 Vertices;
in vec3 Normals;

layout( binding = 0 ) uniform sampler2D RenderTex;

layout (location = 0) out vec4 FragColour;

uniform float EdgeThreshold;
uniform int Pass;
uniform vec3 Change;

uniform struct LightInfo
{
    vec4 Position;
    vec3 La;
    vec3 Ld;
    vec3 Ls;
    
}Light;


uniform struct MaterialInfo
{
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;


const vec3 lum = vec3(0.2126, 0.7152, 0.0722);

vec3 blinnPhong(vec3 position, vec3 n) 
{
    
    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector    

    vec3 ambient = Material.Ka * Light.La; 
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
    
    vec3 diffuse = Light.Ld * Material.Kd * sDotn; //calculate the diffuse
        
    vec3 specular = vec3(0.0f);
    
    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess); 
    }     

    return  ambient +  diffuse + specular;
}

float luminance( vec3 colour )
{
     return dot(lum, colour);
}

vec4 pass1()
{
    return vec4(blinnPhong(Vertices, normalize(Normals) ),1.0);
}

vec4 pass2()
{
     ivec2 pix = ivec2(gl_FragCoord.xy); //we grab a pixel to check if edge
    //pick neighboutring pixels for convolution filter
    //check lecture slides
     float s00 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(-1,1)).rgb);
     float s10 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(-1,0)).rgb);
     float s20 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(-1,-1)).rgb);
     float s01 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(0,1)).rgb);
     float s21 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(0,-1)).rgb);
     float s02 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(1,1)).rgb);
     float s12 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(1,0)).rgb);
     float s22 = luminance(texelFetchOffset(RenderTex, pix, 0, ivec2(1,-1)).rgb);
     float sx = s00 + 2 * s10 + s20 - (s02 + 2 * s12 + s22);
     float sy = s00 + 2 * s01 + s02 - (s20 + 2 * s21 + s22);
     float g = sx * sx + sy * sy;
     if( g > EdgeThreshold )
     return vec4(1.0); //edge
     else
     return vec4(Change,1.0f); //no edge
}


void main()
{    

    if( Pass == 1 )
    {
        FragColour = pass1();
    }
    if( Pass == 2 )
    {
        FragColour = pass2();    
    }
}
