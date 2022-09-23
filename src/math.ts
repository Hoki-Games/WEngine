export type FixedArray<T, L extends number> =
	[T, ...T[]] & { readonly length: L }

export type WVec2<T1, T2 = T1> = [T1, T2]
export type WVec3<T1, T2 = T1, T3 = T1> = [T1, T2, T3]
export type WVec4<T1, T2 = T1, T3 = T1, T4 = T1> = [T1, T2, T3, T4]

export type WLine2<T1, T2 = T1> = FixedArray<WVec2<T1, T2>, 2>
export type WLine3<T1, T2 = T1, T3 = T1> = FixedArray<WVec3<T1, T2, T3>, 2>
export type WLine4<T1, T2 = T1, T3 = T1, T4 = T1> =
	FixedArray<WVec4<T1, T2, T3, T4>, 2>

export type WTri2<T1, T2 = T1> = FixedArray<WVec2<T1, T2>, 3>
export type WTri3<T1, T2 = T1, T3 = T1> = FixedArray<WVec3<T1, T2, T3>, 3>
export type WTri4<T1, T2 = T1, T3 = T1, T4 = T1> =
	FixedArray<WVec4<T1, T2, T3, T4>, 3>

type WColorObject = {
	r: GLclampf
	g: GLclampf
	b: GLclampf
	a: GLclampf
}
export type WColor = WColorObject | WVec4<GLclampf> | `#${string}`

type WDimensionObject = {
	x: GLint
	y: GLint
	width: GLsizei
	height: GLsizei
}
export type WDimension = WDimensionObject
	| WVec4<GLint, GLint, GLsizei, GLsizei>

export const narrowColor = (color: WColor): WVec4<GLclampf> => {
	let ret: WVec4<GLclampf>

	if (Array.isArray(color)) ret = [...color]
	else if (typeof color == 'object')
		ret = [color.r, color.g, color.b, color.a]
	else {
		const b4 = '([0-Fa-f])'.repeat(4)
		const b8 = '([0-Fa-f][0-Fa-f])'.repeat(4)
		
		const rgba4 = new RegExp(`^#${b4}?$`).exec(color)
		const rgba8 = new RegExp(`^#${b8}?$`).exec(color)

		if (rgba4) ret = 
			<WVec4<GLclampf>>rgba4.slice(1).map(v => parseInt(v, 16) / 16)
		else if (rgba8) ret = 
			<WVec4<GLclampf>>rgba8.slice(1).map(v => parseInt(v, 16) / 255)
		else throw new Error('Invalid color data', { cause: color })
	}

	return ret
}
	

export const narrowDimension = (color: WDimension):
	WVec4<GLint, GLint, GLsizei, GLsizei> => Array.isArray(color)
	? [...color]
	: [color.x, color.y, color.width, color.height]

/**
 * Simplifies {@link Vector2} creation.
 */
export const vec2 = (x: number, y?: number): Vector2 => new Vector2(x, y ?? x)

/**
  * Defines two-dimentional vector with x and y coordinates.
  */
