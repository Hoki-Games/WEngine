import type { Types as GraphicTypes, Scene } from '../graphics.js';
import { type Types as MathTypes } from '../math.js';
import OneColorObject from './OneColorObject.js';
export default class LinesObject extends OneColorObject {
    constructor({ scene, lines, width, color, zIndex }: {
        scene: Scene;
        lines: MathTypes.Line2<number>[];
        width?: number;
        color?: GraphicTypes.Color;
        zIndex?: number;
    });
}
