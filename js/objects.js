import { WRenderer } from './engine.js';
export class WCustomObject {
    renderer;
    tris = null;
    vertsCount;
    attributes;
    uniforms;
    textures;
    trisCount;
    constructor({ scene, uniforms = {}, attributes = {}, textures = [], shaders, trisCount }) {
        this.attributes = attributes;
        this.uniforms = uniforms;
        this.textures = textures;
        this.trisCount = trisCount;
        this.renderer = new WRenderer({ scene, shaders });
    }
    init() {
        this.renderer.init({
            uniforms: this.uniforms,
            attributes: this.attributes,
            textures: this.textures
        });
    }
    draw() {
        this.renderer.draw(this.trisCount * 3);
    }
}
export class WOneColorObject {
    renderer;
    color;
    tris;
    constructor(scene, color, tris) {
        this.tris = tris;
        this.color = Array.isArray(color)
            ? [...color]
            : [color.r, color.g, color.b, color.a];
        this.renderer = new WRenderer({
            scene,
            shaders: [{
                    source: `#version 300 es
				precision mediump float;
				
				in vec3 i_vertexPosition;
				
				void main() {
					gl_Position = vec4(i_vertexPosition, 1.0);
				}`,
                    type: WebGL2RenderingContext.VERTEX_SHADER
                }, {
                    source: `#version 300 es
				precision mediump float;
				
				uniform vec4 u_color;
				
				out vec4 o_fragColor;
				
				void main() {
					o_fragColor = u_color;
				}`,
                    type: WebGL2RenderingContext.FRAGMENT_SHADER
                }]
        });
    }
    init() {
        this.renderer.init({
            uniforms: {
                'u_color': {
                    data: this.color,
                    type: WebGL2RenderingContext.FLOAT
                }
            },
            attributes: {
                'i_vertexPosition': {
                    data: new Float32Array(this.tris.flat(2)),
                    type: WebGL2RenderingContext.FLOAT,
                    length: 3
                }
            }
        });
    }
    draw() {
        this.renderer.draw(this.tris.length * 3);
    }
}
export class WTextureObject {
    renderer;
    img;
    tris;
    uvmap;
    constructor(img, scene, tris, uvmap) {
        this.img = img;
        this.tris = tris;
        this.uvmap = uvmap;
        this.renderer = new WRenderer({
            scene,
            shaders: [{
                    source: `#version 300 es
				precision mediump float;
				
				in vec3 i_vertexPosition;
				in vec2 i_uvmap;
				
				out vec2 v_uvmap;
				
				void main() {
					v_uvmap = i_uvmap;
					gl_Position = vec4(i_vertexPosition, 1);
				}`,
                    type: WebGL2RenderingContext.VERTEX_SHADER
                }, {
                    source: `#version 300 es
				precision mediump float;
				
				uniform sampler2D u_texture;
				
				in vec2 v_uvmap;
				
				out vec4 o_fragColor;
				
				void main() {
					o_fragColor = texture(u_texture, v_uvmap);
				}`,
                    type: WebGL2RenderingContext.FRAGMENT_SHADER
                }]
        });
    }
    init() {
        this.renderer.init({
            uniforms: {
                'u_texture': {
                    data: [0],
                    type: WebGL2RenderingContext.INT
                }
            },
            attributes: {
                'i_vertexPosition': {
                    data: new Float32Array(this.tris.flat(2)),
                    type: WebGL2RenderingContext.FLOAT,
                    length: 3
                },
                'i_uvmap': {
                    data: new Float32Array(this.uvmap.flat(2)),
                    type: WebGL2RenderingContext.FLOAT,
                    length: 2
                }
            },
            textures: [{
                    img: this.img,
                    settings: {
                        internalformat: WebGL2RenderingContext.RGBA,
                        format: WebGL2RenderingContext.RGBA,
                        params: {
                            TEXTURE_WRAP_S: WebGL2RenderingContext.CLAMP_TO_EDGE,
                            TEXTURE_WRAP_T: WebGL2RenderingContext.CLAMP_TO_EDGE,
                            TEXTURE_MIN_FILTER: WebGL2RenderingContext.LINEAR,
                            UNPACK_FLIP_Y_WEBGL: true
                        }
                    }
                }]
        });
    }
    draw() {
        this.renderer.draw(this.tris.length * 3);
    }
}
