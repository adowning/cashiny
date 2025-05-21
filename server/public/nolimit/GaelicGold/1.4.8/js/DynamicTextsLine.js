"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicTextsLine = void 0;
/**
 * Created by Ning Jiang on 9/15/2016.
 * Copied from Oktoberfest and refactored by Ning Jiang on 2/19/2018.
 */
const SharpText_1 = require("./SharpText");
class DynamicTextsLine extends PIXI.Container {
    get verticalAlignment() {
        return this._verticalAlignment;
    }
    set verticalAlignment(value) {
        this._verticalAlignment = value;
        this.arrange();
    }
    get textSpacing() {
        return this._textSpacing;
    }
    set textSpacing(value) {
        this._textSpacing = value;
        this.arrange();
    }
    constructor(verticalAlignment = 0.5, textSpacing = 0, anchor) {
        super();
        this._textSpacing = 0;
        this._internalScale = 1;
        this._anchor = anchor ? anchor : new PIXI.Point(0.5, 0.5);
        this._verticalAlignment = verticalAlignment;
        this._textSpacing = textSpacing;
        this._texts = [];
    }
    createText(textString, style) {
        const text = new SharpText_1.SharpText(textString, style);
        this._texts.push(text);
        this.addChild(text);
        return text;
    }
    setAnchor(x, y) {
        y = y ? y : x;
        this._anchor.set(x, y);
        this.arrange();
    }
    setScale(value) {
        if (value === this._internalScale) {
            return;
        }
        this._internalScale = value;
        for (let textFiled of this._texts) {
            textFiled.setScale(value);
        }
        this.arrange();
    }
    arrange() {
        let textAdvance = 0;
        for (let text of this._texts) {
            text.position.set(textAdvance, 0);
            textAdvance += text.width + this._textSpacing * this._internalScale;
        }
        this.updateVerticalAlignment();
        this.pivot.set(this.width * this._anchor.x, this.height * this._anchor.y);
    }
    updateVerticalAlignment() {
        let maxHeight = 0;
        for (let text of this._texts) {
            text.anchor.set(0, this._verticalAlignment);
            maxHeight = text.height > maxHeight ? text.height : maxHeight;
        }
        for (let text of this._texts) {
            text.y = Math.ceil(maxHeight * this._verticalAlignment);
        }
    }
}
exports.DynamicTextsLine = DynamicTextsLine;
//# sourceMappingURL=DynamicTextsLine.js.map