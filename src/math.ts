export type FixedArray<T, L extends number> =
	[T, ...T[]] & { readonly length: L }

export type Vec2<T1, T2 = T1> = [T1, T2]
export type Vec3<T1, T2 = T1, T3 = T1> = [T1, T2, T3]
export type Vec4<T1, T2 = T1, T3 = T1, T4 = T1> = [T1, T2, T3, T4]

export type Line2<T1, T2 = T1> = FixedArray<Vec2<T1, T2>, 2>
export type Line3<T1, T2 = T1, T3 = T1> = FixedArray<Vec3<T1, T2, T3>, 2>
export type Line4<T1, T2 = T1, T3 = T1, T4 = T1> =
	FixedArray<Vec4<T1, T2, T3, T4>, 2>

export type Tri2<T1, T2 = T1> = FixedArray<Vec2<T1, T2>, 3>
export type Tri3<T1, T2 = T1, T3 = T1> = FixedArray<Vec3<T1, T2, T3>, 3>
export type Tri4<T1, T2 = T1, T3 = T1, T4 = T1> =
	FixedArray<Vec4<T1, T2, T3, T4>, 3>

type ColorObject = {
	r: GLclampf
	g: GLclampf
	b: GLclampf
	a: GLclampf
}
export type Color = ColorObject | Vec4<GLclampf> | `#${string}`

type DimensionObject = {
	x: GLint
	y: GLint
	width: GLsizei
	height: GLsizei
}
export type Dimension = DimensionObject
	| Vec4<GLint, GLint, GLsizei, GLsizei>

export const narrowColor = (color: Color): Vec4<GLclampf> => {
	let ret: Vec4<GLclampf>

	if (Array.isArray(color)) ret = [...color]
	else if (typeof color == 'object')
		ret = [color.r, color.g, color.b, color.a]
	else {
		const b4 = '([0-Fa-f])'.repeat(4)
		const b8 = '([0-Fa-f][0-Fa-f])'.repeat(4)
		
		const rgba4 = new RegExp(`^#${b4}?$`).exec(color)
		const rgba8 = new RegExp(`^#${b8}?$`).exec(color)

		if (rgba4) ret = 
			<Vec4<GLclampf>>rgba4.slice(1).map(v => parseInt(v, 16) / 15)
		else if (rgba8) ret = 
			<Vec4<GLclampf>>rgba8.slice(1).map(v => parseInt(v, 16) / 255)
		else throw new Error('Invalid color data', { cause: color })
	}

	if (Number.isNaN(ret[3])) ret[3] = 1

	return ret
}
	

export const narrowDimension = (color: Dimension):
	Vec4<GLint, GLint, GLsizei, GLsizei> => Array.isArray(color)
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
	 * Calculates the difference between given vector and this.
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
	get size() {
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
		return this.scale(1 / this.size)
	}

	/**
	 * Return this vector's rotation.
	 */
	get rotation() {
		return Math.atan2(this.y, this.x)
	}

	get arr(): [number, number] {
		return [this.x, this.y]
	}

	get length(): 2 {
		return 2
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

export class Matrix3 {
	protected _data: Float32Array

	constructor()
	constructor(data: Tri3<number>)
	constructor(data: FixedArray<number, 9>)
	constructor(data?: Tri3<number> | FixedArray<number, 9>) {
		this._data = Float32Array.from(data?.flat() ?? [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		])
	}

	get(): Tri3<number>
	get(col: number): Vec3<number>
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

	set(value: Tri3<number>): this
	set(col: number, value: Vec3<number>): this
	set(col: number, row: number, value: number): this
	set(
		col: number | Tri3<number>,
		row?: number | Vec3<number>,
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
		const ret = <FixedArray<number, 9>>[...this._data]

		mat.forEach(m => {
			m._data.forEach((v, i) => {
				ret[i] += v
			})
		})
		
		return new Matrix3(ret)
	}

	mult(mat: Matrix3) {
		const a = this.get()
		const b = mat.get()
		const r: Tri3<number> = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		]

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				r[j][i] = a[0][i] * b[j][0] +
					a[1][i] * b[j][1] +
					a[2][i] * b[j][2]
			}
		}

		return new Matrix3(r)
	}

	transpose() {
		const ret: Tri3<number> = [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0]
		]

		this.get().forEach((v, i) => v.forEach((v, j) => {
			ret[j][i] = v
		}))

		return this.set(ret)
	}

	get buffer() {
		return this._data.buffer
	}
}

export class TransformMatrix3 extends Matrix3 {
	#translate: Vector2
	#direct: Vector2
	#skew: number
	#scale: Vector2

