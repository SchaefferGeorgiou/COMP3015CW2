#pragma once

#include "trianglemesh.h"
#include <glad/glad.h>

class Sphere : public TriangleMesh
{
public:
    Sphere(float rad, GLuint sl, GLuint st);
};
