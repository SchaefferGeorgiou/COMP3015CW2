#version 460



in vec3 Vertices;
in vec3 Normals;
in vec2 TexCoord;

layout (location = 0) out vec4 FragColour;
layout (location = 1) out vec3 HdrColour;

uniform float AveLum;
uniform int Pass;

layout(binding=0) uniform sampler2D HdrTex;


uniform mat3 rgb2xyz = mat3(
0.4124564, 0.2126729, 0.0193339,
0.3575761, 0.7151522, 0.1191920,
0.1804375, 0.0721750, 0.9503041 );

uniform mat3 xyz2rgb = mat3(
3.2404542, -0.9692660, 0.0556434,
-1.5371385, 1.8760108, -0.2040259,
-0.4985314, 0.0415560, 1.0572252 );

uniform float Exposure = 0.35;
uniform float White = 0.928;
uniform bool DoToneMap = true;

uniform struct LightInfo
{
    vec4 Position;
    vec3 La;
    vec3 L;
   
    
}Lights[3];


uniform struct MaterialInfo
{
    vec3 Ka;
    vec3 Kd;
    vec3 Ks;
    float Shininess;

}Material;




vec3 blinnPhong(vec3 position, vec3 n, int i) 
{
    
    vec3 diffuse = vec3(0.0f); //calculate the diffuse
        
    vec3 specular = vec3(0.0f);

    vec3 s = normalize(((Lights[i].Position).xyz - position)); //calculate s vector    

    vec3 ambient = Material.Ka * Lights[i].La; 
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
    
    diffuse = Lights[i].L * Material.Kd * sDotn; //calculate the diffuse

    
    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess); 
    }     

    return  ambient +  diffuse + specular;
}


void pass1()
{
    vec3 n = normalize(Normals);
    // Compute shading and store result in high-res framebuffer
    HdrColour = vec3(0.0);
    for( int i = 0; i < 3; i++)
        HdrColour += blinnPhong(Vertices, n, i);
}

// This pass computes the sum of the luminance of all pixels
void pass2()
{
    // Retrieve high-res color from texture
    vec4 colour = texture( HdrTex, TexCoord );

    // Convert to XYZ
    vec3 xyzCol = rgb2xyz * vec3(colour);

    // Convert to xyY
    float xyzSum = xyzCol.x + xyzCol.y + xyzCol.z;
    vec3 xyYCol = vec3( xyzCol.x / xyzSum, xyzCol.y / xyzSum, xyzCol.y);

    // Apply the tone mapping operation to the luminance (xyYCol.z or xyzCol.y)
    float L = (Exposure * xyYCol.z) / AveLum;
    L = (L * ( 1 + L / (White * White) )) / ( 1 + L );

    // Using the new luminance, convert back to XYZ
    xyzCol.x = (L * xyYCol.x) / (xyYCol.y);
    xyzCol.y = L;
    xyzCol.z = (L * (1 - xyYCol.x - xyYCol.y))/xyYCol.y;

    // Convert back to RGB and send to output buffer
    if( DoToneMap )
    FragColour = vec4( xyz2rgb * xyzCol, 1.0);
    else
    FragColour = colour;
}

void main()
{    

    if( Pass == 1 )
        pass1();
    else if( Pass == 2)
        pass2();

    //FragColour = vec4(1.0f);
}
