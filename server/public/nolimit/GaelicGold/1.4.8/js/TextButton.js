"use strict";
/**
 * Created by Jerker Nord on 2016-04-19.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextButton = void 0;
const Helper_1 = require("../utils/Helper");
const Button_1 = require("./Button");
class TextButton extends Button_1.Button {
    get buttonText() {
        return this._buttonText;
    }
    constructor(textures, onClickedCallback, buttonText, textStyle) {
        super(textures, onClickedCallback);
        this._buttonTextString = buttonText;
        this._textStyle = textStyle != undefined ? textStyle : this.getDefaultTextStyle();
        this.createText();
    }
    createText() {
        this._buttonText = new PIXI.Text(this._buttonTextString, this._textStyle);
        Helper_1.Helper.shrinkTextWidth(this._buttonTextString, this._buttonText, this.width / this.scale.x);
        this._buttonText.style.align = "center";
        this._buttonText.anchor.set(0.5, 0.5);
        this.addChild(this._buttonText);
    }
    getDefaultTextStyle() {
        return {
            fontFamily: 'Arial',
            fontSize: 11,
            fill: '#000000',
            wordWrap: false
        };
    }
    updateText(text) {
        this._buttonTextString = text;
        this._buttonText.text = text;
        this._buttonText.style.fontSize = this._textStyle.fontSize;
        Helper_1.Helper.shrinkTextWidth(this._buttonTextString, this._buttonText, this.width);
    }
}
exports.TextButton = TextButton;
//# sourceMappingURL=TextButton.js.map