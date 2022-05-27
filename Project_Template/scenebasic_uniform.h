#ifndef SCENEBASIC_UNIFORM_H
#define SCENEBASIC_UNIFORM_H

#include "helper/scene.h"

#include <glad/glad.h>
#include "helper/glslprogram.h"
#include "helper/torus.h"
#include "helper/teapot.h"
#include "helper/frustum.h"

#include "helper/plane.h"
#include "helper/objmesh.h"
#include "helper/cube.h"
#include "helper/skybox.h"
#include "helper/sphere.h"
#include "helper/noisetex.h"

class SceneBasic_Uniform : public Scene
{
private:

    GLSLProgram prog1, prog2, prog3, prog4;

    //To hold all the things
    GLuint deferredFBO;

    //To project everything onto
    GLuint object1, object2, vbos[2];
    float angle, tPrev, rotSpeed;

    //For Textures
    

    Plane plane;

    float time;

    void setMatrices(GLSLProgram&);
    void compile();

    void createBuffers();
    void createGBufTex(GLenum, GLenum, GLuint&);
    void setupFBO();
    
    void Pass1();
    void Pass2();
    void Pass3();
    void Pass4();

public:
    SceneBasic_Uniform();

    void initScene();
    void update( float t );
    void render();
    void resize(int, int);
};

#endif // SCENEBASIC_UNIFORM_H
