import type Timed from './Timed.js'
import Animation from './Animation.js'

export default class TimedAnimation extends Animation implements Timed {
	t0: number
	dur: number

	constructor({
		x0 = 0,
		dx = 1,
		func = (t) => t,
		t0 = 0,
		dur = 1
	}: {
		x0?: number
		dx?: number
		func?: (t: number) => number
		t0?: number
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
