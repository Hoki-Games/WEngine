import Blank from './animation/Blank.js'

export namespace Types {
	export type Ani = {
		anim: Blank
		s: number
		dur?: number
	}
}

export { default as Animation } from './animation/Animation.js'
export { default as AnimationSequence } from './animation/AnimationSequence.js'
export type { default as Blank } from './animation/Blank.js'
export { default as Timed } from './animation/Timed.js'
export { default as TimedAnimation } from './animation/TimedAnimation.js'
export { default as TimedAnimationSequence } from './animation/TimedAnimationSequence.js'