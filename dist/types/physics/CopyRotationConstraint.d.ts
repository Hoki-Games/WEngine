import type PhysicsModel from './PhysicsModel.js';
import TargetConstraint from './TargetConstraint.js';
export default class CopyRotationConstraint extends TargetConstraint {
    invert: boolean;
    offset: boolean;
    ownerRelativity: 'local' | 'global';
    targetRelativity: 'local' | 'global';
    constructor(owner: PhysicsModel, target: PhysicsModel, { invert, offset, ownerRelativity, targetRelativity }?: {
        invert?: boolean;
        offset?: boolean;
        ownerRelativity?: 'local' | 'global';
        targetRelativity?: 'local' | 'global';
    });
    solve(): void;
}
