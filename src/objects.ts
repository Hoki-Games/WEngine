import {
	WScene,
	WRenderer,
	WAttributeData,
	WUniformType,
	WTexSettings,
	WShader,
	WMatrixDim
} from './graphics.js'

import {
	narrowColor,
	WColor,
	WTri2,
	WTri3,
} from './math.js'

import { WPhysicsModel } from './physics.js';

export interface WBasicObject {
	renderer: WRenderer

	init(): void
	draw(): void
}

export class WCustomObject implements WBasicObject {
	renderer: WRenderer

	protected _vertsCount: number
	protected _attributes: Record<string, WAttributeData>
	protected _uniforms: Record<string, WUniformType>
	protected _textures: {
		img: TexImageSource
		settings?: WTexSettings
	}[]

	constructor({
		scene,
		uniforms = {},
		attributes = {},
		textures = [],
		shaders,
		vertsCount
	}: {
		scene: WScene
		attributes?: Record<string, WAttributeData>
		uniforms?: Record<string, WUniformType>
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
		shaders: WShader[]
		vertsCount: number
	}) {
		this._attributes = attributes;
		this._uniforms = uniforms
		this._textures = textures
		this._vertsCount = vertsCount

		this.renderer = new WRenderer({ scene, shaders })
	}

	init() {
		this.renderer.init({
			uniforms: this._uniforms,
			attributes: this._attributes,
			textures: this._textures
		})
	}

	draw() {
		this.renderer.draw(this._vertsCount)
	}

	getAttribute(name: string) {
		return this.renderer.getAttribute(name)
	}
	setAttribute(
		name: string,
		value: WAttributeData['data'],
		type: WAttributeData['type'],
		length: WAttributeData['length']
	) {
		this.renderer.setAttribute(name, value, type, length);
	}

	getUniform(name: string) {
		return this.renderer.getUniform(name)
	}
	setUniform(name: string, value: WUniformType): void
	setUniform(name: string, value: Float32Array, matrix: WMatrixDim): void
	setUniform(
		name: string,
		value: WUniformType,
		matrix?: WMatrixDim
	) {
		this.renderer.setUniform(name, <Float32Array>value, matrix);
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

	get vertsCount() {
		return this._vertsCount
	}
}

export class WPositionedObject extends WCustomObject {
	#physics: WPhysicsModel

	protected _tris: Float32Array

	constructor({
		scene,
		uniforms = {},
		attributes = {},
		textures = [],
		shaders,
		tris,
		physicsModel = new WPhysicsModel({})
	}: {
		scene: WScene
		attributes?: Record<string, WAttributeData>
		uniforms?: Record<string, WUniformType>
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
		shaders: WShader[]
		tris: WTri3<GLfloat>[]
		physicsModel?: WPhysicsModel
	}) {
		super({
			scene,
			uniforms,
			attributes,
			textures,
			shaders,
			vertsCount: 0
		})

		this._tris = Float32Array.from(tris.flat(2))
		this.physics = physicsModel

		this.setAttribute(
			'i_vertexPosition',
			this._tris.buffer,
			'FLOAT',
			3
		)
		
		this.updateTriangles()
	}

	getTriangle(id: number) {
		const arr = new Float32Array(this._tris.buffer, 36 * id, 9)

		return <WTri3<GLfloat>>[
			[arr[0], arr[1], arr[2]],
			[arr[3], arr[4], arr[5]],
			[arr[6], arr[7], arr[8]]
		]
	}

	setTriangle(id: number, triangle: WTri3<GLfloat>) {
		if (id < 0 || id >= this._vertsCount / 3) return false

		this._tris.set(triangle.flat(2), id * 9)

		this.updateTriangles()
		return true
	}

	addTriangle(triangle: WTri3<GLfloat>) {
		const arr = new Float32Array((this._vertsCount / 3 + 1) * 9)
		arr.set(new Float32Array(this._tris.buffer))
		arr.set(Float32Array.from(triangle.flat(2)), this._vertsCount * 3)

		this._tris = arr

		this.updateTriangles()
		return this._vertsCount / 3 - 1
	}

	removeTriangle(id: number) {
		if (id < 0 || id >= this._vertsCount / 3) return false
		
		const arr = new Float32Array((this._vertsCount / 3 - 1) * 9)
		arr.set(new Float32Array(this._tris.buffer, 0, id * 9))
		arr.set(new Float32Array(
			this._tris.buffer,
			(id + 1) * 36,
			(this._vertsCount / 3 - 1 - id) * 9
		), id * 9)

		this._tris = arr

		this.updateTriangles()
		return true
	}

