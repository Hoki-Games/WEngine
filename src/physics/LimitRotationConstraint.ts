import { clamp } from '../math.js'
import ObjectConstraint from './ObjectConstraint.js'
import type PhysicsModel from './PhysicsModel.js'

export default class LimitRotationConstraint extends ObjectConstraint {
	#influence: number

	min: number
	max: number

	ownerRelativity: 'local' | 'global'

	constructor(
		owner: PhysicsModel,
		{
			ownerRelativity = 'global',
			influence = 1,
			min = -Infinity,
			max = Infinity
		}: {
			ownerRelativity?: 'local' | 'global'
			influence?: number
			min?: number
			max?: number
		} = {}
	) {
		super(owner)

		this.ownerRelativity = ownerRelativity
		this.#influence = influence
		this.min = min
		this.max = max
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local' ? this.owner.local : og

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
