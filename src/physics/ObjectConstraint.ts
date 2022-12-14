import PhysicsModel from './PhysicsModel.js'

export default abstract class ObjectConstraint {
	owner: PhysicsModel

	constructor(owner: PhysicsModel) {
		this.owner = owner
	}

	solve() {
		/* empty */
	}
}
