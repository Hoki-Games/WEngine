import { clamp } from './math.js';
export class Blank {
    #value;
    #percent;
    constructor(value = 0) {
        this.#value = value;
        this.#percent = 0;
    }
    get percent() {
        return this.#percent;
    }
    set percent(v) {
        this.#percent = clamp(v, 0, 1);
    }
    get value() {
        return this.#value;
    }
}
export class Animation extends Blank {
    _func = p => p;
    _x0;
    _dx;
    constructor({ x0 = 0, dx = 1, percent = 0, func = p => p } = {}) {
        super();
        this._func = func;
        this._x0 = x0;
        this._dx = dx;
        this.percent = percent;
    }
    get value() {
        return this._x0 + this._func(this.percent) * this._dx;
    }
}
export class TimedAnimation extends Animation {
    t0;
    dur;
    constructor({ x0 = 0, dx = 1, func = t => t, t0 = 0, dur = 1 }) {
        super({ dx, x0, func });
        this.t0 = t0;
        this.dur = dur;
    }
    update(time) {
        this.percent = (time - this.t0) / this.dur;
        return this.value;
    }
}
export class AnimationSequence extends Animation {
    #sequence;
    offset;
    constructor(arg1, ...arg2) {
        super();
        this.#sequence = [];
        if (typeof arg1 == 'number') {
            this.offset = arg1;
            arg2.forEach(v => this.add(v.anim, v.dur));
        }
        else {
            this.offset = 0;
            [arg1, ...arg2].forEach(v => this.add(v.anim, v.dur));
        }
    }
    add(anim, dur = 1) {
        this.#sequence.push({
            anim,
            s: this.length,
            dur
        });
    }
    remove(p) {
        p = clamp(p, 0, 1) * this.length;
        const id = this.#sequence.findIndex(v => v.s <= p && v.s + v.dur >= p);
        this.#sequence.splice(id, 1);
        for (let i = id; i < this.#sequence.length; i++) {
            const anim = this.#sequence[i];
            if (i == 0) {
                anim.s = 0;
                continue;
            }
            const last = this.#sequence[i - 1];
            anim.s = last.s + last.dur;
        }
    }
    get length() {
        return this.#sequence.reduce((t, v) => t + v.dur, 0);
    }
    get value() {
        const p = this.percent * this.length;
        const anim = this.#sequence.find(v => v.s <= p && v.s + v.dur >= p);
        anim.anim.percent = (p - anim.s) / anim.dur;
        return this.offset + anim.anim.value;
    }
}
export class TimedAnimationSequence extends AnimationSequence {
    t0;
    dur;
    constructor({ t0 = 0, dur = 1, offset, animations = [] } = {}) {
        super(offset, ...animations);
        this.t0 = t0;
        this.dur = dur;
    }
    update(time) {
        this.percent = (time - this.t0) / this.dur;
        return this.value;
    }
}
