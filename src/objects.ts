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
	vec2,
	WColor,
	WTri2,
	WVec2,
	WLine2
} from './math.js'

import { WPhysicsModel } from './physics.js';

export interface BasicObject {
	renderer: WRenderer
	zIndex: number

	init(): void
	draw(): void
}

export class CustomObject implements BasicObject {
	#drawMode: GLenum

	renderer: WRenderer
	zIndex: number

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
		vertsCount,
		drawMode = WebGL2RenderingContext.TRIANGLES,
		zIndex = 0
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
		drawMode?: GLenum
		zIndex?: number
	}) {
		this._attributes = attributes	
		this._uniforms = uniforms
		this._textures = textures
		this._vertsCount = vertsCount
		this.#drawMode = drawMode
		this.zIndex = zIndex

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
		this.renderer.draw(this._vertsCount, this.#drawMode)
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
		this._attributes[name] = {
			data: value,
			length,
			type
		}
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
		this._uniforms[name] = value
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

export class WPositionedObject extends CustomObject {
	#physics: WPhysicsModel
	#ratio: number

	protected _tris: Float32Array

	constructor({
		scene,
		uniforms,
		attributes,
		textures,
		shaders,
		tris,
		physicsModel = new WPhysicsModel(),
		zIndex
	}: {
		scene: WScene
		attributes?: Record<string, WAttributeData>
		uniforms?: Record<string, WUniformType>
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
		shaders: WShader[]
		tris: WTri2<GLfloat>[]
		physicsModel?: WPhysicsModel
		zIndex?: number
	}) {
		super({
			scene,
			zIndex,
			uniforms,
			attributes,
			textures,
			shaders,
			vertsCount: 0
		})

		this._tris = Float32Array.from(tris.flat(2))
		this.physics = physicsModel
		this.ratio = 1

		this.setAttribute(
			'i_vertexPosition',
			this._tris.buffer,
			'FLOAT',
			2
		)

		this.setUniform('u_origin', this.#physics.origin)
		
		this.updateTriangles()
	}

	getTriangle(id: number) {
		const arr = new Float32Array(this._tris.buffer, 24 * id, 6)

		return <WTri2<GLfloat>>[
			[arr[0], arr[1]],
			[arr[2], arr[3]],
			[arr[4], arr[5]]
		]
	}

	setTriangle(id: number, triangle: WTri2<GLfloat>) {
		if (id < 0 || id >= this._vertsCount / 2) return false

		this._tris.set(triangle.flat(2), id * 6)

		this.updateTriangles()
		return true
	}

	addTriangle(triangle: WTri2<GLfloat>) {
		const arr = new Float32Array((this._vertsCount / 2 + 1) * 6)
		arr.set(new Float32Array(this._tris.buffer))
		arr.set(Float32Array.from(triangle.flat(2)), this._vertsCount * 2)

		this._tris = arr

		this.updateTriangles()
		return this._vertsCount / 2 - 1
	}

	removeTriangle(id: number) {
		if (id < 0 || id >= this._vertsCount / 2) return false
		
		const arr = new Float32Array((this._vertsCount / 2 - 1) * 6)
		arr.set(new Float32Array(this._tris.buffer, 0, id * 6))
		arr.set(new Float32Array(
			this._tris.buffer,
			(id + 1) * 24,
			(this._vertsCount / 2 - 1 - id) * 6
		), id * 6)

		this._tris = arr

		this.updateTriangles()
		return true
	}

	updateTriangles() {
		this._vertsCount = this._tris.byteLength / 8

		this.renderer.updateAttribute('i_vertexPosition')
	}

	get physics() {
		return this.#physics
	}
	set physics(v) {
		this.#physics = v
		this.setUniform('u_transform', v.global, '3')
	}

	get ratio() {
		return this.#ratio
	}
	set ratio(v) {
		this.#ratio = v
		this.setUniform('u_ratio', Float32Array.of(v))
	}
}

export class WOneColorObject extends WPositionedObject {
	color: Float32Array
	
	constructor(
		scene: WScene,
		color: WColor,
		tris: WTri2<GLfloat>[],
		zIndex?: number
	) {
		const clr = Float32Array.from(narrowColor(color))

		super({
			scene,
			shaders: [{
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
			tris,
			zIndex
		})

		this.color = clr
	}
}

export class WTexPositionedObject extends WPositionedObject {
	protected _uvmap: Float32Array

	constructor({
		scene,
		uniforms,
		attributes,
		textures,
		shaders,
		tris,
		uvmap,
		zIndex
	}: {
		scene: WScene
		attributes?: Record<string, WAttributeData>
		uniforms?: Record<string, WUniformType>
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
		shaders: WShader[]
		tris: WTri2<GLfloat>[]
		uvmap: WTri2<GLfloat>[]
		zIndex?: number
	}) {
		super({
			scene,
			uniforms,
			attributes,
			textures,
			shaders,
			tris,
			zIndex
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
		tris: WTri2<GLfloat>[],
		uvmap: WTri2<GLfloat>[],
		zIndex?: number
	) {
		super({
			scene,
			shaders: [{
				source: `#version 300 es
				precision mediump float;

				uniform vec2 u_origin;
				uniform mat3 u_transform;

				in vec2 i_vertexPosition;
				in vec2 i_uvmap;

				out vec2 v_uvmap;

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
					v_uvmap = i_uvmap;
					gl_Position = vec4(pos, 0, 1);
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
			uvmap,
			zIndex
		})

		this.img = img;
	}
}

export class LinesObject extends WOneColorObject {
	constructor({
		scene,
		lines,
		width = .1,
		color = '#000',
		zIndex
	}: {
		scene: WScene
		lines: WLine2<number>[]
		width?: number
		color?: WColor,
		zIndex?: number
	}) {
		const verts: WTri2<number>[] = []

		for (const line of lines) {
			const v1 = vec2(...line[0])
			const v2 = vec2(...line[1])
			const a = v2.dif(v1)
			const b = a.right
			const c = b.scale(width / b.length)

			verts.push(<never>[
				v2.dif(c),
				v1.sum(c),
				v1.dif(c)
			])

			verts.push(<never>[
				v2.dif(c),
				v2.sum(c),
				v1.sum(c)
			])
		}

		super(scene, color, verts, zIndex)
	}
}

export class CircleObject extends WPositionedObject {
	color: Float32Array

	constructor({
		scene,
		innerR = 0,
		location,
		scale = 1,
		color = '#000',
		zIndex
	}: {
		scene: WScene
		innerR?: number,
		location: WVec2<number>
		scale?: number
		color?: WColor
		zIndex?: number
	}) {
		const clr = Float32Array.from(narrowColor(color))

		super({
			scene,
			shaders: [{
				source: `#version 300 es
				precision mediump float;

				uniform vec2 u_origin;
				uniform mat3 u_transform;
				uniform float u_ratio;

				in vec2 i_vertexPosition;
				in vec2 i_uvmap;

				out vec2 v_uvmap;

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
					v_uvmap = i_uvmap;
					vec2 pos = transform(i_vertexPosition);
					gl_Position = vec4(pos, 0, 1);
				}`,
				type: 'VERTEX_SHADER'
			}, {
				source: `#version 300 es
				precision mediump float;

				uniform float u_innerRadius;
				uniform vec4 u_color;

				in vec2 v_uvmap;

				out vec4 o_fragColor;

				void main() {
					o_fragColor = u_color;
					float kat1 = pow(v_uvmap.x, 2.);
					float kat2 = pow(v_uvmap.y, 2.);
					float dist = sqrt(kat1 + kat2);
					if (dist > 1. || dist < u_innerRadius) o_fragColor.a = 0.;
				}`,
				type: 'FRAGMENT_SHADER'
			}],
			uniforms: {
				'u_innerRadius': Float32Array.of(innerR),
				'u_color': clr
			},
			attributes: {
				'i_uvmap': {
					data: Float32Array.of(
						1, 1,
						-1, -1,
						-1, 1,

						1, 1,
						1, -1,
						-1, -1
					),
					length: 2,
					type: 'FLOAT'
				}
			},
			tris: [
				[
					[1, 1],
					[-1, -1],
					[-1, 1]
				], [
					[1, 1],
					[1, -1],
					[-1, -1]
				]
			],
			physicsModel: new WPhysicsModel({
				location: vec2(...location),
				scale: vec2(scale)
			}),
			zIndex
		})

		this.color = clr
	}
}