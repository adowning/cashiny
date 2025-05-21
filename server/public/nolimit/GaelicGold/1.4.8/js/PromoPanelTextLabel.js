"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLabelAdvanced = exports.PromoPanelTextLabel = void 0;
const Helper_1 = require("../utils/Helper");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
class PromoPanelTextLabel extends Label_1.Label {
    constructor(value, textStyle, options) {
        super(value, textStyle.clone());
        this._textStyle = textStyle.clone();
        this._options = options;
        this._fontSize = typeof (this._textStyle.fontSize) === "string" ? parseInt(this._textStyle.fontSize) : this._textStyle.fontSize;
        this.defaultSize = this._fontSize;
        this.anchor.set(0.5);
    }
    onResize() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        const isLandscape = NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(bounds);
        const maxWidth = isLandscape ? this._options.landscapeMaxWidth : this._options.portraitMaxWidth;
        const style = this.getStyleClone();
        const fontScale = (typeof (style.fontSize) === "string" ? parseInt(style.fontSize) : style.fontSize) / this.defaultSize;
        const orgSizeWidth = this.width / fontScale;
        const newScale = maxWidth / orgSizeWidth;
        const newFontSize = Math.min(Math.floor(this.defaultSize * newScale), this.defaultSize);
        if (newFontSize != this._fontSize) {
            this._fontSize = newFontSize;
            this.setStyle(style);
        }
        PromoPanelConfig_1.PromoPanelConfig.TEXT_LABEL_DRAW_BORDER && this.drawBorder();
    }
    setStyle(newStyle) {
        newStyle.fontSize = this._fontSize;
        super.setStyle(newStyle);
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
            this._border.drawRect(0, 0, this._options.portraitMaxWidth, this.height);
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
exports.PromoPanelTextLabel = PromoPanelTextLabel;
class TextLabelAdvanced extends PromoPanelTextLabel {
    get latestValue() {
        return this._latestValue;
    }
    set latestValue(value) {
        this._latestValue = value;
    }
}
exports.TextLabelAdvanced = TextLabelAdvanced;
//# sourceMappingURL=PromoPanelTextLabel.js.map