export type FixedArray<T, L extends number> =
	[T, ...Array<T>] & { readonly length: L }

export type WVec2<T1, T2 = T1> = [T1, T2]
export type WVec3<T1, T2 = T1, T3 = T1> = [T1, T2, T3]
export type WVec4<T1, T2 = T1, T3 = T1, T4 = T1> = [T1, T2, T3, T4]

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
export type WColor = WColorObject | WVec4<GLclampf>

type WDimensionObject = {
	x: GLint
	y: GLint
	width: GLsizei
	height: GLsizei
}
export type WDimension = WDimensionObject
	| WVec4<GLint, GLint, GLsizei, GLsizei>

export const narrowColor = (color: WColor): WVec4<GLclampf> =>
	Array.isArray(color)
		? [...color]
		: [color.r, color.g, color.b, color.a]

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
export class Vector2 {
	x: number
	y: number

	constructor(x = 0, y = 0) {
		this.x = x
		this.y = y
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

	/**
	 * Creates a vector from length and rotation.
	 */
	static fromDegree(length: number, degree: number) {
		return vec2(length * Math.cos(degree), length * Math.sin(degree))
	}
}