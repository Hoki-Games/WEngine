#version 300 es
// VERTEX SHADER
precision mediump float;

in vec2 i_vertexPosition;
in vec2 i_uvmap;
in int i_index;

out vec2 v_uvmap;
flat out int v_index;

void main() {
    v_uvmap = i_uvmap;
    v_index = i_index;
    gl_Position = vec4(i_vertexPosition, -.5, 1);
}