	constructor(buffer: Float32Array)
	constructor(options: {
		translate?: Vector2,
		rotate?: number,
		skew?: number,
		scale?: Vector2
	})
	constructor(value: {
		translate?: Vector2,
		rotate?: number,
		skew?: number,
		scale?: Vector2
	} | Float32Array = {}) {
		super()

		if (value instanceof Float32Array) {
			this.setArray(value)
		} else {
			this.#translate = value.translate ?? vec2(0)
			this.#direct = Vector2.fromDegree(value.rotate ?? 0)
			this.#skew = Math.tan(value.skew) ?? 0
			this.#scale = value.scale ?? vec2(1)

			this.calcMatrix()
		}
	}

	calcMatrix() {
		const [tx, ty] = this.#translate
		const [rx, ry] = this.#direct
		const [sx, sy] = this.#scale
		const k = this.#skew

		this._data.set([
			rx * sx, ry * sx, 0,
			(rx * k - ry) * sy, (ry * k + rx) * sy, 0,
			tx, ty, 1
		])

		return this
	}

	calcFields() {
		const [m11, m12, , m21, m22, , m31, m32] = this._data

		this.#direct = vec2(m11, m12).norm
		
		const sk = Math.atan2(m22, m21) - Math.PI / 2 - this.#direct.rotation
		this.#skew = -Math.tan(sk)

		this.#scale = vec2(
			Math.sqrt(m11 ** 2 + m12 ** 2),
			Math.sqrt(m21 ** 2 + m22 ** 2) * Math.cos(sk)
		)
		
		this.#translate = vec2(m31, m32)

		return this
	}

	translateX(x: number, recalc = true) {
		this.#translate.x = x

		if (recalc) this.calcMatrix()

		return this
	}

	translateY(y: number, recalc = true) {
		this.#translate.y = y

		if (recalc) this.calcMatrix()

		return this
	}

	translate(x: number, y: number, recalc = true) {
		this.#translate = vec2(x, y)

		if (recalc) this.calcMatrix()

		return this
	}

	rotate(r: number, recalc?: boolean): TransformMatrix3
	rotate(x: number, y: number, recalc?: boolean): TransformMatrix3
	rotate(v0: number, v1: number | boolean = true, v2 = true) {
		if (typeof v1 == 'number') {
			this.#direct = vec2(v0, v1).norm
			if (v2) this.calcMatrix()
		} else {
			this.#direct = Vector2.fromDegree(v0)
			if (v1) this.calcMatrix()
		}

		return this
	}

	scaleX(sx: number, recalc = true) {
		this.#scale.x = sx

		if (recalc) this.calcMatrix()

		return this
	}

	scaleY(sy: number, recalc = true) {
		this.#scale.y = sy

		if (recalc) this.calcMatrix()

		return this
	}

	scale(sx: number, sy: number, recalc = true) {
		this.#scale = vec2(sx, sy)

		if (recalc) this.calcMatrix()

		return this
	}

	skew(k: number, recalc = true) {
		this.#skew = Math.tan(k)

		if (recalc) this.calcMatrix()

		return this
	}

	matrix(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
		this.setArray([
			a, b, 0,
			c, d, 0,
			e, f, 1
		])
	}

	copy() {
		return new TransformMatrix3(this._data)
	}

	setArray(value: ArrayLike<number>, offset?: number) {
		this._data.set(value, offset)
		this.calcFields()
	}

	get tx() {
		return this.#translate.x
	}

	get ty() {
		return this.#translate.y
	}

	get t() {
		return this.#translate.sum()
	}

	get r() {
		return this.#direct.rotation
	}

	get sx() {
		return this.#scale.x
	}

	get sy() {
		return this.#scale.y
	}

	get s() {
		return this.#scale.sum()
	}

	get k() {
		return Math.atan(this.#skew)
	}

	get kt() {
		return this.#skew
	}

	get m() {
		const [a, b, , c, d, , e, f] = this._data


		return [a, b, c, d, e, f]
	}
	
	get a() {
		return this._data[0]
	}
	set a(v: number) {
		this._data[0] = v

		this.calcFields()
	}

	get b() {
		return this._data[1]
	}
	set b(v: number) {
		this._data[1] = v

		this.calcFields()
	}

	get c() {
		return this._data[3]
	}
	set c(v: number) {
		this._data[3] = v

		this.calcFields()
	}

	get d() {
		return this._data[4]
	}
	set d(v: number) {
		this._data[4] = v

		this.calcFields()
	}

	get e() {
		return this._data[6]
	}
	set e(v: number) {
		this._data[6] = v

		this.calcFields()
	}

	get f() {
		return this._data[7]
	}
	set f(v: number) {
		this._data[7] = v

		this.calcFields()
	}
}

export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
	if (x1 < 0 || x1 > 1) throw new Error('x1 is out of bounds', { cause: x1 })
	if (x2 < 0 || x2 > 1) throw new Error('x2 is out of bounds', { cause: x2 })
	
	const arr: Vec2<number>[] = []

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