	updateTriangles() {
		this._vertsCount = this._tris.byteLength / 12

		this.renderer.updateAttribute('i_vertexPosition')
	}

	get physics() {
		return this.#physics
	}
	set physics(v) {
		this.#physics = v
		this.setUniform('u_transform', v.array, '3')
	}
}

export class WOneColorObject extends WPositionedObject {
	color: Float32Array
	
	constructor(scene: WScene, color: WColor, tris: WTri3<GLfloat>[]) {
		const clr = Float32Array.from(narrowColor(color))

		super({
			scene,
			shaders: [{
				source: `#version 300 es
				precision mediump float;

				uniform vec2 u_origin;
				uniform mat3 u_transform;

				in vec3 i_vertexPosition;

				vec3 transform(vec3 v) {
					vec3 pos = vec3(vec2(v) - u_origin, 1);
					pos = u_transform * pos;
					pos = pos + vec3(u_origin, 0);
					pos.z = v.z;
					return pos;
				}

				void main() {
					vec3 pos = transform(i_vertexPosition);
					gl_Position = vec4(pos, 1);
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
		})

		this.color = clr
	}
}

export class WTexPositionedObject extends WPositionedObject {
	protected _uvmap: Float32Array

	constructor({
		scene,
		uniforms = {},
		attributes = {},
		textures = [],
		shaders,
		tris,
		uvmap
	}: {
		scene: WScene
		attributes?: Record<string, WAttributeData>
		uniforms?: Record<string, WUniformType>
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
		shaders: WShader[]
		tris: WTri3<GLfloat>[]
		uvmap: WTri2<GLfloat>[]
	}) {
		super({
			scene,
			uniforms,
			attributes,
			textures,
			shaders,
			tris
		})

		this._uvmap = Float32Array.from(uvmap.flat(2))

		this.setAttribute(
			'i_uvmap',
			this._uvmap.buffer,
			'FLOAT',
			2
		)
		
		this.updateUVTriangles()
	}

	getUVTriangle(id: number) {
		const arr = new Float32Array(this._uvmap.buffer, 24 * id, 6)

		return <WTri2<GLfloat>>[
			[arr[0], arr[1]],
			[arr[2], arr[3]],
			[arr[4], arr[5]]
		]
	}

	setUVTriangle(id: number, triangle: WTri2<GLfloat>) {
		if (id < 0 || id >= this._uvmap.byteLength / 24) return false

		this._uvmap.set(triangle.flat(2), id * 6)

		this.updateUVTriangles()
		return true
	}

	addUVTriangle(triangle: WTri2<GLfloat>) {
		const arr = new Float32Array((this._uvmap.byteLength / 24 + 1) * 6)
		arr.set(new Float32Array(this._uvmap.buffer))
		arr.set(Float32Array.from(triangle.flat(2)), this._uvmap.byteLength / 4)

		this._uvmap = arr

		this.updateUVTriangles()
		return this._uvmap.byteLength / 24 - 1
	}

	removeUVTriangle(id: number) {
		if (id < 0 || id >= this._uvmap.byteLength / 24) return false
		
		const arr = new Float32Array((this._uvmap.byteLength / 24 - 1) * 6)
		arr.set(new Float32Array(this._uvmap.buffer, 0, id * 6))
		arr.set(new Float32Array(
			this._uvmap.buffer,
			(id + 1) * 24,
			(this._uvmap.byteLength / 24 - 1 - id) * 6
		), id * 6)

		this._uvmap = arr

		this.updateUVTriangles()
		return true
	}

	updateUVTriangles() {
		this.renderer.updateAttribute('i_uvmap')
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

				uniform vec2 u_origin;
				uniform mat3 u_transform;

				in vec3 i_vertexPosition;
				in vec2 i_uvmap;

				out vec2 v_uvmap;

				vec3 transform(vec3 v) {
					vec3 pos = vec3(vec2(v) - u_origin, 1);
					pos = u_transform * pos;
					pos = pos + vec3(u_origin, 0);
					pos.z = v.z;
					return pos;
				}

				void main() {
					vec3 pos = transform(i_vertexPosition);
					v_uvmap = i_uvmap;
					gl_Position = vec4(pos, 1);
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
		})

		this.img = img;
	}
}