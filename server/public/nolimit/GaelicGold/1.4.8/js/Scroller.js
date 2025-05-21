"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scroller = void 0;
const gsap_1 = require("gsap");
/**
 * Created by Jonas Wålekvist on 2019-12-11.
 */
class Scroller extends PIXI.Container {
    constructor(container) {
        super();
        this._enabled = false;
        this.onDragStart = (event) => {
            this.data = event.data;
            this._prevScrollTarget = this.data.getLocalPosition(this.parent);
            this.setScrollDelta(this._prevScrollTarget, true);
            this.on('pointermove', this.onDragMove);
        };
        this.onDragMove = (event) => {
            if (this.data) {
                const scrollTarget = this.data.getLocalPosition(this.parent);
                this.setScrollDelta(scrollTarget);
            }
        };
        this.onDragEnd = (event) => {
            if (this.data) {
                const scrollTarget = this.data.getLocalPosition(this.parent);
                this.slideToStop();
                this.setScrollDelta(scrollTarget);
            }
            this.data = undefined;
            this._prevScrollTarget = undefined;
            this.removeListener('pointermove', this.onDragMove);
        };
        this.name = "ScrollContent";
        this._speed = new PIXI.Point(0, 0);
        this._timestamp = 0;
        this._scrollContainer = container;
        this.enable(false);
        this.setScrollPosition(new PIXI.Point(0, 0));
    }
    enable(enable) {
        if (enable) {
            this.start();
        }
        else {
            this.stop();
        }
    }
    start() {
        if (this._enabled) {
            return;
        }
        this._enabled = true;
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', this.onDragStart);
        this.on('pointerup', this.onDragEnd);
        this.on('pointerupoutside', this.onDragEnd);
    }
    stop() {
        this.interactive = false;
        this.buttonMode = false;
        this.removeListener('pointerdown', this.onDragStart);
        this.removeListener('pointerup', this.onDragEnd);
        this.removeListener('pointerupoutside', this.onDragEnd);
        this._enabled = false;
    }
    setScrollDelta(scrollTarget, dragEnd = false) {
        const scroller = dragEnd ? undefined : this;
        const delta = this.calculateDelta(scrollTarget, this._prevScrollTarget);
        this._scrollContainer.setScrollDelta(scroller, delta.x, delta.y);
        this._prevScrollTarget = scrollTarget;
    }
    slideToStop() {
        if (Math.abs(this._speed.x) < 2 && Math.abs(this._speed.y) < 2) {
            return;
        }
        this._slideTween = new gsap_1.TweenLite(this._speed, 2, {
            x: 0, y: 0, ease: gsap_1.Power2.easeOut,
            onUpdate: () => {
                this._scrollContainer.setScrollDelta(this, this._speed.x, this._speed.y);
            },
            onComplete: () => {
                this._scrollContainer.setScrollDelta(undefined, this._speed.x, this._speed.y);
            }
        });
    }
    setScrollPosition(scrollTarget) {
        if (this._slideTween == undefined) {
            this.calcSpeed(scrollTarget);
        }
        return gsap_1.TweenLite.to(this.position, 0.2, {
            x: scrollTarget.x,
            y: scrollTarget.y,
            ease: gsap_1.Power2.easeOut
        });
    }
    abort() {
        if (this._slideTween) {
            this._slideTween.kill();
            this._slideTween = undefined;
            this._speed.set(0, 0);
        }
    }
    calcSpeed(scrollTarget) {
        const now = Date.now();
        const delta = now - this._timestamp;
        let distance = new PIXI.Point(Math.abs(this.position.x) - Math.abs(scrollTarget.x), Math.abs(this.position.y) - Math.abs(scrollTarget.y));
        this._speed.set(Math.round(distance.x / delta), Math.round(distance.y / delta));
        this._timestamp = now;
    }
    calculateDelta(scrollTarget, prevScrollTarget) {
        return new PIXI.Point(scrollTarget.x - prevScrollTarget.x, scrollTarget.y - prevScrollTarget.y);
    }
}
exports.Scroller = Scroller;
//# sourceMappingURL=Scroller.js.map