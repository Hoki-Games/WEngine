import { WScene } from './graphics.js'
import { WOneColorObject, WPositionedObject } from './objects.js'
import { vec2 } from './math.js'

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

	const moon = new WOneColorObject(scene, '#F4F6F0', [[
		[1, 1, 0],
		[1, -1, 0],
		[-1, -1, 0],
	], [
		[-1, -1, 0],
		[-1, 1, 0],
		[1, 1, 0],
	]])

	scene.addObject('sun', sun)
	scene.addObject('earth', earth)
	scene.addObject('moon', moon)

	sun.physics.move(vec2(0, -.1))
	sun.physics.scale = vec2(.2)
	sun.physics.applyVelocity(vec2(.1, 0))

	earth.physics.move(vec2(0, .7))
	earth.physics.scale = vec2(0.1)
	earth.physics.applyVelocity(vec2(-.5, 0))
	
	moon.physics.move(vec2(.2, .7))
	moon.physics.scale = vec2(0.05)
	moon.physics.applyVelocity(vec2(-.5, 0))

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
		moon.physics.rotation -= 2 * dt

		const dist = sun.physics.position.dif(earth.physics.position).length
		const dist2 = earth.physics.position.dif(moon.physics.position).length

		sun.physics.applyAcceleration(sun.physics.position.neg.scale(.8))

		earth.physics.applyAcceleration(
			sun.physics.position.dif(earth.physics.position).scale(dist)
		)

		moon.physics.applyAcceleration(
			earth.physics.position.dif(moon.physics.position).scale(dist * 4)
		)

		scene.updatePositions(dt)

		scene.draw()

		requestAnimationFrame(draw)
	}

	requestAnimationFrame(draw)
})
//* Plans:
//// Create matrix classes
////Expand objects to physics rules
//* Implement physic bonds system
// Test with "The Lantern"