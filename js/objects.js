import { WRenderer } from './graphics.js';
import { narrowColor } from './math.js';
export class WCustomObject {
    renderer;
    _vertsCount;
    _attributes;
    _uniforms;
    _textures;
    constructor({ scene, uniforms = {}, attributes = {}, textures = [], shaders, vertsCount }) {
        this._attributes = attributes;
        this._uniforms = uniforms;
        this._textures = textures;
        this._vertsCount = vertsCount;
        this.renderer = new WRenderer({ scene, shaders });
    }
    init() {
        this.renderer.init({
            uniforms: this._uniforms,
            attributes: this._attributes,
            textures: this._textures
        });
    }
    draw() {
        this.renderer.draw(this._vertsCount);
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
    setUniform(name, value) {
        this.renderer.setUniform(name, value);
    }
    getTexture(id) {
        return this.renderer.getTexture(id);
    }
    setTexture(id, img, settings) {
        this.renderer.setTexture({ id, img, settings });
    }
}
export class WPositionedObject extends WCustomObject {
    _tris;
    constructor({ scene, uniforms = {}, attributes = {}, textures = [], shaders, tris }) {
        super({
            scene,
            uniforms,
            attributes,
            textures,
            shaders,
            vertsCount: 0
        });
        this._tris = new DataView(Float32Array.from(tris.flat(2)).buffer);
        this.updateTriangles();
    }
    getTriangle(id) {
        const arr = new Float32Array(this._tris.buffer, 36 * id, 9);
        return [
            [arr[0], arr[1], arr[2]],
            [arr[3], arr[4], arr[5]],
            [arr[6], arr[7], arr[8]]
        ];
    }
    setTriangle(id, triangle) {
        if (id < 0 || id >= this._vertsCount / 3)
            return false;
        triangle.flat(2).forEach((v, i) => {
            this._tris.setFloat32(36 * id + 4 * i, v, true);
        });
        this.updateTriangles();
        return true;
    }
    addTriangle(triangle) {
        const arr = new Float32Array((this._vertsCount / 3 + 1) * 9);
        arr.set(new Float32Array(this._tris.buffer));
        arr.set(Float32Array.from(triangle.flat(2)), this._vertsCount * 3);
        this._tris = new DataView(arr.buffer);
        this.updateTriangles();
        return this._vertsCount / 3 - 1;
    }
    removeTriangle(id) {
        if (id < 0 || id >= this._vertsCount / 3)
            return false;
        const arr = new Float32Array((this._vertsCount / 3 - 1) * 9);
        arr.set(new Float32Array(this._tris.buffer, 0, id * 9));
        arr.set(new Float32Array(this._tris.buffer, (id + 1) * 36, (this._vertsCount / 3 - 1 - id) * 9), id * 9);
        this._tris = new DataView(arr.buffer);
        this.updateTriangles();
        return true;
    }
    updateTriangles() {
        this._vertsCount = this._tris.byteLength / 12;
        this.setAttribute('i_vertexPosition', this._tris.buffer, 'FLOAT', 3);
    }
}
export class WOneColorObject extends WPositionedObject {
    color;
    constructor(scene, color, tris) {
        const clr = Float32Array.from(narrowColor(color));
        super({
            scene,
            shaders: [{
                    source: `#version 300 es
				precision mediump float;
				
				in vec3 i_vertexPosition;
				
				void main() {
					gl_Position = vec4(i_vertexPosition, 1.0);
				}`,
                    type: 'VERTEX_SHADER'
                }, {
                    source: `#version 300 es
				precision mediump float;
				
				uniform vec4 u_color;
				
				out vec4 o_fragColor;
				
				void main() {
					o_fragColor = u_color;
				}`,
                    type: 'FRAGMENT_SHADER'
                }],
            uniforms: {
                'u_color': clr
            },
            tris
        });
        this.color = new DataView(clr.buffer);
    }
}
export class WTexPositionedObject extends WPositionedObject {
    _uvmap;
    constructor({ scene, uniforms = {}, attributes = {}, textures = [], shaders, tris, uvmap }) {
        super({
            scene,
            uniforms,
            attributes,
            textures,
            shaders,
            tris
        });
        this._uvmap = new DataView(Float32Array.from(uvmap.flat(2)).buffer);
        this.updateUVTriangles();
    }
    getUVTriangle(id) {
        const arr = new Float32Array(this._uvmap.buffer, 24 * id, 6);
        return [
            [arr[0], arr[1]],
            [arr[2], arr[3]],
            [arr[4], arr[5]]
        ];
    }
    setUVTriangle(id, triangle) {
        if (id < 0 || id >= this._uvmap.byteLength / 24)
            return false;
        triangle.flat(2).forEach((v, i) => {
            this._uvmap.setFloat32(24 * id + 4 * i, v, true);
        });
        this.updateUVTriangles();
        return true;
    }
    addUVTriangle(triangle) {
        const arr = new Float32Array((this._uvmap.byteLength / 24 + 1) * 6);
        arr.set(new Float32Array(this._uvmap.buffer));
        arr.set(Float32Array.from(triangle.flat(2)), this._uvmap.byteLength / 4);
        this._uvmap = new DataView(arr.buffer);
        this.updateUVTriangles();
        return this._uvmap.byteLength / 24 - 1;
    }
    removeUVTriangle(id) {
        if (id < 0 || id >= this._uvmap.byteLength / 24)
            return false;
        const arr = new Float32Array((this._uvmap.byteLength / 24 - 1) * 6);
        arr.set(new Float32Array(this._uvmap.buffer, 0, id * 6));
        arr.set(new Float32Array(this._uvmap.buffer, (id + 1) * 24, (this._uvmap.byteLength / 24 - 1 - id) * 6), id * 6);
        this._uvmap = new DataView(arr.buffer);
        this.updateUVTriangles();
        return true;
    }
    updateUVTriangles() {
        this.setAttribute('i_uvmap', this._uvmap.buffer, 'FLOAT', 2);
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
                    type: 'VERTEX_SHADER'
                }, {
                    source: `#version 300 es
				precision mediump float;
				
				uniform sampler2D u_texture;
				
				in vec2 v_uvmap;
				
				out vec4 o_fragColor;
				
				void main() {
					o_fragColor = texture(u_texture, v_uvmap);
				}`,
                    type: 'FRAGMENT_SHADER'
                }],
            uniforms: {
                'u_texture': Int32Array.of(0)
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
            tris,
            uvmap
        });
        this.img = img;
    }
}
