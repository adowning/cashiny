"use strict";
/**
 * Created by Ning Jiang on 2/8/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmapCountUp = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const Currency_1 = require("../balance/Currency");
const GameConfig_1 = require("../gameconfig/GameConfig");
class BitmapCountUp extends PIXI.BitmapText {
    get shrinkSize() {
        return this._shrinkSize;
    }
    set shrinkSize(value) {
        this._shrinkSize = value;
    }
    get maxTextWidth() {
        return this._maxTextWidth;
    }
    set maxTextWidth(value) {
        this._maxTextWidth = value;
        if (this.parent) {
            this.updateCountUpTextPivot();
        }
        else {
            this._isResizeDirty = true;
        }
    }
    get currentValue() {
        return this._currentValue;
    }
    set currentValue(value) {
        this._currentValue = value;
    }
    get scaling() {
        return this._scaling;
    }
    set scaling(value) {
        this._scaling = value;
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get width() {
        return this.textWidth;
    }
    constructor(config) {
        super("0", {
            fontName: config.style.font.name ? config.style.font.name : "",
            fontSize: config.style.font.size,
            align: config.style.align,
            tint: config.style.tint ? config.style.tint : 0xffffff
        });
        this._highestTriggeredAnchorIndex = -1;
        this._isCountingUp = false;
        this._scaling = 1;
        this._isResizeDirty = false;
        this._evenWidth = true;
        this._anchors = [];
        this._externalOnUpdateCallbacks = [];
        this._onWidthChangeCallback = config.onWidthChangeCallback;
        this._numberFormat = config.numberFormat;
        this._originalFontSize = config.style.font.size;
        this._evenWidth = config.evenWidth !== false;
        this.on("added", this.onAdded);
    }
    onAdded() {
        if (this._isResizeDirty) {
            this.updateCountUpTextPivot();
        }
    }
    addAnchor(anchor) {
        if (this._isCountingUp) {
            debugger;
            throw new Error("Error: BitmapCountUp.addAnchor():Not allow to edit anchors while counting up!");
        }
        this._anchors.push(anchor);
        this._anchors.sort((a, b) => { return a.value - b.value; });
    }
    clearAllAnchors() {
        if (this._isCountingUp) {
            debugger;
            throw new Error("Error: BitmapCountUp.clearAllAnchors():Not allow to edit anchors while counting up!");
        }
        this._anchors = [];
    }
    addExternalOnUpdateCallback(callback) {
        this._externalOnUpdateCallbacks.push(callback);
    }
    getCountUpAnimation(fromValue, toValue, animationConfig, onCompleteCallback) {
        animationConfig.scaling = animationConfig.scaling || { from: 1, to: 1 };
        const countUpTween = new gsap_1.TimelineLite();
        countUpTween.add(gsap_1.TweenLite.fromTo(this, animationConfig.duration, {
            currentValue: fromValue,
            scaling: animationConfig.scaling.from,
        }, {
            currentValue: toValue,
            scaling: animationConfig.scaling.to,
            ease: animationConfig.ease ? animationConfig.ease : gsap_1.Power3.easeInOut,
            onStart: () => {
                if (this._isCountingUp) {
                    Logger_1.Logger.logDev(`BigmapCountUp.getCountUpAnimation():Start count up when it's already counting. it might be no problem. just log for warning.`);
                }
                if (this._shrinkSize) {
                    this.fontSize = this._originalFontSize;
                }
                this.onCountUpUpdate();
                this.updateCountUpTextPivot();
                this._isCountingUp = true;
            },
            onUpdate: () => this.onCountUpUpdate(),
            onComplete: () => {
                this.resetCountUp();
                this.onCountUpUpdate();
                if (onCompleteCallback) {
                    onCompleteCallback();
                }
            }
        }));
        return countUpTween;
    }
    onCountUpUpdate() {
        const lastStringLength = this.text.length;
        this.text = Currency_1.Currency.formatValue(this._currentValue, this._numberFormat);
        this.scale.set(this.scaling, this.scaling);
        if (!this._evenWidth || lastStringLength != this.text.length) {
            this.updateCountUpTextPivot();
            if (this._onWidthChangeCallback) {
                this._onWidthChangeCallback();
            }
        }
        // Play external callbacks.
        for (let i = 0; i < this._externalOnUpdateCallbacks.length; i++) {
            this._externalOnUpdateCallbacks[i]();
        }
        // Play passed unused anchors.
        if (this._highestTriggeredAnchorIndex < (this._anchors.length - 1)) {
            for (let i = this._highestTriggeredAnchorIndex + 1; i < this._anchors.length; i++) {
                if (this._anchors[i].value <= this._currentValue) {
                    this._anchors[i].callback();
                    if (this._anchors[i].oneTimeUse) {
                        this._anchors.splice(i, 1);
                        i--;
                    }
                    else {
                        this._highestTriggeredAnchorIndex = i;
                    }
                }
            }
        }
    }
    updateCountUpTextPivot() {
        if (!this.parent) {
            this._isResizeDirty = true;
            return;
        }
        this.dirty = true;
        this.updateTransform(); //Force update transform so that the textWidth are updated.
        if (this._shrinkSize) {
            if (this._maxTextWidth == null || this._maxTextWidth <= 0) {
                this._maxTextWidth = GameConfig_1.GameConfig.instance.REEL_AREA_WIDTH;
            }
            while (this.textWidth * this._scaling > this._maxTextWidth) {
                this.fontSize--;
                this.dirty = true;
                this.updateTransform();
            }
        }
        this.pivot.set(this.textWidth * 0.5, this.height * 0.5);
        this._isResizeDirty = false;
    }
    resetCountUp() {
        this._isCountingUp = false;
        this._highestTriggeredAnchorIndex = -1;
    }
}
exports.BitmapCountUp = BitmapCountUp;
//# sourceMappingURL=BitmapCountUp.js.map