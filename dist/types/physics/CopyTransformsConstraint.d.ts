import type PhysicsModel from './PhysicsModel.js';
import TargetConstraint from './TargetConstraint.js';
declare type TransMixMode = 'replace' | 'split' | 'beforeFull' | 'afterFull';
export default class CopyTransformsConstraint extends TargetConstraint {
    mixMode: TransMixMode;
    ownerRelativity: 'local' | 'global';
    targetRelativity: 'local' | 'global';
    constructor(owner: PhysicsModel, target: PhysicsModel, { mixMode, ownerRelativity, targetRelativity }?: {
        mixMode?: TransMixMode;
        ownerRelativity?: 'local' | 'global';
        targetRelativity?: 'local' | 'global';
    });
    solve(): void;
}
export {};
