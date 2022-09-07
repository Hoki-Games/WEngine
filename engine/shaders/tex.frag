#version 300 es
// FRAGMENT SHADER
precision mediump float;

uniform sampler2D u_texture;

in vec2 v_uvmap;

out vec4 o_fragColor;

void main() {
    o_fragColor = texture(u_texture, v_uvmap);
}