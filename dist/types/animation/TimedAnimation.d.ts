import type Timed from './Timed.js';
import Animation from './Animation.js';
export default class TimedAnimation extends Animation implements Timed {
    t0: number;
    dur: number;
    constructor({ x0, dx, func, t0, dur }: {
        x0?: number;
        dx?: number;
        func?: (t: number) => number;
        t0?: number;
        dur?: number;
    });
    update(time: number): number;
}
