"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiniBetSelector = void 0;
const PlusMinusWidget_1 = require("./parts/PlusMinusWidget");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const SlotKeypad_1 = require("../../../SlotKeypad");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const GuiDefaultTextures_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaultTextures");
const SkinLoader_1 = require("../../../SkinLoader");
/**
 * Created by jonas on 2024-01-25.
 */
class MiniBetSelector extends PIXI.Container {
    get betWidget() {
        return this._betWidget;
    }
    constructor(controller) {
        super();
        this._controller = controller;
        this.name = "MiniBetSelector";
        this._backgroundPlate = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_BASE_20), 20, 20, 20, 20);
        this._backgroundPlate.alpha = 1;
        this._backgroundPlate.tint = 0xEE2653;
        this._backgroundStroke = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_STROKE_20), 20, 20, 20, 20);
        this._backgroundStroke.alpha = 1;
        this._backgroundStroke.tint = 0x9b1b43;
        this._backgroundStroke2 = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_STROKE_20), 20, 20, 20, 20);
        this._backgroundStroke2.alpha = 1;
        this._backgroundStroke2.tint = 0x9b1b43;
        this.setBackgroundSize(206, 164);
        const icon = new PIXI.Sprite(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.NOLIMIT_BONUS_BTN));
        icon.scale.set(0.4, 0.4);
        icon.anchor.set(1, 0);
        icon.position.set(206 - 6, 6);
        this.titleLabel = new Label_1.Label(SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("BET"), MiniBetSelector.BET_PANEL_BET_LABEL);
        this.titleLabel.anchor.set(0.5, 0);
        this.titleLabel.position.set(Math.floor(this.size.x * 0.5), 12);
        this.costLabel = new Label_1.Label("-1", MiniBetSelector.BET_PANEL_BET_STYLE);
        this.costLabel.anchor.set(0.5, 0.5);
        this.costLabel.position.set(Math.floor(this.size.x * 0.5), 65);
        this._betWidget = new PlusMinusWidget_1.PlusMinusWidget("up", "down", (btn) => {
            if (btn.name == "up") {
                this._controller.increaseBetLevel();
            }
            else if (btn.name == "down") {
                this._controller.decreaseBetLevel();
            }
        });
        this._betWidget.position.set(107, 118);
        this._betWidget.enableUpButton(true);
        this._betWidget.enableDownButton(true);
        this.addChild(this._backgroundPlate);
        this.addChild(this._backgroundStroke);
        this.addChild(this._backgroundStroke2);
        this.addChild(icon);
        this.addChild(this.titleLabel);
        this.addChild(this.costLabel);
        this.addChild(this._betWidget);
        this.interactive = true;
        this.interactiveChildren = true;
    }
    setBackgroundSize(width, height) {
        this.size = new PIXI.Point(width, height);
        this._backgroundPlate.width = this.size.x;
        this._backgroundPlate.height = this.size.y;
        this._backgroundStroke.width = this.size.x;
        this._backgroundStroke.height = this.size.y;
        this._backgroundStroke2.width = this.size.x;
        this._backgroundStroke2.height = this.size.y - 3;
    }
    updateBetLevel(betLevel) {
        this.setBetLevel(betLevel);
        this.betWidget.enableDownButton(!SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.isFirst());
        this.betWidget.enableUpButton(!SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.isLast());
        this.lastBetLevel = betLevel;
    }
    setBetLevel(betLevel) {
        this.costLabel.text = SlotKeypad_1.SlotKeypad.formatCurrencyWithDecimalCutoff(betLevel);
        this.costLabel.scale.set(1, 1);
        if (this.costLabel.width >= 185) {
            const scale = 185 / this.costLabel.width;
            this.costLabel.scale.set(scale, scale);
        }
    }
}
MiniBetSelector.BET_PANEL_BET_LABEL = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
MiniBetSelector.BET_PANEL_BET_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 22,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
exports.MiniBetSelector = MiniBetSelector;
//# sourceMappingURL=MiniBetSelector.js.map