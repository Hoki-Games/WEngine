import { vec2, Vector2 } from './math.js'

export interface WUniformData {
	data: Iterable<number>
	type: GLenum
}

interface WUniform extends WUniformData {
	location: WebGLUniformLocation
}

export interface WAttributeData {
	data: BufferSource
	type: GLenum
	length: GLint
}

interface WAttribute extends WAttributeData {
	location: GLuint
}

interface WTexture {
	data: TexImageSource
	location: WebGLTexture
	target: GLenum
}

interface WTexParams {
	// pixelStorei
	PACK_ALIGNMENT?: GLint
	UNPACK_ALIGNMENT?: GLint
	UNPACK_FLIP_Y_WEBGL?: GLboolean
	UNPACK_PREMULTIPLY_ALPHA_WEBGL?: GLboolean
	UNPACK_COLORSPACE_CONVERSION_WEBGL?: GLenum
	PACK_ROW_LENGTH?: GLint
	PACK_SKIP_PIXELS?: GLint
	PACK_SKIP_ROWS?: GLint
	UNPACK_ROW_LENGTH?: GLint
	UNPACK_IMAGE_HEIGHT?: GLint
	UNPACK_SKIP_PIXELS?: GLint
	UNPACK_SKIP_ROWS?: GLint
	UNPACK_SKIP_IMAGES?: GLint

	// texParametri
	TEXTURE_MAG_FILTER?: GLenum
	TEXTURE_MIN_FILTER?: GLenum
	TEXTURE_WRAP_S?: GLenum
	TEXTURE_WRAP_T?: GLenum
	TEXTURE_BASE_LEVEL?: GLint
	TEXTURE_COMPARE_FUN?: GLenum
	TEXTURE_COMPARE_MOD?: GLenum
	TEXTURE_MAX_LEVEL?: GLint
	TEXTURE_WRAP_R?: GLenum

	// texParametrf
	TEXTURE_MAX_LOD?: GLfloat
	TEXTURE_MIN_LOD?: GLfloat
}

export interface WTexSettings {
	target?: GLenum
	level?: GLint
	internalformat?: GLint
	width?: GLsizei
	height?: GLsizei
	border?: GLint
	format?: GLenum
	type?: GLenum
	params?: WTexParams
}

type WGLData = {
	uniforms: {
		[key: string]: WUniform
	}
	buffers: {
		[key: string]: WebGLBuffer
	}
	attributes: {
		[key: string]: WAttribute
	}
	textures: WTexture[]
}

export type WShader = {
	source: string
	type: GLenum
}

type WSettings = {
	backgroundColor: {
		r: GLclampf
		g: GLclampf
		b: GLclampf
		a: GLclampf
	} | [GLclampf, GLclampf, GLclampf, GLclampf]
	viewport: {
		x: GLint
		y: GLint
		width: GLsizei
		height: GLsizei
	} | [GLint, GLint, GLsizei, GLsizei]
	enable: GLenum[]
	depthFunc: GLenum
}

export class WScene {
	display: HTMLCanvasElement
	gl: WebGL2RenderingContext
	renderers: {
		[key: string]: WRenderer
	}
	settings: WSettings

	constructor({
		canvas,
		settings
	}: {
		canvas: HTMLCanvasElement
		settings: WSettings
	}) {
		this.display = canvas;
		this.gl = canvas.getContext('webgl2');
		this.renderers = {};
		this.settings = settings
	}

	init(data: { [name: string]: {
		uniforms?: {[name: string]: WUniformData},
		attributes?: {[name: string]: WAttributeData},
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
	}} = {}) {
		const bgColor = this.settings.backgroundColor
		if (Array.isArray(bgColor)) this.gl.clearColor(...bgColor);
		else this.gl.clearColor(bgColor.r, bgColor.b, bgColor.g, bgColor.a);

		this.settings.enable.forEach(v => this.gl.enable(v))

		this.gl.depthFunc(this.settings.depthFunc);
		
		const vp = this.settings.viewport;
		if (Array.isArray(vp)) this.gl.viewport(...vp);
		else this.gl.viewport(vp.x, vp.y, vp.width, vp.height);

		for (const name in data) {
			this.renderers[name].init(data[name])
		}
	}

