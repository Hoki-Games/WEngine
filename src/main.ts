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
	const sun = new WPositionedObject({
		scene,
		shaders: [{
			source: `#version 300 es
			precision mediump float;
			
			in vec3 i_vertexPosition;

			uniform vec2 u_origin;
			uniform mat3 u_transform;
			
			void main() {
				vec3 pos = vec3(vec2(i_vertexPosition) - u_origin, 1);
				pos = u_transform * pos;
				pos = pos + vec3(u_origin, 0);
				pos.z = i_vertexPosition.z;
				gl_Position = vec4(pos, 1);
			}`,
			type: 'VERTEX_SHADER'
		}, {
			source: `#version 300 es
			precision mediump float;
			
			out vec4 o_fragColor;
			
			void main() {
				o_fragColor = vec4(1, 1, 0, 1);
			}`,
			type: 'FRAGMENT_SHADER'
		}],
		tris: [[
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
		]]
	})
	scene.addObject('sun', sun)

	const transform = new WTransformMatrix3({
		scale: vec2(0.5),
		rotate: Math.PI / 2,
		translate: vec2(-1, 0)
	})

	sun.renderer.setUniform(
		'u_transform',
		Float32Array.from(transform.getMatrix().get().flat(2)),
		'3'
	)
	sun.renderer.setUniform('u_origin', Float32Array.of(1, 0))

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