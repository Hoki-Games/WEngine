import { vec2, Vector2, WVec2, WVec3 } from './math.js'
import { Shape } from './shapes.js'

export class WPhysicsModel extends Shape {
	global: Float32Array
	globalLocation: Vector2
	globalRotation: number
	globalScale: Vector2

	velocity: Vector2 // m/s
	acceleration: Vector2 // m/s²
	force: Vector2 // N (kg∙m/s²)
	mass: number // kg
	
	constructor({
		location = vec2(0),
		rotation = 0,
		scale = vec2(1),
		mass = 1,
		velocity = vec2(0),
		acceleration = vec2(0)
	}: {
		location?: Vector2,
		rotation?: number,
		scale?: Vector2
		mass?: number
		velocity?: Vector2
		acceleration?: Vector2
	} = {}) {
		super({ location, rotation, scale })

		this.mass = mass
		this.velocity = velocity
		this.acceleration = acceleration
		this.force = vec2(0)

		this.global = new Float32Array(9)
		this.globalLocation = vec2(0)
		this.globalRotation = 0
		this.globalScale = vec2(0)

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
		this.location.add(displacement)
	}

	updateLocation(dt: number) {
		this.applyAcceleration(this.force.scale(1 / this.mass))
		this.applyVelocity(this.acceleration.scale(dt))
		this.move(this.velocity.scale(dt))

		this.acceleration = vec2(0)
		this.force = vec2(0)

		this.globalLocation = this.location.sum()
		this.globalRotation = this.rotation
		this.globalScale = this.scale.sum()
	}

	updateGlobalLocation() {
		const [tx, ty] = this.globalLocation
		const [rx, ry] = Vector2.fromDegree(this.globalRotation)
		const [sx, sy] = this.globalScale

		this.global.set([
			rx * sx,
			ry * sx,
			0,
			-ry * sy,
			rx * sy,
			0,
			tx,
			ty,
			1
		])
	}
}
abstract class ObjectConstraint {
	owner: WPhysicsModel

	constructor(owner: WPhysicsModel) {
		this.owner = owner
	}

	solve() {/* empty */}
}

abstract class TargetConstraint extends ObjectConstraint {
	target: WPhysicsModel

	constructor(owner: WPhysicsModel, target: WPhysicsModel) {
		super(owner)
		
		this.target = target
	}
}

export class WSpring extends TargetConstraint {
	L0: number
	ks: number

	constructor(owner: WPhysicsModel, target: WPhysicsModel, {
		L0,
		ks
	}: {
		L0: number
		ks: number
	}) {
		super(owner, target)

		this.L0 = L0
		this.ks = ks
	}
	
	solve() {
		const diff = this.owner.location.dif(this.target.location)
		const dl = diff.length

		const x = dl - this.L0
		const f = this.ks * x

		const F_ba = diff.scale(f / (dl || Infinity))
		const F_ab = F_ba.neg

		this.owner.applyForce(F_ab)
		this.target.applyForce(F_ba)
	}
}

export class WRope extends TargetConstraint {
	length: number
	bounce: number

	constructor(owner: WPhysicsModel, target: WPhysicsModel, {
		length,
		bounce
	}: {
		length: number
		bounce: number
	}) {
		super(owner, target)

		this.length = length
		this.bounce = bounce
	}

	solve() {
		const dir = this.target.location.dif(this.owner.location)
		const diff = dir.length
		
		if (diff > this.length) {
			const sum = this.owner.mass + this.target.mass

			let r1: number
			let r2: number

			if (Number.isFinite(this.owner.mass)) {
				if (Number.isFinite(this.target.mass)) {
					r1 = this.target.mass / sum
					r2 = this.owner.mass / sum
				} else {
					r1 = 1
					r2 = 0
				}
			} else {
				if (Number.isFinite(this.target.mass)) {
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

			this.owner.move(m1)
			this.target.move(m2)

			this.owner.applyAcceleration(m1.scale(this.bounce))
			this.target.applyAcceleration(m2.scale(this.bounce))
		}
	}
}

export class CopyLocationConstraint extends TargetConstraint {
	axes: WVec2<boolean>
	invert: WVec2<boolean>
	offset: boolean
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: WPhysicsModel, target: WPhysicsModel, {
		axes = [true, true],
		invert = [false, false],
		offset = false,
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		axes?: WVec2<boolean>
		invert?: WVec2<boolean>
		offset?: boolean
		ownerRelativity?: 'local' | 'global'
		targetRelativity?: 'local' | 'global'
	} = {}) {
		super(owner, target)

		this.axes = axes
		this.invert = invert
		this.offset = offset
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		const o = this.ownerRelativity == 'local'
			? this.owner.location
			: this.owner.globalLocation

		const t = this.targetRelativity == 'local'
			? this.target.location
			: this.target.globalLocation

		if (this.axes[0]) {
			const i = this.invert[0] ? -1 : 1

			this.owner.globalLocation.x = t.x * i + ((this.offset) ? o.x : 0)
		}

		if (this.axes[1]) {
			const i = this.invert[1] ? -1 : 1

			this.owner.globalLocation.y = t.y * i + ((this.offset) ? o.y : 0)
		}
	}
}

export class CopyRotationConstraint extends TargetConstraint {
	invert: boolean
	offset: boolean
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: WPhysicsModel, target: WPhysicsModel, {
		invert = false,
		offset = false,
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		invert?: boolean
		offset?: boolean
		ownerRelativity?: 'local' | 'global'
		targetRelativity?: 'local' | 'global'
	} = {}) {
		super(owner, target)

		this.invert = invert
		this.offset = offset
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		const i = this.invert ? -1 : 1

		const o = this.ownerRelativity == 'local'
			? this.owner.rotation
			: this.owner.globalRotation

		const t = this.targetRelativity == 'local'
			? this.target.rotation
			: this.target.globalRotation

		this.owner.globalRotation = t * i + ((this.offset) ? o : 0)
	}
}