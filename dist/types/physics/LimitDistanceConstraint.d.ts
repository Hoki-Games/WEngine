import PhysicsModel from './PhysicsModel.js';
import TargetConstraint from './TargetConstraint.js';
export default class LimitDistanceConstraint extends TargetConstraint {
    distance: number;
    clampRegion: 'inside' | 'outside' | 'surface';
    ownerRelativity: 'local' | 'global';
    targetRelativity: 'local' | 'global';
    constructor(owner: PhysicsModel, target: PhysicsModel, { distance, clampRegion, ownerRelativity, targetRelativity }?: {
        distance?: number;
        clampRegion?: 'inside' | 'outside' | 'surface';
        ownerRelativity?: 'local' | 'global';
        targetRelativity?: 'local' | 'global';
    });
    solve(): void;
}
