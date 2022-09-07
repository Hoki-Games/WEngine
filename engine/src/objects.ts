import {
	WScene,
	WRenderer,
	WAttributeData,
	WUniformData,
	WTexSettings,
	WShader
} from './engine.js'

type WShaderColor = {
	r: GLclampf
	g: GLclampf
	b: GLclampf
	a: GLclampf
} | [GLclampf, GLclampf, GLclampf, GLclampf]

type WVert2 = [number, number]
type WVert3 = [number, number, number]
type WTri2 = [WVert2, WVert2, WVert2]
type WTri3 = [WVert3, WVert3, WVert3]

interface WBasicObject {
	renderer: WRenderer
	tris: WTri3[]

	init(): void
	draw(): void
}

export class WCustomObject implements WBasicObject {
	renderer: WRenderer
	tris = null
	vertsCount: number
	attributes: { [name: string]: WAttributeData }
	uniforms: { [name: string]: WUniformData }
	textures: {
		img: TexImageSource
		settings?: WTexSettings
	}[]
	trisCount

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
}

export class WOneColorObject implements WBasicObject {
	renderer: WRenderer
	color: [GLclampf, GLclampf, GLclampf, GLclampf]
	tris: WTri3[]
	
	constructor(scene: WScene, color: WShaderColor, tris: WTri3[]) {
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
		})
	}

	draw() {
		this.renderer.draw(this.tris.length * 3);
	}
}

export class WTextureObject implements WBasicObject {
	renderer: WRenderer
	img: TexImageSource
	tris: WTri3[]
	uvmap: WTri2[]
	
	constructor(
		img: TexImageSource,
		scene: WScene,
		tris: WTri3[],
		uvmap: WTri2[]
	) {
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
		})
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
		})
	}

	draw() {
		this.renderer.draw(this.tris.length * 3);
	}
}