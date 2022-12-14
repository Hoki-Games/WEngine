import Animation from './Animation.js';
import type Blank from './Blank.js';
import type { Types as AnimationTypes } from '../animations.js';
export default class AnimationSequence extends Animation {
    #private;
    offset: number;
    constructor(...animations: Omit<AnimationTypes.Ani, 's'>[]);
    constructor(offset?: number, ...animations: Omit<AnimationTypes.Ani, 's'>[]);
    add(anim: Blank, dur?: number): void;
    remove(p: number): void;
    get length(): number;
    get value(): number;
}
