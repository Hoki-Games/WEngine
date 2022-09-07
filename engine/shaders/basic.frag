#version 300 es
// FRAGMENT SHADER
precision mediump float;

uniform vec4 u_color;
// uniform sampler2D u_texture;

// in vec4 v_color;
// in vec2 v_uvmap;

out vec4 o_fragColor;

void main() {
    // o_fragColor = texture(u_texture, v_uvmap);
    o_fragColor = u_color;
    // o_fragColor = v_color;
}