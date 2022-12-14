/**
 * Defines two-dimentional vector with x and y coordinates.
 */
export default class Vector2 implements Iterable<number> {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    add(...v: Vector2[]): void;
    /**
     * Calculates the sum of all given vectors and this.
     *
     * _If no vectors were given, just returnes this._
     */
    sum(...v: Vector2[]): Vector2;
    /**
     * Calculates the difference between given vector and this.
     */
    dif(v: Vector2): Vector2;
    /**
     * Calculates the multiplication of all given vectors and this.
     * _If no vectors were given, just returnes this._
     */
    mult(...v: Vector2[]): Vector2;
    /**
     * Calculates the division of this by given vector.
     *
     * _A/B_
     */
    div(v: Vector2): Vector2;
    /**
     * Calculates the multiplication of given number and this.
     *
     * _n•A_
     */
    scale(n: number): Vector2;
    /**
     * Calculates the dot product of this and given vector.
     *
     * _A•B_
     */
    dot(v: Vector2): number;
    /**
     * Calculates the triple product of this and given vector.
     *
     * _(A×B)×A_
     */
    triProd(v: Vector2): Vector2;
    /**
     * Returns vector, perpendicular to this facing right.
     *
     * ↱
     */
    get right(): Vector2;
    /**
     * Returns vector, perpendicular to this facing left.
     *
     * ↰
     */
    get left(): Vector2;
    /**
     * Returns this vector but it's x and y are absolute.
     */
    get abs(): Vector2;
    /**
     * Return this vector's length.
     *
     * _|A|_
     */
    get size(): number;
    /**
     * Returns a vector negative to this.
     */
    get neg(): Vector2;
    /**
     * Returns this vector but with length equal to 1.
     */
    get norm(): Vector2;
    /**
     * Return this vector's rotation.
     */
    get rotation(): number;
    get arr(): [number, number];
    get length(): 2;
    get [Symbol.iterator](): () => Generator<number, void, undefined>;
    /**
     * Creates a vector from length and rotation.
     */
    static fromDegree(degree: number, length?: number): Vector2;
}
