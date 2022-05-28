#include "scenebasic_uniform.h"

#include <cstdio>
#include <cstdlib>

#include <string>
using std::string;

#include <iostream>
using std::cerr;
using std::endl;

#include "helper/glutils.h"
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>

#include <sstream>

#include "helper/texture.h"

using glm::vec3;
using glm::vec4;
using glm::mat4;


SceneBasic_Uniform::SceneBasic_Uniform() : time(0), angle(0.0f), tPrev(0.0f), rotSpeed(glm::pi<float>() / 8.0f), plane(10.0f, 10.0f, 10, 10)
{
	mesh = ObjMesh::load("../Project_Template/media/SmallSpaceFighter.obj", true);
}

#pragma region initScene


void SceneBasic_Uniform::initScene()
{
	compile();

	glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

	glEnable(GL_DEPTH_TEST);

	createBuffers();

	angle = glm::half_pi<float>();

	

	setupFBO();



	

}

#pragma endregion

#pragma region compile


void SceneBasic_Uniform::compile()
{
	try {
		generateNoise.compileShader("shader/NoiseMap.vert");
		generateNoise.compileShader("shader/NoiseMap.frag");
		generateNoise.link();

		animate.compileShader("shader/Animate.vert");
		animate.compileShader("shader/Animate.frag");
		animate.link();

		stationary.compileShader("shader/Stationary.vert");
		stationary.compileShader("shader/Stationary.frag");
		stationary.link();
		
		lighting.compileShader("shader/BlinnPhong.vert");
		lighting.compileShader("shader/BlinnPhong.frag");
		lighting.link();

	} catch (GLSLProgramException &e) {
		cerr << e.what() << endl;
		exit(EXIT_FAILURE);
	}
}

#pragma endregion

#pragma region setMatrices


void SceneBasic_Uniform::setMatrices(GLSLProgram& prog)
{
	mat4 mv = view * model;
			
	prog.setUniform("ModelMatrix", model);
	prog.setUniform("ViewMatrix", view);
	prog.setUniform("NormalMatrix", glm::mat3(vec3(mv[0]), vec3(mv[1]), vec3(mv[2])));
	prog.setUniform("MVP", projection * mv);

}

#pragma endregion

void SceneBasic_Uniform::update( float t )
{
	float deltaT = t - tPrev;
	if (tPrev == 0.0f)
	{
		deltaT = 0.0f;
	}
	tPrev = t;
	angle += 0.2f * deltaT;
	
	if (angle > glm::two_pi<float>())
	{
		angle -= glm::two_pi<float>();		
	}

	

	time = t;
}

#pragma region render


void SceneBasic_Uniform::render()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	
	Pass1();
	
	Pass2();

	Pass3();
	
	Pass4();

	Pass5();

	glFinish();
}


#pragma endregion

void SceneBasic_Uniform::resize(int w, int h)
{
	glViewport(0, 0, w, h);
	width = w;
	height = h;
	projection = glm::perspective(glm::radians(60.0f), (float)w / h, 0.3f, 100.0f);
}



