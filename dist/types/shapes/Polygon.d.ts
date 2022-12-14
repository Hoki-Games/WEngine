import { type Vector2 } from '../math.js';
import Shape from './Shape.js';
export default class Polygon extends Shape {
    vertices: Vector2[];
    constructor({ location, rotation, scale, vertices }: {
        location?: Vector2;
        rotation?: number;
        scale?: Vector2;
        vertices: Vector2[];
    });
}
