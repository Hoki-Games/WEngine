import { vec2, Vector2, TransformMatrix3, Vec2, clamp } from './math.js'

export class PhysicsModel {
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
		location?: Vector2,
		rotation?: number,
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

		// this.#global.setArray(new Float32Array(this.#local.buffer))
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

abstract class ObjectConstraint {
	owner: PhysicsModel

	constructor(owner: PhysicsModel) {
		this.owner = owner
	}

	solve() {/* empty */}
}

abstract class TargetConstraint extends ObjectConstraint {
	target: PhysicsModel

	constructor(owner: PhysicsModel, target: PhysicsModel) {
		super(owner)
		
		this.target = target
	}
}

export class Spring extends TargetConstraint {
	L0: number
	ks: number

	constructor(owner: PhysicsModel, target: PhysicsModel, {
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
		const dl = diff.size

		const x = dl - this.L0
		const f = this.ks * x

		const F_ba = diff.scale(f / (dl || Infinity))
		const F_ab = F_ba.neg

		this.owner.applyForce(F_ab)
		this.target.applyForce(F_ba)
	}
}

export class Rope extends TargetConstraint {
	length: number
	bounce: number

	constructor(owner: PhysicsModel, target: PhysicsModel, {
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
		const diff = dir.size
		
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
	axes: Vec2<boolean>
	invert: Vec2<boolean>
	offset: boolean
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: PhysicsModel, target: PhysicsModel, {
		axes = [true, true],
		invert = [false, false],
		offset = false,
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		axes?: Vec2<boolean>
		invert?: Vec2<boolean>
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

	constructor(owner: PhysicsModel, target: PhysicsModel, {
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
	axes: Vec2<boolean>
	offset: boolean
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: PhysicsModel, target: PhysicsModel, {
		axes = [true, true],
		offset = false,
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		axes?: Vec2<boolean>
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

type TransMixMode = 'replace' | 'split' |
	'beforeFull' | 'afterFull'

export class CopyTransformsConstraint extends TargetConstraint {
	mixMode: TransMixMode
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: PhysicsModel, target: PhysicsModel, {
		mixMode = 'replace',
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		mixMode?: TransMixMode
		ownerRelativity?: 'local' | 'global'
		targetRelativity?: 'local' | 'global'
	} = {}) {
		super(owner, target)

		this.mixMode = mixMode
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local'
			? this.owner.local
			: og

		const t = this.targetRelativity == 'local'
			? this.target.local
			: this.target.global

		switch (this.mixMode) {
		case 'replace':
			og.setArray(new Float32Array(t.buffer))
			break

		case 'split':
			og.scale(
				t.sx * o.sx,
				t.sy * o.sy,
				false
			)
			og.skew(t.k + o.k, false)
			og.rotate(t.r + o.r, false)
			og.translate(
				t.tx + o.tx,
				t.ty + o.ty
			)
			break

		case 'beforeFull':
			og.setArray(new Float32Array(t.mult(o).buffer))
			break

		case 'afterFull':
			og.setArray(new Float32Array(o.mult(t).buffer))
			break

		default:
			throw new Error('Invalid mix mode', { cause: this.mixMode })
		}
	}
}

export class LimitDistanceConstraint extends TargetConstraint {
	distance: number
	clampRegion: 'inside' | 'outside' | 'surface'
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(owner: PhysicsModel, target: PhysicsModel, {
		distance = 0,
		clampRegion = 'inside',
		ownerRelativity = 'global',
		targetRelativity = 'global'
	}: {
		distance?: number
		clampRegion?: 'inside' | 'outside' | 'surface'
		ownerRelativity?: 'local' | 'global'
		targetRelativity?: 'local' | 'global'
	} = {}) {
		super(owner, target)

		this.distance = distance
		this.clampRegion = clampRegion
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local'
			? this.owner.local
			: og

		const t = this.targetRelativity == 'local'
			? this.target.local
			: this.target.global

		const dir = t.t.dif(o.t)
		const dist = dir.size
		const diff = dist - this.distance

		if (
			(this.clampRegion == 'inside' && diff > 0) ||
			(this.clampRegion == 'outside' && diff < 0) ||
			(this.clampRegion == 'surface' && diff !== 0)
		) {
			const t = dir.scale(diff / dist).sum(og.t)
			og.translate(t.x ?? 0, t.y ?? 0)
		}
	}
}

export class LimitLocationConstraint extends ObjectConstraint {
	#influence: number

	ownerRelativity: 'local' | 'global'
	min: Vector2
	max: Vector2

	constructor(owner: PhysicsModel, {
		ownerRelativity = 'global',
		influence = 1,
		minX = -Infinity,
		minY = -Infinity,
		maxX = Infinity,
		maxY = Infinity
	}: {
		ownerRelativity?: 'local' | 'global',
		influence?: number,
		minX?: number,
		minY?: number,
		maxX?: number,
		maxY?: number
	} = {}) {
		super(owner)

		this.ownerRelativity = ownerRelativity
		this.#influence = influence
		this.min = vec2(minX, minY)
		this.max = vec2(maxX, maxY)
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local'
			? this.owner.local
			: og

		const minT = this.min.dif(o.t)
		const maxT = this.max.dif(o.t)

		const t = vec2(0)

		if (minT.x > 0) {
			if (maxT.x < 0) t.x = 0
			else t.x = minT.x
		}
		else if (maxT.x < 0) t.x = maxT.x
		
		if (minT.y > 0) {
			if (maxT.y < 0) t.y = 0
			else t.y = minT.y
		}
		else if (maxT.y < 0) t.y = maxT.y

		og.translate(
			og.tx + t.x * this.influence,
			og.ty + t.y * this.influence
		)
	}

	get influence() {
		return this.#influence
	}
	set influence(v: number) {
		this.#influence = clamp(v, 0, 1)
	}
}

export class LimitScaleConstraint extends ObjectConstraint {
	#influence: number

	minX: number
	minY: number
	maxX: number
	maxY: number

	ownerRelativity: 'local' | 'global'

	constructor(owner: PhysicsModel, {
		ownerRelativity = 'global',
		influence = 1,
		minX = -Infinity,
		minY = -Infinity,
		maxX = Infinity,
		maxY = Infinity
	}: {
		ownerRelativity?: 'local' | 'global'
		influence?: number
		minX?: number
		minY?: number
		maxX?: number
		maxY?: number
	} = {}) {
		super(owner)

		this.ownerRelativity = ownerRelativity
		this.#influence = influence
		this.minX = minX
		this.minY = minY
		this.maxX = maxX
		this.maxY = maxY
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local'
			? this.owner.local
			: og

		const dsx = clamp(o.sx, this.minX, this.maxX) - o.sx
		const dsy = clamp(o.sy, this.minY, this.maxY) - o.sy

		og.scale(
			o.sx + dsx * this.#influence,
			o.sy + dsy * this.#influence
		)
	}

	get influence() {
		return this.#influence
	}
	set influence(v: number) {
		this.#influence = clamp(v, 0, 1)
	}
}

export class LimitRotationConstraint extends ObjectConstraint {
	#influence: number

	min: number
	max: number

	ownerRelativity: 'local' | 'global'

	constructor(owner: PhysicsModel, {
		ownerRelativity = 'global',
		influence = 1,
		min = -Infinity,
		max = Infinity,
	}: {
		ownerRelativity?: 'local' | 'global'
		influence?: number
		min?: number
		max?: number
	} = {}) {
		super(owner)

		this.ownerRelativity = ownerRelativity
		this.#influence = influence
		this.min = min
		this.max = max
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local'
			? this.owner.local
			: og

		const dr = clamp(o.rd, this.min, this.max) - o.rd

		og.rotate(o.rd + dr * this.#influence)
	}

	get influence() {
		return this.#influence
	}
	set influence(v: number) {
		this.#influence = clamp(v, 0, 1)
	}
}