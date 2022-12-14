export default interface Timed {
    t0: number;
    dur: number;
    percent: number;
    readonly value: number;
    update(time: number): number;
}
