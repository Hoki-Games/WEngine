import type { Scene } from '../graphics.js';
import type { Types as MathTypes } from '../math.js';
import TexPositionedObject from './TexPositionedObject.js';
export default class TextureObject extends TexPositionedObject {
    img: TexImageSource;
    constructor(img: TexImageSource, scene: Scene, tris: MathTypes.Tri2<GLfloat>[], uvmap: MathTypes.Tri2<GLfloat>[], zIndex?: number);
}
