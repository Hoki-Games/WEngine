import { type Types as GraphicTypes } from '../graphics.js'
import type Scene from '../graphics/Scene.js'
import Renderer from '../graphics/Renderer.js'
import type BasicObject from './BasicObject.js'

export default class CustomObject implements BasicObject {
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
		attributes?: Record<string, GraphicTypes.AttributeData>
		uniforms?: Record<
			string,
			GraphicTypes.UniformType | GraphicTypes.MatrixData
		>
		textures?: {
			img: TexImageSource
			settings?: GraphicTypes.TexSettings
		}[]
		shaders: GraphicTypes.Shader[]
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
		value: GraphicTypes.AttributeData['data'],
		type: GraphicTypes.AttributeData['type'],
		length: GraphicTypes.AttributeData['length']
	) {
		this.renderer.setAttribute(name, value, type, length)
	}

	getUniform(name: string) {
		return this.renderer.getUniform(name)
	}
	setUniform(name: string, value: GraphicTypes.UniformType): void
	setUniform(
		name: string,
		matrix: Float32Array,
		dim: GraphicTypes.MatrixDim
	): void
	setUniform(
		name: string,
		value: GraphicTypes.UniformType,
		matrix?: GraphicTypes.MatrixDim
	) {
		this.renderer.setUniform(name, <Float32Array>value, matrix)
	}

	getTexture(id: number) {
		return this.renderer.getTexture(id)
	}
	setTexture(
		id: number,
		img: TexImageSource,
		settings?: GraphicTypes.TexSettings
	) {
		this.renderer.setTexture({ id, img, settings })
	}

	get vertsCount() {
		return this._vertsCount
	}
}
