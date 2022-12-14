import type { Types as GraphicTypes, Scene } from '../graphics.js'
import type { Types as MathTypes } from '../math.js'
import PhysicsModel from '../physics/PhysicsModel.js'
import CustomObject from './CustomObject.js'

export default class PositionedObject extends CustomObject {
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
		attributes?: Record<string, GraphicTypes.AttributeData>
		uniforms?: Record<string, GraphicTypes.UniformType>
		textures?: {
			img: TexImageSource
			settings?: GraphicTypes.TexSettings
		}[]
		shaders: GraphicTypes.Shader[]
		tris: MathTypes.Tri2<GLfloat>[]
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

		this.setAttribute('i_vertexPosition', this._tris.buffer, 'FLOAT', 2)

		this.setUniform('u_origin', this.#physics.origin)

		this.updateTriangles()
	}

	getTriangle(id: number) {
		const arr = new Float32Array(this._tris.buffer, 24 * id, 6)

		return <MathTypes.Tri2<GLfloat>>[
			[arr[0], arr[1]],
			[arr[2], arr[3]],
			[arr[4], arr[5]]
		]
	}

	setTriangle(id: number, triangle: MathTypes.Tri2<GLfloat>) {
		if (id < 0 || id >= this._vertsCount / 2) return false

		this._tris.set(triangle.flat(2), id * 6)

		this.updateTriangles()
		return true
	}

	addTriangle(triangle: MathTypes.Tri2<GLfloat>) {
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
		arr.set(
			new Float32Array(
				this._tris.buffer,
				(id + 1) * 24,
				(this._vertsCount / 2 - 1 - id) * 6
			),
			id * 6
		)

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
