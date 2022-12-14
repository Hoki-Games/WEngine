import { type Vector2, vec2 } from '../math.js'
import Shape from './Shape.js'

export default class Circle extends Shape {
	radius: number

	constructor({
		location = vec2(0),
		rotation = 0,
		scale = vec2(1),
		radius = 1
	}: {
		location?: Vector2
		rotation?: number
		scale?: Vector2
		radius?: number
	} = {}) {
		super({ location, rotation, scale })
		this.radius = radius
	}
}
