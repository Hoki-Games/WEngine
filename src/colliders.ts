//* Colliders 🧱 

import { vec2, Vector2 } from "./math"

const furthestInDir = (s1: Collider, s2: Collider, rot: Vector2) => {
	const v1 = s1.support(rot).sum(s1.position)
	const v2 = s2.support(rot.neg).sum(s1.position)
	return v1.sum(v2.neg)
}


/**
 * Defines the most basic version of collider.
 * 
 * It represents a dot in space.
 */
class Collider {
	#rotate: number

	position: Vector2
	color: string
	intersects = false
	shadeIntersects = false

	shade: [Vector2, Vector2]

	constructor({
		x = 0,
		y = 0,
		rotate = 0,
		color
	}: {
		x?: number
		y?: number
		rotate?: number
		color: string
	}) {
		this.position = vec2(x, y)
		this.rotate = rotate
		this.color = color

		this.setShade()
	}

	setShade(shade: [Vector2, Vector2] = [vec2(0), vec2(0)]) {
		this.shade = shade
	}

	draw(ctx: CanvasRenderingContext2D) {/* empty */}

	drawShade(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.shadeIntersects ? 'green' : 'grey'
		const size = this.shade[1].sum(this.shade[0].neg)
		ctx.fillRect(
			this.globalPosition.x + this.shade[0].x,
			this.globalPosition.y + this.shade[0].y,
			size.x,
			size.y,
		)
	}

	support(direction: Vector2) { return vec2(0) }

	shadeIntersect(s: Collider) {
		const s1_min = this.globalPosition.sum(this.shade[0])
		const s1_max = this.globalPosition.sum(this.shade[1])
		const s2_min = s.globalPosition.sum(s.shade[0])
		const s2_max = s.globalPosition.sum(s.shade[1])

		if (s1_min.x < s2_max.x &&
			s2_min.x < s1_max.x &&
			s1_min.y < s2_max.y &&
			s2_min.y < s1_max.y
		) return true
	}

	intersect(s: Collider): boolean {
		if (!this.shadeIntersect(s)) false

		// Get first p1

		let dir = s.position.sum(this.position.neg)

		let p1 = furthestInDir(this, s, dir)

		// Get p2 as farthest point towards the origin

		dir = p1.neg

		let p2 = furthestInDir(this, s, dir)

		// Check if p2 is beyond the origin

		if (p2.dot(dir) < 0) return false

		// Get p3 from normal p1-2 to origin

		const p12 = p2.sum(dir)
		dir = p12.triProd(p1)

		let p3 = furthestInDir(this, s, dir)

		const check = (iter: number) => {
			if (iter <= 0) return false

			// Check if p3 is beyond the origin

			if (p3.dot(dir) < 0) return false

			// Check if triangle contains the origin

			const p3_neg = p3.neg
	
			const p32 = p2.dif(p3)
			const p31 = p1.dif(p3)

			dir = p32.triProd(p31)

			const c = p3_neg.dot(dir)

			if (Math.abs(c) < 0.001) return false

			if (c > 0) { // BC
				p1 = p3

				p3 = furthestInDir(this, s, dir)

				return check(iter - 1)
			} else { // AC + Tri
				dir = p31.triProd(p32)

				const c = p3_neg.dot(dir)

				if (Math.abs(c) < 0.001) return false

				if (c > 0) { // AC
					p2 = p3

					p3 = furthestInDir(this, s, dir)

					return check(iter - 1)
				} else return true // Tri
			}
		}

		return check(30)
	}

	get globalPosition() {
		return center.sum(this.position)
	}

	get rotate() {
		return this.#rotate
	}
	set rotate(v) {
		this.#rotate = v
		this.setShade()
	}
}

/**
 * Ellipse shaped collider, defined by two radiuses.
 */
class Ellipse extends Collider {
	radius: Vector2

	constructor({
		x,
		y,
		rotate,
		color,
		radiusX = 100,
		radiusY = 100
	}: {
		x?: number
		y?: number
		rotate?: number
		color: string
		radiusX?: number
		radiusY?: number
	}) {
		super({ x, y, rotate, color })

		this.radius = vec2(radiusX, radiusY)

		this.shade = [
			this.radius.neg,
			this.radius
		]
	}

	/**
	 * Draws this collider on the canvas.
	 */
	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.intersects ? 'lime' : this.color
		ctx.beginPath()
		ctx.ellipse(
			this.globalPosition.x, 
			this.globalPosition.y, 
			this.radius.x, 
			this.radius.y, 
			this.rotate, 
			0, 
			PI2)
		ctx.fill()
		ctx.stroke()
	}
}