	draw(vertCounts: {[name: string]: GLsizei} = {}) {
		this.gl.clear(
			WebGL2RenderingContext.COLOR_BUFFER_BIT |
			WebGL2RenderingContext.DEPTH_BUFFER_BIT
		);

		for (const name in vertCounts) {
			this.renderers[name].draw(vertCounts[name])
		}
	}

	addRenderer(name: string, shaders: WShader[]) {
		return this.renderers[name] = new WRenderer({
			scene: this,
			shaders
		})
	}
}


const typeMap = {
	[WebGL2RenderingContext.INT]: 'i',
	[WebGL2RenderingContext.UNSIGNED_INT]: 'ui',
	[WebGL2RenderingContext.FLOAT]: 'f'
}

const texParamMap = {
	PACK_ALIGNMENT: 'pixelStoreI',
	UNPACK_ALIGNMENT: 'pixelStoreI',
	UNPACK_FLIP_Y_WEBGL: 'pixelStoreI',
	UNPACK_PREMULTIPLY_ALPHA_WEBGL: 'pixelStoreI',
	UNPACK_COLORSPACE_CONVERSION_WEBGL: 'pixelStoreI',
	PACK_ROW_LENGTH: 'pixelStoreI',
	PACK_SKIP_PIXELS: 'pixelStoreI',
	PACK_SKIP_ROWS: 'pixelStoreI',
	UNPACK_ROW_LENGTH: 'pixelStoreI',
	UNPACK_IMAGE_HEIGHT: 'pixelStoreI',
	UNPACK_SKIP_PIXELS: 'pixelStoreI',
	UNPACK_SKIP_ROWS: 'pixelStoreI',
	UNPACK_SKIP_IMAGES: 'pixelStoreI',
	TEXTURE_MAG_FILTER: 'texI',
	TEXTURE_MIN_FILTER: 'texI',
	TEXTURE_WRAP_S: 'texI',
	TEXTURE_WRAP_T: 'texI',
	TEXTURE_BASE_LEVEL: 'texI',
	TEXTURE_COMPARE_FUN: 'texI',
	TEXTURE_COMPARE_MOD: 'texI',
	TEXTURE_MAX_LEVEL: 'texI',
	TEXTURE_WRAP_R: 'texI',
	TEXTURE_MAX_LOD: 'texF',
	TEXTURE_MIN_LOD: 'texF'
}

export class WRenderer {
	#data: WGLData

	scene: WScene
	program: WebGLProgram
	shaders: WebGLShader[]

	constructor({
		scene,
		shaders = []
	}: {
		scene: WScene
		shaders?: WShader[]
	}) {
		this.scene = scene

		this.#data = {
			uniforms: {},
			buffers: {},
			attributes: {},
			textures: []
		};

		const gl = scene.gl
		
		this.program = gl.createProgram();

		this.shaders = shaders.map(s => {
			const shader = gl.createShader(s.type);
			
			gl.shaderSource(shader, s.source);

			gl.compileShader(shader);
			
			gl.attachShader(this.program, shader);

			return shader;
		})