void SceneBasic_Uniform::createBuffers()
{
	// Array for quad
	GLfloat verts[] = {
	-1.0f, -1.0f, 0.0f, 1.0f, -1.0f, 0.0f, 1.0f, 1.0f, 0.0f,
	-1.0f, -1.0f, 0.0f, 1.0f, 1.0f, 0.0f, -1.0f, 1.0f, 0.0f
	};

	GLfloat tc[] = {
	0.0f, 0.0f, 1.0f, 0.0f, 1.0f, 1.0f,
	0.0f, 0.0f, 1.0f, 1.0f, 0.0f, 1.0f
	};

	// Set up the buffers
	

	
	glGenBuffers(2, vbos);
	glBindBuffer(GL_ARRAY_BUFFER, vbos[0]);
	glBufferData(GL_ARRAY_BUFFER, 6 * 3 * sizeof(float), verts, GL_STATIC_DRAW);

	glBindBuffer(GL_ARRAY_BUFFER, vbos[1]);
	glBufferData(GL_ARRAY_BUFFER, 6 * 2 * sizeof(float), tc, GL_STATIC_DRAW);

	// Set up the vertex array object
	glGenVertexArrays(1, &vao);
	glBindVertexArray(vao);
	glBindBuffer(GL_ARRAY_BUFFER, vbos[0]);
	glVertexAttribPointer((GLuint)0, 3, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(0); // Vertex position

	glBindBuffer(GL_ARRAY_BUFFER, vbos[1]);
	glVertexAttribPointer((GLuint)2, 2, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(2); // Texture coordinates	
}


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

void SceneBasic_Uniform::createGBufTex(GLenum texUnit, GLenum format, GLuint& texid)
{
	glActiveTexture(texUnit);
	glGenTextures(1, &texid);
	glBindTexture(GL_TEXTURE_2D, texid);
	glTexStorage2D(GL_TEXTURE_2D, 1, format, width, height);

	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAX_LEVEL, 0);
}



void SceneBasic_Uniform::setupFBO()
{

	GLuint depthBuf1, posTex1, normTex1, colourTex1, specTex1, noiseTex, shadowTex;

	
	// Create and bind the FBO
	glGenFramebuffers(1, &deferredFBO);
	glBindFramebuffer(GL_FRAMEBUFFER, deferredFBO);

	// The depth buffer
	glGenRenderbuffers(1, &depthBuf1);
	glBindRenderbuffer(GL_RENDERBUFFER, depthBuf1);
	glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, width, height);

	// Create the textures for position, normal and colour
	createGBufTex(GL_TEXTURE0, GL_RGB32F, posTex1); // Position
	createGBufTex(GL_TEXTURE1, GL_RGB32F, normTex1); // Normal
	createGBufTex(GL_TEXTURE2, GL_RGB8, colourTex1); // Colour/Texture
	createGBufTex(GL_TEXTURE3, GL_RGB8, specTex1); //Specular
	createGBufTex(GL_TEXTURE4, GL_RGB8, noiseTex); // Noise Map
	
	GLuint noiseTexture = NoiseTex::generate2DTex(6.0f);
	glActiveTexture(GL_TEXTURE4);
	glBindTexture(GL_TEXTURE_2D, noiseTexture);

	GLuint posTex2, normTex2, colourTex2, specTex2;

	createGBufTex(GL_TEXTURE5, GL_RGB32F, posTex2); // Position2
	createGBufTex(GL_TEXTURE6, GL_RGB32F, normTex2); // Normal2
	createGBufTex(GL_TEXTURE7, GL_RGB32F, colourTex2); // Colour/Texture2
	createGBufTex(GL_TEXTURE8, GL_RGB32F, specTex2); //Specular2

	createGBufTex(GL_TEXTURE9, GL_RGB32F, shadowTex);//Shadow Map

	// Attach the textures to the framebuffer
	//Obj1	
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthBuf1);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, posTex1, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, normTex1, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, colourTex1, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT3, GL_TEXTURE_2D, specTex1, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT4, GL_TEXTURE_2D, noiseTex, 0);

	//Obj2
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT5, GL_TEXTURE_2D, posTex2, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT6, GL_TEXTURE_2D, normTex2, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT7, GL_TEXTURE_2D, colourTex2, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT8, GL_TEXTURE_2D, specTex2, 0);

	//Both
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT9, GL_TEXTURE_2D, shadowTex, 0);

	GLenum drawBuffers[] = { GL_NONE,
							 GL_COLOR_ATTACHMENT0,
							 GL_COLOR_ATTACHMENT1,
							 GL_COLOR_ATTACHMENT2,
							 GL_COLOR_ATTACHMENT3,
							 GL_COLOR_ATTACHMENT4,
							 GL_COLOR_ATTACHMENT5,
							 GL_COLOR_ATTACHMENT6,
							 GL_COLOR_ATTACHMENT7,
							 GL_COLOR_ATTACHMENT8,
							 GL_COLOR_ATTACHMENT9
						
	};




	glDrawBuffers(8, drawBuffers);
}

#pragma region Passes

void SceneBasic_Uniform::Pass1()
{
	generateNoise.use();

	glBindFramebuffer(GL_FRAMEBUFFER, deferredFBO);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glEnable(GL_DEPTH_TEST);


	model = mat4(1.0);
	view = glm::lookAt(vec3(10.0f * cos(angle), 4.0f, 70.0f * sin(angle)), vec3(0.0f, 0.0f, 0.0f), vec3(0.0f, 1.0f, 0.0f));
	projection = glm::perspective(glm::radians(60.0f), (float)width / height, 0.3f, 100.0f);	
	
}

void SceneBasic_Uniform::Pass2()
{

	animate.use();
	
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);


	
	
	animate.setUniform("Time", time);

	animate.setUniform("Material.Kd", 0.7f, 0.0f, 0.3f);
	animate.setUniform("Material.Ks", 0.9f, 0.9f, 0.9f);

	model = mat4(1.0);

	setMatrices(animate);
	
	plane.render();


	
}

void SceneBasic_Uniform::Pass3()
{
	stationary.use();

	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	stationary.setUniform("Material.Kd", 0.0f, 0.3f, 0.7f);
	stationary.setUniform("Material.Ks", 0.9f, 0.9f, 0.9f);

	model = mat4(1.0);
	/*model = glm::translate(model, vec3(0.0f, 10.0f, 0.0f));*/

	setMatrices(stationary);

	mesh->render();

}

void SceneBasic_Uniform::Pass4()
{

}

void SceneBasic_Uniform::Pass5()
{
	lighting.use();

	glBindFramebuffer(GL_FRAMEBUFFER, 0);

	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glDisable(GL_DEPTH_TEST);

	view = mat4(1.0);
	model = mat4(1.0);
	projection = mat4(1.0);

	setMatrices(lighting);


	lighting.setUniform("Light.Intensity", 1.0f);
	lighting.setUniform("Light.Position", vec4(0.0f, 4.0f, 0.0f, 1.0f));
	lighting.setUniform("Material.Shininess", 60.0f);

	glBindVertexArray(vao);
	glDrawArrays(GL_TRIANGLES, 0, 6);
}

#pragma endregion


