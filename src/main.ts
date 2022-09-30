import { WScene } from './graphics.js'
import { WPositionedObject } from './objects.js'

window.addEventListener('load', async () => {
	const display = <HTMLCanvasElement>document.getElementById('display')

	const scene = globalThis.scene = new WScene({
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

	scene.addObject('obj1', new WPositionedObject({
		scene,
		shaders: [{
			source: `#version 300 es
			precision mediump float;

			in vec3 i_vertexPosition;
			in float i_opacity;

			out float v_opacity;

			 void main() {
				gl_Position = vec4(i_vertexPosition, 1);
				v_opacity = i_opacity;
			}`,
			type: 'VERTEX_SHADER'
		}, {
			source: `#version 300 es
			precision mediump float;

			in float v_opacity;

			out vec4 o_fragColor;

			void main() {
				o_fragColor = vec4(.98, 0.73, 0, v_opacity);
			}`,
			type: 'FRAGMENT_SHADER'
		}],
		tris: [
			[
				[.8, 1, 0],
				[.8, -1, 0],
				[-1, 1, 0]
			], [
				[-1, 1, 0],
				[-1, -1, 0],
				[.8, -1, 0]
			]
		],
		attributes: {
			'i_opacity': {
				data: Float32Array.of(0, 0, 1, 1, 1, 0),
				type: 'FLOAT',
				length: 1
			}
		}
	}))

	scene.addObject('obj2', new WPositionedObject({
		scene,
		shaders: [{
			source: `#version 300 es
			precision mediump float;

			in vec3 i_vertexPosition;
			in float i_opacity;

			out float v_opacity;

			 void main() {
				gl_Position = vec4(i_vertexPosition, 1);
				v_opacity = i_opacity;
			}`,
			type: 'VERTEX_SHADER'
		}, {
			source: `#version 300 es
			precision mediump float;

			in float v_opacity;

			out vec4 o_fragColor;

			void main() {
				o_fragColor = vec4(0, .1, .9, v_opacity);
			}`,
			type: 'FRAGMENT_SHADER'
		}],
		tris: [
			[
				[1, .8, -.1],
				[1, -1, -.1],
				[-1, .8, -.1]
			], [
				[-1, .8, -.1],
				[-1, -1, -.1],
				[1, -1, -.1],
			]
		],
		attributes: {
			'i_opacity': {
				data: Float32Array.of(0, 1, 0, 0, 1, 1),
				type: 'FLOAT',
				length: 1
			}
		}
	}))

	window.addEventListener('resize', resize)
	resize()

	scene.init()

	let lastTime = -1

	const draw = globalThis.draw = (time: number) => {
		if (lastTime < 0) lastTime = time
		const dt = (time - lastTime) / 1000;
		lastTime = time;

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
////Fix transparency
//* Implement object modifiers system
////Create animation invoker system
// Test with "The Lantern"
// Implement colliders
// Improve collision testing
// Expand colliders with surface repultion logics


// eslint-disable-next-line max-len
// TODO: координатная сетка на фоне на ней единичный круг две точки ездят по нему (тягая мышкой), через них линии проходят (+координаты)