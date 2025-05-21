"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoPanelLabelButton = exports.createDefaultButtonStroke = exports.createDefaultButtonBackPlate = void 0;
/**
 * Created by Jonas Wålekvist on 2019-10-16.
 */
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const GuiToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/GuiToggleButton");
const ToggleState_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/ToggleState");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
const PromoPanelAssetConfig_1 = require("../config/PromoPanelAssetConfig");
const PromoPanelTextStyles_1 = require("../config/PromoPanelTextStyles");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
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
class PromoPanelLabelButton extends GuiToggleButton_1.GuiToggleButton {
    constructor(name, labelString = "", onColors, offColors, buttonLabelStyle, backPlate, stroke, backPlateOff, isToogledBtn = false) {
        super(name, () => this.toggleCallback());
        this._isToggledBtn = false;
        this._colorSets = onColors && offColors && new ToggleState_1.ToggleStateSet(onColors, offColors);
        this.value = undefined;
        this._isToggledBtn = isToogledBtn;
        this._label = new Label_1.Label(labelString, buttonLabelStyle || PromoPanelTextStyles_1.PromoPanelTextStyles.SETTINGS_BUTTON_LABEL_STYLE);
        this._backPlate = backPlate ? backPlate : createDefaultButtonBackPlate();
        this._stroke = stroke;
        this._backPlateOff = backPlateOff;
        this.addChild(this._backPlate);
        this._backPlateOff && this.addChild(this._backPlateOff);
        this._stroke && this.addChild(this._stroke);
        this.addChild(this._label);
    }
    setSize(width, height) {
        this._backPlate.width = width;
        this._backPlate.height = height;
        this._backPlateOff && (this._backPlateOff.width = width);
        this._backPlateOff && (this._backPlateOff.height = height);
        if (this._stroke) {
            this._stroke.width = width;
            this._stroke.height = height;
        }
        this._label.anchor.set(0.5, 0.5);
        this._label.position.set(width * 0.5, height * 0.5);
        this.pivot.set(width * 0.5, height * 0.5);
    }
    resize(minMargin = 0) {
        if (this._label.width + 5 >= this._backPlate.width) {
            this.setSize(this._label.width + minMargin, this._backPlate.height);
        }
    }
    onPointerStateUpdate(state) {
        this.setColors();
    }
    setColors() {
        if (this._colorSets) {
            const currentColorSet = this._colorSets.getItem(this.toggleState);
            const argb = currentColorSet.getItem(this.pointerState);
            this._label.setColor(argb);
            this._backPlate.alpha = (1 - this.toggleState) * 0.15;
            if (this._stroke) {
                this._stroke.tint = GuiUtils_1.GuiUtils.getColorFromARGB(argb);
                this._stroke.alpha = GuiUtils_1.GuiUtils.getAlphaFromARGB(argb);
                this._stroke.alpha *= this.toggled ? 1 : 0.6;
            }
        }
    }
    toggleCallback() {
        this.setColors();
        if (this._backPlateOff) {
            this._backPlate.alpha = this.toggled ? 1 : 0;
            this._backPlateOff.alpha = !this.toggled ? 1 : 0;
        }
    }
    get label() {
        return this._label;
    }
    get backPlate() {
        return this._backPlate;
    }
}
exports.PromoPanelLabelButton = PromoPanelLabelButton;
//# sourceMappingURL=PromoPanelLabelButton.js.map