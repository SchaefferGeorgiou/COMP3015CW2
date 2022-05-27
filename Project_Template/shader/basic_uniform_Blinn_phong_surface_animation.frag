#version 460


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


vec3 blinnPhong(vec3 pos, vec3 n)
{
	vec3 s = normalize(((Light.Position).xyz - pos)); //calculate s vector   

    vec3 ambient = Material.Ka; 
    
    float sDotn = max(dot(s,n), 0.0f) ; //calculate dot product between s and n
    
    vec3 diffuse = Material.Kd * sDotn; //calculate the diffuse
        
    vec3 specular = vec3(0.0f);
    
    if( sDotn > 0.0 )
    {
        vec3 v = normalize(-pos.xyz);
        vec3 h = normalize(v + s);
        specular = Material.Ks * pow(max( dot(h,n), 0.0), Material.Shininess); 
    }

    return (Light.Intensity) * (ambient + diffuse + specular);
}

in vec4 Position;
in vec3 Normal;
in vec2 TexCoord;

out vec4 FragColour;

void main()
{
	
	FragColour = vec4( blinnPhong(Position.xyz, Normal), 1.0f);

}
