import type { Types as AnimationTypes } from '../animations.js';
import AnimationSequence from './AnimationSequence.js';
import type Timed from './Timed.js';
export default class TimedAnimationSequence extends AnimationSequence implements Timed {
    t0: number;
    dur: number;
    constructor({ t0, dur, offset, animations }?: {
        t0?: number;
        dur?: number;
        offset?: number;
        animations?: Omit<AnimationTypes.Ani, 's'>[];
    });
    update(time: number): number;
}
