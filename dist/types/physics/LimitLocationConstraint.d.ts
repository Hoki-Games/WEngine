import { type Vector2 } from '../math.js';
import ObjectConstraint from './ObjectConstraint.js';
import type PhysicsModel from './PhysicsModel.js';
export default class LimitLocationConstraint extends ObjectConstraint {
    #private;
    ownerRelativity: 'local' | 'global';
    min: Vector2;
    max: Vector2;
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
