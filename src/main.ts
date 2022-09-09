import { WScene } from './graphics.js'
import {
	WOneColorObject,
	WTexPositionedObject,
	WTextureObject
} from './objects.js'
import AssetsLoader from './loader.js';
import { WPhysicsModel } from './physics.js';
import { vec2 } from './math.js';

const assetsLoader = new AssetsLoader({
	shaders: {
		sh1: './shaders/tex.vert',
		sh2: './shaders/tex2.frag'
	},
	images: {
		img1: './fnap.png',
		img2: './irbis.png',
		img3: './glass.jpg'
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

window.addEventListener('load', async () => {
	const {
		shaders: {
			sh1,
			sh2
		},
		images: {
			img1,
			img2,
			img3
		}
	} = await assetsLoader.response

	scene.addObject({
		basic1: new WOneColorObject(scene, [1, .6, .6, 1], [[
			[-1, 1, 0],
			[-1, 0, 0],
			[1, 1, 0]
		], [
			[-1, -1, .5],
			[-1, 0, .5],
			[1, -1, .5]
		]]),
		basic2: new WOneColorObject(scene, [0, .8, 1, 1], [[
			[-1, 1, .5],
			[1, 1, .5],
			[1, 0, .5]
		], [
			[-1, -1, 0],
			[1, -1, 0],
			[1, 0, 0]
		]]),
		tex: new WTextureObject(img3, scene, [[
			[-.9, .9, -.5],
			[.5764, .9, -.5],
			[-.9, .1618, -.5]
		], [
			[.9, -.9, -.5],
			[-.5764, -.9, -.5],
			[.9, -.1618, -.5]
		]], [[
			[0, 1],
			[1, 1],
			[0, 1 / 6]
		], [
			[1, 1 / 6],
			[0, 1 / 6],
			[1, 1]
		]]),
		tex2: new WTexPositionedObject({
			scene,
			shaders: [{
				source: sh1,
				type: 'VERTEX_SHADER'
			}, {
				source: sh2,
				type: 'FRAGMENT_SHADER'
			}],
			tris: [
				[
					[0, .5, -.5],
					[1, 0, -.5],
					[0, -.5, -.5]
				], [
					[0, .5, -.5],
					[-1, 0, -.5],
					[0, -.5, -.5]
				]
			],
			uvmap: [
				[
					[.5, 1],
					[1.5, .5],
					[.5, 0,]
				], [
					[.5, 1],
					[-.5, .5],
					[.5, 0]
				]
			],
			attributes: {
				'i_index': {
					data: Int32Array.from([1, 1, 1, 0, 0, 0]),
					type: 'INT',
					length: 1
				}
			},
			uniforms: {
				'u_texture1': Int32Array.of(0),
				'u_texture2': Int32Array.of(1)
			},
			textures: [{
				img: img1,
				settings: {
					params: {
						TEXTURE_MIN_FILTER: WebGL2RenderingContext.LINEAR,
						TEXTURE_WRAP_S: WebGL2RenderingContext.CLAMP_TO_EDGE,
						TEXTURE_WRAP_T: WebGL2RenderingContext.CLAMP_TO_EDGE,
						UNPACK_FLIP_Y_WEBGL: true
					}
				}
			}, {
				img: img2,
				settings: {
					params: {
						TEXTURE_MIN_FILTER: WebGL2RenderingContext.LINEAR,
						TEXTURE_WRAP_S: WebGL2RenderingContext.CLAMP_TO_EDGE,
						TEXTURE_WRAP_T: WebGL2RenderingContext.CLAMP_TO_EDGE,
						UNPACK_FLIP_Y_WEBGL: true
					}
				}
			}]
		})
	})

	const phys = globalThis.phys = new WPhysicsModel({
		acceleration: vec2(0, -1)
	});

	scene.init()

	let lastTime = 0;

	const draw = globalThis.draw = (time: number) => {
		const dt = (time - lastTime) / 1000;
		lastTime = time;

		scene.draw()

		const move = time / 160 / 6
		phys.updatePosition(dt)

		;(<WTextureObject>scene.objects['tex']).setUVTriangle(0, [
			[0, 1 + phys.position.y],
			[1, 1 + phys.position.y],
			[0, 1 / 6 + phys.position.y]
		])

		;(<WTextureObject>scene.objects['tex']).setUVTriangle(1, [
			[1 + move, 1 / 6 + move],
			[0 + move, 1 / 6 + move],
			[1 + move, 1 + move]
		])

		requestAnimationFrame(draw)
	}

	requestAnimationFrame(draw)
})