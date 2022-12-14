import PhysicsModel from './PhysicsModel.js';
export default abstract class ObjectConstraint {
    owner: PhysicsModel;
    constructor(owner: PhysicsModel);
    solve(): void;
}
