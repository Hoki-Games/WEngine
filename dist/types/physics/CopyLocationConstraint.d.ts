import type PhysicsModel from './PhysicsModel.js';
import type { Types as MathTypes } from '../math.js';
import TargetConstraint from '../physics/TargetConstraint.js';
export default class CopyLocationConstraint extends TargetConstraint {
    axes: MathTypes.Vec2<boolean>;
    invert: MathTypes.Vec2<boolean>;
    offset: boolean;
    ownerRelativity: 'local' | 'global';
    targetRelativity: 'local' | 'global';
    constructor(owner: PhysicsModel, target: PhysicsModel, { axes, invert, offset, ownerRelativity, targetRelativity }?: {
        axes?: MathTypes.Vec2<boolean>;
        invert?: MathTypes.Vec2<boolean>;
        offset?: boolean;
        ownerRelativity?: 'local' | 'global';
        targetRelativity?: 'local' | 'global';
    });
    solve(): void;
}
