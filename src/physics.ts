import { vec2, Vector2 } from './math.js'

export class WPhysicsModel {
	array: Float32Array

	// Meter here is relative, so consider as unit
	position: Vector2 // m
	rotation: number // rad
	scale: Vector2 // m

	velocity: Vector2 // m/s
	acceleration: Vector2 // m/s²
	force: Vector2 // N (kg∙m/s²)
	mass: number // kg
	
	constructor({
		position = vec2(0),
		rotation = 0,
		scale = vec2(1),
		mass = 1,
		velocity = vec2(0),
		acceleration = vec2(0)
	}: {
		position?: Vector2,
		rotation?: number,
		scale?: Vector2
		mass?: number
		velocity?: Vector2
		acceleration?: Vector2
	}) {
		this.position = position
		this.rotation = rotation
		this.scale = scale
		this.mass = mass
		this.velocity = velocity
		this.acceleration = acceleration
		this.force = vec2(0)

		this.array = new Float32Array(9)
	}

	applyForce(force: Vector2) {
		this.force.add(force)
	}

	applyAcceleration(acceleration: Vector2) {
		this.acceleration.add(acceleration)
	}

	applyVelocity(velocity: Vector2) {
		this.velocity.add(velocity)
	}

	move(displacement: Vector2) {
		this.position.add(displacement)
	}

	updatePosition(dt: number) {
		this.applyAcceleration(this.force.scale(1 / this.mass))
		this.applyVelocity(this.acceleration.scale(dt))
		this.move(this.velocity.scale(dt))

		this.acceleration = this.force = vec2(0)

		const [tx, ty] = this.position
		const [rx, ry] = Vector2.fromDegree(this.rotation)
		const [sx, sy] = this.scale

		this.array.set([rx * sx, ry * sx, 0, -ry * sy, rx * sy, 0, tx, ty, 1])
	}
}