"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NineSliceButton = void 0;
/**
 * Class description
 *
 * Created: 2017-11-22
 * @author jonas
 */
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const BasePlateMesh_1 = require("../displayobject/BasePlateMesh");
const Helper_1 = require("../utils/Helper");
const Button_1 = require("./Button");
const gsap_1 = require("gsap");
class NineSliceButton extends PIXI.Container {
    set enabled(value) {
        if (this._enabled != value) {
            this._enabled = value;
            this.setState(this._enabled ? Button_1.ButtonState.idle : Button_1.ButtonState.disabled);
            this._backplateMesh.buttonMode = this._enabled;
        }
    }
    get enabled() {
        return this._enabled;
    }
    constructor(onClickedCallback, buttonText, textStyle, backgroundConfig) {
        super();
        this._animationDuration = 0.1;
        this._onClickedCallback = onClickedCallback;
        this._normalTextString = buttonText;
        this._textStyle = textStyle != undefined ? textStyle : this.getDefaultTextStyle();
        this._backgroundConfig = backgroundConfig != undefined ? backgroundConfig : this.getDefaultBackgroundConfig();
        this.initAnimations();
        this.init();
    }
    initAnimations() {
        this._graphicsContainer = new PIXI.Container();
        this.addChild(this._graphicsContainer);
        this._backplateMesh = this.createBackPlate();
        this._buttonText = this.createText(this._normalTextString, this._textStyle);
        this._currentTextString = this._normalTextString;
        this._graphicsContainer.addChild(this._backplateMesh);
        this._graphicsContainer.addChild(this._buttonText);
        this._animationGetters = {};
        this._animationGetters[Button_1.ButtonState.disabled] = () => this.getToDisabled();
        this._animationGetters[Button_1.ButtonState.idle] = () => this.getToIdle();
        this._animationGetters[Button_1.ButtonState.over] = () => this.getToOver();
        this._animationGetters[Button_1.ButtonState.down] = () => this.getToDown();
    }
    createBackPlate() {
        return new BasePlateMesh_1.BasePlateMesh(this._backgroundConfig);
    }
    getDefaultBackgroundConfig() {
        return {
            cornerRadius: 12,
            lineThickness: 2,
            lineColor: 0xffffff,
            lineAlpha: 1,
            backgroundColor: 0x000000,
            backgroundAlpha: 0.4
        };
    }
    createText(text, style) {
        const textField = new PIXI.Text(text, style);
        textField.style.align = "center";
        textField.anchor.set(0.5, 0.5);
        return textField;
    }
    getDefaultTextStyle() {
        return {
            fontFamily: "Open Sans",
            fontStyle: FontStatics_1.FontStyle.ITALIC,
            fontSize: 28,
            fill: "#ffffff",
            fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
        };
    }
    setSize(width, height, stageScale) {
        this._backplateMesh.width = width;
        this._backplateMesh.height = height;
        this._backplateMesh.update(stageScale);
        this._backplateMesh.pivot.set(this._backplateMesh.width * 0.5, this._backplateMesh.height * 0.5);
        this._buttonText.style.fontSize = this._textStyle.fontSize;
        Helper_1.Helper.shrinkTextWidth(this._currentTextString, this._buttonText, this._backplateMesh.width / this.scale.x);
    }
    setButtonText(value) {
        if (this._currentTextString == value) {
            return;
        }
        this._currentTextString = value;
        this._buttonText.text = value;
        this._buttonText.style.fontSize = this._textStyle.fontSize;
        Helper_1.Helper.shrinkTextWidth(this._currentTextString, this._buttonText, this._backplateMesh.width / this.scale.x);
    }
    setState(state) {
        if (state == this._currentState) {
            return;
        }
        if (this._currentAnimation && this._currentAnimation.isActive()) {
            this._currentAnimation.pause(this._currentAnimation.totalDuration());
            this._currentAnimation.kill();
        }
        if (this._animationGetters[state] == null) {
            debugger;
            throw new Error(`Button.setState(): Illegal button state ${state}`);
        }
        this._currentAnimation = this._animationGetters[state]();
        this._currentState = state;
    }
    init() {
        this._backplateMesh.interactive = true;
        this.enabled = true;
        this._backplateMesh.on('pointerdown', this.onDown, this);
        this._backplateMesh.on('pointerout', this.onIdle, this);
        this._backplateMesh.on('pointerover', this.onOver, this);
        this._backplateMesh.on('pointertap', this.onUp, this);
    }
    onIdle() {
        if (!this._enabled) {
            return;
        }
        this.setState(Button_1.ButtonState.idle);
    }
    onOver() {
        if (!this._enabled) {
            return;
        }
        this.setState(Button_1.ButtonState.over);
    }
    onDown() {
        if (!this._enabled) {
            return;
        }
        this.setState(Button_1.ButtonState.down);
    }
    onUp() {
        if (!this._enabled) {
            return;
        }
        if (this._currentState != Button_1.ButtonState.down) {
            this.setState(Button_1.ButtonState.down);
        }
        this._onClickedCallback();
    }
    click() {
        this.onUp();
    }
    getToDisabled() {
        const tl = new gsap_1.TimelineLite();
        tl.add([
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 0.4 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 0.2 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 0.95, y: 0.95 })
        ]);
        return tl;
    }
    getToIdle() {
        const tl = new gsap_1.TimelineLite();
        tl.add([
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 0.8 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 0.6 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 1, y: 1 })
        ]);
        return tl;
    }
    getToOver() {
        const tl = new gsap_1.TimelineLite();
        tl.add([
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 1 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 1 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 1, y: 1 })
        ]);
        return tl;
    }
    getToDown() {
        const tl = new gsap_1.TimelineLite();
        tl.add([
            new gsap_1.TweenLite(this._buttonText, this._animationDuration, { alpha: 1.0 }),
            new gsap_1.TweenLite(this._backplateMesh, this._animationDuration, { alpha: 1.0 }),
            new gsap_1.TweenLite(this._graphicsContainer.scale, this._animationDuration, { x: 0.95, y: 0.95 })
        ]);
        return tl;
    }
}
exports.NineSliceButton = NineSliceButton;
//# sourceMappingURL=NineSliceButton.js.map