import { type Vector2 } from '../math.js';
import Polygon from './Polygon.js';
export default class Rectangle extends Polygon {
    constructor({ location, rotation, scale, height, width }: {
        location?: Vector2;
        rotation?: number;
        scale?: Vector2;
        width: number;
        height: number;
    });
}
