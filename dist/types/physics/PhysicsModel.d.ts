import { type Vector2 } from '../math.js';
import TransformMatrix3 from '../math/TransformMatrix3.js';
export default class PhysicsModel {
    #private;
    velocity: Vector2;
    acceleration: Vector2;
    force: Vector2;
    mass: number;
    constructor({ location, rotation, scale, skew, mass, velocity, acceleration, origin }?: {
        location?: Vector2;
        rotation?: number;
        scale?: Vector2;
        skew?: number;
        mass?: number;
        velocity?: Vector2;
        acceleration?: Vector2;
        origin?: Vector2;
    });
    applyForce(force: Vector2): void;
    applyAcceleration(acceleration: Vector2): void;
    applyVelocity(velocity: Vector2): void;
    move(displacement: Vector2): void;
    updateLocation(dt: number): void;
    get origin(): Float32Array;
    get local(): TransformMatrix3;
    get global(): TransformMatrix3;
}
