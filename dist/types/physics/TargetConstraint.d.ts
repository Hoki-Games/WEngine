import ObjectConstraint from './ObjectConstraint.js';
import type PhysicsModel from './PhysicsModel.js';
export default abstract class TargetConstraint extends ObjectConstraint {
    target: PhysicsModel;
    constructor(owner: PhysicsModel, target: PhysicsModel);
}
