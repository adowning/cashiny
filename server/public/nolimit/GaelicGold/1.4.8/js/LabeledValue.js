"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabeledValue = void 0;
/**
 * Created by Jonas Wålekvist on 2019-09-26.
 */
const Label_1 = require("./Label");
const GuiDefaults_1 = require("../default/GuiDefaults");
class LabeledValue extends PIXI.Container {
    get label() {
        return this._label;
    }
    get value() {
        return this._value;
    }
    constructor(name, labelText, initValue, labelStyle = GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_STYLE, valueStyle = GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_VALUE_STYLE) {
        super();
        this._margin = 10;
        this._anchorPoint = new PIXI.Point(0, 0);
        this.name = name;
        this._label = new Label_1.Label(labelText, labelStyle);
        this._value = new Label_1.Label(initValue.toString(), valueStyle);
        this.addChild(this._label);
        this.addChild(this._value);
        this.setAlignment();
    }
    setTextSize(value) {
        const labelStyle = this._label.getStyleClone();
        labelStyle.fontSize = value;
        const valueStyle = this._value.getStyleClone();
        valueStyle.fontSize = value;
        this._label.setStyle(labelStyle);
        this._value.setStyle(valueStyle);
        this.setAlignment();
        this.setPivot();
    }
    setAlignment() {
        this._label.position.set(0, 0);
        this._value.position.set(this._label.width + this._margin, 0);
    }
    setColor(color) {
        this._label.tint = color;
        this._value.tint = color;
    }
    setValue(value) {
        this._value.text = value;
        this.setAlignment();
        this.setPivot();
    }
    setLabel(string) {
        this._label.text = string;
        this.setAlignment();
        this.setPivot();
    }
    setPivot() {
        this.pivot.set(this.width * this._anchorPoint.x, this.height * this._anchorPoint.y);
    }
    setAnchor(x, y) {
        this._anchorPoint = new PIXI.Point(x, y);
        this.setAlignment();
        this.setPivot();
    }
}
exports.LabeledValue = LabeledValue;
//# sourceMappingURL=LabeledValue.js.map