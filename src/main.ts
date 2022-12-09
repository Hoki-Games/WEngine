import { Scene } from './graphics.js'
import { OneColorObject, PositionedObject } from './objects.js'
import { LimitDistanceConstraint, LimitLocationConstraint } from './physics.js'
import { RegularPolygon } from './shapes.js'

window.addEventListener('load', async () => {
	const display = <HTMLCanvasElement>document.getElementById('display')

	const scene = globalThis.scene = new Scene({
		canvas: display,
		settings: {
			backgroundColor: '#150E1C',
			premultipliedAlpha: false,
			enable: [WebGL2RenderingContext.BLEND],
			blendFunc: [
				WebGL2RenderingContext.SRC_ALPHA,
				WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA
			],
			viewport: { x: 0, y: 0, width: 1, height: 1 }
		}
	})

	const resize = () => {
		const rect = display.getBoundingClientRect();
		const ratio = rect.width / rect.height
		
		scene.settings.viewport[2] = display.width = rect.width;
		scene.settings.viewport[3] = display.height = rect.height;

		for (const name in scene.objects) {
			const obj = scene.objects[name]
			if (obj instanceof PositionedObject) {
				obj.ratio = ratio
			}
		}

		scene.resize()
	}

	const hex = new RegularPolygon({
		radius: 1,
		vertexCount: 6
	})

	const pent = new RegularPolygon({
		radius: 1,
		vertexCount: 5
	})

	scene.addObject('hex', new OneColorObject(scene, '#03fcc6', [[
		hex.vertices[0].arr,
		hex.vertices[1].arr,
		hex.vertices[5].arr
	], [
		hex.vertices[5].arr,
		hex.vertices[1].arr,
		hex.vertices[4].arr
	], [
		hex.vertices[1].arr,
		hex.vertices[2].arr,
		hex.vertices[4].arr
	], [
		hex.vertices[4].arr,
		hex.vertices[2].arr,
		hex.vertices[3].arr
	]], 0))

	scene.addObject('pent', new OneColorObject(scene, '#5ab03f', [[
		pent.vertices[0].arr,
		pent.vertices[2].arr,
		pent.vertices[1].arr
	], [
		pent.vertices[0].arr,
		pent.vertices[3].arr,
		pent.vertices[2].arr
	], [
		pent.vertices[0].arr,
		pent.vertices[4].arr,
		pent.vertices[3].arr
	]], 1))

	;(<OneColorObject>scene.objects['pent']).physics.local.scale(.5, .5)
	;(<OneColorObject>scene.objects['hex']).physics.local.scale(.25, .25)

	const limitLoc = globalThis.limitLoc = new LimitLocationConstraint(
		(<PositionedObject>scene.objects.pent).physics, {
			minX: -.5,
			minY: -.5,
			maxX: .5,
			maxY: .5
		}
	)

	window.addEventListener('resize', resize)
	resize()

	let lastTime = -1

	const draw = globalThis.draw = (time: number) => {
		if (lastTime < 0) lastTime = time
		const dt = (time - lastTime) / 1000
		lastTime = time

		scene.updateLocations(dt)

		limitLoc.solve()

		scene.draw()

		requestAnimationFrame(draw)
	}

	requestAnimationFrame(draw)
})