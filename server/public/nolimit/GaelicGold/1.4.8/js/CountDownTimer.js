"use strict";
/**
 * Created by Ning Jiang on 9/15/2016.
 * Copied from Oktoberfest and refactored by Ning Jiang on 2/19/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountDownTimer = void 0;
const DynamicTextsLine_1 = require("./DynamicTextsLine");
class CountDownTimer extends PIXI.Container {
    constructor(config) {
        super();
        this._prefixSingularString = config.prefixTextSingular;
        this._prefixPluralString = config.prefixTextPlural;
        this._postfixSecondsPluralString = config.postfixSecondsTextPlural;
        this._postfixSecondSingularString = config.postfixSecondTextSingular;
        this._textPrefixStyle = config.prefixTextStyle == null ? CountDownTimer.DEFAULT_TEXT_STYLE : config.prefixTextStyle;
        this._textTimeStyle = config.timeTextStyle == null ? CountDownTimer.DEFAULT_TEXT_TIME_STYLE : config.timeTextStyle;
        this._textSecondsStyle = config.postfixTextStyle == null ? CountDownTimer.DEFAULT_TEXT_STYLE : config.postfixTextStyle;
        this._textSpacing = config.textSpacing == null ? CountDownTimer.DEFAULT_TEXT_SPACING : config.textSpacing;
        this._isRunning = false;
        this.initAnimations();
    }
    initAnimations() {
        this._textsLine = new DynamicTextsLine_1.DynamicTextsLine(0.5, this._textSpacing);
        this.addChild(this._textsLine);
        this._textPrefix = this._textsLine.createText(this._prefixPluralString, this._textPrefixStyle);
        this._textTime = this._textsLine.createText("-", this._textTimeStyle);
        this._textSecondsPostfix = this._textsLine.createText(this._postfixSecondsPluralString, this._textSecondsStyle);
        this._textsLine.arrange();
    }
    setScale(scale) {
        this._textsLine.setScale(scale);
    }
    start(time, completeCallback = null) {
        this.abort();
        this._timeTotal = time;
        this._timeLeft = this._timeTotal + 1;
        this._completeCallback = completeCallback;
        this.onTimer();
        this._timer = window.setInterval(() => this.onTimer(), 1000);
        this._isRunning = true;
    }
    abort() {
        if (!this._isRunning) {
            return;
        }
        window.clearInterval(this._timer);
        this._isRunning = false;
    }
    onTimer() {
        this._timeLeft--;
        this._textTime.text = this._timeLeft.toString();
        this._textPrefix.text = this._timeLeft === 1 ? this._prefixSingularString : this._prefixPluralString;
        this._textSecondsPostfix.text = this._timeLeft === 1 ? this._postfixSecondSingularString : this._postfixSecondsPluralString;
        this._textsLine.arrange();
        if (this._timeLeft === 0) {
            this.abort();
            if (this._completeCallback) {
                this._completeCallback();
            }
        }
    }
}
CountDownTimer.DEFAULT_TEXT_STYLE = {
    fontFamily: "Open Sans",
    fontSize: "13px",
    fontWeight: "300",
    fill: "#ffffff"
};
CountDownTimer.DEFAULT_TEXT_TIME_STYLE = {
    fontFamily: "Open Sans",
    fontSize: "13px",
    fontWeight: "700",
    fill: "#ffffff"
};
CountDownTimer.DEFAULT_TEXT_SPACING = 5;
exports.CountDownTimer = CountDownTimer;
//# sourceMappingURL=CountDownTimer.js.map