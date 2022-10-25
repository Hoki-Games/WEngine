export const narrowColor = (color) => {
    let ret;
    if (Array.isArray(color))
        ret = [...color];
    else if (typeof color == 'object')
        ret = [color.r, color.g, color.b, color.a];
    else {
        const b4 = '([0-Fa-f])'.repeat(4);
        const b8 = '([0-Fa-f][0-Fa-f])'.repeat(4);
        const rgba4 = new RegExp(`^#${b4}?$`).exec(color);
        const rgba8 = new RegExp(`^#${b8}?$`).exec(color);
        if (rgba4)
            ret =
                rgba4.slice(1).map(v => parseInt(v, 16) / 15);
        else if (rgba8)
            ret =
                rgba8.slice(1).map(v => parseInt(v, 16) / 255);
        else
            throw new Error('Invalid color data', { cause: color });
    }
    if (Number.isNaN(ret[3]))
        ret[3] = 1;
    return ret;
};
export const narrowDimension = (color) => Array.isArray(color)
    ? [...color]
    : [color.x, color.y, color.width, color.height];
/**
 * Simplifies {@link Vector2} creation.
 */
export const vec2 = (x, y) => new Vector2(x, y ?? x);
/**
  * Defines two-dimentional vector with x and y coordinates.
  */
