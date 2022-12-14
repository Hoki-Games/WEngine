import type PhysicsModel from './PhysicsModel.js'
import type { Types as MathTypes } from '../math.js'
import TargetConstraint from '../physics/TargetConstraint.js'

export default class CopyLocationConstraint extends TargetConstraint {
	axes: MathTypes.Vec2<boolean>
	invert: MathTypes.Vec2<boolean>
	offset: boolean
	ownerRelativity: 'local' | 'global'
	targetRelativity: 'local' | 'global'

	constructor(
		owner: PhysicsModel,
		target: PhysicsModel,
		{
			axes = [true, true],
			invert = [false, false],
			offset = false,
			ownerRelativity = 'global',
			targetRelativity = 'global'
		}: {
			axes?: MathTypes.Vec2<boolean>
			invert?: MathTypes.Vec2<boolean>
			offset?: boolean
			ownerRelativity?: 'local' | 'global'
			targetRelativity?: 'local' | 'global'
		} = {}
	) {
		super(owner, target)

		this.axes = axes
		this.invert = invert
		this.offset = offset
		this.ownerRelativity = ownerRelativity
		this.targetRelativity = targetRelativity
	}

	solve() {
		const o =
			this.ownerRelativity == 'local'
				? this.owner.local.t
				: this.owner.global.t

		const t =
			this.targetRelativity == 'local'
				? this.target.local.t
				: this.target.global.t

		if (this.axes[0]) {
			const i = this.invert[0] ? -1 : 1

			this.owner.global.translateX(t.x * i + (this.offset ? o.x : 0))
		}

		if (this.axes[1]) {
			const i = this.invert[1] ? -1 : 1

			this.owner.global.translateY(t.y * i + (this.offset ? o.y : 0))
		}
	}
}
