import { type Vector2 } from '../math.js';
export default class Shape {
    location: Vector2;
    rotation: number;
    scale: Vector2;
    constructor({ location: position, rotation, scale }?: {
        location?: Vector2;
        rotation?: number;
        scale?: Vector2;
    });
}
