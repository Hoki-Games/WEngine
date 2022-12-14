import { clamp } from '../math.js'
import ObjectConstraint from './ObjectConstraint.js'
import type PhysicsModel from './PhysicsModel.js'

export default class LimitScaleConstraint extends ObjectConstraint {
	#influence: number

	minX: number
	minY: number
	maxX: number
	maxY: number

	ownerRelativity: 'local' | 'global'

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
		this.minX = minX
		this.minY = minY
		this.maxX = maxX
		this.maxY = maxY
	}

	solve() {
		const og = this.owner.global
		const o = this.ownerRelativity == 'local' ? this.owner.local : og

		const dsx = clamp(o.sx, this.minX, this.maxX) - o.sx
		const dsy = clamp(o.sy, this.minY, this.maxY) - o.sy

		og.scale(o.sx + dsx * this.#influence, o.sy + dsy * this.#influence)
	}

	get influence() {
		return this.#influence
	}
	set influence(v: number) {
		this.#influence = clamp(v, 0, 1)
	}
}
