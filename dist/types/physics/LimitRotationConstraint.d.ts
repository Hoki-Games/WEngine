import ObjectConstraint from './ObjectConstraint.js';
import type PhysicsModel from './PhysicsModel.js';
export default class LimitRotationConstraint extends ObjectConstraint {
    #private;
    min: number;
    max: number;
    ownerRelativity: 'local' | 'global';
    constructor(owner: PhysicsModel, { ownerRelativity, influence, min, max }?: {
        ownerRelativity?: 'local' | 'global';
        influence?: number;
        min?: number;
        max?: number;
    });
    solve(): void;
    get influence(): number;
    set influence(v: number);
}
