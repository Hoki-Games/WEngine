import { vec2, WTransformMatrix3 } from './math.js';
export class WPhysicsModel {
    origin;
    local;
    global;
    velocity; // m/s
    acceleration; // m/s²
    force; // N (kg∙m/s²)
    mass; // kg
    constructor({ location = vec2(0), rotation = 0, scale = vec2(1), skew = 0, mass = 1, velocity = vec2(0), acceleration = vec2(0), origin = vec2(0) } = {}) {
        this.origin = Float32Array.from(origin);
        this.mass = mass;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.force = vec2(0);
        this.local = new WTransformMatrix3({
            translate: location,
            rotate: rotation,
            scale,
            skew
        });
        this.global = this.local.copy();
        this.updateLocation(0);
    }
    applyForce(force) {
        this.force.add(force);
    }
    applyAcceleration(acceleration) {
        this.acceleration.add(acceleration);
    }
    applyVelocity(velocity) {
        this.velocity.add(velocity);
    }
    move(displacement) {
        const [tx, ty] = this.local.t.sum(displacement);
        this.local.translate(tx, ty);
    }
    updateLocation(dt) {
        this.applyAcceleration(this.force.scale(1 / this.mass));
        this.applyVelocity(this.acceleration.scale(dt));
        this.move(this.velocity.scale(dt));
        this.acceleration = vec2(0);
        this.force = vec2(0);
        this.global.set(new Float32Array(this.local.buffer));
    }
}
class ObjectConstraint {
    owner;
    constructor(owner) {
        this.owner = owner;
    }
    solve() { }
}
class TargetConstraint extends ObjectConstraint {
    target;
    constructor(owner, target) {
        super(owner);
        this.target = target;
    }
}
export class WSpring extends TargetConstraint {
    L0;
    ks;
    constructor(owner, target, { L0, ks }) {
        super(owner, target);
        this.L0 = L0;
        this.ks = ks;
    }
    solve() {
        const diff = this.owner.global.t.dif(this.target.global.t);
        const dl = diff.length;
        const x = dl - this.L0;
        const f = this.ks * x;
        const F_ba = diff.scale(f / (dl || Infinity));
        const F_ab = F_ba.neg;
        this.owner.applyForce(F_ab);
        this.target.applyForce(F_ba);
    }
}
export class WRope extends TargetConstraint {
    length;
    bounce;
    constructor(owner, target, { length, bounce }) {
        super(owner, target);
        this.length = length;
        this.bounce = bounce;
    }
    solve() {
        const dir = this.target.global.t.dif(this.owner.global.t);
        const diff = dir.length;
        if (diff > this.length) {
            const sum = this.owner.mass + this.target.mass;
            let r1;
            let r2;
            if (Number.isFinite(this.owner.mass)) {
                if (Number.isFinite(this.target.mass)) {
                    r1 = this.target.mass / sum;
                    r2 = this.owner.mass / sum;
                }
                else {
                    r1 = 1;
                    r2 = 0;
                }
            }
            else {
                if (Number.isFinite(this.target.mass)) {
                    r1 = 0;
                    r2 = 1;
                }
                else {
                    r1 = 0;
                    r2 = 0;
                }
            }
            const mv = dir.scale((diff - this.length) / diff);
            const m1 = mv.scale(r1);
            const m2 = mv.scale(-r2);
            this.owner.move(m1);
            this.target.move(m2);
            this.owner.applyAcceleration(m1.scale(this.bounce));
            this.target.applyAcceleration(m2.scale(this.bounce));
        }
    }
}
export class CopyLocationConstraint extends TargetConstraint {
    axes;
    invert;
    offset;
    ownerRelativity;
    targetRelativity;
    constructor(owner, target, { axes = [true, true], invert = [false, false], offset = false, ownerRelativity = 'global', targetRelativity = 'global' } = {}) {
        super(owner, target);
        this.axes = axes;
        this.invert = invert;
        this.offset = offset;
        this.ownerRelativity = ownerRelativity;
        this.targetRelativity = targetRelativity;
    }
    solve() {
        const o = this.ownerRelativity == 'local'
            ? this.owner.local.t
            : this.owner.global.t;
        const t = this.targetRelativity == 'local'
            ? this.target.local.t
            : this.target.global.t;
        if (this.axes[0]) {
            const i = this.invert[0] ? -1 : 1;
            this.owner.global.translateX(t.x * i + ((this.offset) ? o.x : 0));
        }
        if (this.axes[1]) {
            const i = this.invert[1] ? -1 : 1;
            this.owner.global.translateY(t.y * i + ((this.offset) ? o.y : 0));
        }
    }
}
export class CopyRotationConstraint extends TargetConstraint {
    invert;
    offset;
    ownerRelativity;
    targetRelativity;
    constructor(owner, target, { invert = false, offset = false, ownerRelativity = 'global', targetRelativity = 'global' } = {}) {
        super(owner, target);
        this.invert = invert;
        this.offset = offset;
        this.ownerRelativity = ownerRelativity;
        this.targetRelativity = targetRelativity;
    }
    solve() {
        const i = this.invert ? -1 : 1;
        const o = this.ownerRelativity == 'local'
            ? this.owner.local.r
            : this.owner.global.r;
        const t = this.targetRelativity == 'local'
            ? this.target.local.r
            : this.target.global.r;
        this.owner.global.rotate(t * i + ((this.offset) ? o : 0));
    }
}
export class CopyScaleConstraint extends TargetConstraint {
    axes;
    offset;
    ownerRelativity;
    targetRelativity;
    constructor(owner, target, { axes = [true, true], offset = false, ownerRelativity = 'global', targetRelativity = 'global' } = {}) {
        super(owner, target);
        this.axes = axes;
        this.offset = offset;
        this.ownerRelativity = ownerRelativity;
        this.targetRelativity = targetRelativity;
    }
    solve() {
        const o = this.ownerRelativity == 'local'
            ? this.owner.local.s
            : this.owner.global.s;
        const t = this.targetRelativity == 'local'
            ? this.target.local.s
            : this.target.global.s;
        if (this.axes[0]) {
            this.owner.global.scaleX(t.x * (this.offset ? o.x : 1));
        }
        if (this.axes[1]) {
            this.owner.global.scaleY(t.y * (this.offset ? o.y : 1));
        }
    }
}
export class CopyTransformsConstraint extends TargetConstraint {
    mixMode;
    ownerRelativity;
    targetRelativity;
    constructor(owner, target, { mixMode = 'replace', ownerRelativity = 'global', targetRelativity = 'global' } = {}) {
        super(owner, target);
        /*
        scale x = sqrt(M11 * M11 + M12 * M12)

        scale y = sqrt(M21 * M21 + M22 * M22) * cos(shear)
    
        rotation = atan2(M12, M11)
    
        shear (y) = atan2(M22, M21) - PI/2 - rotation
    
        translation x = M31
    
        translation y = M32
        */
        // M1 = S * R * T; M1 * S2 = M1S2 * R2....
        // O - (T1, R1, S1); T - (T2, R2, S2)
        // replace:     S2 R2 T2
        // beforeFull:  (S2 R2 T2) (S1 R1 T1)
        // beforeSplit: T2 (R2 (S2 (S1 R1 T1)))
        // afterFull:   (S1 R1 T1) (S2 R2 T2)
        // afterSplit:  (((S1 R1 T1) S2) R2) T2
        // O1: [S1 R1 T1]
        // O2: [S2 R2 T2] [S1 R1 T1] => [S2* R2* T2*]
        // O3: [S3 S2*] [R3 R2*] [T3 T2*]
        this.mixMode = mixMode;
        this.ownerRelativity = ownerRelativity;
        this.targetRelativity = targetRelativity;
    }
    solve() {
        switch (this.mixMode) {
            case 'replace':
                this.owner.global.set(new Float32Array((this.targetRelativity == 'global')
                    ? this.target.global.buffer
                    : this.target.local.buffer));
                break;
            case 'beforeFull':
                // this.owner.global.
                break;
            case 'beforeSplit':
                break;
            case 'afterFull':
                break;
            case 'afterSplit':
                break;
            default:
        }
    }
}