export class Vector2 {
    x;
    y;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    add(...v) {
        v.forEach(v => {
            this.x += v.x;
            this.y += v.y;
        });
    }
    /**
     * Calculates the sum of all given vectors and this.
     *
     * _If no vectors were given, just returnes this._
     */
    sum(...v) {
        const ret = vec2(this.x, this.y);
        for (const vec of v) {
            ret.x += vec.x;
            ret.y += vec.y;
        }
        return ret;
    }
    /**
     * Calculates the difference between gien vector and this.
     */
    dif(v) {
        return vec2(this.x - v.x, this.y - v.y);
    }
    /**
     * Calculates the multiplication of all given vectors and this.
     * _If no vectors were given, just returnes this._
     */
    mult(...v) {
        const ret = vec2(this.x, this.y);
        for (const vec of v) {
            ret.x *= vec.x;
            ret.y *= vec.y;
        }
        return ret;
    }
    /**
     * Calculates the division of this by given vector.
     *
     * _A/B_
     */
    div(v) {
        return vec2(this.x / v.x, this.y / v.y);
    }
    /**
     * Calculates the multiplication of given number and this.
     *
     * _n•A_
     */
    scale(n) {
        return vec2(this.x * n, this.y * n);
    }
    /**
     * Calculates the dot product of this and given vector.
     *
     * _A•B_
     */
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    /**
     * Calculates the triple product of this and given vector.
     *
     * _(A×B)×A_
     */
    triProd(v) {
        const crossZ = this.x * v.y - this.y * v.x;
        return vec2(this.y * crossZ, -this.x * crossZ);
    }
    /**
     * Returns vector, perpendicular to this facing right.
     *
     * ↱
     */
    get right() {
        return vec2(this.y, -this.x);
    }
    /**
     * Returns vector, perpendicular to this facing left.
     *
     * ↰
     */
    get left() {
        return vec2(-this.y, this.x);
    }
    /**
     * Returns this vector but it's x and y are absolute.
     */
    get abs() {
        return vec2(Math.abs(this.x), Math.abs(this.y));
    }
    /**
     * Return this vector's length.
     *
     * _|A|_
     */
    get length() {
        return Math.hypot(this.x, this.y);
    }
    /**
     * Returns a vector negative to this.
     */
    get neg() {
        return vec2(-this.x, -this.y);
    }
    /**
     * Returns this vector but with length equal to 1.
     */
    get norm() {
        return this.scale(1 / this.length);
    }
    /**
     * Return this vector's rotation.
     */
    get rotation() {
        return Math.atan2(this.y, this.x);
    }
    get [Symbol.iterator]() {
        const me = this;
        return function* () {
            yield* [me.x, me.y];
        };
    }
    /**
     * Creates a vector from length and rotation.
     */
    static fromDegree(degree, length = 1) {
        return vec2(length * Math.cos(degree), length * Math.sin(degree));
    }
}
export class WMatrix3 {
    _data;
    constructor(data) {
        this._data = data ?? [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
    }
    get(col, row) {
        if (typeof row == 'number') {
            return this._data[col][row];
        }
        else if (typeof col == 'number') {
            return [...this._data[col]];
        }
        else {
            const [a, b, c] = this._data;
            return [[...a], [...b], [...c]];
        }
    }
    set(col, row, value) {
        if (typeof value == 'number') {
            this._data[col][row] = value;
        }
        else if (Array.isArray(row)) {
            this._data[col] = row;
        }
        else if (Array.isArray(col)) {
            this._data = col;
        }
        else
            throw new Error('Invalid data');
    }
    copy() {
        return new WMatrix3(this.get());
    }
    sum(...mat) {
        const ret = [];
        this._data.forEach((_, col) => {
            ret.push([]);
            this._data[col].forEach((v1, row) => {
                ret[col].push(mat.reduce((t, v) => t + v[col][row], v1));
            });
        });
        return new WMatrix3(ret);
    }
    mult(mat) {
        const a = this.get();
        const b = mat.get();
        // TODO: Turn to loop calc
        const r00 = a[0][0] * b[0][0] + a[1][0] * b[0][1] + a[2][0] * b[0][2];
        const r10 = a[0][0] * b[1][0] + a[1][0] * b[1][1] + a[2][0] * b[1][2];
        const r20 = a[0][0] * b[2][0] + a[1][0] * b[2][1] + a[2][0] * b[2][2];
        const r01 = a[0][1] * b[0][0] + a[1][1] * b[0][1] + a[2][1] * b[0][2];
        const r11 = a[0][1] * b[1][0] + a[1][1] * b[1][1] + a[2][1] * b[1][2];
        const r21 = a[0][1] * b[2][0] + a[1][1] * b[2][1] + a[2][1] * b[2][2];
        const r02 = a[0][2] * b[0][0] + a[1][2] * b[0][1] + a[2][2] * b[0][2];
        const r12 = a[0][2] * b[1][0] + a[1][2] * b[1][1] + a[2][2] * b[1][2];
        const r22 = a[0][2] * b[2][0] + a[1][2] * b[2][1] + a[2][2] * b[2][2];
        return new WMatrix3([
            [r00, r01, r02],
            [r10, r11, r12],
            [r20, r21, r22]
        ]);
    }
    transpose() {
        const m = this.get();
        this.set([
            [m[0][0], m[1][0], m[2][0]],
            [m[0][1], m[1][1], m[2][1]],
            [m[0][2], m[1][2], m[2][2]]
        ]);
    }
}
export class WTransformMatrix3 {
    #translate;
    #direct;
    #skew;
    #scale;
    #data = new Float32Array(9);
    constructor({ translate = vec2(0), rotate = 0, skew = 0, scale = vec2(1) } = {}) {
        this.#translate = translate;
        this.#direct = Vector2.fromDegree(rotate);
        this.#skew = Math.tan(skew);
        this.#scale = scale;
        this.calcMatrix();
    }
    calcMatrix() {
        const [tx, ty] = this.#translate;
        const [rx, ry] = this.#direct;
        const [sx, sy] = this.#scale;
        const k = this.#skew;
        this.#data.set([
            rx * sx, ry * sx, 0,
            (rx * k - ry) * sy, (ry * k + rx) * sy, 0,
            tx, ty, 1
        ]);
        return this;
    }
    calcFields() {
        const [m11, m12, , m21, m22, , m31, m32] = this.#data;
        this.#direct = vec2(m11, m12).norm;
        const sk = Math.atan2(m22, m21) - Math.PI / 2 - this.#direct.rotation;
        this.#skew = -Math.tan(sk);
        this.#scale.x = Math.sqrt(m11 ** 2 + m12 ** 2);
        this.#scale.y = Math.sqrt(m21 ** 2 + m22 ** 2) * Math.cos(sk);
        this.#translate = vec2(m31, m32);
        return this;
    }
    translateX(x) {
        this.#translate.x = x;
        return this.calcMatrix();
    }
    translateY(y) {
        this.#translate.y = y;
        return this.calcMatrix();
    }
    translate(x, y) {
        this.#translate = vec2(x, y);
        return this.calcMatrix();
    }
    rotate(v0, v1) {
        if (v1 !== undefined)
            this.#direct = vec2(v0, v1).norm;
        else
            this.#direct = Vector2.fromDegree(v0);
        return this.calcMatrix();
    }
    scaleX(sx) {
        this.#scale.x = sx;
        return this.calcMatrix();
    }
    scaleY(sy) {
        this.#scale.y = sy;
        return this.calcMatrix();
    }
    scale(sx, sy) {
        this.#scale = vec2(sx, sy);
        return this.calcMatrix();
    }
    skew(k) {
        this.#skew = Math.tan(k);
        return this.calcMatrix();
    }
    matrix(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        this.#data.set([
            a, b, 0,
            c, d, 0,
            e, f, 1
        ]);
        return this.calcFields();
    }
    get tx() {
        return this.#translate.x;
    }
    get ty() {
        return this.#translate.y;
    }
    get t() {
        return this.#translate.sum();
    }
    get r() {
        return this.#direct.rotation;
    }
    get sx() {
        return this.#scale.x;
    }
    get sy() {
        return this.#scale.y;
    }
    get s() {
        return this.#scale.sum();
    }
    get k() {
        return Math.atan(this.#skew);
    }
    get kt() {
        return this.#skew;
    }
    get m() {
        const [a, b, , c, d, , e, f] = this.#data;
        return [a, b, c, d, e, f];
    }
    get a() {
        return this.#data[0];
    }
    set a(v) {
        this.#data[0] = v;
        this.calcFields();
    }
    get b() {
        return this.#data[1];
    }
    set b(v) {
        this.#data[1] = v;
        this.calcFields();
    }
    get c() {
        return this.#data[3];
    }
    set c(v) {
        this.#data[3] = v;
        this.calcFields();
    }
    get d() {
        return this.#data[4];
    }
    set d(v) {
        this.#data[4] = v;
        this.calcFields();
    }
    get e() {
        return this.#data[6];
    }
    set e(v) {
        this.#data[6] = v;
        this.calcFields();
    }
    get f() {
        return this.#data[7];
    }
    set f(v) {
        this.#data[7] = v;
        this.calcFields();
    }
    get buffer() {
        return this.#data.buffer;
    }
}
export const bezier = (x1, y1, x2, y2) => {
    if (x1 < 0 || x1 > 1)
        throw new Error('x1 is out of bounds', { cause: x1 });
    if (x2 < 0 || x2 > 1)
        throw new Error('x2 is out of bounds', { cause: x2 });
    const arr = [];
    const pos = (a, b, t) => t * (3 * a * (1 - t) ** 2 + t * (3 * b * (1 - t) + t));
    return (steps) => {
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            arr.push([
                pos(x1, x2, t),
                pos(y1, y2, t)
            ]);
        }
        return (x) => {
            if (x < 0 || x > 1)
                throw new Error('x is out of bounds', { cause: x });
            const search = (l, r) => {
                if (r - l == 1) {
                    const rX = arr[r][0];
                    const lX = arr[l][0];
                    const rY = arr[r][1];
                    const lY = arr[l][1];
                    return (x - rX) / (lX - rX) * lY + (x - lX) / (rX - lX) * rY;
                }
                const i = Math.round(l + (r - l) / 2);
                const v = arr[i];
                if (v[0] < x)
                    return search(i, r);
                else if (v[0] > x)
                    return search(l, i);
                return v[1];
            };
            return search(0, arr.length - 1);
        };
    };
};
export const clamp = (value, min, max) => Math.min(Math.max(min, value), max);
