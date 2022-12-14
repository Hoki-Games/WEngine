import type { Types as GraphicTypes, Scene } from '../graphics.js';
import type { Types as MathTypes } from '../math.js';
import PhysicsModel from '../physics/PhysicsModel.js';
import CustomObject from './CustomObject.js';
export default class PositionedObject extends CustomObject {
    #private;
    protected _tris: Float32Array;
    constructor({ scene, uniforms, attributes, textures, shaders, tris, physicsModel, zIndex }: {
        scene: Scene;
        attributes?: Record<string, GraphicTypes.AttributeData>;
        uniforms?: Record<string, GraphicTypes.UniformType>;
        textures?: {
            img: TexImageSource;
            settings?: GraphicTypes.TexSettings;
        }[];
        shaders: GraphicTypes.Shader[];
        tris: MathTypes.Tri2<GLfloat>[];
        physicsModel?: PhysicsModel;
        zIndex?: number;
    });
    getTriangle(id: number): MathTypes.Tri2<number, number>;
    setTriangle(id: number, triangle: MathTypes.Tri2<GLfloat>): boolean;
    addTriangle(triangle: MathTypes.Tri2<GLfloat>): number;
    removeTriangle(id: number): boolean;
    updateTriangles(): void;
    get physics(): PhysicsModel;
    set physics(v: PhysicsModel);
    get ratio(): number;
    set ratio(v: number);
}
