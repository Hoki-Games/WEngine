import { type Vector2, vec2, clamp } from '../math.js'
import ObjectConstraint from './ObjectConstraint.js'
import type PhysicsModel from './PhysicsModel.js'

export default class LimitLocationConstraint extends ObjectConstraint {
	#influence: number

	ownerRelativity: 'local' | 'global'
	min: Vector2
	max: Vector2

	constructor(
		owner: PhysicsModel,
		{
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
		} = {}
	) {
		super(owner)

		this.ownerRelativity = ownerRelativity
		this.#influence = influence
		this.min = vec2(minX, minY)
		this.max = vec2(maxX, maxY)
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local' ? this.owner.local : og

		const minT = this.min.dif(o.t)
		const maxT = this.max.dif(o.t)

		const t = vec2(0)

		if (minT.x > 0) {
			if (maxT.x < 0) t.x = 0
			else t.x = minT.x
		} else if (maxT.x < 0) t.x = maxT.x

		if (minT.y > 0) {
			if (maxT.y < 0) t.y = 0
			else t.y = minT.y
		} else if (maxT.y < 0) t.y = maxT.y

		og.translate(og.tx + t.x * this.influence, og.ty + t.y * this.influence)
	}

	get influence() {
		return this.#influence
	}
	set influence(v: number) {
		this.#influence = clamp(v, 0, 1)
	}
}
