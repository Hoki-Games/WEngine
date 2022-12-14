import Vector2 from './math/Vector2.js';
export declare namespace Types {
    type FixedArray<T, L extends number> = [T, ...T[]] & {
        readonly length: L;
    };
    type Vec2<T1, T2 = T1> = [T1, T2];
    type Vec3<T1, T2 = T1, T3 = T1> = [T1, T2, T3];
    type Vec4<T1, T2 = T1, T3 = T1, T4 = T1> = [T1, T2, T3, T4];
    type Line2<T1, T2 = T1> = FixedArray<Vec2<T1, T2>, 2>;
    type Line3<T1, T2 = T1, T3 = T1> = FixedArray<Vec3<T1, T2, T3>, 2>;
    type Line4<T1, T2 = T1, T3 = T1, T4 = T1> = FixedArray<Vec4<T1, T2, T3, T4>, 2>;
    type Tri2<T1, T2 = T1> = FixedArray<Vec2<T1, T2>, 3>;
    type Tri3<T1, T2 = T1, T3 = T1> = FixedArray<Vec3<T1, T2, T3>, 3>;
    type Tri4<T1, T2 = T1, T3 = T1, T4 = T1> = FixedArray<Vec4<T1, T2, T3, T4>, 3>;
}
export { default as Vector2 } from './math/Vector2.js';
export { default as Matrix3 } from './math/Matrix3.js';
export { default as TransformMatrix3 } from './math/TransformMatrix3.js';
/**
 * Simplifies {@link Vector2} creation.
 */
export declare const vec2: (x: number, y?: number) => Vector2;
export declare const bezier: (x1: number, y1: number, x2: number, y2: number) => (steps: number) => (x: number) => any;
export declare const clamp: (value: number, min: number, max: number) => number;
