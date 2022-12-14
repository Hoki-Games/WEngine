import type PhysicsModel from './PhysicsModel.js';
import TargetConstraint from './TargetConstraint.js';
export default class Spring extends TargetConstraint {
    L0: number;
    ks: number;
    constructor(owner: PhysicsModel, target: PhysicsModel, { L0, ks }: {
        L0: number;
        ks: number;
    });
    solve(): void;
}
