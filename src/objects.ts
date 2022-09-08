import {
	WScene,
	WRenderer,
	WAttributeData,
	WUniformData,
	WTexSettings,
	WShader
} from './graphics.js'

import {
	narrowColor,
	WColor,
	WTri2,
	WTri3,
	WVec4
} from './math.js'

interface WBasicObject {
	renderer: WRenderer

	init(): void
	draw(): void
}

export class WCustomObject implements WBasicObject {
	renderer: WRenderer
	protected trisCount: number
	protected attributes: { [name: string]: WAttributeData }
	protected uniforms: { [name: string]: WUniformData }
	protected textures: {
		img: TexImageSource
		settings?: WTexSettings
	}[]

	constructor({
		scene,
		uniforms = {},
		attributes = {},
		textures = [],
		shaders,
		trisCount
	}: {
		scene: WScene
		attributes?: { [name: string]: WAttributeData }
		uniforms?: { [name: string]: WUniformData }
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
		shaders: WShader[]
		trisCount: number
	}) {
		this.attributes = attributes;
		this.uniforms = uniforms
		this.textures = textures
		this.trisCount = trisCount
		
		this.renderer = new WRenderer({ scene, shaders })
	}

	init() {
		this.renderer.init({
			uniforms: this.uniforms,
			attributes: this.attributes,
			textures: this.textures
		})
	}

	draw() {
		this.renderer.draw(this.trisCount * 3)
	}

	getAttribute(name: string) {
		return this.renderer.getAttribute(name)
	}
	setAttribute(
		name: string,
		value: BufferSource,
		type: GLenum,
		length: GLint
	) {
		this.renderer.setAttribute(name, value, type, length);
	}

	getUniform(name: string) {
		return this.renderer.getUniform(name)
	}
	setUniform(
		name: string,
		value: Iterable<number>,
		type: GLenum
	) {
		this.renderer.setUniform(name, value, type);
	}

	getTexture(id: number) {
		return this.renderer.getTexture(id)
	}
	setTexture(
		id: number,
		img: TexImageSource,
		settings?: WTexSettings
	) {
		this.renderer.setTexture({ id, img, settings });
	}
}

abstract class WPositionedObject extends WCustomObject {
	protected tris: (WTri3<GLfloat> | [])[] = []

	getTriangle(id: number) {
		return this.tris[id];
	}

	setTriangle(id: number, triangle: WTri3<GLfloat>) {
		if (id < 0) return false
		this.tris[id] = triangle
		this.updateTriangles()
		return true;
	}

	addTriangle(triangle: WTri3<GLfloat>) {
		const id = this.tris.push(triangle) - 1;
		this.updateTriangles()
		return id
	}

	removeTriangle(id: number) {
		if (!(id in this.tris)) return false
		this.tris[id] = [];
		this.updateTriangles()
		return true
	}

	updateTriangles() {
		this.trisCount = this.tris.filter(v => v.length).length
		this.setAttribute(
			'i_vertexPosition',
			new Float32Array(this.tris.flat(2)),
			WebGL2RenderingContext.FLOAT,
			3
		)
	}
}

export class WOneColorObject extends WPositionedObject {
	color: WVec4<GLclampf>
	
	constructor(scene: WScene, color: WColor, tris: WTri3<GLfloat>[]) {
		const clr = narrowColor(color)

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
		})

		this.tris = tris;
		this.color = clr
	}
}

abstract class WTexPositionedObject extends WPositionedObject {
	protected uvmap: (WTri2<GLfloat> | [])[] = []

	getUVTriangle(id: number) {
		return this.uvmap[id];
	}

	setUVTriangle(id: number, triangle: WTri2<GLfloat>) {
		if (id < 0) return false
		this.uvmap[id] = triangle
		this.updateUVTriangles()
		return true;
	}

	addUVTriangle(triangle: WTri2<GLfloat>) {
		const id = this.uvmap.push(triangle) - 1;
		this.updateUVTriangles()
		return id
	}

	removeUVTriangle(id: number) {
		if (!(id in this.uvmap)) return false
		this.uvmap[id] = [];
		this.updateUVTriangles()
		return true
	}

	updateUVTriangles() {
		this.setAttribute(
			'i_uvmap',
			new Float32Array(this.uvmap.flat(2)),
			WebGL2RenderingContext.FLOAT,
			2
		)
	}
}

export class WTextureObject extends WTexPositionedObject {
	img: TexImageSource
	
	constructor(
		img: TexImageSource,
		scene: WScene,
		tris: WTri3<GLfloat>[],
		uvmap: WTri2<GLfloat>[]
	) {
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
		})

		this.img = img;
		this.tris = tris;
		this.uvmap = uvmap;
	}
}