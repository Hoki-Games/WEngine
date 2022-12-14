import type { Types } from '../math.js';
export default class Matrix3 {
    protected _data: Float32Array;
    constructor();
    constructor(data: Types.Tri3<number>);
    constructor(data: Types.FixedArray<number, 9>);
    get(): Types.Tri3<number>;
    get(col: number): Types.Vec3<number>;
    get(col: number, row: number): number;
    set(value: Types.Tri3<number>): this;
    set(col: number, value: Types.Vec3<number>): this;
    set(col: number, row: number, value: number): this;
    copy(): Matrix3;
    sum(...mat: Matrix3[]): Matrix3;
    mult(mat: Matrix3): Matrix3;
    transpose(): this;
    get buffer(): ArrayBufferLike;
}
