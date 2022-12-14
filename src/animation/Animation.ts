import Blank from './Blank.js'

export default class Animation extends Blank {
	protected _func: (p: number) => number = (p) => p
	protected _x0: number
	protected _dx: number

	constructor({
		x0 = 0,
		dx = 1,
		percent = 0,
		func = (p) => p
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

	get value() {
		return this._x0 + this._func(this.percent) * this._dx
	}
}
