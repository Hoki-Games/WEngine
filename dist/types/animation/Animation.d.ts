import Blank from './Blank.js';
export default class Animation extends Blank {
    protected _func: (p: number) => number;
    protected _x0: number;
    protected _dx: number;
    constructor({ x0, dx, percent, func }?: {
        x0?: number;
        dx?: number;
        percent?: number;
        func?: (p: number) => number;
    });
    get value(): number;
}
