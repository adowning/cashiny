"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASFreeSpinRoundInfoView = void 0;
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const ASRoundInfoView_1 = require("./ASRoundInfoView");
const TimesBetDisplay_1 = require("./TimesBetDisplay");
const PromoPanelTextLabel_1 = require("../../PromoPanelTextLabel");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const gsap_1 = require("gsap");
const TimelineSprite_1 = require("../../../utils/TimelineSprite");
const BigWin_1 = require("./BigWin");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const ASInterfaces_1 = require("../../../interfaces/ASInterfaces");
const ASEnums_1 = require("../../../enums/ASEnums");
const AnimationHelper_1 = require("../../../utils/AnimationHelper");
const CurrencyUtils_1 = require("../../../utils/CurrencyUtils");
const ActionSpinsController_1 = require("../ActionSpinsController");
class ASFreeSpinRoundInfoView extends PIXI.Container {
    constructor(controller, winData, index, parent) {
        super();
        this._winData = winData;
        Logger_1.Logger.logDev("ASFreeSpinRoundInfoView constructor called win data is : ", winData);
        this._controller = controller;
        this._index = index;
        this._parentRound = parent;
        this.init();
    }
    start(delay = 0) {
        const tl = new gsap_1.TimelineLite();
        if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.IS_MINIMIZED) {
            this.alpha = 1;
            this._parentRound.updateFSTotalBetAndWin();
            return tl;
        }
        delay && tl.delay(delay);
        tl.add(() => {
            this._parentRound.updateFSTotalBetAndWin();
        });
        if (this._winData.isBigWin) {
            tl.add(() => {
                this.alpha = 1;
            });
            tl.add(this.getBigWinAnimation());
        }
        else {
            tl.add(() => {
                this.alpha = 1;
                this._timesBetDisplay.alpha = 0;
                this._winText.alpha = 0;
                this._topLine.width = 0;
                this._bottomLine.width = 0;
            });
            tl.add(gsap_1.TweenLite.to(this._topLine, 0.2, { ease: gsap_1.Power1.easeOut, width: 500 }), 0);
            tl.add(gsap_1.TweenLite.to(this._bottomLine, 0.2, { ease: gsap_1.Power1.easeOut, width: 500 }), 0);
            tl.add(gsap_1.TweenLite.to(this._winText, 0.05, { alpha: 1 }), 0.05);
            tl.add(gsap_1.TweenLite.to(this._timesBetDisplay, 0.06, { alpha: 1 }), 0.04);
            tl.add(this.getWinAnimation(this._winData.totalSpinWinnings > 0), 0);
        }
        return tl;
    }
    init() {
        this.createInfo();
        this.onResize();
        this.alpha = 0;
    }
    onResize() {
        this._winText.onResize();
        this._timesBetDisplay.position.set(374, this._bottomLine.position.y * 0.5);
        this._timesBetDisplay.pivot.x = this._timesBetDisplay.width;
        this._winText.position.set(this._topLine.position.x - 2, this._bottomLine.position.y * 0.5);
    }
    createInfo() {
        const lineWidth = 500;
        const topLine = new PIXI.Sprite(PIXI.Texture.WHITE);
        topLine.width = lineWidth;
        topLine.tint = 0;
        topLine.height = 1;
        const bottomLine = new PIXI.Sprite(PIXI.Texture.WHITE);
        bottomLine.width = lineWidth;
        bottomLine.tint = 0;
        bottomLine.height = 1;
        this._topLine = topLine;
        this._bottomLine = bottomLine;
        this._topLine.position.set(ASRoundInfoView_1.ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN + this._topLine.width, 0);
        this._bottomLine.position.set(ASRoundInfoView_1.ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN + this._bottomLine.width, 60);
        this._winText = new PromoPanelTextLabel_1.PromoPanelTextLabel("", PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_WIN_STYLE, {
            landscapeMaxWidth: 150,
            portraitMaxWidth: 150
        });
        this._winText.name = "wintext";
        this._winText.anchor.set(1, 0.5);
        this.updateWin(this._winData.totalSpinWinnings);
        //If wintype == multiplier, then the expected value in totalSpinWinnings, is the actual timesBet amount. Otherwise use calculated
        let totalWinTimesBetThisSpin = this._winData.winType === ASEnums_1.WINTYPE.MULTIPLIER ? this._winData.totalSpinWinnings : this._winData.calculatedTimesBetThisSpin;
        this._timesBetDisplay = new TimesBetDisplay_1.TimesBetDisplay(totalWinTimesBetThisSpin, 150);
        this._topLine.alpha = 0.5;
        this._bottomLine.alpha = 0.5;
        this._topLine.anchor.x = this._bottomLine.anchor.x = 1;
        this.addChild(this._topLine, this._timesBetDisplay, this._winText, this._bottomLine);
    }
    updateWin(winValue) {
        const color = winValue > 0 ? "#fbc217" : "#000000";
        const style = this._winText.getStyleClone();
        style.fill = PIXI.utils.string2hex(color);
        style.dropShadow = (winValue > 0);
        this._winText.setStyle(style);
        if (this._winData.winType === ASEnums_1.WINTYPE.MULTIPLIER) {
            this._winText.text = winValue + "x";
        }
        else {
            this._winText.text = CurrencyUtils_1.CurrencyUtils.format(winValue);
        }
        this._winText.onResize();
    }
    getWinAnimation(win) {
        const tl = new gsap_1.TimelineLite();
        if (!this._winData.isWinBelowStake) {
            const animName = win ? "winCoins" : "noWin";
            const winAnim = new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures(animName));
            winAnim.visible = false;
            winAnim.anchor.set(0.5);
            winAnim.position.set(this._winText.x - this._winText.width * 0.5, this._winText.y);
            tl.add(() => {
                if (win) {
                    ActionSpinsController_1.ActionSpinsController.triggerSound(ASInterfaces_1.ActionSpinSound.WIN);
                }
                this.addChild(winAnim);
            });
            tl.add(winAnim.getAnimationAutoShowHide());
            tl.add(() => { this.removeChild(winAnim); });
        }
        return tl;
    }
    getBigWinAnimation() {
        const bigWinView = new BigWin_1.BigWin();
        bigWinView.position.set(this._topLine.position.x + 65 - (bigWinView.width * 0.5), this.height * 0.5 - 4);
        this.addChild(bigWinView);
        const tl = new gsap_1.TimelineLite();
        tl.add(() => {
            ActionSpinsController_1.ActionSpinsController.triggerSound(ASInterfaces_1.ActionSpinSound.BIG_WIN);
        });
        tl.add(bigWinView.start());
        return tl;
    }
}
exports.ASFreeSpinRoundInfoView = ASFreeSpinRoundInfoView;
//# sourceMappingURL=ASFreeSpinRoundInfoView.js.map