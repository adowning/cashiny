"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Label = exports.Margin = void 0;
const GuiUtils_1 = require("../utils/GuiUtils");
const GuiDefaults_1 = require("../default/GuiDefaults");
const NLCText_1 = require("../../display/NLCText");
class Margin {
    constructor(top, right, bottom, left) {
        this.top = top;
        this.right = right ? right : this.top;
        this.bottom = bottom ? bottom : this.top;
        this.left = left ? left : this.right;
    }
}
exports.Margin = Margin;
/**
 * Class description
 *
 * Created: 2019-09-17
 * @author jonas
 */
class Label extends PIXI.Container {
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get width() {
        return this._label.width;
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get height() {
        return this._label.height;
    }
    get tint() {
        return this._label.tint;
    }
    set tint(value) {
        this._label.tint = value;
    }
    constructor(value, textStyle = GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_STYLE) {
        super();
        this._label = new NLCText_1.NLCText(value, textStyle.clone());
        this.name = "Label[" + value + "]";
        this.anchor = new PIXI.ObservablePoint((...params) => this.onAnchorUpdate(params), this);
        this.addChild(this._label);
    }
    setColor(argb) {
        const style = this._label.getStyleClone();
        style.fill = GuiUtils_1.GuiUtils.getColorFromARGB(argb);
        this._label.setStyle(style);
        this.alpha = GuiUtils_1.GuiUtils.getAlphaFromARGB(argb);
    }
    addBackPlate(plate, updateCallback) {
        this._backPlateUpdateCallback = updateCallback;
        this.addChild(plate);
        this.addChild(this._label);
        this.updateBackPlate();
    }
    set text(value) {
        this._label.text = value;
        this.updateBackPlate();
    }
    get text() {
        return this._label.text;
    }
    getStyleClone() {
        return this._label.getStyleClone();
    }
    setStyle(newStyle) {
        this._label.setStyle(newStyle);
    }
    onAnchorUpdate(params) {
        this._label.anchor.set(this.anchor.x, this.anchor.y);
        this.updateBackPlate();
    }
    updateBackPlate() {
        if (this._backPlateUpdateCallback) {
            this._backPlateUpdateCallback();
        }
    }
}
exports.Label = Label;
//# sourceMappingURL=Label.js.map