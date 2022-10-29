import { vec2, Vector2, WTransformMatrix3, WVec2 } from './math.js'

export class WPhysicsModel {
	origin: Float32Array

	local: WTransformMatrix3
	global: WTransformMatrix3

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
		location?: Vector2,
		rotation?: number,
		scale?: Vector2
		skew?: number
		mass?: number
		velocity?: Vector2
		acceleration?: Vector2
		origin?: Vector2
	} = {}) {
		this.origin = Float32Array.from(origin)

		this.mass = mass
		this.velocity = velocity
		this.acceleration = acceleration
		this.force = vec2(0)

		this.local = new WTransformMatrix3({
			translate: location,
			rotate: rotation,
			scale,
			skew
		})

		this.global = this.local.copy()

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
		const [tx, ty] = this.local.t.sum(displacement)
		this.local.translate(tx, ty)
	}

	updateLocation(dt: number) {
		this.applyAcceleration(this.force.scale(1 / this.mass))
		this.applyVelocity(this.acceleration.scale(dt))
		this.move(this.velocity.scale(dt))

		this.acceleration = vec2(0)
		this.force = vec2(0)

		this.global.set(new Float32Array(this.local.buffer))
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
		const diff = this.owner.global.t.dif(this.target.global.t)
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
		const dir = this.target.global.t.dif(this.owner.global.t)
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
			? this.owner.local.t
			: this.owner.global.t

		const t = this.targetRelativity == 'local'
			? this.target.local.t
			: this.target.global.t

		if (this.axes[0]) {
			const i = this.invert[0] ? -1 : 1

			this.owner.global.translateX(t.x * i + ((this.offset) ? o.x : 0))
		}

		if (this.axes[1]) {
			const i = this.invert[1] ? -1 : 1

			this.owner.global.translateY(t.y * i + ((this.offset) ? o.y : 0))
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
			? this.owner.local.r
			: this.owner.global.r

		const t = this.targetRelativity == 'local'
			? this.target.local.r
			: this.target.global.r

		this.owner.global.rotate(t * i + ((this.offset) ? o : 0))
	}
}

export class CopyScaleConstraint extends TargetConstraint {
	axes: WVec2<boolean>
	offset: boolean
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: WPhysicsModel, target: WPhysicsModel, {
		axes = [true, true],
		offset = false,
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		axes?: WVec2<boolean>
		offset?: boolean
		ownerRelativity?: 'local' | 'global'
		targetRelativity?: 'local' | 'global'
	} = {}) {
		super(owner, target)

		this.axes = axes
		this.offset = offset
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		const o = this.ownerRelativity == 'local'
			? this.owner.local.s
			: this.owner.global.s

		const t = this.targetRelativity == 'local'
			? this.target.local.s
			: this.target.global.s

		if (this.axes[0]) {
			this.owner.global.scaleX(t.x * (this.offset ? o.x : 1)) 
		}
	
		if (this.axes[1]) {
			this.owner.global.scaleY(t.y * (this.offset ? o.y : 1))
		}
	}
}

type transMixMode = 'replace' |
	'beforeFull' | 'beforeSplit' |
	'afterFull' | 'afterSplit'
export class CopyTransformsConstraint extends TargetConstraint {
	mixMode: transMixMode
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: WPhysicsModel, target: WPhysicsModel, {
		mixMode = 'replace',
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		mixMode?: transMixMode
		ownerRelativity?: 'local' | 'global'
		targetRelativity?: 'local' | 'global'
	} = {}) {
		super(owner, target)
		
		/*
		scale x = sqrt(M11 * M11 + M12 * M12)

		scale y = sqrt(M21 * M21 + M22 * M22) * cos(shear)
	
		rotation = atan2(M12, M11)
	
		shear (y) = atan2(M22, M21) - PI/2 - rotation
	
		translation x = M31
	
		translation y = M32
		*/
		// M1 = S * R * T; M1 * S2 = M1S2 * R2....
		// O - (T1, R1, S1); T - (T2, R2, S2)
		// replace:     S2 R2 T2
		// beforeFull:  (S2 R2 T2) (S1 R1 T1)
		// beforeSplit: T2 (R2 (S2 (S1 R1 T1)))
		// afterFull:   (S1 R1 T1) (S2 R2 T2)
		// afterSplit:  (((S1 R1 T1) S2) R2) T2
		// O1: [S1 R1 T1]
		// O2: [S2 R2 T2] [S1 R1 T1] => [S2* R2* T2*]
		// O3: [S3 S2*] [R3 R2*] [T3 T2*]

		this.mixMode = mixMode
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		switch (this.mixMode) {
		case 'replace':
			this.owner.global.set(
				new Float32Array((this.targetRelativity == 'global')
					? this.target.global.buffer
					: this.target.local.buffer
				)
			)
			break

		case 'beforeFull':
			// this.owner.global.
			break

		case 'beforeSplit':

			break

		case 'afterFull':

			break

		case 'afterSplit':

			break

		default:
			
		}

		
	}
}