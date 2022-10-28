import { WScene } from './graphics.js';
import { vec2 } from './math.js';
import { WOneColorObject, WPositionedObject } from './objects.js';
import { CopyLocationConstraint, CopyRotationConstraint, CopyScaleConstraint } from './physics.js';
import { RegularPolygon } from './shapes.js';
window.addEventListener('load', async () => {
    const display = document.getElementById('display');
    const scene = globalThis.scene = new WScene({
        canvas: display,
        settings: {
            backgroundColor: '#150E1C',
            premultipliedAlpha: false,
            enable: [WebGL2RenderingContext.BLEND],
            blendFunc: [
                WebGL2RenderingContext.SRC_ALPHA,
                WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA
            ],
            viewport: { x: 0, y: 0, width: 1, height: 1 }
        }
    });
    const resize = () => {
        const rect = display.getBoundingClientRect();
        const ratio = rect.width / rect.height;
        scene.settings.viewport[2] = display.width = rect.width;
        scene.settings.viewport[3] = display.height = rect.height;
        for (const name in scene.objects) {
            const obj = scene.objects[name];
            if (obj instanceof WPositionedObject) {
                obj.ratio = ratio;
            }
        }
        scene.resize();
    };
    const hex = new RegularPolygon({
        // radius: .25,
        radius: 1,
        vertexCount: 6
    });
    const pent = new RegularPolygon({
        // radius: .50,
        radius: 1,
        vertexCount: 5
    });
    scene.addObject('hex', new WOneColorObject(scene, '#03fcc6', [[
            [...hex.vertices[0]],
            [...hex.vertices[1]],
            [...hex.vertices[5]]
        ], [
            [...hex.vertices[5]],
            [...hex.vertices[1]],
            [...hex.vertices[4]]
        ], [
            [...hex.vertices[1]],
            [...hex.vertices[2]],
            [...hex.vertices[4]]
        ], [
            [...hex.vertices[4]],
            [...hex.vertices[2]],
            [...hex.vertices[3]]
        ]], 0));
    scene.addObject('pent', new WOneColorObject(scene, '#5ab03f', [[
            [...pent.vertices[0]],
            [...pent.vertices[2]],
            [...pent.vertices[1]]
        ], [
            [...pent.vertices[0]],
            [...pent.vertices[3]],
            [...pent.vertices[2]]
        ], [
            [...pent.vertices[0]],
            [...pent.vertices[4]],
            [...pent.vertices[3]]
        ]], 1));
    scene.objects['pent'].physics.scale = vec2(.5);
    scene.objects['hex'].physics.scale = vec2(.25);
    const copLoc = globalThis.copLoc = new CopyLocationConstraint(scene.objects.pent.physics, scene.objects.hex.physics, {
        axes: [true, true],
        invert: [false, false],
        offset: false,
        ownerRelativity: 'global',
        targetRelativity: 'global'
    });
    const copRot = globalThis.copRot = new CopyRotationConstraint(scene.objects.pent.physics, scene.objects.hex.physics, {
        invert: false,
        offset: false,
        ownerRelativity: 'global',
        targetRelativity: 'global'
    });
    const copScale = globalThis.copScale = new CopyScaleConstraint(scene.objects.pent.physics, scene.objects.hex.physics, {
        offset: false,
        ownerRelativity: 'global',
        targetRelativity: 'global'
    });
    window.addEventListener('resize', resize);
    resize();
    scene.init();
    let lastTime = -1;
    const draw = globalThis.draw = (time) => {
        if (lastTime < 0)
            lastTime = time;
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        scene.updateLocations(dt);
        // copLoc.solve()
        // copRot.solve()
        // copScale.solve()
        scene.updateGlobals();
        scene.draw();
        requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
});
