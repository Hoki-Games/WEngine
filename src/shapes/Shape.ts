import { type Vector2, vec2 } from '../math.js'

export default class Shape {
	location: Vector2
	rotation: number
	scale: Vector2

	constructor({
		location: position = vec2(0),
		rotation = 0,
		scale = vec2(1)
	}: {
		location?: Vector2
		rotation?: number
		scale?: Vector2
	} = {}) {
		this.location = position
		this.rotation = rotation
		this.scale = scale
	}
}
