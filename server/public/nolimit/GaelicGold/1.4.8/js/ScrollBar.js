"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollBar = void 0;
/**
 * Created by Jonas Wålekvist on 2019-12-16.
 */
const Scroller_1 = require("./Scroller");
const gsap_1 = require("gsap");
class ScrollBar extends Scroller_1.Scroller {
    constructor(container, vertical, useFadeTween, scrollConfig) {
        super(container);
        this._useFadeTween = true;
        this.name = "ScrollBar" + (vertical ? "Vertical" : "Horizontal");
        this._vertical = vertical;
        this._margin = new PIXI.Point(5, 5);
        this._useFadeTween = useFadeTween;
        this._gfx = new PIXI.Graphics();
        this._scrollConfig = scrollConfig; //color and thickness of scroll is configurable now.
        this.addChild(this._gfx);
    }
    // #140 of nolimit-promo-panel -> so that x and y are not set to NaN at line no. 90 and 84 respectively.
    setBarScale(scrollContainerSize, contentSize) {
        this._barScale = scrollContainerSize / contentSize;
    }
    resize(scrollContainerSize, contentSize) {
        this._barScale = scrollContainerSize / contentSize;
        const length = this._barScale * scrollContainerSize;
        let thickness = this._scrollConfig.thickness;
        this._gfx.clear();
        let hitArea;
        if (this._vertical) {
            hitArea = new PIXI.Rectangle(-(thickness * 6), this._margin.y, thickness * 6, length - this._margin.y * 2);
            this._gfx.beginFill(this._scrollConfig.color, 1);
            this._gfx.drawRoundedRect(-(thickness + this._margin.x), this._margin.y, thickness, length - this._margin.y * 2, 5);
        }
        else {
            hitArea = new PIXI.Rectangle(this._margin.x, -(thickness * 6), length - this._margin.x * 2, thickness * 6);
            this._gfx.beginFill(this._scrollConfig.color, 1);
            this._gfx.drawRect(this._margin.x, -(thickness + this._margin.y), length - this._margin.x * 2, thickness);
        }
        //Debug hit area
        // this._gfx.beginFill(0x0000ff, 1);
        // this._gfx.drawRect(hitArea.x, hitArea.y, hitArea.width, hitArea.height);
        this.hitArea = hitArea;
        this._gfx.endFill();
    }
    setScrollPosition(scrollTarget) {
        this.alpha = 1.0;
        if (this._fadeTween) {
            this._fadeTween.kill();
        }
        // #135 of nolimit-promo-panel
        if (this._useFadeTween) {
            this._fadeTween = gsap_1.TweenLite.to(this, 0.2, { duration: 0.2, alpha: 0.4, delay: 1 });
        }
        // #140 of nolimit-promo-panel
        if (this._scrollTween) {
            this._scrollTween.kill();
        }
        if (this._vertical) {
            this._scrollTween = gsap_1.TweenLite.to(this.position, 0.2, {
                duration: 0.2,
                y: -scrollTarget.y * this._barScale,
                ease: gsap_1.Power2.easeOut
            });
        }
        else {
            this._scrollTween = gsap_1.TweenLite.to(this.position, 0.2, {
                duration: 0.2,
                x: -scrollTarget.x * this._barScale,
                ease: gsap_1.Power2.easeOut
            });
        }
        return this._scrollTween;
    }
    start() {
        super.start();
        this.visible = this._enabled;
    }
    stop() {
        super.stop();
        this.visible = this._enabled;
    }
    calculateDelta(scrollTarget, prevScrollTarget) {
        let xDelta = 0;
        let yDelta = 0;
        if (!this._vertical) {
            xDelta = (scrollTarget.x - prevScrollTarget.x) / -this._barScale;
        }
        else {
            yDelta = (scrollTarget.y - prevScrollTarget.y) / -this._barScale;
        }
        return new PIXI.Point(xDelta, yDelta);
    }
}
exports.ScrollBar = ScrollBar;
//# sourceMappingURL=ScrollBar.js.map