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


SceneBasic_Uniform::SceneBasic_Uniform() : time(0), plane(20.0f, 20.0f, 50, 50)
{

}

#pragma region initScene


//CLOUD EFFECT
void SceneBasic_Uniform::initScene()
{
	compile();

	glClearColor(0.5f, 0.5f, 0.5f, 1.0f);

	glEnable(GL_DEPTH_TEST);

	createBuffers();

	angle = glm::half_pi<float>();

	

	setupFBO();

	GLuint noiseTexture = NoiseTex::generate2DTex(6.0f);
	glActiveTexture(GL_TEXTURE4);
	glBindTexture(GL_TEXTURE_2D, noiseTexture);

	glActiveTexture(0);

}

#pragma endregion

#pragma region compile


void SceneBasic_Uniform::compile()
{
	try {
		prog1.compileShader("shader/NoiseMap.vert");
		prog1.compileShader("shader/NoiseMap.frag");
		prog1.link();

		prog2.compileShader("shader/Animate.vert");
		prog2.compileShader("shader/Animate.frag");
		prog2.link();
		
		prog3.compileShader("shader/BlinnPhong.vert");
		prog3.compileShader("shader/BlinnPhong.frag");
		prog3.link();

		//prog4.compileShader("shader/Flat.vert");
		//prog4.compileShader("shader/Flat.frag");
		//prog4.link();

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
			
	prog.setUniform("ModelViewMatrix", mv);
	prog.setUniform("NormalMatrix", glm::mat3(vec3(mv[0]), vec3(mv[1]), vec3(mv[2])));
	prog.setUniform("MVP", projection * mv);

}

#pragma endregion

void SceneBasic_Uniform::update( float t )
{
	//float deltaT = t - tPrev;
	//if (tPrev == 0.0f)
	//{
	//	deltaT = 0.0f;
	//}
	//tPrev = t;
	//angle += 0.2f * deltaT;
	//
	//if (angle > glm::two_pi<float>())
	//{
	//	angle -= glm::two_pi<float>();		
	//}

	time = t;
}

#pragma region render


void SceneBasic_Uniform::render()
{
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	
	Pass1();
	
	Pass2();

	Pass3();
	
	//Pass4();

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
	

	
	glGenBuffers(7, vbos);
	glBindBuffer(GL_ARRAY_BUFFER, vbos[0]);
	glBufferData(GL_ARRAY_BUFFER, 6 * 3 * sizeof(float), verts, GL_STATIC_DRAW);

	glBindBuffer(GL_ARRAY_BUFFER, vbos[1]);
	glBufferData(GL_ARRAY_BUFFER, 6 * 2 * sizeof(float), tc, GL_STATIC_DRAW);

	// Set up the vertex array object
	glGenVertexArrays(2, &quad[0]);
	glBindVertexArray(quad[0]);
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

	GLuint depthBuf, posTex, normTex, colourTex, specTex, noiseTex;
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
	createGBufTex(GL_TEXTURE2, GL_RGB8, colourTex); // Colour
	createGBufTex(GL_TEXTURE3, GL_RGB8, specTex);
	createGBufTex(GL_TEXTURE4, GL_RGB8, noiseTex);
	

	// Attach the textures to the framebuffer
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthBuf);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, posTex, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT1, GL_TEXTURE_2D, normTex, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT2, GL_TEXTURE_2D, colourTex, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT3, GL_TEXTURE_2D, specTex, 0);

	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT4, GL_TEXTURE_2D, noiseTex, 0);

	GLenum drawBuffers[] = { GL_NONE,
							 GL_COLOR_ATTACHMENT0,
							 GL_COLOR_ATTACHMENT1,
							 GL_COLOR_ATTACHMENT2,
							 GL_COLOR_ATTACHMENT3,
							 GL_COLOR_ATTACHMENT4
	};


	

	glDrawBuffers(6, drawBuffers);

	glBindFramebuffer(GL_FRAMEBUFFER, 0);



}

#pragma region Passes

void SceneBasic_Uniform::Pass1()
{
	prog1.use();

	glBindFramebuffer(GL_FRAMEBUFFER, deferredFBO);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glEnable(GL_DEPTH_TEST);

	view = glm::lookAt(vec3(7.0f * cos(angle), 4.0f, 7.0f * sin(angle)), vec3(0.0f, 0.0f, 0.0f), vec3(0.0f, 1.0f, 0.0f));
	projection = glm::perspective(glm::radians(60.0f), (float)width / height, 0.3f, 100.0f);

	


	
}

void SceneBasic_Uniform::Pass2()
{
	prog2.use();

	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glEnable(GL_DEPTH_TEST);

	//Plane
	model = glm::translate(model, vec3(0.0f, 0.0f, -10.0f));

	
	prog2.setUniform("Time", time);

	prog2.setUniform("Material.Kd", 0.7f, 0.0f, 0.3f);
	prog2.setUniform("Material.Ks", 0.9f, 0.9f, 0.9f);

	setMatrices(prog2);

	plane.render();
	
	glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT4, GL_TEXTURE_2D, 0, 0);
}

void SceneBasic_Uniform::Pass3()
{
	prog3.use();

	glBindFramebuffer(GL_FRAMEBUFFER, 0);
	
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
	glDisable(GL_DEPTH_TEST);

	prog3.setUniform("Light.Position", vec4(0.0f,20.0f, 0.0f, 1.0f));
	prog3.setUniform("Light.Intensity", 1.0f);

	prog3.setUniform("Material.Shininess", 20.0f);

	view = mat4(1.0);
	model = mat4(1.0);
	projection = mat4(1.0);
	setMatrices(prog3);
	
	
	glBindVertexArray(quad[0]);
	glDrawArrays(GL_TRIANGLES, 0, 6);

}

void SceneBasic_Uniform::Pass4()
{
	prog4.use();



}

#pragma endregion


