import { Vector2 } from '../math.js';
import Polygon from './Polygon.js';
export default class RegularPolygon extends Polygon {
    constructor({ location, rotation, vertexCount, radius }: {
        location?: Vector2;
        rotation?: number;
        scale?: Vector2;
        vertexCount: number;
        radius: number;
    });
}
