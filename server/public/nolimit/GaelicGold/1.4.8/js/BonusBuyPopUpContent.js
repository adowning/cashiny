"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusBuyPopUpContent = void 0;
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const SlotKeypad_1 = require("../../../../SlotKeypad");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const SkinLoader_1 = require("../../../../SkinLoader");
/**
 * Created by jonas on 2023-11-01.
 */
class BonusBuyPopUpContent extends PIXI.Container {
    constructor(featureData) {
        super();
        this.featureName = featureData.name;
        this.featureImage = new PIXI.Sprite(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.CONFIRM_POP_UP_WARNING));
        this.featureImage.anchor.set(0.5, 0);
        this.bet = SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.getLevel();
        this.price = featureData.getTotalCost();
        this.priceString = SlotKeypad_1.SlotKeypad.formatCurrencyWithDecimalCutoff(this.price);
        this.priceLabel = new Label_1.Label(this.priceString, BonusBuyPopUpContent.POP_UP_FORMATTED_PRICE);
        this.priceLabel.anchor.set(0.5, 0);
        this.priceLabel.visible = false;
        this.textLabel = new Label_1.Label(SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("The total cost for the activated feature will be charged from your balance for each spin."), BonusBuyPopUpContent.POP_UP_CHARGE_FROM_WALLET_TEXT);
        this.textLabel.anchor.set(0.5, 0);
        this.featureImage.position.set(0, 0);
        this.priceLabel.position.set(0, 220);
        this.textLabel.position.set(0, 260);
        this.addChild(this.featureImage, this.priceLabel, this.textLabel);
    }
}
BonusBuyPopUpContent.POP_UP_FORMATTED_PRICE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
BonusBuyPopUpContent.POP_UP_CHARGE_FROM_WALLET_TEXT = new PIXI.TextStyle({
    fill: "#686868",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT,
    padding: 25,
    breakWords: true,
    wordWrap: true,
    wordWrapWidth: 540
});
exports.BonusBuyPopUpContent = BonusBuyPopUpContent;
//# sourceMappingURL=BonusBuyPopUpContent.js.map