		gl.linkProgram(this.program)
	}

	init({
		uniforms = {},
		attributes = {},
		textures = []
	}: {
		uniforms?: {[name: string]: WUniformData}
		attributes?: {[name: string]: WAttributeData}
		textures?: {
			img: TexImageSource
			settings?: WTexSettings
		}[]
	}) {
		for (const name in uniforms) {
			this.setUniform(name, uniforms[name].data, uniforms[name].type);
		}

		for (const name in attributes) {
			this.setAttribute(
				name,
				attributes[name].data,
				attributes[name].type,
				attributes[name].length
			);
		}

		textures.forEach((v, id) => {
			this.setTexture({
				id,
				img: v.img,
				settings: v.settings
			})
		})
	}

	draw(vertsCount: GLsizei) {
		this.scene.gl.useProgram(this.program);

		this.#data.textures.forEach((v, i) => {
			this.scene.gl.activeTexture(WebGL2RenderingContext.TEXTURE0 + i);
			this.scene.gl.bindTexture(v.target, v.location);
		})

		for (const name in this.#data.uniforms) {
			const val = [...this.#data.uniforms[name].data];

			if (val.length > 4 || val.length < 1)
				throw new Error('Array length must be in bounds [1,4]');

			const type = this.#data.uniforms[name].type;
			this.scene.gl[`uniform${val.length}${typeMap[type]}v`](
				this.#data.uniforms[name].location,
				this.#data.uniforms[name].data
			)
		}

		for (const name in this.#data.attributes) {
			this.scene.gl.bindBuffer(
				this.scene.gl.ARRAY_BUFFER,
				this.#data.buffers[name]
			);
			if (
				this.#data.attributes[name].type == WebGL2RenderingContext.INT
			) {
				this.scene.gl.vertexAttribIPointer(
					this.#data.attributes[name].location,
					this.#data.attributes[name].length,
					this.#data.attributes[name].type,
					0,
					0
				);
			} else {
				this.scene.gl.vertexAttribPointer(
					this.#data.attributes[name].location,
					this.#data.attributes[name].length,
					this.#data.attributes[name].type,
					false,
					0,
					0
				);
			}
			this.scene.gl.enableVertexAttribArray(
				this.#data.attributes[name].location
			);
		}

		this.scene.gl.drawArrays(
			this.scene.gl.TRIANGLES,
			0,
			vertsCount
		)
	}

	getAttribute(name: string) {
		return this.#data.attributes[name].data;
	}

	setAttribute(
		name: string, 
		value: BufferSource, 
		type: GLenum, 
		length: GLint
	) {
		if (!(name in this.#data.attributes)) {
			this.#data.attributes[name] = {
				data: value,
				location: this.scene.gl.getAttribLocation(
					this.program,
					name
				),
				type,
				length
			}
			this.#data.buffers[name] = this.scene.gl.createBuffer();
		}
		this.#data.attributes[name].data = value;
		this.scene.gl.bindBuffer(
			this.scene.gl.ARRAY_BUFFER,
			this.#data.buffers[name]
		)
		this.scene.gl.bufferData(
			this.scene.gl.ARRAY_BUFFER,
			value,
			this.scene.gl.STATIC_DRAW
		);
	}
	
	getUniform(name: string) {
		return this.#data.uniforms[name].data;
	}

	setUniform(name: string, value: Iterable<number>, type: GLenum) {
		if (!(
			type == WebGL2RenderingContext.INT ||
			type == WebGL2RenderingContext.UNSIGNED_INT ||
			type == WebGL2RenderingContext.FLOAT
		)) throw new Error(`Invalid type [${type}]`);
		if (!(name in this.#data.uniforms)) {
			this.#data.uniforms[name] = {
				location: this.scene.gl.getUniformLocation(
					this.program,
					name
				),
				data: value,
				type
			}
		}
		this.#data.uniforms[name].data = value;
	}

	getTexture(id: number) {
		return this.#data.textures[id].data;
	}

	setTexture({
		id,
		img,
		settings = {}
	}: {
		id: number
		img: TexImageSource
		settings?: WTexSettings
	}) {
		const target = settings.target ?? WebGL2RenderingContext.TEXTURE_2D;
		const level = settings.target ?? 0;
		const internalformat =
			settings.internalformat ?? WebGL2RenderingContext.RGBA;
		const width = settings.width ?? img.width;
		const height = settings.height ?? img.height;
		const border = settings.border ?? 0;
		const format = settings.format ?? WebGL2RenderingContext.RGBA;
		const type = settings.type ?? WebGL2RenderingContext.UNSIGNED_BYTE;
		type Param = {
			name: GLenum
			value: GLint | GLfloat | GLenum | GLboolean
		}
		const params = {
			pixelStoreI: <Param[]>[],
			texI: <Param[]>[],
			texF: <Param[]>[]
		}
		
		if (settings?.params) {
			for (const name in settings.params) {
				(<Param[]>params[texParamMap[name]]).push({
					name: WebGL2RenderingContext[name],
					value: settings.params[name]
				})
			}
		}

		const gl = this.scene.gl;
		
		const texture = gl.createTexture();
		
		gl.bindTexture(target, texture)

		params.pixelStoreI.forEach(v => gl.pixelStorei(v.name, v.value))

		gl.texImage2D(
			target,
			level,
			internalformat,
			width,
			height,
			border,
			format,
			type,
			img
		);

		params.texI.forEach(v => gl.texParameteri(
			target,
			v.name,
			<GLint>v.value
		));

		params.texF.forEach(v => gl.texParameterf(
			target, 
			v.name, 
			<GLfloat>v.value
		));

		this.#data.textures[id] = {
			data: img,
			location: texture,
			target
		};
	}
}