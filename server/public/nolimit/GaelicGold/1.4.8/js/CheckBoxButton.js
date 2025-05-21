"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckBoxButton = void 0;
const IconToggleButton_1 = require("../IconToggleButton");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
const PointerStateIconSet_1 = require("../states/sets/PointerStateIconSet");
const Icon_1 = require("../../displayobjects/Icon");
const PointerStateColorSet_1 = require("../states/sets/PointerStateColorSet");
const Label_1 = require("../../labels/Label");
const GuiDefaults_1 = require("../../default/GuiDefaults");
const ImgLoader_1 = require("../../../loader/ImgLoader");
/**
 * Created by jonas on 2019-11-13.
 */
class CheckBoxButton extends IconToggleButton_1.IconToggleButton {
    constructor(name, labelString, labelStyle, onColors, offColors) {
        onColors = onColors ? onColors : new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFC00, 0xFFFFFC00, 0xFFFFFC00, 0x33FFFC00);
        offColors = offColors ? offColors : new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        const offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.CHECK_BOX_SMALL_EMPTY)));
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.CHECK_BOX_SMALL_CHECKED)));
        super(name, onIcons, onColors, offIcons, offColors);
        if (labelString != undefined) {
            const style = labelStyle ? labelStyle : GuiDefaults_1.GuiDefaults.DEFAULT_CHECKBOX_BUTTON_LABEL;
            const label = new Label_1.Label(labelString, style);
            label.anchor.set(0, 0.5);
            this.addSubComponent(label, { x: 1, y: 0.5 }, { x: 4, y: 1 });
        }
    }
}
exports.CheckBoxButton = CheckBoxButton;
//# sourceMappingURL=CheckBoxButton.js.map