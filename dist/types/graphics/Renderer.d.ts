import type { Types as GraphicTypes } from '../graphics.js';
import type Scene from './Scene.js';
export default class Renderer {
    #private;
    scene: Scene;
    program: WebGLProgram;
    shaders: WebGLShader[];
    constructor({ scene, shaders }: {
        scene: Scene;
        shaders?: GraphicTypes.Shader[];
    });
    init({ uniforms, attributes, textures }?: {
        uniforms?: Record<string, GraphicTypes.UniformType | GraphicTypes.MatrixData>;
        attributes?: Record<string, GraphicTypes.AttributeData>;
        textures?: {
            img: TexImageSource;
            settings?: GraphicTypes.TexSettings;
        }[];
    }): void;
    draw(vertsCount: GLsizei, mode?: GLenum): void;
    getAttribute(name: string): ArrayBuffer;
    setAttribute(name: string, value: ArrayBuffer, type: GraphicTypes.AttributeType, length: GLint): void;
    updateAttribute(name: string): void;
    getUniform(name: string): GraphicTypes.UniformType;
    setUniform(name: string, value: GraphicTypes.UniformType): void;
    setUniform(name: string, matrix: Float32Array, dim: GraphicTypes.MatrixDim): void;
    getTexture(id: number): TexImageSource;
    setTexture({ id, img, settings }: {
        id: number;
        img: TexImageSource;
        settings?: GraphicTypes.TexSettings;
    }): void;
}
