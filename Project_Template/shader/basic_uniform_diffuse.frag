#version 430


in vec3 LightIntensity;

//in vec3 Color;
layout (location = 0) out vec4 FragColor;


void main() {
    FragColor = vec4(LightIntensity, 1.0);
}
