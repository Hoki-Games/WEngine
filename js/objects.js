import { WRenderer } from './graphics.js';
import { narrowColor } from './math.js';
export class WCustomObject {
    renderer;
    trisCount;
    attributes;
    uniforms;
    textures;
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
    getAttribute(name) {
        return this.renderer.getAttribute(name);
    }
    setAttribute(name, value, type, length) {
        this.renderer.setAttribute(name, value, type, length);
    }
    getUniform(name) {
        return this.renderer.getUniform(name);
    }
    setUniform(name, value, type) {
        this.renderer.setUniform(name, value, type);
    }
    getTexture(id) {
        return this.renderer.getTexture(id);
    }
    setTexture(id, img, settings) {
        this.renderer.setTexture({ id, img, settings });
    }
}
class WPositionedObject extends WCustomObject {
    tris = [];
    getTriangle(id) {
        return this.tris[id];
    }
    setTriangle(id, triangle) {
        if (id < 0)
            return false;
        this.tris[id] = triangle;
        this.updateTriangles();
        return true;
    }
    addTriangle(triangle) {
        const id = this.tris.push(triangle) - 1;
        this.updateTriangles();
        return id;
    }
    removeTriangle(id) {
        if (!(id in this.tris))
            return false;
        this.tris[id] = [];
        this.updateTriangles();
        return true;
    }
    updateTriangles() {
        this.trisCount = this.tris.filter(v => v.length).length;
        this.setAttribute('i_vertexPosition', new Float32Array(this.tris.flat(2)), WebGL2RenderingContext.FLOAT, 3);
    }
}
export class WOneColorObject extends WPositionedObject {
    color;
    constructor(scene, color, tris) {
        const clr = narrowColor(color);
        super({
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
                }],
            uniforms: {
                'u_color': {
                    data: clr,
                    type: WebGL2RenderingContext.FLOAT
                }
            },
            attributes: {
                'i_vertexPosition': {
                    data: new Float32Array(tris.flat(2)),
                    type: WebGL2RenderingContext.FLOAT,
                    length: 3
                }
            },
            trisCount: tris.length
        });
        this.tris = tris;
        this.color = clr;
    }
}
class WTexPositionedObject extends WPositionedObject {
    uvmap = [];
    getUVTriangle(id) {
        return this.uvmap[id];
    }
    setUVTriangle(id, triangle) {
        if (id < 0)
            return false;
        this.uvmap[id] = triangle;
        this.updateUVTriangles();
        return true;
    }
    addUVTriangle(triangle) {
        const id = this.uvmap.push(triangle) - 1;
        this.updateUVTriangles();
        return id;
    }
    removeUVTriangle(id) {
        if (!(id in this.uvmap))
            return false;
        this.uvmap[id] = [];
        this.updateUVTriangles();
        return true;
    }
    updateUVTriangles() {
        this.setAttribute('i_uvmap', new Float32Array(this.uvmap.flat(2)), WebGL2RenderingContext.FLOAT, 2);
    }
}
export class WTextureObject extends WTexPositionedObject {
    img;
    constructor(img, scene, tris, uvmap) {
        super({
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
                }],
            uniforms: {
                'u_texture': {
                    data: [0],
                    type: WebGL2RenderingContext.INT
                }
            },
            attributes: {
                'i_vertexPosition': {
                    data: new Float32Array(tris.flat(2)),
                    type: WebGL2RenderingContext.FLOAT,
                    length: 3
                },
                'i_uvmap': {
                    data: new Float32Array(uvmap.flat(2)),
                    type: WebGL2RenderingContext.FLOAT,
                    length: 2
                }
            },
            textures: [{
                    img: img,
                    settings: {
                        internalformat: WebGL2RenderingContext.RGBA,
                        format: WebGL2RenderingContext.RGBA,
                        params: {
                            TEXTURE_WRAP_S: WebGL2RenderingContext.MIRRORED_REPEAT,
                            TEXTURE_WRAP_T: WebGL2RenderingContext.MIRRORED_REPEAT,
                            TEXTURE_MIN_FILTER: WebGL2RenderingContext.LINEAR,
                            UNPACK_FLIP_Y_WEBGL: true
                        }
                    }
                }],
            trisCount: tris.length
        });
        this.img = img;
        this.tris = tris;
        this.uvmap = uvmap;
    }
}
