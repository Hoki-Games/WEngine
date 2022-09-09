import { vec2, Vector2 } from './math.js'

export class WPhysicsModel {
	position: Vector2
	rotation: number
	scale: Vector2

	velocity: Vector2
	acceleration: Vector2
	force: Vector2 //gravity
	mass: number
	
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
	}

	applyForce(force: Vector2) {
		this.force.add(force)
	}

	applyAcceleration(acceleration: Vector2) {
		this.acceleration.add(acceleration)
	}

	updatePosition(dt: number) {
		this.acceleration.add(this.force.scale(1 / this.mass))
		this.force = vec2(0);
		this.velocity.add(this.acceleration.scale(dt ** 2))
		this.acceleration = vec2(0);
		this.position.add(this.velocity.scale(dt))
	}
}