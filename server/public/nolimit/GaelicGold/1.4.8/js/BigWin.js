"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigWin = void 0;
const TimelineSprite_1 = require("../../../utils/TimelineSprite");
const gsap_1 = require("gsap");
const AnimationHelper_1 = require("../../../utils/AnimationHelper");
class BigWin extends PIXI.Container {
    constructor() {
        super();
        this.init();
        this.name = "BIGWIN";
    }
    start() {
        const tl = new gsap_1.TimelineLite();
        tl.add(() => {
            this._baseAnim.setFrame(0);
            this._textAnim.setFrame(0);
            this._coinAnim[0].setFrame(0);
            this._coinAnim[1].setFrame(0);
            this._coinAnim[2].setFrame(0);
            this._coinAnim[3].setFrame(0);
            this.visible = true;
        });
        tl.add([
            this._baseAnim.getAnimationAutoShowHide(true, true),
            this._textAnim.getAnimationAutoShowHide(true, true)
        ], 0);
        tl.add([
            this._coinAnim[1].getAnimationAutoShowHide(true, true),
            this._coinAnim[2].getAnimationAutoShowHide(true, true)
        ], 1 / 30 * 4);
        tl.add([
            this._coinAnim[0].getAnimationAutoShowHide(true, true),
            this._coinAnim[3].getAnimationAutoShowHide(true, true)
        ], 1 / 30 * 6);
        tl.add(() => {
            var _a;
            this.visible = false;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.removeChild(this);
        });
        return tl;
    }
    init() {
        this._baseAnim = new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures("bigWinBase"));
        this._textAnim = new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures("bigWinText"));
        this._coinAnim = [
            new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures("winCoins")),
            new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures("winCoins")),
            new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures("winCoins")),
            new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures("winCoins"))
        ];
        this._baseAnim.anchor.set(0.5);
        this._textAnim.anchor.set(0.5);
        this._coinAnim[0].anchor.set(0.5);
        this._coinAnim[1].anchor.set(0.5);
        this._coinAnim[2].anchor.set(0.5);
        this._coinAnim[3].anchor.set(0.5);
        this._coinAnim[0].position.x = -210;
        this._coinAnim[1].position.x = -150;
        this._coinAnim[2].position.x = 140;
        this._coinAnim[3].position.x = 200;
        this._textAnim.position.y = 18;
        this.addChild(this._baseAnim, this._coinAnim[0], this._coinAnim[1], this._coinAnim[2], this._coinAnim[3], this._textAnim);
        this.visible = false;
    }
}
exports.BigWin = BigWin;
//# sourceMappingURL=BigWin.js.map