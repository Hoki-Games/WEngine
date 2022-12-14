import { type Vector2, vec2 } from '../math.js'
import Shape from './Shape.js'

export default class Polygon extends Shape {
	vertices: Vector2[]

	constructor({
		location = vec2(0),
		rotation = 0,
		scale = vec2(1),
		vertices
	}: {
		location?: Vector2
		rotation?: number
		scale?: Vector2
		vertices: Vector2[]
	}) {
		super({ location, rotation, scale })
		if (vertices.length < 3)
			throw new Error('Polygon must have at least 3 vertices', {
				cause: vertices
			})
		this.vertices = vertices
	}
}
