import { type Scene, type Types as GraphicTypes } from '../graphics.js';
import { type Types as MathTypes } from '../math.js';
import PositionedObject from './PositionedObject.js';
export default class CircleObject extends PositionedObject {
    color: Float32Array;
    constructor({ scene, innerR, location, scale, color, zIndex }: {
        scene: Scene;
        innerR?: number;
        location: MathTypes.Vec2<number>;
        scale?: number;
        color?: GraphicTypes.Color;
        zIndex?: number;
    });
}
