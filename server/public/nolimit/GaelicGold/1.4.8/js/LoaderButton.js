"use strict";
/**
 * Class description
 *
 * Created: 2017-11-22
 * @author jonas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoaderButton = void 0;
const gsap_1 = require("gsap");
const BasePlateMesh_1 = require("../displayobject/BasePlateMesh");
const Button_1 = require("./Button");
const NineSliceButton_1 = require("./NineSliceButton");
class LoaderButton extends NineSliceButton_1.NineSliceButton {
    constructor(onClickedCallback, buttonText, loadingText, textStyle) {
        super(onClickedCallback, buttonText, textStyle);
        this._loadingText = loadingText;
    }
    initAnimations() {
        super.initAnimations();
        this._loadProgress = 0;
        this._loaderOutline = this.createLoaderOutline();
        this._loaderOutlineMask = new PIXI.Graphics();
        this._loaderOutline.mask = this._loaderOutlineMask;
        this._startAngle = -90;
        this._endAngle = this._startAngle + 360;
        this._graphicsContainer.addChild(this._backplateMesh);
        this._graphicsContainer.addChild(this._loaderOutline);
        this._graphicsContainer.addChild(this._loaderOutlineMask);
        this._graphicsContainer.addChild(this._buttonText);
        this._animationGetters[Button_1.ButtonState.loading] = () => this.getToLoading();
    }
    createLoaderOutline() {
        const plate = new BasePlateMesh_1.BasePlateMesh({
            cornerRadius: 12,
            lineThickness: 2,
            lineColor: 0xFFFFFF,
            lineAlpha: 1,
            backgroundColor: 0x000000,
            backgroundAlpha: 0.0,
        });
        return plate;
    }
    setState(state) {
        if (state == Button_1.ButtonState.loading) {
            this.enabled = false;
        }
        super.setState(state);
    }
    updateMask(amount) {
        if (this._loadProgress == amount) {
            return;
        }
        this._loadProgress = amount;
        const targetAngle = this._startAngle + (360 * this._loadProgress);
        this._loaderOutlineMask.clear();
        this._loaderOutlineMask.beginFill(0xff0000);
        this._loaderOutlineMask.arc(0, 0, this._maskRadius, this._startAngle * PIXI.DEG_TO_RAD, targetAngle * PIXI.DEG_TO_RAD, false);
        this._loaderOutlineMask.lineTo(0, 0);
        this._loaderOutlineMask.endFill();
    }
    setSize(width, height, stageScale) {
        super.setSize(width, height, stageScale);
        this._loaderOutline.width = width;
        this._loaderOutline.height = height;
        this._loaderOutline.update(stageScale);
        this._loaderOutline.pivot.set(this._loaderOutline.width * 0.5, this._loaderOutline.height * 0.5);
        this._maskRadius = Math.max(this._loaderOutline.width, this._loaderOutline.height);
        this.updateMask(this._loadProgress);
    }
    startLoadingTextLoop() {
        this.stopLoadingTextLoop();
        this._loadingLoop = new gsap_1.TimelineMax({ repeat: -1, yoyo: true });
        this._loadingLoop.add(gsap_1.TweenLite.fromTo(this._buttonText, 1, {
            alpha: 0.8,
            ease: gsap_1.Power2.easeInOut
        }, { alpha: 0.4, ease: gsap_1.Power2.easeInOut }));
    }
    stopLoadingTextLoop() {
        if (this._loadingLoop && this._loadingLoop.isActive()) {
            this._loadingLoop.pause();
        }
        this._loadingLoop = null;
    }
    getToLoading() {
        const tl = new gsap_1.TimelineLite();
        tl.add([
            () => this.setButtonText(this._loadingText),
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 0.4 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 0.2 }),
            new gsap_1.TweenLite(this._loaderOutline, this._animationDuration, { alpha: 0.6 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 0.95, y: 0.95 })
        ]);
        tl.add(() => this.startLoadingTextLoop());
        return tl;
    }
    getToDisabled() {
        const tl = new gsap_1.TimelineLite();
        tl.add(() => this.stopLoadingTextLoop());
        tl.add([
            () => this.setButtonText(this._normalTextString),
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 0.4 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 0.2 }),
            new gsap_1.TweenLite(this._loaderOutline, this._animationDuration, { alpha: 0.6 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 0.95, y: 0.95 })
        ]);
        return tl;
    }
    getToIdle() {
        const tl = new gsap_1.TimelineLite();
        tl.add(() => this.stopLoadingTextLoop());
        tl.add([
            () => this.setButtonText(this._normalTextString),
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 0.8 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 0.6 }),
            new gsap_1.TweenLite(this._loaderOutline, this._animationDuration, { alpha: 0.0 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 1, y: 1 })
        ]);
        return tl;
    }
    getToOver() {
        const tl = new gsap_1.TimelineLite();
        tl.add(() => this.stopLoadingTextLoop());
        tl.add([
            () => this.setButtonText(this._normalTextString),
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 1 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 1 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 1, y: 1 })
        ]);
        return tl;
    }
    getToDown() {
        const tl = new gsap_1.TimelineLite();
        tl.add(() => this.stopLoadingTextLoop());
        tl.add([
            () => this.setButtonText(this._normalTextString),
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 1.0 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 1.0 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 0.95, y: 0.95 })
        ]);
        return tl;
    }
}
exports.LoaderButton = LoaderButton;
//# sourceMappingURL=LoaderButton.js.map