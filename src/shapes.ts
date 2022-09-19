import { Vector2, vec2 } from "./math"

export class Shape {
	position: Vector2
	rotation: number
	scale: Vector2

	constructor({
		position = vec2(0),
		rotation = 0,
		scale = vec2(1)
	}: {
		position?: Vector2,
		rotation?: number,
		scale?: Vector2
	} = {}) {
		this.position = position
		this.rotation = rotation
		this.scale = scale
	}

}

class Circle extends Shape {
	radius: number

	constructor({
		position = vec2(0),
		rotation = 0,
		scale = vec2(1),
		radius = 1
	}: {
		position?: Vector2,
		rotation?: number,
		scale?: Vector2,
		radius?: number
	} = {}) {
		super({ position, rotation, scale })
		this.radius = radius
	}
}

class Polygon extends Shape {
	vertices: Vector2[]

	constructor({
		position = vec2(0),
		rotation = 0,
		scale = vec2(1),
		vertices
	}: {
		position?: Vector2,
		rotation?: number,
		scale?: Vector2,
		vertices: Vector2[]
	}) {
		super({ position, rotation, scale })
		if (vertices.length < 3) 
			throw new Error('Polygon must have at least 3 vertices', {
				cause: vertices
			})
		this.vertices = vertices
	}
}

class RegularPolygon extends Polygon {
	constructor({
		position = vec2(0),
		rotation = 0,
		scale = vec2(1),
		vertexCount,
		radius
	}: {
		position?: Vector2,
		rotation?: number,
		scale?: Vector2,
		vertexCount: number,
		radius: number
	}) {
		const verts: Vector2[] = []
		const dAng = PI2 / vertexCount
		const ang = vertexCount % 2 ? PI_2 : (Math.PI - dAng) * .5
		verts.push(
			vertexCount % 2 ? vec2(0, radius) : Vector2.fromDegree(radius, ang))

		super({ position, rotation, scale, vertices: verts })
	}
}

class Rectangle extends Polygon {
	constructor({
		position = vec2(0),
		rotation = 0,
		scale = vec2(1),
		height,
		width
	}: {
		position?: Vector2,
		rotation?: number,
		scale?: Vector2,
		width: number,
		height: number
	}) {
		super({
			position,
			rotation,
			scale,
			vertices: [
				vec2(width *  .5, height *  .5),
				vec2(width * -.5, height *  .5),
				vec2(width *  .5, height * -.5),
				vec2(width * -.5, height * -.5)
			]
		})
	}
}

const PI2 = Math.PI * 2
const PI_2 = Math.PI * .5
const center = vec2(500)