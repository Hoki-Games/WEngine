import { type Types as GraphicTypes, type Scene } from '../graphics.js';
import type { Types as MathTypes } from '../math.js';
import PositionedObject from './PositionedObject.js';
export default class OneColorObject extends PositionedObject {
    color: Float32Array;
    constructor(scene: Scene, color: GraphicTypes.Color, tris: MathTypes.Tri2<GLfloat>[], zIndex?: number);
}
