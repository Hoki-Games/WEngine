import type Renderer from '../graphics/Renderer.js'

export default interface BasicObject {
	renderer: Renderer
	zIndex: number

	draw(): void
}