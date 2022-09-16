import { clamp } from './math.js'

interface Timed {
	t0: number
	dur: number
	percent: number
	readonly value: number

	update(time: number): number
}

export class Animation extends EventTarget {
	protected _func: (p: number) => number = p => p
	protected _x0: number
	protected _dx: number
	#percent: number

	constructor({
		x0 = 0,
		dx = 1,
		percent = 0,
		func = p => p
	}: {
		x0?: number
		dx?: number
		percent?: number
		func?: (p: number) => number 
	} = {}) {
		super()
		this._func = func
		this._x0 = x0
		this._dx = dx
		this.percent = percent
	}

	get percent() {
		return this.#percent
	}
	set percent(v: number) {
		this.#percent = clamp(v, 0, 1)
		if (this.#percent == 1) this.dispatchEvent(new CustomEvent('end'))
	}

	get value() {
		return this._x0 + this._func(this.percent) * this._dx
	}
}

export class TimedAnimation extends Animation implements Timed {
	t0: number
	dur: number

	constructor({
		x0 = 0,
		dx = 1,
		func = t => t,
		t0 = 0,
		dur = 1
	}: {
		x0?: number,
		dx?: number,
		func?: (t: number) => number,
		t0?: number,
		dur?: number
	}) {
		super({ dx, x0, func })
		
		this.t0 = t0
		this.dur = dur
	}

	update(time: number) {
		this.percent = (time - this.t0) / this.dur
		return this.value
	}
}

type Ani = {
	anim: Animation
	s: number
	dur: number
}
export class AnimationSequence extends Animation {
	#sequence: Ani[]
	
	constructor(...animations: {
		anim: Animation
		dur: number
	}[]) {
		super()

		this.#sequence = []
		animations.forEach(v => this.add(v.anim, v.dur))
	}

	add(anim: Animation, dur: number) {
		this.#sequence.push({
			anim,
			s: this.length,
			dur
		})
	}

	remove(p: number) {
		p = clamp(p, 0, 1) * this.length
		const id = this.#sequence.findIndex(v => v.s <= p && v.s + v.dur >= p)

		this.#sequence.splice(id, 1)

		for (let i = id; i < this.#sequence.length; i++) {
			const anim = this.#sequence[i]

			if (i == 0) {
				anim.s = 0;
				continue;
			}

			const last = this.#sequence[i - 1]
			anim.s = last.s + last.dur
		}
	}

	get length() {
		return this.#sequence.reduce((t, v) => t + v.dur, 0)
	}

	get value() {
		const p = this.percent * this.length
		const anim = this.#sequence.find(v => v.s <= p && v.s + v.dur >= p)

		anim.anim.percent = (p - anim.s) / anim.dur
		return anim.anim.value
	}
}

export class TimedAnimationSequence extends AnimationSequence implements Timed {
	t0: number
	dur: number

	constructor({
		t0 = 0,
		dur = 1,
		animations = []
	}: {
		t0?: number,
		dur?: number,
		animations?: Omit<Ani, 's'>[]
	} = {}) {
		super(...animations)

		this.t0 = t0
		this.dur = dur
	}

	update(time: number) {
		this.percent = (time - this.t0) / this.dur
		return this.value
	}
}

// 0<---------------▽--->1 (0.8)
//  [anim1, anim2, anim3] (sequence)
//  [         45        ]
//  [ 15 ][2][  20  ][8 ]