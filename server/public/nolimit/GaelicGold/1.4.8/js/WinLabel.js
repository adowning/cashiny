"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinLabel = void 0;
const LabeledValue_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/LabeledValue");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
/**
 * Class description
 *
 * Created: 2019-12-16
 * @author jonas
 */
class WinLabel extends LabeledValue_1.LabeledValue {
    constructor(name, labelText, initValue, labelStyle, valueStyle) {
        super(name, labelText, initValue, labelStyle, valueStyle);
        this.setAlignment();
        this.setPivot();
    }
    setAlignment() {
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._label.position.set(0, this._value.height - this._label.height - 4);
            this._value.position.set(this._label.width + this._margin, 0);
        }
        else {
            if (this._label.width > this._value.width) {
                this._label.position.set(0, 0);
                this._value.position.set(this._label.width - this._value.width, this._label.height);
            }
            else {
                this._label.position.set(this._value.width - this._label.width, 0);
                this._value.position.set(0, this._label.height);
            }
        }
    }
    setPivot() {
        this.pivot.set(this.width * this._anchorPoint.x, this.height * this._anchorPoint.y);
    }
}
exports.WinLabel = WinLabel;
//# sourceMappingURL=WinLabel.js.map