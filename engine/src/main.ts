import { WScene } from './engine.js'
import { WCustomObject, WOneColorObject, WTextureObject } from './objects.js'

const sources = Promise.all([
	fetch('./shaders/tex.vert').then(v => v.text()),
	fetch('./shaders/tex2.frag').then(v => v.text()),
	new Promise<HTMLImageElement>(res => {
		const img = new Image()
		img.src = './fnap.png';
		img.addEventListener('load', () => res(img))
	}),
	new Promise<HTMLImageElement>(res => {
		const img = new Image()
		img.src = './irbis.png';
		img.addEventListener('load', () => res(img))
	}),
	new Promise<HTMLImageElement>(res => {
		const img = new Image()
		img.src = './glass.jpg';
		img.addEventListener('load', () => res(img))
	})
])

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

const basic1 = new WOneColorObject(scene, [1, .6, .6, 1], [[
	[-1, 1, 0],
	[-1, 0, 0],
	[1, 1, 0]
], [
	[-1, -1, .5],
	[-1, 0, .5],
	[1, -1, .5]
]])

const basic2 = new WOneColorObject(scene, [0, .8, 1, 1], [[
	[-1, 1, .5],
	[1, 1, .5],
	[1, 0, .5]
], [
	[-1, -1, 0],
	[1, -1, 0],
	[1, 0, 0]
]])

window.addEventListener('load', async () => {
	const [sh1, sh2, img1, img2, img3] = await sources

	const tex = new WTextureObject(img3, scene, [[
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
	]])

	const tex2 = new WCustomObject({
		scene,
		trisCount: 2,
		shaders: [{
			source: sh1,
			type: WebGL2RenderingContext.VERTEX_SHADER
		}, {
			source: sh2,
			type: WebGL2RenderingContext.FRAGMENT_SHADER
		}],
		uniforms: {
			'u_texture1': {
				data: [0],
				type: WebGL2RenderingContext.INT
			},
			'u_texture2': {
				data: [1],
				type: WebGL2RenderingContext.INT
			}
		},
		attributes: {
			'i_vertexPosition': {
				data: new Float32Array([
					0, .5,
					1, 0,
					0, -.5,

					0, .5,
					-1, 0,
					0, -.5
				]),
				type: WebGL2RenderingContext.FLOAT,
				length: 2
			},
			'i_uvmap': {
				data: new Float32Array([
					.5, 1,
					1.5, .5,
					.5, 0,

					.5, 1,
					-.5, .5,
					.5, 0,
				]),
				type: WebGL2RenderingContext.FLOAT,
				length: 2
			},
			'i_index': {
				data: new Int32Array([
					1,
					1,
					1,

					0,
					0,
					0
				]),
				type: WebGL2RenderingContext.INT,
				length: 1
			}
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

	scene.init()

	basic1.init()
	basic2.init()
	tex.init()
	tex2.init()

	scene.draw()
	basic1.draw()
	basic2.draw()
	tex.draw()
	tex2.draw()

	scene.draw()
	basic1.draw()
	basic2.draw()
	tex.draw()
	tex2.draw()
})