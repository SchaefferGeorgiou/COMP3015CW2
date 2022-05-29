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


SceneBasic_Uniform::SceneBasic_Uniform() : time(0), angle(0.0f), tPrev(0.0f), plane(50.0f, 50.0f, 200, 200)
{
	mesh = ObjMesh::load("media/SmallSpaceFighter.obj", true);
}

#pragma region initScene


void SceneBasic_Uniform::initScene()
{
	compile();

	glClearColor(0.4f, 0.4f, 0.4f, 1.0f);

	createObjects();

	angle = glm::half_pi<float>();

	setupFBO();

}

#pragma endregion

#pragma region compile


void SceneBasic_Uniform::compile()
{
	try {

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
	
	//Split them to get static light
	prog.setUniform("ModelMatrix", model);
	prog.setUniform("ViewMatrix", view);
	prog.setUniform("NormalMatrix", glm::mat3(vec3(mv[0]), vec3(mv[1]), vec3(mv[2])));
	prog.setUniform("MVP", projection * mv);

}

#pragma endregion

void SceneBasic_Uniform::update( float t )
{
	//Rotate camera
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

	Pass1();//Render

	Pass2();//Lighting

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



void SceneBasic_Uniform::createObjects()
{
	// Arrays for quad used for FBO "projection"
	GLfloat vertices[] = {
	-1.0f, -1.0f, 0.0f, 1.0f, -1.0f, 0.0f, 1.0f, 1.0f, 0.0f,
	-1.0f, -1.0f, 0.0f, 1.0f, 1.0f, 0.0f, -1.0f, 1.0f, 0.0f
	};

	GLfloat textureCoords[] = {
	0.0f, 0.0f, 1.0f, 0.0f, 1.0f, 1.0f,
	0.0f, 0.0f, 1.0f, 1.0f, 0.0f, 1.0f
	};


	// Set up the VBO
	glGenBuffers(2, vbos);
	glBindBuffer(GL_ARRAY_BUFFER, vbos[0]);
	glBufferData(GL_ARRAY_BUFFER, 6 * 3 * sizeof(float), vertices, GL_STATIC_DRAW);

	glBindBuffer(GL_ARRAY_BUFFER, vbos[1]);
	glBufferData(GL_ARRAY_BUFFER, 6 * 2 * sizeof(float), textureCoords, GL_STATIC_DRAW);

	// Set up the VAO
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
	GLuint depthBuf, posTex, normTex, colourTex, specTex;

	// Create and bind the FBO
	glGenFramebuffers(1, &deferredFBO);
	glBindFramebuffer(GL_FRAMEBUFFER, deferredFBO);

	// The depth buffer
	glGenRenderbuffers(1, &depthBuf);
	glBindRenderbuffer(GL_RENDERBUFFER, depthBuf);
	glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT, width, height);

	// Create the textures for position, normal and colour
	createGBufTex(GL_TEXTURE0, GL_RGB32F, posTex); // Position
	createGBufTex(GL_TEXTURE1, GL_RGB32F, normTex); // Normal
	createGBufTex(GL_TEXTURE2, GL_RGB8, colourTex); // Colour/Texture
	createGBufTex(GL_TEXTURE3, GL_RGB8, specTex); //Specular

	//Create noise texture
	GLuint noiseTexture = NoiseTex::generate2DTex(6.0f);
	glActiveTexture(GL_TEXTURE4);
	glBindTexture(GL_TEXTURE_2D, noiseTexture);


	// Attach the textures to the framebuffer	
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthBuf);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, posTex, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, normTex, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, colourTex, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT3, GL_TEXTURE_2D, specTex, 0);


	GLenum drawBuffers1[] = { GL_NONE,
							 GL_COLOR_ATTACHMENT0,
							 GL_COLOR_ATTACHMENT1,
							 GL_COLOR_ATTACHMENT2,
							 GL_COLOR_ATTACHMENT3
	};

	glDrawBuffers(5, drawBuffers1);	
}

#pragma region Passes

void SceneBasic_Uniform::Pass1()
{

	glBindFramebuffer(GL_FRAMEBUFFER, deferredFBO);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glEnable(GL_DEPTH_TEST);	

	model = mat4(1.0);

	//CENTRED ON SPACESHIP LOCATION
	view = glm::lookAt(vec3(5.0f * cos(angle), 12.0f, 40.0f * sin(angle)), vec3(0.0f, 5.0f, 0.0f), vec3(0.0f, 1.0f, 0.0f));
	projection = glm::perspective(glm::radians(60.0f), (float)width / height, 0.3f, 90.0f);

	//PLANE
	animate.use();	
	animate.setUniform("Time", time);//For wave calc
	animate.setUniform("Material.Kd", 1.0f, 0.0f, 0.3f);//Add colour to noise map
	animate.setUniform("Material.Ks", 1.0f, 1.0f, 1.0f);
	setMatrices(animate);
	plane.render();

	//SPACESHIP
	stationary.use();
	stationary.setUniform("Material.Kd", 0.0f, 0.3f, 0.9f);
	stationary.setUniform("Material.Ks", 1.0f, 1.0f, 1.0f);
	model = mat4(1.0);
	model = glm::translate(model, vec3(0.0f, 5.0f, 0.0f));
	setMatrices(stationary);
	mesh->render();
}

void SceneBasic_Uniform::Pass2()
{	
	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	glDisable(GL_DEPTH_TEST);
	
	lighting.use();

	view = mat4(1.0);
	model = mat4(1.0);
	projection = mat4(1.0);

	lighting.setUniform("Light.Intensity", 1.0f);
	lighting.setUniform("Light.Position", vec4(0.0f, 20.0f, 0.0f, 1.0f));
	lighting.setUniform("Material.Shininess", 50.0f);

	setMatrices(lighting);

	glBindVertexArray(vao);
	glDrawArrays(GL_TRIANGLES, 0, 6);
}

#pragma endregion


