import { vec2, Vector2 } from './math.js'
import { Shape } from './shapes.js'

export class WPhysicsModel extends Shape {
	array: Float32Array

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
	} = {}) {
		super({ position, rotation, scale })

		this.mass = mass
		this.velocity = velocity
		this.acceleration = acceleration
		this.force = vec2(0)

		this.array = new Float32Array(9)

		this.updatePosition(0)
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

		this.acceleration = vec2(0)
		this.force = vec2(0)

		const [tx, ty] = this.position
		const [rx, ry] = Vector2.fromDegree(this.rotation)
		const [sx, sy] = this.scale

		this.array.set([rx * sx, ry * sx, 0, -ry * sy, rx * sy, 0, tx, ty, 1])
	}
}

abstract class WBond {
	object1: WPhysicsModel
	object2: WPhysicsModel

	constructor(o1: WPhysicsModel, o2: WPhysicsModel) {
		this.object1 = o1
		this.object2 = o2
	}

	recalc() {/* empty */}
}

export class WSpring extends WBond {
	L0: number
	ks: number

	constructor({
		object1,
		object2,
		L0,
		ks
	}: {
		object1: WPhysicsModel
		object2: WPhysicsModel
		L0: number
		ks: number
	}) {
		super(object1, object2)

		this.L0 = L0
		this.ks = ks
	}
	
	recalc() {
		const diff = this.object1.position.dif(this.object2.position)
		const dl = diff.length

		const x = dl - this.L0
		const f = this.ks * x

		const F_ba = diff.scale(f / (dl || Infinity))
		const F_ab = F_ba.neg

		this.object1.applyForce(F_ab)
		this.object2.applyForce(F_ba)
	}
}

export class WRope extends WBond {
	length: number
	bounce: number

	constructor({
		object1,
		object2,
		length,
		bounce
	}: {
		object1: WPhysicsModel
		object2: WPhysicsModel
		length: number
		bounce: number
	}) {
		super(object1, object2)

		this.length = length
		this.bounce = bounce
	}

	recalc() {
		const dir = this.object2.position.dif(this.object1.position)
		const diff = dir.length
		
		if (diff > this.length) {
			const sum = this.object1.mass + this.object2.mass

			let r1: number
			let r2: number

			if (Number.isFinite(this.object1.mass)) {
				if (Number.isFinite(this.object2.mass)) {
					r1 = this.object2.mass / sum
					r2 = this.object1.mass / sum
				} else {
					r1 = 1
					r2 = 0
				}
			} else {
				if (Number.isFinite(this.object2.mass)) {
					r1 = 0
					r2 = 1
				} else {
					r1 = 0
					r2 = 0
				}
			}

			const mv = dir.scale((diff - this.length) / diff)

			const m1 = mv.scale(r1)
			const m2 = mv.scale(-r2)

			this.object1.move(m1)
			this.object2.move(m2)

			this.object1.applyAcceleration(m1.scale(this.bounce))
			this.object2.applyAcceleration(m2.scale(this.bounce))
		}
	}
}