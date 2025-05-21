"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleLabelButton = exports.createDefaultButtonStroke = exports.createDefaultButtonBackPlate = void 0;
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../../../../config/PromoPanelAssetConfig");
const GuiToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/GuiToggleButton");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const ToggleState_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/ToggleState");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
/**
 * Created by Jonas Wålekvist on 2019-10-16.
 */
function createDefaultButtonBackPlate() {
    const backPlate = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.BUTTON_PLATE_20), 20, 20, 20, 20);
    backPlate.tint = 0x000000;
    backPlate.alpha = 0.15;
    return backPlate;
}
exports.createDefaultButtonBackPlate = createDefaultButtonBackPlate;
function createDefaultButtonStroke() {
    const backPlate = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.BUTTON_STROKE_20), 20, 20, 20, 20);
    backPlate.tint = 0xFFFFFF;
    backPlate.alpha = 0.6;
    return backPlate;
}
exports.createDefaultButtonStroke = createDefaultButtonStroke;
class SimpleLabelButton extends GuiToggleButton_1.GuiToggleButton {
    constructor(name, labelString = "", labelStyle, onColors, offColors, backPlate, stroke) {
        super(name, () => this.toggleCallback());
        labelStyle = labelStyle ? labelStyle : GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE;
        onColors = onColors ? onColors : new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFC00, 0xFFFFFC00, 0xFFFFFC00, 0x33FFFC00);
        offColors = offColors ? offColors : new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        this._colorSets = new ToggleState_1.ToggleStateSet(onColors, offColors);
        this.value = undefined;
        this._label = new Label_1.Label(labelString, labelStyle);
        this._backplate = backPlate ? backPlate : createDefaultButtonBackPlate();
        this._stroke = stroke ? stroke : createDefaultButtonStroke();
        this.addChild(this._backplate);
        this.addChild(this._stroke);
        this.addChild(this._label);
    }
    get label() {
        return this._label;
    }
    get backplate() {
        return this._backplate;
    }
    set backplate(value) {
        this._backplate = value;
    }
    get stroke() {
        return this._stroke;
    }
    set stroke(value) {
        this._stroke = value;
    }
    setSize(width, height) {
        this._backplate.width = width;
        this._backplate.height = height;
        this._stroke.width = width;
        this._stroke.height = height;
        this._label.anchor.set(0.5, 0.5);
        this._label.position.set(width * 0.5, height * 0.5);
    }
    resizeButtonToLabelWithMargin(top = 0, right = 0, bottom = 0, left = 0) {
        this.setSize(this._label.width + left + right, this._label.height + top + bottom);
        this._label.anchor.set(0, 0);
        this._label.position.set(left, top);
    }
    onPointerStateUpdate(state) {
        this.setColors();
    }
    setColors() {
        const currentColorSet = this._colorSets.getItem(this.toggleState);
        const argb = currentColorSet.getItem(this.pointerState);
        this._label.setColor(argb);
        this._backplate.alpha = this.toggleState * GuiUtils_1.GuiUtils.getAlphaFromARGB(argb);
        this._stroke.tint = GuiUtils_1.GuiUtils.getColorFromARGB(argb);
        //this._stroke.alpha = GuiUtils.getAlphaFromARGB(argb);
        this._stroke.alpha = (1 - this.toggleState) * GuiUtils_1.GuiUtils.getAlphaFromARGB(argb);
    }
    toggleCallback() {
        this.setColors();
    }
}
exports.SimpleLabelButton = SimpleLabelButton;
//# sourceMappingURL=SimpleLabelButton.js.map