import Vector2 from './math/Vector2.js'

export namespace Types {
	export type FixedArray<T, L extends number> = [T, ...T[]] & {
		readonly length: L
	}

	export type Vec2<T1, T2 = T1> = [T1, T2]
	export type Vec3<T1, T2 = T1, T3 = T1> = [T1, T2, T3]
	export type Vec4<T1, T2 = T1, T3 = T1, T4 = T1> = [T1, T2, T3, T4]

	export type Line2<T1, T2 = T1> = FixedArray<Vec2<T1, T2>, 2>
	export type Line3<T1, T2 = T1, T3 = T1> = FixedArray<Vec3<T1, T2, T3>, 2>
	export type Line4<T1, T2 = T1, T3 = T1, T4 = T1> = FixedArray<
		Vec4<T1, T2, T3, T4>,
		2
	>

	export type Tri2<T1, T2 = T1> = FixedArray<Vec2<T1, T2>, 3>
	export type Tri3<T1, T2 = T1, T3 = T1> = FixedArray<Vec3<T1, T2, T3>, 3>
	export type Tri4<T1, T2 = T1, T3 = T1, T4 = T1> = FixedArray<
		Vec4<T1, T2, T3, T4>,
		3
	>
}

export { default as Vector2 } from './math/Vector2.js'
export { default as Matrix3 } from './math/Matrix3.js'
export { default as TransformMatrix3 } from './math/TransformMatrix3.js'

/**
 * Simplifies {@link Vector2} creation.
 */
export const vec2 = (x: number, y?: number) => new Vector2(x, y ?? x)

export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
	if (x1 < 0 || x1 > 1) throw new Error('x1 is out of bounds', { cause: x1 })
	if (x2 < 0 || x2 > 1) throw new Error('x2 is out of bounds', { cause: x2 })

	const arr: Types.Vec2<number>[] = []

	const pos = (a: number, b: number, t: number) =>
		t * (3 * a * (1 - t) ** 2 + t * (3 * b * (1 - t) + t))

	return (steps: number) => {
		for (let i = 0; i <= steps; i++) {
			const t = i / steps

			arr.push([pos(x1, x2, t), pos(y1, y2, t)])
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

					return (
						((x - rX) / (lX - rX)) * lY +
						((x - lX) / (rX - lX)) * rY
					)
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
