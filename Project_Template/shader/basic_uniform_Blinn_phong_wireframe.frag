#version 430


uniform struct LightInfo {

	vec4 Position;
	vec3 Intensity;

}Light;


uniform struct MaterialInfo {

	vec3 Ka;
	vec3 Kd;
	vec3 Ks;
	float Shininess;

}Material;


uniform struct LineInfo{

	float Width;
	vec4 Colour;

} Line;

in vec3 GeomPosition;
in vec3 GeomNormal;
noperspective in vec3 GEdgeDistance;

layout (location = 0) out vec4 FragColour;

vec3 blinnPhong(vec3 position, vec3 n) 
{    

    vec3 ambient = Light.Intensity * Material.Ka;

    vec3 s = normalize(((Light.Position).xyz - position)); //calculate s vector
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n  
    

    vec3 diffuse = Light.Intensity * Material.Kd * sDotn; //calculate the diffuse
        
    vec3 specular = vec3(0.0f);
    
    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-position.xyz);
        vec3 h = normalize(v + s);
        specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess); 
    }     

    return  ambient + diffuse + specular;
}

void main()
{
	vec4 colour = vec4(blinnPhong(GeomPosition, GeomNormal),1.0);

    float d = min(GEdgeDistance.x, GEdgeDistance.y);
    d = min(d, GEdgeDistance.z);

    float mixVal;
    if(d < Line.Width - 1)
    {
        mixVal = 1.0;
    }
    else if(d > Line.Width + 1)
    {
        mixVal = 0.0;
    }
    else
    {
        float x = d - (Line.Width - 1);
        mixVal = exp2(-2.0 * (x*x));
    }

    FragColour = mix(colour, Line.Colour, mixVal);

}
