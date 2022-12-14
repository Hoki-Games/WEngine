import ObjectConstraint from './ObjectConstraint.js';
import type PhysicsModel from './PhysicsModel.js';
export default class LimitScaleConstraint extends ObjectConstraint {
    #private;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    ownerRelativity: 'local' | 'global';
    constructor(owner: PhysicsModel, { ownerRelativity, influence, minX, minY, maxX, maxY }?: {
        ownerRelativity?: 'local' | 'global';
        influence?: number;
        minX?: number;
        minY?: number;
        maxX?: number;
        maxY?: number;
    });
    solve(): void;
    get influence(): number;
    set influence(v: number);
}
