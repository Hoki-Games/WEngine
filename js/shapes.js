import { Vector2, vec2 } from "./math.js";
export class Shape {
    location;
    rotation;
    scale;
    constructor({ location: position = vec2(0), rotation = 0, scale = vec2(1) } = {}) {
        this.location = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}
export class Circle extends Shape {
    radius;
    constructor({ location = vec2(0), rotation = 0, scale = vec2(1), radius = 1 } = {}) {
        super({ location, rotation, scale });
        this.radius = radius;
    }
}
export class Polygon extends Shape {
    vertices;
    constructor({ location = vec2(0), rotation = 0, scale = vec2(1), vertices }) {
        super({ location, rotation, scale });
        if (vertices.length < 3)
            throw new Error('Polygon must have at least 3 vertices', {
                cause: vertices
            });
        this.vertices = vertices;
    }
}
export class RegularPolygon extends Polygon {
    constructor({ location = vec2(0), rotation = 0, vertexCount, radius }) {
        const verts = [];
        const delta = PI2 / vertexCount;
        const theta = vertexCount % 2 ? 0 : delta * .5;
        const beta = PI_2 - theta;
        for (let i = 0; i < vertexCount; i++) {
            verts.push(Vector2.fromDegree(beta + delta * i, radius));
        }
        super({ location, rotation, scale: vec2(1), vertices: verts });
    }
}
export class Rectangle extends Polygon {
    constructor({ location = vec2(0), rotation = 0, scale = vec2(1), height, width }) {
        super({
            location,
            rotation,
            scale,
            vertices: [
                vec2(width * .5, height * .5),
                vec2(width * -.5, height * .5),
                vec2(width * .5, height * -.5),
                vec2(width * -.5, height * -.5)
            ]
        });
    }
}
const PI2 = Math.PI * 2;
const PI_2 = Math.PI * .5;
