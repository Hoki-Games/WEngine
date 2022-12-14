import type { Types as GraphicTypes, Scene } from '../graphics.js';
import type { Types as MathTypes } from '../math.js';
import PositionedObject from './PositionedObject.js';
export default class TexPositionedObject extends PositionedObject {
    protected _uvmap: Float32Array;
    constructor({ scene, uniforms, attributes, textures, shaders, tris, uvmap, zIndex }: {
        scene: Scene;
        attributes?: Record<string, GraphicTypes.AttributeData>;
        uniforms?: Record<string, GraphicTypes.UniformType>;
        textures?: {
            img: TexImageSource;
            settings?: GraphicTypes.TexSettings;
        }[];
        shaders: GraphicTypes.Shader[];
        tris: MathTypes.Tri2<GLfloat>[];
        uvmap: MathTypes.Tri2<GLfloat>[];
        zIndex?: number;
    });
    getUVTriangle(id: number): MathTypes.Tri2<number, number>;
    setUVTriangle(id: number, triangle: MathTypes.Tri2<GLfloat>): boolean;
    addUVTriangle(triangle: MathTypes.Tri2<GLfloat>): number;
    removeUVTriangle(id: number): boolean;
    updateUVTriangles(): void;
}
