import { type Vector2 } from '../math.js';
import Shape from './Shape.js';
export default class Circle extends Shape {
    radius: number;
    constructor({ location, rotation, scale, radius }?: {
        location?: Vector2;
        rotation?: number;
        scale?: Vector2;
        radius?: number;
    });
}
