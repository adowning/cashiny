"use strict";
/**
 * Created by Ning Jiang on 5/24/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenView = void 0;
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const BaseView_1 = require("../base/BaseView");
const CountDownTimer_1 = require("../component/CountDownTimer");
const NineSliceButton_1 = require("../component/NineSliceButton");
const ResourcesGroupName_1 = require("../resource/ResourcesGroupName");
const Orientation_1 = require("../stage/Orientation");
const StageManager_1 = require("../stage/StageManager");
const Translation_1 = require("../translation/Translation");
const UserAgent_1 = require("../useragent/UserAgent");
const MathHelper_1 = require("../utils/MathHelper");
class ScreenView extends BaseView_1.BaseView {
    constructor(config, autoClose = false) {
        super(config.resourceGroup ? config.resourceGroup : ResourcesGroupName_1.ResourcesGroupName.MAIN);
        this.DEFAULT_BUTTON_SIZE = new PIXI.Point(240, 64);
        this.DEFAULT_BUTTON_TEXT_STYLE = {
            fontFamily: "Open Sans",
            fontStyle: FontStatics_1.FontStyle.ITALIC,
            fontSize: 34,
            fill: "#ffffff",
            fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
        };
        this.DEFAULT_MOBILE_SCALE = 1.6;
        this.DEFAULT_PORTRAIT_SCALE = 1.7;
        this._isShowing = false;
        this._autoClose = false;
        this._config = config;
        this._onButtonClickCallback = config.onButtonClickCallback;
        this._autoClose = autoClose;
        this._layer = StageManager_1.StageManager.getLayer(config.layer);
    }
    initAnimations() {
        this._deviceScale = UserAgent_1.UserAgent.isMobile ? (this._config.mobileScale ? this._config.mobileScale : this.DEFAULT_MOBILE_SCALE) : 1;
        if (this.createBackground) {
            this._background = this.createBackground();
            this.addChild(this._background);
        }
        if (this.createGameGraphics) {
            this.addChild(this.createGameGraphics());
        }
        this._button = this.createButton();
        this.addChild(this._button);
        if (this._autoClose) {
            this._autoCloseTimer = this.createAutoCloseTimer();
            this.addChild(this._autoCloseTimer);
        }
    }
    createButton() {
        const text = Translation_1.Translation.translate(this._config.buttonText ? this._config.buttonText : "CONTINUE");
        const textStyle = this.getScaledButtonTextStyle();
        const button = new NineSliceButton_1.NineSliceButton(() => this.onButtonClick(), ` ${text} `, textStyle, this._config.buttonBackgroundConfig);
        button.enabled = false;
        return button;
    }
    onButtonClick() {
        this._onButtonClickCallback();
    }
    getScaledButtonTextStyle() {
        const style = this._config.buttonTextStyle ? this._config.buttonTextStyle : this.DEFAULT_BUTTON_TEXT_STYLE;
        if (!(0, MathHelper_1.isNumber)(style.fontSize)) {
            debugger;
            throw new Error("Error: IntoView.getScaledButtonTextStyle(): please use number fontSize!");
        }
        style.fontSize = style.fontSize * this._deviceScale;
        return style;
    }
    createAutoCloseTimer() {
        const textsSingular = Translation_1.Translation.translate("Closes in ${sec} second").split("${sec}");
        const textsPlural = Translation_1.Translation.translate("Closes in ${sec} seconds").split("${sec}");
        return new CountDownTimer_1.CountDownTimer(this._config.autoCloseText ? this._config.autoCloseText : {
            prefixTextSingular: textsSingular[0],
            prefixTextPlural: textsPlural[0],
            postfixSecondTextSingular: textsSingular[1],
            postfixSecondsTextPlural: textsPlural[1]
        });
    }
    onResize(resizeData) {
        if (!this._isShowing) {
            this._isResizeDirty = true;
            return;
        }
        this._screenWidth = resizeData.width / this._layer.scale.x;
        this._screenHeight = resizeData.height / this._layer.scale.y;
        this._orientationScale = resizeData.orientation === Orientation_1.Orientation.PORTRAIT ? (this._config.portraitScale ? this._config.portraitScale : this.DEFAULT_PORTRAIT_SCALE) : 1;
        if (this.createBackground && this.onResizeBackground) {
            this.onResizeBackground(resizeData);
        }
        this.onResizeButton(resizeData);
        if (this._autoClose) {
            this.onResizeAutoCloseTimer(resizeData);
        }
        if (this.createGameGraphics && this.onResizeGameGraphics) {
            this.onResizeGameGraphics(resizeData);
        }
        //Negate layer scaling offset.
        this.x = -this._layer.x / this._layer.scale.x;
        this.y = -this._layer.y / this._layer.scale.y;
        this._isResizeDirty = false;
    }
    onResizeButton(data) {
        const buttonSize = this.getScaledButtonSize();
        this._button.setSize(buttonSize.x, buttonSize.y, this._layer.scale.x * this._orientationScale);
        this._button.scale.set(this._orientationScale, this._orientationScale);
        this.setButtonPosition(data);
    }
    getScaledButtonSize() {
        const buttonSize = this._config.buttonSize ? this._config.buttonSize : this.DEFAULT_BUTTON_SIZE;
        return new PIXI.Point(buttonSize.x * this._deviceScale, buttonSize.y * this._deviceScale);
    }
    // for overriding.
    setButtonPosition(data) {
        this._button.position.set(this._screenWidth * 0.5, this._screenHeight * 0.85);
    }
    onResizeAutoCloseTimer(data) {
        const scale = this._orientationScale * this._deviceScale;
        this._autoCloseTimer.setScale(scale);
        this._autoCloseTimer.position.set(this._button.x, this._button.y + this._button.height * 0.5 + this._autoCloseTimer.height);
    }
    show(data, onShowComplete) {
        this._isShowing = true;
        if (this._isResizeDirty) {
            this.onResize(this._resizeData);
        }
        this._layer.addChild(this);
        this.startPresentation(data, onShowComplete);
    }
    // For overriding.
    startPresentation(data, onShowComplete) {
        if (onShowComplete) {
            onShowComplete();
        }
    }
    close(closeCallback) {
        if (!this._isShowing) {
            return;
        }
        this.stopPresentation(closeCallback);
    }
    // For overriding.
    stopPresentation(closeCallback) {
        this._layer.removeChild(this);
        this._button.enabled = false;
        if (closeCallback) {
            closeCallback();
        }
        this._isShowing = false;
    }
    enableButton() {
        this._button.enabled = true;
    }
    startTimer(time, onCompleteCallback) {
        if (!this._autoClose) {
            return;
        }
        this._autoCloseTimer.start(time, onCompleteCallback);
    }
    stopTimer() {
        if (!this._autoClose) {
            return;
        }
        this._autoCloseTimer.abort();
    }
}
exports.ScreenView = ScreenView;
//# sourceMappingURL=ScreenView.js.map