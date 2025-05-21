"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContinueButton = void 0;
const NolimitApplication_1 = require("../../../NolimitApplication");
const GuiDefaults_1 = require("../../default/GuiDefaults");
const SvgLoader_1 = require("../../../loader/SvgLoader");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
const GuiButton_1 = require("../GuiButton");
const Label_1 = require("../../labels/Label");
const PointerStateColorSet_1 = require("../states/sets/PointerStateColorSet");
const GuiUtils_1 = require("../../utils/GuiUtils");
/**
 * Created by jonas on 2020-03-23.
 */
class ContinueButton extends GuiButton_1.GuiButton {
    constructor(customText) {
        super(customText ? customText : "continues" + "_button");
        this.onPointerStateUpdate = (state) => {
            const alpha = GuiUtils_1.GuiUtils.getAlphaFromARGB(this._colors.getItem(state));
            this.alpha = alpha;
        };
        customText = customText ? customText : NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("CONTINUE");
        this._label = new Label_1.Label(customText, GuiDefaults_1.GuiDefaults.DEFAULT_CONTINUE_BUTTON_LABEL_STYLE);
        this._backplate = ContinueButton.createBackPlate();
        this._stroke = ContinueButton.createButtonStroke();
        this._colors = new PointerStateColorSet_1.PointerStateColorSet(0xff000000, undefined, undefined, 0x80000000);
        this.addChild(this._backplate);
        this.addChild(this._stroke);
        this.addChild(this._label);
        this.resizeButtonToLabelWithMargin(18, 30, 18, 30);
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
    static createBackPlate() {
        const backPlate = new PIXI.NineSlicePlane(SvgLoader_1.SvgLoader.getSvgTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_BASE_9), 9, 9, 9, 9);
        backPlate.tint = 0x000000;
        backPlate.alpha = 0.4;
        return backPlate;
    }
    static createButtonStroke() {
        const backPlate = new PIXI.NineSlicePlane(SvgLoader_1.SvgLoader.getSvgTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_STROKE_9), 9, 9, 9, 9);
        backPlate.tint = 0xFFFFFF;
        backPlate.alpha = 1.0;
        return backPlate;
    }
}
exports.ContinueButton = ContinueButton;
//# sourceMappingURL=ContinueButton.js.map