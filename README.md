# COMP3015CW2
 
## INTERACTION

It is a non-interactable application.

The camera rotates around a Spaceship over a dubiously coloured "ocean".

Pressing 'Esc' exits the application.

NOTE: "Executable" folder should contain COMP3015CW2.exe,  "shader" folder, and "media" folder.
These three items need to be in the same root folder for the application to work.

## BACKGROUND

I wanted to make use of noise maps on a dynamically changing plane to get an almost ocean-like effect and add on from there.

### WHAT I STARTED WITH

I started with the provided Project Template, cpp and header files provided for lab exercises, and code I wrote during said lab exercises.

I also found a Spaceship model for free on [TurboSquid](https://www.turbosquid.com/3d-models/space-fighter-3ds-free/820608).

### CODE SUMMARY

I adapted the Vertex animation code to include the Z-dimension making the waves move in "3D".

I made use of vertex animation to get the wave effect and added a noise texture generated using Perlin noise.
This was to add more motion to the scene and an "artistic texture" to the plane.

In total I use 3 different shaders.
I made use of 2 separate shaders for the objects so that effects would only be applied to one object and not the other.
The object data is deferred with the use of an FBO to the final shader for a lighting pass.


## YOUTUBE

https://youtu.be/Yg-8Iiu72EE
