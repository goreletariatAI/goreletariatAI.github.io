const radius = 20;

const vert = `
precision highp float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vVertTexCoord;

void main(void) {
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
  vVertTexCoord = aTexCoord;
}
`

const frag = `
precision highp float;
varying vec2 vVertTexCoord;

uniform sampler2D source;
uniform float noiseSeed;
uniform float noiseAmount;

float rand(vec2 n) { 
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
  vec4 inColor = texture2D(source, vVertTexCoord);
  gl_FragColor = clamp(inColor + vec4(
    mix(-noiseAmount, noiseAmount, fract(noiseSeed + rand(vVertTexCoord * 1234.5678))),
    mix(-noiseAmount, noiseAmount, fract(noiseSeed + rand(vVertTexCoord * 876.54321))),
    mix(-noiseAmount, noiseAmount, fract(noiseSeed + rand(vVertTexCoord * 3214.5678))),
    0.
  ), 0., 1.);
}
`

let grainBuffer
let grainShader


function applyGrain() {
  grainBuffer.clear()
  grainBuffer.reset()
  grainBuffer.push()
  grainBuffer.shader(grainShader)
  grainShader.setUniform('noiseSeed', random())
  grainShader.setUniform('source', mainCanvas)
  grainShader.setUniform('noiseAmount', 0.1)
  grainBuffer.rectMode(CENTER)
  grainBuffer.noStroke()
  grainBuffer.rect(0, 0, width, height)
  grainBuffer.pop()
  
  clear()
  push()
  image(grainBuffer, 0, 0)
  pop()
}