/**
 * Circle shaped collider, defined by it's radius.
 */
class Circle extends Ellipse {
	constructor({
		x,
		y,
		rotate,
		color,
		radius = 100
	}: {
		x?: number
		y?: number
		rotate?: number
		color: string
		radius?: number
	}) {
		super({ x, y, rotate, color, radiusX: radius, radiusY: radius })
	}

	support(direction: Vector2) {
		const rot = Math.atan2(direction.y, direction.x)

		return Vector2.fromDegree(this.radius.x, rot).sum(this.position)
	}
}

/**
 * Polygon shaped collider, built from relatively positioned vertices.
 * 
 * **Must be convex.**
 */
class Polygon extends Collider {
	verts: Vector2[] = []

	constructor({
		x,
		y,
		rotate,
		color,
		verts,
		chk = true
	}: {
		x?: number
		y?: number
		rotate?: number
		color: string
		verts: Vector2[]
		chk?: boolean
	}) {
		super({ x, y, rotate, color })

		if (verts.length < 3) 
			throw new Error('Polygon must contain at least 3 vertices')

		const v0_neg = verts[0].neg
		const clockwise = verts[1]
			.sum(v0_neg).right
			.dot(verts[2]
				.sum(v0_neg)) > 0

		for (let i = 0; i < verts.length; i++) {
			const a = verts[i == 0 ? verts.length - 1 : i - 1]
			const b = verts[i]
			const c = verts[i == verts.length - 1 ? 0 : i + 1]

			const b_neg = b.neg

			const ba = a.sum(b_neg)
			const bc = c.sum(b_neg)

			const normal = clockwise ? bc.right : bc.left

			if (chk && normal.dot(ba) <= 0) 
				throw new Error('The polygon must be convex')
		}

		this.verts = verts

		this.setShade()
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.intersects ? 'lime' : this.color

		const cos = Math.cos(this.rotate)
		const sin = Math.sin(this.rotate)

		ctx.beginPath()
		ctx.moveTo(
			this.globalPosition.x 
			+ this.verts[0].x * cos 
			- this.verts[0].y * sin, 
			this.globalPosition.y 
			+ this.verts[0].x * sin 
			+ this.verts[0].y * cos)
		for (let i = 1; i < this.verts.length; i++) {
			const vert = this.verts[i]
			ctx.lineTo(
				this.globalPosition.x 
				+ vert.x * cos 
				- vert.y * sin, 
				this.globalPosition.y 
				+ vert.x * sin 
				+ vert.y * cos)
		}
		ctx.closePath()

		ctx.fill()
		ctx.stroke()
	}

	setShade() {
		const min = vec2(Infinity, Infinity)
		const max = vec2(-Infinity, -Infinity)

		const cos = Math.cos(this.rotate)
		const sin = Math.sin(this.rotate)

		this.verts?.forEach(v => {
			v = vec2(v.x * cos - v.y * sin, v.x * sin + v.y * cos)

			if (v.x < min.x) min.x = v.x
			if (v.x > max.x) max.x = v.x
			if (v.y < min.y) min.y = v.y
			if (v.y > max.y) max.y = v.y
		})

		super.setShade([min, max])
	}

	//TODO: Support function
}

class Regular extends Polygon {
	vertices: number
	radius: number

	constructor({
		x,
		y,
		rotate,
		color,
		radius = 100,
		vertices
	}: {
		x?: number
		y?: number
		rotate?: number
		color: string
		radius?: number
		vertices: number,
	}) {
		const verts: Vector2[] = []
		const dAng = PI2 / vertices // 60
		const ang = vertices % 2 ? PI_2 : (Math.PI - dAng) * .5 //60
		verts.push(
			vertices % 2 ? vec2(0, radius) : Vector2.fromDegree(radius, ang))

		const maxAng = PI2 + ang - 0.0001
		for (let i = ang + dAng; i < maxAng; i += dAng) 
			verts.push(Vector2.fromDegree(radius, i))

		super({ x, y, rotate, color, verts })

		this.radius = radius
		this.vertices = vertices
	}

	support(direction: Vector2) {
		const ang = PI2 / this.vertices // 60
		const stRot = this.vertices % 2 ? PI_2 : PI_2 - ang / 2 // 60
		const rot = direction.rotation - stRot // -15

		let i = Math.round(rot / ang) // 0
		if (i < 0) i += this.vertices
		if (i >= this.vertices) i -= this.vertices

		return this.verts[i].sum(this.position)
	}
}



//* Constants 👓

const PI2 = Math.PI * 2
const PI_2 = Math.PI * .5
const center = vec2(500)