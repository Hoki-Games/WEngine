#version 300 es
// FRAGMENT SHADER
precision mediump float;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;

in vec2 v_uvmap;
flat in int v_index;

out vec4 o_fragColor;

void main() {
    if (v_index == 0)
        o_fragColor = texture(u_texture1, v_uvmap);
    else
        o_fragColor = texture(u_texture2, v_uvmap);
}