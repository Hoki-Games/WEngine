import type Timed from '../animation/Timed.js';
import type { Types as MathTypes } from '../math.js';
import type BasicObject from '../objects/BasicObject.js';
import { type Types as GraphicTypes } from '../graphics.js';
export default class Scene {
    display: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    settings: {
        backgroundColor: MathTypes.Vec4<GLclampf>;
        viewport: MathTypes.Vec4<GLint, GLint, GLsizei, GLsizei>;
        enable: GLenum[];
        depthFunc: GLenum;
        blendFunc: [GLenum, GLenum];
    };
    objects: Record<string, BasicObject>;
    animations: Timed[];
    constructor({ canvas, settings }: {
        canvas: HTMLCanvasElement;
        settings: GraphicTypes.Settings;
    });
    init(): void;
    draw(): void;
    resize(): void;
    updateLocations(dt: number): void;
    addObject(name: string, value: BasicObject): void;
    addObject(entries: [string, BasicObject][]): void;
    addObject(entries: Record<string, BasicObject>): void;
    removeObject(...name: string[]): void;
    clearObjects(): void;
    addAnimation(...animations: Timed[]): void;
    updateAnimations(time: number): void;
}
