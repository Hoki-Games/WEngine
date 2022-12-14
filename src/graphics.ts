import type { Types as MathTypes } from './math.js'

export namespace Types {
	type ColorObject = {
		r: GLclampf
		g: GLclampf
		b: GLclampf
		a: GLclampf
	}
	export type Color = ColorObject | MathTypes.Vec4<GLclampf> | `#${string}`

	type DimensionObject = {
		x: GLint
		y: GLint
		width: GLsizei
		height: GLsizei
	}
	export type Dimension =
		| DimensionObject
		| MathTypes.Vec4<GLint, GLint, GLsizei, GLsizei>

	export interface Uniform {
		location: WebGLUniformLocation
		data: UniformType
		type: 'i' | 'ui' | 'f' | MatrixDim
	}

	export type AttributeType =
		| 'BYTE'
		| 'SHORT'
		| 'UNSIGNED_BYTE'
		| 'UNSIGNED_SHORT'
		| 'FLOAT'
		| 'HALF_FLOAT'
		| 'INT'

	export interface AttributeData {
		data: ArrayBuffer
		type: AttributeType
		length: GLint
	}

	export interface Attribute extends AttributeData {
		location: GLuint
	}

	export type Settings = {
		backgroundColor: Color
		premultipliedAlpha?: boolean
		viewport: Dimension
		enable?: GLenum[]
		depthFunc?: GLenum
		blendFunc?: [GLenum, GLenum]
	}

	export type UniformType = Int32Array | Uint32Array | Float32Array

	export type MatrixData = {
		data: Float32Array
		dim: MatrixDim
	}

	export type MatrixDim =
		| '2'
		| '2x3'
		| '2x4'
		| '3x2'
		| '3'
		| '3x4'
		| '4x2'
		| '4x3'
		| '4'

	export type Shader = {
		source: string
		type: 'VERTEX_SHADER' | 'FRAGMENT_SHADER'
	}

	export type Texture = {
		data: TexImageSource
		location: WebGLTexture
		target: GLenum
	}

	export type GLData = {
		uniforms: {
			[key: string]: Types.Uniform
		}
		buffers: {
			[key: string]: WebGLBuffer
		}
		attributes: {
			[key: string]: Types.Attribute
		}
		textures: Texture[]
	}

	export type TexParams = {
		[P in
			| 'PACK_ALIGNMENT'
			| 'UNPACK_ALIGNMENT'
			| 'UNPACK_FLIP_Y_WEBGL'
			| 'UNPACK_PREMULTIPLY_ALPHA_WEBGL'
			| 'UNPACK_COLORSPACE_CONVERSION_WEBGL'
			| 'PACK_ROW_LENGTH'
			| 'PACK_SKIP_PIXELS'
			| 'PACK_SKIP_ROWS'
			| 'UNPACK_ROW_LENGTH'
			| 'UNPACK_IMAGE_HEIGHT'
			| 'UNPACK_SKIP_PIXELS'
			| 'UNPACK_SKIP_ROWS'
			| 'UNPACK_SKIP_IMAGES'
			| 'TEXTURE_MAG_FILTER'
			| 'TEXTURE_MIN_FILTER'
			| 'TEXTURE_WRAP_S'
			| 'TEXTURE_WRAP_T'
			| 'TEXTURE_BASE_LEVEL'
			| 'TEXTURE_COMPARE_FUN'
			| 'TEXTURE_COMPARE_MOD'
			| 'TEXTURE_MAX_LEVEL'
			| 'TEXTURE_WRAP_R'
			| 'TEXTURE_MAX_LOD'
			| 'TEXTURE_MIN_LOD']?: number | boolean
	}

	export type TexSettings = {
		target?: GLenum
		level?: GLint
		internalformat?: GLint
		width?: GLsizei
		height?: GLsizei
		border?: GLint
		format?: GLenum
		type?: GLenum
		params?: TexParams
	}
}

export { default as Renderer } from './graphics/Renderer.js'
export { default as Scene } from './graphics/Scene.js'

export const narrowColor = (color: Types.Color): MathTypes.Vec4<GLclampf> => {
	let ret: MathTypes.Vec4<GLclampf>

	if (Array.isArray(color)) ret = [...color]
	else if (typeof color == 'object')
		ret = [color.r, color.g, color.b, color.a]
	else {
		const b4 = '([0-Fa-f])'.repeat(4)
		const b8 = '([0-Fa-f][0-Fa-f])'.repeat(4)

		const rgba4 = new RegExp(`^#${b4}?$`).exec(color)
		const rgba8 = new RegExp(`^#${b8}?$`).exec(color)

		if (rgba4)
			ret = <MathTypes.Vec4<GLclampf>>(
				rgba4.slice(1).map((v) => parseInt(v, 16) / 15)
			)
		else if (rgba8)
			ret = <MathTypes.Vec4<GLclampf>>(
				rgba8.slice(1).map((v) => parseInt(v, 16) / 255)
			)
		else throw new Error('Invalid color data', { cause: color })
	}

	if (Number.isNaN(ret[3])) ret[3] = 1

	return ret
}

export const narrowDimension = (
	color: Types.Dimension
): MathTypes.Vec4<GLint, GLint, GLsizei, GLsizei> =>
	Array.isArray(color)
		? [...color]
		: [color.x, color.y, color.width, color.height]
