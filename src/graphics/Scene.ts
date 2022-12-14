import type Timed from '../animation/Timed.js'
import type { Types as MathTypes } from '../math.js'
import type BasicObject from '../objects/BasicObject.js'
import PositionedObject from '../objects/PositionedObject.js'
import {
	type Types as GraphicTypes,
	narrowColor,
	narrowDimension
} from '../graphics.js'

export default class Scene {
	display: HTMLCanvasElement
	gl: WebGL2RenderingContext
	settings: {
		backgroundColor: MathTypes.Vec4<GLclampf>
		viewport: MathTypes.Vec4<GLint, GLint, GLsizei, GLsizei>
		enable: GLenum[]
		depthFunc: GLenum
		blendFunc: [GLenum, GLenum]
	}
	objects: Record<string, BasicObject>
	animations: Timed[]

	constructor({
		canvas,
		settings
	}: {
		canvas: HTMLCanvasElement
		settings: GraphicTypes.Settings
	}) {
		this.display = canvas
		this.gl = canvas.getContext('webgl2', {
			premultipliedAlpha: settings.premultipliedAlpha ?? true
		})
		this.settings = {
			backgroundColor: narrowColor(settings.backgroundColor),
			viewport: narrowDimension(settings.viewport),
			depthFunc: settings.depthFunc ?? WebGL2RenderingContext.LEQUAL,
			blendFunc: settings.blendFunc ?? [
				WebGL2RenderingContext.ONE,
				WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA
			],
			enable: settings.enable ?? []
		}
		this.objects = {}
		this.animations = []

		this.init()
	}

	init() {
		this.gl.clearColor(...this.settings.backgroundColor)

		this.settings.enable.forEach((v) => this.gl.enable(v))

		this.gl.depthFunc(this.settings.depthFunc)
		this.gl.blendFunc(...this.settings.blendFunc)

		this.gl.blendFunc(...this.settings.blendFunc)

		this.resize()
	}

	draw() {
		this.gl.clear(
			WebGL2RenderingContext.COLOR_BUFFER_BIT |
				WebGL2RenderingContext.DEPTH_BUFFER_BIT
		)

		Object.values(this.objects)
			.sort((a, b) => b.zIndex - a.zIndex)
			.forEach((v) => v.draw())
	}

	resize() {
		this.gl.viewport(...this.settings.viewport)
	}

	updateLocations(dt: number) {
		for (const name in this.objects) {
			const obj = this.objects[name]
			if (obj instanceof PositionedObject) obj.physics.updateLocation(dt)
		}
	}

	addObject(name: string, value: BasicObject): void
	addObject(entries: [string, BasicObject][]): void
	addObject(entries: Record<string, BasicObject>): void
	addObject(
		arg1: string | [string, BasicObject][] | Record<string, BasicObject>,
		arg2?: BasicObject
	) {
		if (typeof arg1 == 'string') {
			this.objects[arg1] = arg2
		} else if (Array.isArray(arg1)) {
			arg1.forEach(([n, v]) => (this.objects[n] = v))
		} else {
			for (const name in arg1) {
				this.objects[name] = arg1[name]
			}
		}
	}

	removeObject(...name: string[]) {
		name.forEach((v) => delete this.objects[v])
	}

	clearObjects() {
		this.objects = {}
	}

	addAnimation(...animations: Timed[]) {
		this.animations = [...this.animations, ...animations]
	}

	updateAnimations(time: number) {
		this.animations.forEach((v) => v.update(time))
	}
}
