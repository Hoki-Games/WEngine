import type { Types } from '../math.js'

export default class Matrix3 {
	protected _data: Float32Array

	constructor()
	constructor(data: Types.Tri3<number>)
	constructor(data: Types.FixedArray<number, 9>)
	constructor(data?: Types.Tri3<number> | Types.FixedArray<number, 9>) {
		this._data = Float32Array.from(
			data?.flat() ?? [1, 0, 0, 0, 1, 0, 0, 0, 1]
		)
	}

	get(): Types.Tri3<number>
	get(col: number): Types.Vec3<number>
	get(col: number, row: number): number
	get(col?: number, row?: number) {
		if (typeof row == 'number') {
			return this._data[col * 3 + row]
		} else if (typeof col == 'number') {
			const colI = col * 3
			return [...this._data.subarray(colI, colI + 3)]
		} else {
			return [
				[...this._data.subarray(0, 3)],
				[...this._data.subarray(3, 6)],
				[...this._data.subarray(6, 9)]
			]
		}
	}

	set(value: Types.Tri3<number>): this
	set(col: number, value: Types.Vec3<number>): this
	set(col: number, row: number, value: number): this
	set(
		col: number | Types.Tri3<number>,
		row?: number | Types.Vec3<number>,
		value?: number
	) {
		if (typeof value == 'number') {
			this._data[+col * 3 + +row] = value
		} else if (Array.isArray(row)) {
			this._data.set(row, +col * 3)
		} else if (Array.isArray(col)) {
			this._data.set(col.flat())
		} else throw new Error('Invalid data')

		return this
	}

	copy() {
		return new Matrix3(this.get())
	}

	sum(...mat: Matrix3[]) {
		const ret = <Types.FixedArray<number, 9>>[...this._data]

		mat.forEach((m) => {
			m._data.forEach((v, i) => {
				ret[i] += v
			})
		})

		return new Matrix3(ret)
	}

	mult(mat: Matrix3) {
		const a = this.get()
		const b = mat.get()
		const r: Types.Tri3<number> = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		]

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				r[j][i] =
					a[0][i] * b[j][0] + a[1][i] * b[j][1] + a[2][i] * b[j][2]
			}
		}

		return new Matrix3(r)
	}

	transpose() {
		const ret: Types.Tri3<number> = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		]

		this.get().forEach((v, i) =>
			v.forEach((v, j) => {
				ret[j][i] = v
			})
		)

		return this.set(ret)
	}

	get buffer() {
		return this._data.buffer
	}
}
