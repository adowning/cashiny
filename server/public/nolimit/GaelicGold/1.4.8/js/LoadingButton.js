"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingButton = void 0;
/**
 * Created by Jonas Wålekvist on 2020-03-09.
 */
const gsap_1 = require("gsap");
const ContinueButton_1 = require("../../../gui/buttons/concretebuttons/ContinueButton");
const NolimitApplication_1 = require("../../../NolimitApplication");
class AnimatedStroke extends PIXI.Container {
    get progress() {
        return this._progress;
    }
    set progress(value) {
        this._progress = value;
        this.updateMask(this._progress);
    }
    constructor(stroke) {
        super();
        this._progress = 0;
        this._stroke = stroke;
        this._strokeMask = new PIXI.Graphics();
        this._strokeMask.position.set(this._stroke.width * 0.5, this._stroke.height * 0.5);
        this._stroke.mask = this._strokeMask;
        this._maskRadius = Math.max(this._stroke.width, this._stroke.height);
        this.addChild(this._stroke);
        this.addChild(this._strokeMask);
    }
    updateMask(progress) {
        const targetAngle = (Math.PI * 2 * progress) - Math.PI * 0.5;
        this._strokeMask.clear();
        this._strokeMask.beginFill(0xff0000, 0.2);
        this._strokeMask.arc(0, 0, this._maskRadius, -Math.PI * 0.5, targetAngle, false);
        this._strokeMask.lineTo(0, 0);
        this._strokeMask.endFill();
    }
}
class LoadingButton extends PIXI.Container {
    constructor() {
        super();
        this._loadingButton = new ContinueButton_1.ContinueButton(NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("LOADING"));
        this._continueButton = new ContinueButton_1.ContinueButton();
        this._loadingButton.enable(false);
        this._continueButton.enable(false);
        this._continueButton.visible = false;
        this._loadingButton.resizeButtonToLabelWithMargin(18, 30, 18, 30);
        this._continueButton.resizeButtonToLabelWithMargin(18, 30, 18, 30);
        const size = new PIXI.Point(Math.max(this._loadingButton.width, this._continueButton.width), Math.max(this._loadingButton.height, this._continueButton.height));
        this._loadingButton.setSize(size.x, size.y);
        this._continueButton.setSize(size.x, size.y);
        const stroke = ContinueButton_1.ContinueButton.createButtonStroke();
        stroke.width = size.x;
        stroke.height = size.y;
        this._animatedStroke = new AnimatedStroke(stroke);
        this.addChild(this._loadingButton, this._animatedStroke, this._continueButton);
        this.pivot.set(size.x * 0.5, size.y * 0.5);
    }
    addClickCallback(callback) {
        this._continueButton.addClickCallback(callback);
    }
    loadingComplete(callback) {
        this._progressTimeline.kill();
        this._progressTimeline = new gsap_1.TimelineLite({
            onComplete: () => {
                this._continueButton.visible = true;
                this.removeChild(this._loadingButton);
                this.removeChild(this._animatedStroke);
                this._continueButton.addClickCallback(callback);
                this._continueButton.enable(true);
            }
        });
        this._progressTimeline.add(new gsap_1.TweenLite(this._animatedStroke, 0.2, { progress: 1, ease: gsap_1.Power2.easeOut }));
    }
    disable() {
        this._continueButton.enable(false);
    }
    start() {
        this._progressTimeline = new gsap_1.TimelineLite();
        this._progressTimeline.add(new gsap_1.TweenLite(this._animatedStroke, 10, { progress: 0.8, ease: gsap_1.Power2.easeOut }));
    }
}
exports.LoadingButton = LoadingButton;
//# sourceMappingURL=LoadingButton.js.map