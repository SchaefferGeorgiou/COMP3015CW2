#ifndef SCENEBASIC_UNIFORM_H
#define SCENEBASIC_UNIFORM_H

#include "helper/scene.h"

#include <glad/glad.h>
#include "helper/glslprogram.h"

#include "helper/plane.h"
#include "helper/objmesh.h"
#include "helper/noisetex.h"

class SceneBasic_Uniform : public Scene
{
private:

    GLSLProgram generateNoise, animate, stationary, shadow, lighting;

   
    GLuint deferredFBO;

    //To project everything onto
    GLuint vao, vbos[2];
    float angle, tPrev;     

    Plane plane;
    std::unique_ptr<ObjMesh> mesh;

    float time;

    void setMatrices(GLSLProgram&);
    void compile();

    void createObjects();
    void createGBufTex(GLenum, GLenum, GLuint&);
    void setupFBO();
    
    void Pass1();
    void Pass2();

public:
    SceneBasic_Uniform();

    void initScene();
    void update( float t );
    void render();
    void resize(int, int);
};

#endif // SCENEBASIC_UNIFORM_H