export class Vector2 implements Iterable<number> {
	x: number
	y: number

	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
	}

	add(...v: Vector2[]) {
		v.forEach(v => {
			this.x += v.x;
			this.y += v.y;
		})
	}

	/**
	 * Calculates the sum of all given vectors and this.
	 * 
	 * _If no vectors were given, just returnes this._
	 */
	sum(...v: Vector2[]) {
		const ret = vec2(this.x, this.y)
		for (const vec of v) {
			ret.x += vec.x
			ret.y += vec.y
		}
		return ret
	}

	/**
	 * Calculates the difference between gien vector and this.
	 */
	dif(v: Vector2) {
		return vec2(this.x - v.x, this.y - v.y)
	}

	/**
	 * Calculates the multiplication of all given vectors and this.
	 * _If no vectors were given, just returnes this._
	 */
	mult(...v: Vector2[]) {
		const ret = vec2(this.x, this.y)
		for (const vec of v) {
			ret.x *= vec.x
			ret.y *= vec.y
		}
		return ret
	}

	/**
	 * Calculates the division of this by given vector.
	 * 
	 * _A/B_
	 */
	div(v: Vector2) {
		return vec2(this.x / v.x, this.y / v.y)
	}

	/**
	 * Calculates the multiplication of given number and this.
	 * 
	 * _n•A_
	 */
	scale(n: number) {
		return vec2(this.x * n, this.y * n)
	}

	/**
	 * Calculates the dot product of this and given vector.
	 * 
	 * _A•B_
	 */
	dot(v: Vector2) {
		return this.x * v.x + this.y * v.y
	}

	/**
	 * Calculates the triple product of this and given vector.
	 * 
	 * _(A×B)×A_
	 */
	triProd(v: Vector2) {
		const crossZ = this.x * v.y - this.y * v.x
		return vec2(this.y * crossZ, -this.x * crossZ)
	}

	/**
	 * Returns vector, perpendicular to this facing right.
	 * 
	 * ↱
	 */
	get right() {
		return vec2(this.y, -this.x)
	}

	/**
	 * Returns vector, perpendicular to this facing left.
	 * 
	 * ↰
	 */
	get left() {
		return vec2(-this.y, this.x)
	}

	/**
	 * Returns this vector but it's x and y are absolute.
	 */
	get abs() {
		return vec2(Math.abs(this.x), Math.abs(this.y))
	}

	/**
	 * Return this vector's length.
	 * 
	 * _|A|_
	 */
	get length() {
		return Math.hypot(this.x, this.y)
	}

	/**
	 * Returns a vector negative to this.
	 */
	get neg() {
		return vec2(-this.x, -this.y)
	}

	/**
	 * Returns this vector but with length equal to 1.
	 */
	get norm() {
		return this.scale(1 / this.length)
	}

	/**
	 * Return this vector's rotation.
	 */
	get rotation() {
		return Math.atan2(this.y, this.x)
	}

	get [Symbol.iterator]() {
		const me = this
		return function*() {
			yield* [me.x, me.y]
		}
	}

	/**
	 * Creates a vector from length and rotation.
	 */
	static fromDegree(degree: number, length = 1) {
		return vec2(length * Math.cos(degree), length * Math.sin(degree))
	}
}

export class WMatrix3 {
	protected _data: WTri3<number>

	constructor(data?: WTri3<number>) {
		this._data = data ?? [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		]
	}

	get(): WTri3<number>
	get(col: number): WVec3<number>
	get(col: number, row: number): number
	get(col?: number, row?: number) {
		if (typeof row == 'number') {
			return this._data[col][row]
		} else if (typeof col == 'number') {
			return [...this._data[col]]
		} else {
			const [a, b, c] = this._data
			return [[...a], [...b], [...c]]
		}
	}

	set(value: WTri3<number>): void
	set(col: number, value: WVec3<number>): void
	set(col: number, row: number, value: number): void
	set(
		col: number | WTri3<number>,
		row?: number | WVec3<number>,
		value?: number
	) {
		if (typeof value == 'number') {
			this._data[<number>col][<number>row] = value
		} else if (Array.isArray(row)) {
			this._data[<number>col] = row
		} else if (Array.isArray(col)) {
			this._data = col
		} else throw new Error('Invalid data')
	}

	copy() {
		return new WMatrix3(this.get())
	}

	sum(...mat: WMatrix3[]) {
		const ret = []

		this._data.forEach((_, col) => {
			ret.push([])
			this._data[col].forEach((v1, row) => { 
				ret[col].push(mat.reduce((t, v) => t + v[col][row], v1))
			})
		})
		
		return new WMatrix3(<WTri3<number>>ret)
	}

