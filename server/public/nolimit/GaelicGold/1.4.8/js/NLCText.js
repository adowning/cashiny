"use strict";
/**
 * Created by jonas on 2023-03-17.
 *
 * Replacement for PIXI.Text usage. It uses PIXI.Text, but renders that to a texture and destroys the underlying
 * PIXI.Text object and all it's components. This is done to reduce memory leakage due to "undestoryed "text fields.
 * PIXI.Text cashes it's underlying canvas which is very easy to miss.
 *
 * The drawback is an even more performance heavy setup. So it's not adviced to unse this object for text that changes
 * a lot. Consider using bitmap fonts for that, or normal PIXI.Text, but be sure to destory it when you are done with it.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLCText = void 0;
const NLCStaticText_1 = require("./NLCStaticText");
class NLCText extends NLCStaticText_1.NLCStaticText {
    get text() {
        return this._text;
    }
    set text(value) {
        this._text = value;
        this.remakeTexture();
    }
    constructor(text, style) {
        super(text, style);
        this._text = text;
        this._style = style != undefined ? style : new PIXI.TextStyle();
    }
    ;
    getStyleClone() {
        return this._style.clone();
    }
    setStyle(newStyle) {
        this._style = newStyle;
        this.remakeTexture();
    }
    remakeTexture() {
        this.texture = NLCStaticText_1.NLCStaticText.renderTextToTexture(new PIXI.Text(this._text, this._style));
    }
}
exports.NLCText = NLCText;
//# sourceMappingURL=NLCText.js.map