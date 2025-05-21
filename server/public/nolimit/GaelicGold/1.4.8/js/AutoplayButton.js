"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoplayButton = void 0;
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const KeypadTextStyles_1 = require("../../config/KeypadTextStyles");
const SkinLoader_1 = require("../../../SkinLoader");
/**
 * Created by Jonas Wålekvist on 2019-11-04.
 */
class AutoplayButton extends IconToggleButton_1.IconToggleButton {
    get spinsCounterLabel() {
        return this._spinsCounterLabel;
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get width() {
        return this._icon.width;
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get height() {
        return this._icon.height;
    }
    constructor(name, onIcons, onColors, offIcons, offColors) {
        super(name, onIcons, onColors, offIcons, offColors);
        this._spinsCounterLabel = new Label_1.Label("-1", KeypadTextStyles_1.KeypadTextStyles.AUTO_PLAY_COUNTER_LABEL_STYLE);
        this._spinsCounterBackPlate = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.LABEL_PLATE_22), 22, 22, 22, 22);
        this._spinsCounterBackPlate.tint = 0x000000;
        this._spinsCounterBackPlate.alpha = 0.4;
        this._spinsCounterLabel.addBackPlate(this._spinsCounterBackPlate, () => this.updateSpinsCounterBackPlate());
        this._spinsCounterLabel.anchor.set(0.5, 0.5);
    }
    updateSpinsCounterBackPlate() {
        const margin = new Label_1.Margin(0, 0);
        this._spinsCounterBackPlate.width = 80;
        this._spinsCounterBackPlate.height = 46;
        this._spinsCounterBackPlate.pivot.set((this._spinsCounterBackPlate.width * 0.5) + margin.left, (this._spinsCounterBackPlate.height * 0.5) + margin.top);
    }
    getIconColorSet() {
        if (this.customToggledColorSet != undefined && this.toggled) {
            return this.customToggledColorSet;
        }
        return this._colorSets.getItem(this.toggleState);
    }
    setCount(count) {
        if (count > 0) {
            this._spinsCounterLabel.text = "" + count;
            this.addSubComponent(this._spinsCounterLabel, { x: 0.5, y: 0 }, { x: 0, y: -43 });
        }
        else {
            this.removeChild(this._spinsCounterLabel);
        }
    }
    hideSpinCounterLabel() {
        this._spinsCounterLabel.visible = false;
    }
    showSpinCounterLabel() {
        this._spinsCounterLabel.visible = true;
    }
}
exports.AutoplayButton = AutoplayButton;
//# sourceMappingURL=AutoplayButton.js.map