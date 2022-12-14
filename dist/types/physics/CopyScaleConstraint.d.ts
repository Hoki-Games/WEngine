import type PhysicsModel from './PhysicsModel.js';
import type { Types as MathTypes } from '../math.js';
import TargetConstraint from './TargetConstraint.js';
export default class CopyScaleConstraint extends TargetConstraint {
    axes: MathTypes.Vec2<boolean>;
    offset: boolean;
    ownerRelativity: 'local' | 'global';
    targetRelativity: 'local' | 'global';
    constructor(owner: PhysicsModel, target: PhysicsModel, { axes, offset, ownerRelativity, targetRelativity }?: {
        axes?: MathTypes.Vec2<boolean>;
        offset?: boolean;
        ownerRelativity?: 'local' | 'global';
        targetRelativity?: 'local' | 'global';
    });
    solve(): void;
}
