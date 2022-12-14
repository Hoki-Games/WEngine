import { narrowColor } from '../graphics.js';
import PositionedObject from './PositionedObject.js';
export default class OneColorObject extends PositionedObject {
    color;
    constructor(scene, color, tris, zIndex) {
        const clr = Float32Array.from(narrowColor(color));
        super({
            scene,
            shaders: [
                {
                    source: `#version 300 es
				precision mediump float;

				uniform vec2 u_origin;
				uniform mat3 u_transform;
				uniform float u_ratio;

				in vec2 i_vertexPosition;

				vec2 transform(vec2 v) {
					vec3 pos = vec3(v - u_origin, 1);
					pos = u_transform * pos;
					pos += vec3(u_origin, 0);
					if (u_ratio != .0) {
						pos.x /= u_ratio;
					}
					return vec2(pos);
				}

				void main() {
					vec2 pos = transform(i_vertexPosition);
					gl_Position = vec4(pos, 0, 1);
				}`,
                    type: 'VERTEX_SHADER'
                },
                {
                    source: `#version 300 es
				precision mediump float;

				uniform vec4 u_color;

				out vec4 o_fragColor;

				void main() {
					o_fragColor = u_color;
				}`,
                    type: 'FRAGMENT_SHADER'
                }
            ],
            uniforms: {
                u_color: clr
            },
            tris,
            zIndex
        });
        this.color = clr;
    }
}
