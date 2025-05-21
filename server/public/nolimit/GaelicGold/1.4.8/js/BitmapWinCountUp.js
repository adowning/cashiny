"use strict";
/**
 * Created by Ning Jiang on 4/5/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmapWinCountUp = void 0;
const BaseView_1 = require("../../../core/base/BaseView");
const BitmapCountUp_1 = require("../../../core/component/BitmapCountUp");
const gsap_1 = require("gsap");
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
class BitmapWinCountUp extends BaseView_1.BaseView {
    constructor(style) {
        super();
        this._style = style;
    }
    initAnimations() {
        this._countUp = new BitmapCountUp_1.BitmapCountUp({
            style: this._style,
            evenWidth: this.isFontEvenWidth()
        });
        this._countUp.shrinkSize = true;
        this._countUp.maxTextWidth = GameConfig_1.GameConfig.instance.REEL_AREA_WIDTH * 0.9;
        this._countUp.visible = false;
        // To use an extra container to make scale animations. the countUp has it's own scale calculation in animationConfig.
        this._countUpContainer = new PIXI.Sprite();
        this._countUpContainer.anchor.set(0.5, 0.5);
        this._countUpContainer.addChild(this._countUp);
        this.addChild(this._countUpContainer);
    }
    abort(endValue, isAborted, ...params) {
        const timeline = new gsap_1.TimelineLite();
        if (isAborted) {
            timeline.add(this.getAbortAnimation(endValue, ...params));
        }
        timeline.add(this.getEndingAnimation(endValue, ...params));
        return timeline;
    }
    // A quick fix for the font with different width number to be centered during count up. it will look wiggling.
    // The best looking is to have all the numbers the same width.
    isFontEvenWidth() {
        return true;
    }
}
exports.BitmapWinCountUp = BitmapWinCountUp;
//# sourceMappingURL=BitmapWinCountUp.js.map