import { WScene } from './graphics.js'
import { WOneColorObject, WPositionedObject } from './objects.js'
import { vec2 } from './math.js'
import { WSpring, WRope } from './physics.js';

window.addEventListener('load', async () => {
	const display = <HTMLCanvasElement>document.getElementById('display')

	const scene = globalThis.scene = new WScene({
		canvas: display,
		settings: {
			backgroundColor: '#150E1C',
			depthFunc: WebGL2RenderingContext.LEQUAL,
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

	const sun = new WOneColorObject(scene, '#FF0', [[
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
	]])

	const earth = new WOneColorObject(scene, '#01629c', [[
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
	]])

	/* const moon = new WOneColorObject(scene, '#F4F6F0', [[
		[1, 1, 0],
		[1, -1, 0],
		[-1, -1, 0],
	], [
		[-1, -1, 0],
		[-1, 1, 0],
		[1, 1, 0],
	]]) */

	scene.addObject('sun', sun)
	scene.addObject('earth', earth)
	// scene.addObject('moon', moon)

	sun.physics.scale = vec2(.2)
	sun.physics.mass = Infinity

	earth.physics.move(vec2(0, .4))
	earth.physics.scale = vec2(.1)
	earth.physics.applyVelocity(vec2(-Math.random(), 0))
	earth.physics.mass = 1000

	// moon.physics.move(vec2(0, .5))
	// moon.physics.scale = vec2(0.05)
	// moon.physics.mass = 50

	const rope = new WRope({
		object1: sun.physics,
		object2: earth.physics,
		length: .5,
		bounce: 0
	})

	/* const gravity1 = new WSpring({
		object1: sun.physics,
		object2: earth.physics,
		L0: 0,
		ks: 40
	}) */

	/* const gravity2 = new WSpring({
		object1: earth.physics,
		object2: moon.physics,
		L0: 0,
		ks: 100
	}) */

	sun.setUniform('u_origin', Float32Array.of(0, 0))
	earth.setUniform('u_origin', Float32Array.of(0, 0))

	window.addEventListener('resize', resize)
	resize()

	scene.init()

	let lastTime = -1

	const draw = globalThis.draw = (time: number) => {
		if (lastTime < 0) lastTime = time
		const dt = (time - lastTime) / 1000;
		lastTime = time;

		sun.physics.rotation -= dt
		earth.physics.rotation += 1.5 * dt
		// moon.physics.rotation -= 2 * dt

		rope.recalc()
		// gravity1.recalc()
		// gravity2.recalc()

		scene.updatePositions(dt)

		scene.draw()

		requestAnimationFrame(draw)
	}

	requestAnimationFrame(draw)
})
//* Plans:
////Create matrix classes
////Expand objects to physics rules
//* Implement physic bonds system
// Create animation invoker system
// Test with "The Lantern"
// Implement colliders
// Improve collision testing
// Expand colliders with surface repultion logics