import { type Vector2, vec2 } from '../math.js'
import TransformMatrix3 from '../math/TransformMatrix3.js'

export default class PhysicsModel {
	#origin: Float32Array

	#local: TransformMatrix3
	#global: TransformMatrix3

	velocity: Vector2 // m/s
	acceleration: Vector2 // m/s²
	force: Vector2 // N (kg∙m/s²)
	mass: number // kg

	constructor({
		location = vec2(0),
		rotation = 0,
		scale = vec2(1),
		skew = 0,
		mass = 1,
		velocity = vec2(0),
		acceleration = vec2(0),
		origin = vec2(0)
	}: {
		location?: Vector2
		rotation?: number
		scale?: Vector2
		skew?: number
		mass?: number
		velocity?: Vector2
		acceleration?: Vector2
		origin?: Vector2
	} = {}) {
		this.#origin = Float32Array.from(origin)

		this.mass = mass
		this.velocity = velocity
		this.acceleration = acceleration
		this.force = vec2(0)

		this.#local = new TransformMatrix3({
			translate: location,
			rotate: rotation,
			scale,
			skew
		})

		this.#global = this.#local.copy()

		this.updateLocation(0)
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
		const [tx, ty] = this.#local.t.sum(displacement)
		this.#local.translate(tx, ty)
	}

	updateLocation(dt: number) {
		this.applyAcceleration(this.force.scale(1 / this.mass))
		this.applyVelocity(this.acceleration.scale(dt))
		this.move(this.velocity.scale(dt))

		this.acceleration = vec2(0)
		this.force = vec2(0)

		this.#global.copyFields(this.#local)
	}

	get origin() {
		return this.#origin
	}

	get local() {
		return this.#local
	}

	get global() {
		return this.#global
	}
}
