"use strict";
/**
 * Created by Jonas Wålekvist on 2018-05-29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharpText = void 0;
class SharpText extends PIXI.Text {
    constructor(text = "", style, canvas) {
        super(text, style, canvas);
        if (typeof this.style.fontSize === 'string') {
            if (this.style.fontSize.indexOf("em") > -1) {
                debugger;
                throw new Error("SharpText.constructor(), I am lazy so I don't want to parse em, please use number or px.");
            }
            this.style.fontSize = parseInt(this.style.fontSize);
        }
        this._originalSize = this.style.fontSize;
    }
    setScale(scale) {
        this.style.fontSize = Math.ceil(this._originalSize * scale);
    }
}
exports.SharpText = SharpText;
//# sourceMappingURL=SharpText.js.map