	mult(mat: WMatrix3) {
		const a = this.get()
		const b = mat.get()

		// TODO: Turn to loop calc

		const r00 = a[0][0] * b[0][0] + a[1][0] * b[0][1] + a[2][0] * b[0][2]
		const r10 = a[0][0] * b[1][0] + a[1][0] * b[1][1] + a[2][0] * b[1][2]
		const r20 = a[0][0] * b[2][0] + a[1][0] * b[2][1] + a[2][0] * b[2][2]

		const r01 = a[0][1] * b[0][0] + a[1][1] * b[0][1] + a[2][1] * b[0][2]
		const r11 = a[0][1] * b[1][0] + a[1][1] * b[1][1] + a[2][1] * b[1][2]
		const r21 = a[0][1] * b[2][0] + a[1][1] * b[2][1] + a[2][1] * b[2][2]

		const r02 = a[0][2] * b[0][0] + a[1][2] * b[0][1] + a[2][2] * b[0][2]
		const r12 = a[0][2] * b[1][0] + a[1][2] * b[1][1] + a[2][2] * b[1][2]
		const r22 = a[0][2] * b[2][0] + a[1][2] * b[2][1] + a[2][2] * b[2][2]
		
		return new WMatrix3([
			[r00, r01, r02],
			[r10, r11, r12],
			[r20, r21, r22]
		])
	}

	transpose() {
		const m = this.get()

		this.set([
			[m[0][0], m[1][0], m[2][0]],
			[m[0][1], m[1][1], m[2][1]],
			[m[0][2], m[1][2], m[2][2]]
		])
	}
}

export class WTransformMatrix3 {
	translate: Vector2
	rotate: number
	scale: Vector2
	origin: Vector2

	constructor({
		translate = vec2(0),
		rotate = 0,
		scale = vec2(1),
		origin = vec2(0)
	}: {
		translate?: Vector2,
		rotate?: number,
		scale?: Vector2,
		origin?: Vector2
	}) {
		this.translate = translate
		this.rotate = rotate
		this.scale = scale
		this.origin = origin
	}

	getMatrix() {
		const [tx, ty] = this.translate
		const [rx, ry] = Vector2.fromDegree(this.rotate)
		const [sx, sy] = this.scale

		return new WMatrix3([
			[1, 0, 0],
			[0, 1, 0],
			[tx, ty, 1]
		]).mult(new WMatrix3([
			[rx, ry, 0],
			[-ry, rx, 0],
			[0, 0, 1]
		])).mult(new WMatrix3([
			[sx, 0, 0],
			[0, sy, 0],
			[0, 0, 1]
		]))
	}

	apply(v: Vector2 | WVec2<number>) {
		let [x, y] = v
		x -= this.origin.x
		y -= this.origin.y

		const trans = this.getMatrix().get()
		const dx = trans[0][0] * x + trans[1][0] * y + trans[2][0]
		const dy = trans[0][1] * x + trans[1][1] * y + trans[2][1]
		x = dx
		y = dy

		return this.origin.sum(vec2(x, y))
	}
}

export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
	if (x1 < 0 || x1 > 1) throw new Error('x1 is out of bounds', { cause: x1 })
	if (x2 < 0 || x2 > 1) throw new Error('x2 is out of bounds', { cause: x2 })
	
	const arr: WVec2<number>[] = []

	const pos = (a: number, b: number, t: number) =>
		t * (3 * a * (1 - t) ** 2 + t * (3 * b * (1 - t) + t))

	return (steps: number) => {
		for (let i = 0; i <= steps; i++) {
			const t = i / steps

			arr.push([
				pos(x1, x2, t),
				pos(y1, y2, t)
			])
		}

		return (x: number) => {
			if (x < 0 || x > 1) 
				throw new Error('x is out of bounds', { cause: x })

			const search = (l: number, r: number) => {
				if (r - l == 1) {
					const rX = arr[r][0]
					const lX = arr[l][0]
					const rY = arr[r][1]
					const lY = arr[l][1]

					return (x - rX) / (lX - rX) * lY + (x - lX) / (rX - lX) * rY
				}

				const i = Math.round(l + (r - l) / 2)
				const v = arr[i]

				if (v[0] < x) return search(i, r)
				else if (v[0] > x) return search(l, i)

				return v[1]
			}
		
			return search(0, arr.length - 1)
		}
	}
}

export const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(min, value), max)