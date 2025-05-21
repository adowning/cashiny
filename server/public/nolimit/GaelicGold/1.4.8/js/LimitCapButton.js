"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitCapButton = void 0;
const ImgLoader_1 = require("../../../loader/ImgLoader");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
const IconToggleButton_1 = require("../IconToggleButton");
const Label_1 = require("../../labels/Label");
const PointerStateColorSet_1 = require("../states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("../states/sets/PointerStateIconSet");
const Icon_1 = require("../../displayobjects/Icon");
const GuiDefaults_1 = require("../../default/GuiDefaults");
const FontStatics_1 = require("../../../loader/font/FontStatics");
const ToggleState_1 = require("../states/ToggleState");
/**
 * Created by jonas on 2024-04-24.
 */
class LimitCapButton extends IconToggleButton_1.IconToggleButton {
    constructor(name) {
        const onColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.LIMIT_CAP_ON)));
        const offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.LIMIT_CAP_OFF)));
        super(name, onIcons, onColors, offIcons);
    }
    addBylines(onText, offText) {
        const style = GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_STYLE.clone();
        style.fontWeight = FontStatics_1.FontWeight.BOLD;
        if (this.onLabel != undefined) {
            this.onLabel.text = onText;
            this.removeChild(this.onLabel);
        }
        else {
            this.onLabel = new Label_1.Label(onText, style);
        }
        if (this.offLabel != undefined) {
            this.offLabel.text = offText;
            this.removeChild(this.offLabel);
        }
        else {
            this.offLabel = new Label_1.Label(offText, style);
        }
        this.onLabel.anchor.set(0.5, 0);
        this.onLabel.position.set(Math.floor(this.width * 0.5), 0);
        this.offLabel.anchor.set(0.5, 0);
        this.offLabel.position.set(Math.floor(this.width * 0.5), 0);
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.LIMIT_CAP_ON_AMOUNT)));
        const offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.LIMIT_CAP_OFF_AMOUNT)));
        this._iconSets = new ToggleState_1.ToggleStateSet(onIcons, offIcons);
        this.addChild(this.onLabel, this.offLabel);
        this.updateLabels();
        this.setIcon();
    }
    setIcon() {
        super.setIcon();
        if (this.onLabel && this.offLabel) {
            this.addChild(this.onLabel, this.offLabel);
        }
    }
    updateLabels() {
        if (this.onLabel && this.offLabel) {
            this.onLabel.visible = this.toggled;
            this.offLabel.visible = !this.toggled;
        }
    }
    get toggled() {
        return super.toggled;
    }
    set toggled(value) {
        super.toggled = value;
        this.updateLabels();
    }
}
exports.LimitCapButton = LimitCapButton;
//# sourceMappingURL=LimitCapButton.js.map