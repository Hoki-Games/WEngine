import type { Types as AnimationTypes } from '../animations.js'
import AnimationSequence from './AnimationSequence.js'
import type Timed from './Timed.js'

export default class TimedAnimationSequence
	extends AnimationSequence
	implements Timed
{
	t0: number
	dur: number

	constructor({
		t0 = 0,
		dur = 1,
		offset,
		animations = []
	}: {
		t0?: number
		dur?: number
		offset?: number
		animations?: Omit<AnimationTypes.Ani, 's'>[]
	} = {}) {
		super(offset, ...animations)

		this.t0 = t0
		this.dur = dur
	}

	update(time: number) {
		this.percent = (time - this.t0) / this.dur
		return this.value
	}
}
