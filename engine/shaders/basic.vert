#version 300 es
// VERTEX SHADER
precision mediump float;

in vec3 i_vertexPosition;
// in vec3 i_color;
// in vec2 i_uvmap;

// out vec4 v_color;
// out vec2 v_uvmap;

void main() {
    // v_uvmap = i_uvmap;
    // v_color = vec4(i_color, 1.0);
    gl_Position = vec4(i_vertexPosition, 1.0);
}