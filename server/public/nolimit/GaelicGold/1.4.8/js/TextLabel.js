"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLabel = void 0;
const Helper_1 = require("../../../utils/Helper");
const NolimitApplication_1 = require("../../../NolimitApplication");
class TextLabel extends PIXI.Text {
    constructor(value, textStyle, options) {
        super(value, textStyle.clone());
        this._textStyle = textStyle.clone();
        this._options = options;
        this.init();
    }
    init() {
        this.anchor.set(0.5);
    }
    onResize() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        const isLandscape = NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(bounds);
        this.style.fontSize = this._textStyle.fontSize;
        Helper_1.Helper.shrinkTextWidth(this.value, this, isLandscape ? this._options.landscapeMaxWidth : this._options.portraitMaxWith);
    }
    drawBorder() {
        if (!this._border) {
            this._border = new PIXI.Graphics();
            this._border.name = this.text + "_BORDER";
            this.parent && this.parent.addChild(this._border);
        }
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        const isLandscape = NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(bounds);
        this._border.clear();
        this._border.beginFill(0x000000);
        this._border.alpha = 0.2;
        if (isLandscape) {
            this._border.drawRect(0, 0, this._options.landscapeMaxWidth, this.height);
        }
        else {
            this._border.drawRect(0, 0, this._options.portraitMaxWith, this.height);
        }
        this._border.pivot.set(this._border.width * this.anchor.x, this._border.height * this.anchor.y);
        this._border.position.set(this.x, this.y);
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        this.text = value;
        this.onResize();
    }
    get textStyle() {
        return this._textStyle;
    }
}
exports.TextLabel = TextLabel;
//# sourceMappingURL=TextLabel.js.map