import { type Types as GraphicTypes } from '../graphics.js';
import type Scene from '../graphics/Scene.js';
import Renderer from '../graphics/Renderer.js';
import type BasicObject from './BasicObject.js';
export default class CustomObject implements BasicObject {
    #private;
    renderer: Renderer;
    zIndex: number;
    protected _vertsCount: number;
    constructor({ scene, uniforms, attributes, textures, shaders, vertsCount, drawMode, zIndex }: {
        scene: Scene;
        attributes?: Record<string, GraphicTypes.AttributeData>;
        uniforms?: Record<string, GraphicTypes.UniformType | GraphicTypes.MatrixData>;
        textures?: {
            img: TexImageSource;
            settings?: GraphicTypes.TexSettings;
        }[];
        shaders: GraphicTypes.Shader[];
        vertsCount: number;
        drawMode?: GLenum;
        zIndex?: number;
    });
    draw(): void;
    getAttribute(name: string): ArrayBuffer;
    setAttribute(name: string, value: GraphicTypes.AttributeData['data'], type: GraphicTypes.AttributeData['type'], length: GraphicTypes.AttributeData['length']): void;
    getUniform(name: string): GraphicTypes.UniformType;
    setUniform(name: string, value: GraphicTypes.UniformType): void;
    setUniform(name: string, matrix: Float32Array, dim: GraphicTypes.MatrixDim): void;
    getTexture(id: number): TexImageSource;
    setTexture(id: number, img: TexImageSource, settings?: GraphicTypes.TexSettings): void;
    get vertsCount(): number;
}
