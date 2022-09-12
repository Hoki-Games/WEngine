import { WScene } from './graphics.js'
import {
	WOneColorObject,
	WPositionedObject,
	WTexPositionedObject,
	WTextureObject
} from './objects.js'
import AssetsLoader from './loader.js';
import { WPhysicsModel } from './physics.js';
import { vec2, WMatrix3, WTransformMatrix3, WTri3 } from './math.js';

const assetsLoader = new AssetsLoader({
	shaders: {
	},
	images: {
	}
})

const scene = globalThis.scene = new WScene({
	canvas: <HTMLCanvasElement>document.getElementById('display'),
	settings: {
		backgroundColor: [0, 1, 1, 1],
		depthFunc: WebGL2RenderingContext.LEQUAL,
		enable: [WebGL2RenderingContext.DEPTH_TEST],
		viewport: {
			x: 0,
			y: 0,
			width: 1000,
			height: 1000
		}
	}
});

// Colors:
// Space - #150E1C
// Sun - #FFFF00
// Earth - #01629C
// TODO
window.addEventListener('load', async () => {
	const sun = new WOneColorObject(scene, '#FF0', [[
		[0.5, 0.9, 0],
		[1, 0, 0],
		[0.5, -0.9, 0],
	], [
		[-0.5, 0.9, 0],
		[-1, 0, 0],
		[-0.5, -0.9, 0],
	], [
		[-0.5, 0.9, 0],
		[-0.5, -0.9, 0],
		[0.5, -0.9, 0],
	], [
		[0.5, -0.9, 0],
		[0.5, 0.9, 0],
		[-0.5, 0.9, 0],
	]])
	scene.addObject('sun', sun)

	/* const earth = new WOneColorObject(scene, '#01629c', [[
		[0.5, 0.9, 0],
		[1, 0, 0],
		[0.5, -0.9, 0],
	], [
		[-0.5, 0.9, 0],
		[-1, 0, 0],
		[-0.5, -0.9, 0],
	], [
		[-0.5, 0.9, 0],
		[-0.5, -0.9, 0],
		[0.5, -0.9, 0],
	], [
		[0.5, -0.9, 0],
		[0.5, 0.9, 0],
		[-0.5, 0.9, 0],
	]])
	scene.addObject('earth', earth) */

	sun.physics.scale = vec2(0.5)
	sun.physics.rotation = Math.PI / 2

	/* scene.addObject('earth', new WOneColorObject(scene, [0, 1, 1, 1], [[
		[1, 1, 1],
		[1, 0, 1],
		[-1, 0, 1]
	]])) */

	scene.init()

	let lastTime = performance.now()

	const draw = globalThis.draw = (time: number) => {
		const dt = (time - lastTime) / 1000;
		lastTime = time;

		sun.physics.rotation += dt

		scene.updatePositions(dt)

		scene.draw()

		requestAnimationFrame(draw)
	}

	requestAnimationFrame(draw)
})
//* Plans:
//// Create matrix classes
//* Expand objects to physics rules
// Implement physic bonds system
// Test with "The Lantern"