"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignLabel = exports.SignLabelAlign = void 0;
const PromoPanelTextLabel_1 = require("../../PromoPanelTextLabel");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const CurrencyUtils_1 = require("../../../utils/CurrencyUtils");
var SignLabelAlign;
(function (SignLabelAlign) {
    SignLabelAlign[SignLabelAlign["LEFT"] = 0] = "LEFT";
    SignLabelAlign[SignLabelAlign["CENTER"] = 1] = "CENTER";
    SignLabelAlign[SignLabelAlign["RIGHT"] = 2] = "RIGHT";
})(SignLabelAlign = exports.SignLabelAlign || (exports.SignLabelAlign = {}));
class SignLabel extends PIXI.Container {
    constructor(id, signPath, textStyle, landscapeMaxWidth, portraitMaxWith) {
        super();
        this._allowNegative = false;
        this._margin = 5;
        this._align = SignLabelAlign.LEFT;
        this.useDecimalCutoff = true;
        this.name = "SignLabel_" + id;
        this.mainContainer = new PIXI.Container();
        this._sign = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(signPath));
        this._sign.anchor.set(0, 0.5);
        this.mainContainer.addChild(this._sign);
        this._label = new PromoPanelTextLabel_1.PromoPanelTextLabel("", textStyle || PromoPanelTextStyles_1.PromoPanelTextStyles.AS_REPLAY_NUMBER_TEXT_STYLE, {
            landscapeMaxWidth: landscapeMaxWidth || 158,
            portraitMaxWidth: portraitMaxWith || 158
        });
        this._label.anchor.set(0, 0.5);
        this._label.position.set(this._sign.width + this._margin, 0);
        this.mainContainer.addChild(this._label);
        this.addChild(this.mainContainer);
        this.value = 0;
    }
    set value(value) {
        if (this._value == value) {
            return;
        }
        this._value = value;
        if (this._allowNegative || this._value > -1) {
            if (this.useDecimalCutoff) {
                this._label.value = CurrencyUtils_1.CurrencyUtils.formatWithDecimalCutOff(this.value);
            }
            else {
                this._label.value = CurrencyUtils_1.CurrencyUtils.format(this.value);
            }
        }
        this.align(this._align);
    }
    align(value) {
        this._align = value;
        if (this._align == SignLabelAlign.RIGHT) {
            this.mainContainer.pivot.set(this.mainContainer.width, 0);
        }
        else if (this._align == SignLabelAlign.CENTER) {
            this.mainContainer.pivot.set(this.mainContainer.width * 0.5, 0);
        }
        else {
            this.mainContainer.pivot.set(0, 0);
        }
    }
    set allowNegative(value) {
        this._allowNegative = value;
    }
    get value() {
        return this._value;
    }
    onResize() {
        this._label.onResize();
    }
}
exports.SignLabel = SignLabel;
//# sourceMappingURL=SignLabel.js.map