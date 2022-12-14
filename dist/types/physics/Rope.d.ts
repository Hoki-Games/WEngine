import type PhysicsModel from './PhysicsModel.js';
import TargetConstraint from './TargetConstraint.js';
export default class Rope extends TargetConstraint {
    length: number;
    bounce: number;
    constructor(owner: PhysicsModel, target: PhysicsModel, { length, bounce }: {
        length: number;
        bounce: number;
    });
    solve(): void;
}
