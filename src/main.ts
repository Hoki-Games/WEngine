import { WScene } from './graphics.js'
import {
	CircleObject,
	LinesObject,
	WPositionedObject
} from './objects.js'
import { vec2, bezier } from './math.js'
import { Animation, Blank, TimedAnimationSequence } from './animation.js'

window.addEventListener('load', async () => {
	const display = <HTMLCanvasElement>document.getElementById('display')

	const scene = globalThis.scene = new WScene({
		canvas: display,
		settings: {
			backgroundColor: '#150E1C',
			depthFunc: WebGL2RenderingContext.LEQUAL,
			blendFunc: [
				WebGL2RenderingContext.SRC_ALPHA,
				WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA
			],
			enable: [WebGL2RenderingContext.DEPTH_TEST],
			viewport: { x: 0, y: 0, width: 1, height: 1 }
		}
	});

	const resize = () => {
		const rect = display.getBoundingClientRect();
		const ratio = rect.width / rect.height
		
		scene.settings.viewport[2] = display.width = rect.width;
		scene.settings.viewport[3] = display.height = rect.height;

		for (const name in scene.objects) {
			const obj = scene.objects[name]
			if (obj instanceof WPositionedObject) {
				obj.ratio = ratio
			}
		}

		scene.resize()
	}

	/* const sun = new WOneColorObject(scene, '#FF0', [[
		[.5, .866, 0],
		[1, 0, 0],
		[.5, -.866, 0],
	], [
		[-.5, .866, 0],
		[-1, 0, 0],
		[-.5, -.866, 0],
	], [
		[-.5, .866, 0],
		[-.5, -.866, 0],
		[.5, -.866, 0],
	], [
		[.5, -.866, 0],
		[.5, .866, 0],
		[-.5, .866, 0],
	]]) */

	/* const earth = new WOneColorObject(scene, '#01629c', [[
		[-.588, -.809, 0],
		[0, 1, 0],
		[-.951, .309, 0],
	], [
		[.588, -.809, 0],
		[0, 1, 0],
		[.951, .309, 0],
	], [
		[-.588, -.809, 0],
		[0, 1, 0],
		[.588, -.809, 0],
	]]) */

	const lines = new LinesObject({
		scene,
		width: .01,
		lines: [
			[
				[.1, 0, 0],
				[.9, 0, 0]
			], [
				[.8, 0, 0],
				[0, -1, 0]
			]
		]
	})

	const circle = new CircleObject({
		scene,
		innerR: .05,
		scale: .1,
		position: [.5, .5, 0]
	})

	/* const moon = new WOneColorObject(scene, '#F4F6F0', [[
		[1, 1, 0],
		[1, -1, 0],
		[-1, -1, 0],
	], [
		[-1, -1, 0],
		[-1, 1, 0],
		[1, 1, 0],
	]]) */

	// scene.addObject('sun', sun)
	// scene.addObject('earth', earth)
	scene.addObject('points', lines)
	scene.addObject('circle', circle)
	// scene.addObject('moon', moon)

	// sun.physics.scale = vec2(.2)
	// sun.physics.mass = Infinity

	// earth.physics.move(vec2(-.5, .5))
	// earth.physics.scale = vec2(.1)
	// earth.physics.mass = 1000

	// moon.physics.move(vec2(0, .5))
	// moon.physics.scale = vec2(0.05)
	// moon.physics.mass = 50

	window.addEventListener('resize', resize)
	resize()

	scene.init()

	let lastTime = -1

	/* const seqAnimX = new TimedAnimationSequence({
		offset: earth.physics.position.x,
		t0: 0,
		dur: 8,
		animations: [
			{ anim: new Animation() },
			{ anim: new Blank(1) },
			{ anim: new Animation({
				x0: 1,
				dx: -1,
				func: bezier(.17, .9, .87, .2)(100)
			}) },
			{ anim: new Animation({
				func: t => -Math.sin(t * 9 * Math.PI) * .1
			}) }
		]
	}) */

	/* const seqAnimY = new TimedAnimationSequence({
		offset: earth.physics.position.y,
		t0: 2,
		dur: 6,
		animations: [
			{ anim: new Animation({
				dx: -1,
				func: t => +(t == 1)
			}) },
			{ anim: new Blank(-1) },
			{ anim: new Animation({ x0: -1 }) }
		]
	}) */

	// scene.addAnimation(seqAnimX, seqAnimY)

	/* const loop = (t: number, max: number) => {
		if (t > max) return loop(t - max, max)
		if (t < 0) return loop(t + max, max)
		return t
	} */

	// let t = 0

	const draw = globalThis.draw = (time: number) => {
		if (lastTime < 0) lastTime = time
		const dt = (time - lastTime) / 1000;
		lastTime = time;
		
		// sun.physics.rotation -= dt
		// earth.physics.rotation += 1.5 * dt
		// moon.physics.rotation -= 2 * dt

		// t = loop(t + dt, 8)

		// scene.updateAnimations(t)

		// earth.physics.position.x = seqAnimX.value
		// earth.physics.position.y = seqAnimY.value

		scene.updatePositions(dt)

		scene.draw()

		requestAnimationFrame(draw)
	}

	requestAnimationFrame(draw)
})
//* Plans:
////Create matrix classes
////Expand objects to physics rules
////Add simple element shapes
//* Implement physic bonds system
////Create animation invoker system
// Test with "The Lantern"
// Implement colliders
// Improve collision testing
// Expand colliders with surface repultion logics


// eslint-disable-next-line max-len
// TODO: координатная сетка на фоне на ней единичный круг две точки ездят по нему (тягая мышкой), через них линии проходят (+координаты)