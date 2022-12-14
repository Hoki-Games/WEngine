import type PhysicsModel from './PhysicsModel.js'
import type { Types as MathTypes } from '../math.js'
import TargetConstraint from './TargetConstraint.js'

export default class CopyScaleConstraint extends TargetConstraint {
	axes: MathTypes.Vec2<boolean>
	offset: boolean
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(
		owner: PhysicsModel,
		target: PhysicsModel,
		{
			axes = [true, true],
			offset = false,
			ownerRelativity = 'global',
			targetRelativity = 'global'
		}: {
			axes?: MathTypes.Vec2<boolean>
			offset?: boolean
			ownerRelativity?: 'local' | 'global'
			targetRelativity?: 'local' | 'global'
		} = {}
	) {
		super(owner, target)

		this.axes = axes
		this.offset = offset
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		const o =
			this.ownerRelativity == 'local'
				? this.owner.local.s
				: this.owner.global.s

		const t =
			this.targetRelativity == 'local'
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
