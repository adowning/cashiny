"use strict";
/**
 * Created by Ning Jiang on 1/29/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickAndClickView = void 0;
const BaseView_1 = require("../base/BaseView");
const CountDownTimer_1 = require("../component/CountDownTimer");
const ResourcesGroupName_1 = require("../resource/ResourcesGroupName");
const Orientation_1 = require("../stage/Orientation");
const StageManager_1 = require("../stage/StageManager");
const Translation_1 = require("../translation/Translation");
const UserAgent_1 = require("../useragent/UserAgent");
class PickAndClickView extends BaseView_1.BaseView {
    constructor(config, autoClick = false) {
        super(config.resourceGroup ? config.resourceGroup : ResourcesGroupName_1.ResourcesGroupName.MAIN);
        this.DEFAULT_MOBILE_SCALE = 1.6;
        this.DEFAULT_PORTRAIT_SCALE = 1.7;
        this._isShowing = false;
        this._autoClicked = false;
        this._autoClick = false;
        this._config = config;
        this._onButtonClickCallback = config.onButtonClickCallback;
        this._autoClick = autoClick;
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
        if (this._autoClick) {
            this._autoClickTimer = this.createAutoClickTimer();
            this.addChild(this._autoClickTimer);
        }
    }
    createAutoClickTimer() {
        const textsSingular = Translation_1.Translation.translate("Auto select in ${sec} second").split("${sec}");
        const textsPlural = Translation_1.Translation.translate("Auto select in ${sec} seconds").split("${sec}");
        return new CountDownTimer_1.CountDownTimer(this._config.autoClickText ? this._config.autoClickText : {
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
        this.onResizeButtons(resizeData);
        if (this._autoClick) {
            this.onResizeAutoClickTimer(resizeData);
        }
        if (this.createGameGraphics && this.onResizeGameGraphics) {
            this.onResizeGameGraphics(resizeData);
        }
        //Negate layer scaling offset.
        this.x = -this._layer.x / this._layer.scale.x;
        this.y = -this._layer.y / this._layer.scale.y;
        this._isResizeDirty = false;
    }
    onResizeAutoClickTimer(data) {
        const scale = this._orientationScale * this._deviceScale;
        this._autoClickTimer.setScale(scale);
        this.setAutoClickTimerPosition(data);
    }
    // for overriding.
    setAutoClickTimerPosition(data) {
        this._autoClickTimer.position.set(this._screenWidth / 2, this._screenHeight * 0.9);
    }
    show(buttonConfig, data, onShowComplete) {
        this._isShowing = true;
        if (this._buttons == null || this._buttons.length === 0 || this._config.recreateButtons == true) {
            this._buttons = this.createButtons(buttonConfig);
            this._isResizeDirty = true;
        }
        if (this._autoClick) {
            this._autoClickTimer.visible = false;
        }
        if (this._isResizeDirty) {
            this.onResize(this._resizeData);
        }
        this._layer.addChild(this);
        this.startPresentation(data, onShowComplete);
    }
    createButtons(buttonConfig) {
        const buttons = [];
        buttonConfig.forEach((config, index) => {
            const button = this.createButton(index, config, this._onButtonClickCallback);
            button.enabled = false;
            buttons.push(button);
        });
        return buttons;
    }
    // For overriding.
    startPresentation(data, onShowComplete) {
        if (onShowComplete) {
            onShowComplete();
        }
    }
    close(data, closeCallback) {
        if (!this._isShowing) {
            return;
        }
        this.stopPresentation(data, closeCallback);
    }
    // For overriding.
    stopPresentation(data, closeCallback) {
        this._layer.removeChild(this);
        if (this._config.recreateButtons) {
            while (this._buttons.length > 0) {
                this.removeChild(this._buttons.pop());
            }
        }
        else {
            // TODO: reset buttons.
        }
        this._isShowing = false;
        this._autoClicked = false;
        if (closeCallback) {
            closeCallback();
        }
    }
    enableButtons(enabled) {
        this._buttons.forEach((button) => {
            button.enabled = enabled;
        });
    }
    startTimer(time) {
        if (!this._autoClick) {
            return;
        }
        this._autoClickTimer.visible = true;
        this._autoClickTimer.start(time, () => this.autoClickButton());
    }
    autoClickButton() {
        const random = Math.floor(Math.random() * this._buttons.length);
        this.clickButton(random, true);
    }
    clickButton(index, autoClicked = false) {
        if (index < 0) {
            debugger;
            throw new Error(`PickAndClickView.clickButton() button index is -1!`);
        }
        this._autoClicked = autoClicked;
        this._buttons[index].click();
    }
    stopTimer() {
        if (!this._autoClick) {
            return;
        }
        this._autoClickTimer.abort();
        this._autoClickTimer.visible = false;
    }
}
exports.PickAndClickView = PickAndClickView;
//# sourceMappingURL=PickAndClickView.js.map