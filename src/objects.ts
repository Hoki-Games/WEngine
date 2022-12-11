import {
	Scene,
	Renderer,
	AttributeData,
	UniformType,
	TexSettings,
	Shader,
	MatrixData,
	MatrixDim
} from './graphics.js'

import {
	narrowColor,
	vec2,
	Color,
	Tri2,
	Vec2,
	Line2
} from './math.js'

import { PhysicsModel } from './physics.js';

export interface BasicObject {
	renderer: Renderer
	zIndex: number

	draw(): void
}

export class CustomObject implements BasicObject {
	#drawMode: GLenum

	renderer: Renderer
	zIndex: number

	protected _vertsCount: number

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
		scene: Scene
		attributes?: Record<string, AttributeData>
		uniforms?: Record<string, UniformType | MatrixData>
		textures?: {
			img: TexImageSource
			settings?: TexSettings
		}[]
		shaders: Shader[]
		vertsCount: number
		drawMode?: GLenum
		zIndex?: number
	}) {
		this._vertsCount = vertsCount
		this.#drawMode = drawMode
		this.zIndex = zIndex

		this.renderer = new Renderer({ scene, shaders })

		this.renderer.init({ uniforms, attributes, textures })
	}

	draw() {
		this.renderer.draw(this._vertsCount, this.#drawMode)
	}

	getAttribute(name: string) {
		return this.renderer.getAttribute(name)
	}
	setAttribute(
		name: string,
		value: AttributeData['data'],
		type: AttributeData['type'],
		length: AttributeData['length']
	) {
		this.renderer.setAttribute(name, value, type, length)
	}

	getUniform(name: string) {
		return this.renderer.getUniform(name)
	}
	setUniform(name: string, value: UniformType): void
	setUniform(name: string, matrix: Float32Array, dim: MatrixDim): void
	setUniform(
		name: string,
		value: UniformType,
		matrix?: MatrixDim
	) {
		this.renderer.setUniform(name, <Float32Array>value, matrix)
	}

	getTexture(id: number) {
		return this.renderer.getTexture(id)
	}
	setTexture(
		id: number,
		img: TexImageSource,
		settings?: TexSettings
	) {
		this.renderer.setTexture({ id, img, settings })
	}

	get vertsCount() {
		return this._vertsCount
	}
}

export class PositionedObject extends CustomObject {
	#physics: PhysicsModel
	#ratio: number

	protected _tris: Float32Array

	constructor({
		scene,
		uniforms,
		attributes,
		textures,
		shaders,
		tris,
		physicsModel = new PhysicsModel(),
		zIndex
	}: {
		scene: Scene
		attributes?: Record<string, AttributeData>
		uniforms?: Record<string, UniformType>
		textures?: {
			img: TexImageSource
			settings?: TexSettings
		}[]
		shaders: Shader[]
		tris: Tri2<GLfloat>[]
		physicsModel?: PhysicsModel
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

		return <Tri2<GLfloat>>[
			[arr[0], arr[1]],
			[arr[2], arr[3]],
			[arr[4], arr[5]]
		]
	}

	setTriangle(id: number, triangle: Tri2<GLfloat>) {
		if (id < 0 || id >= this._vertsCount / 2) return false

		this._tris.set(triangle.flat(2), id * 6)

		this.updateTriangles()
		return true
	}

	addTriangle(triangle: Tri2<GLfloat>) {
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
	set physics(v: PhysicsModel) {
		this.#physics = v
		this.setUniform('u_transform', new Float32Array(v.global.buffer), '3')
	}

	get ratio() {
		return this.#ratio
	}
	set ratio(v) {
		this.#ratio = v
		this.setUniform('u_ratio', Float32Array.of(v))
	}
}

export class OneColorObject extends PositionedObject {
	color: Float32Array
	
	constructor(
		scene: Scene,
		color: Color,
		tris: Tri2<GLfloat>[],
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

export class TexPositionedObject extends PositionedObject {
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
		scene: Scene
		attributes?: Record<string, AttributeData>
		uniforms?: Record<string, UniformType>
		textures?: {
			img: TexImageSource
			settings?: TexSettings
		}[]
		shaders: Shader[]
		tris: Tri2<GLfloat>[]
		uvmap: Tri2<GLfloat>[]
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

		return <Tri2<GLfloat>>[
			[arr[0], arr[1]],
			[arr[2], arr[3]],
			[arr[4], arr[5]]
		]
	}

	setUVTriangle(id: number, triangle: Tri2<GLfloat>) {
		if (id < 0 || id >= this._uvmap.byteLength / 24) return false

		this._uvmap.set(triangle.flat(2), id * 6)

		this.updateUVTriangles()
		return true
	}

	addUVTriangle(triangle: Tri2<GLfloat>) {
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

export class TextureObject extends TexPositionedObject {
	img: TexImageSource
	
	constructor(
		img: TexImageSource,
		scene: Scene,
		tris: Tri2<GLfloat>[],
		uvmap: Tri2<GLfloat>[],
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

export class LinesObject extends OneColorObject {
	constructor({
		scene,
		lines,
		width = .1,
		color = '#000',
		zIndex
	}: {
		scene: Scene
		lines: Line2<number>[]
		width?: number
		color?: Color,
		zIndex?: number
	}) {
		const verts: Tri2<number>[] = []

		for (const line of lines) {
			const v1 = vec2(...line[0])
			const v2 = vec2(...line[1])
			const a = v2.dif(v1)
			const b = a.right
			const c = b.scale(width / b.size)

			verts.push([
				v2.dif(c).arr,
				v1.sum(c).arr,
				v1.dif(c).arr
			])

			verts.push([
				v2.dif(c).arr,
				v2.sum(c).arr,
				v1.sum(c).arr
			])
		}

		super(scene, color, verts, zIndex)
	}
}

export class CircleObject extends PositionedObject {
	color: Float32Array

	constructor({
		scene,
		innerR = 0,
		location,
		scale = 1,
		color = '#000',
		zIndex
	}: {
		scene: Scene
		innerR?: number,
		location: Vec2<number>
		scale?: number
		color?: Color
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
			physicsModel: new PhysicsModel({
				location: vec2(...location),
				scale: vec2(scale)
			}),
			zIndex
		})

		this.color = clr
	}
}