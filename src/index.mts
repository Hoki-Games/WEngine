/* eslint-disable no-var */
import * as _Animations from './animations.js'
import * as _Graphics from './graphics.js'
import * as _Loader from './loader.js'
import * as _Math from './math.js'
import * as _Objects from './objects.js'
import * as _Physics from './physics.js'
import * as _Shapes from './shapes.js'

export {
	_Animations as Animations,
	_Graphics as Graphics,
	_Loader as Loader,
	_Math as Math,
	_Objects as Objects,
	_Physics as Physics,
	_Shapes as Shapes
}

declare global {
	namespace WEngine {
		var Animations: typeof _Animations
		var Graphics: typeof _Graphics
		var Loader: typeof _Loader
		var Math: typeof _Math
		var Objects: typeof _Objects
		var Physics: typeof _Physics
		var Shapes: typeof _Shapes
	}
}

globalThis.WEngine = {
	Animations: _Animations,
	Graphics: _Graphics,
	Loader: _Loader,
	Math: _Math,
	Objects: _Objects,
	Physics: _Physics,
	Shapes: _Shapes
}