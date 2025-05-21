"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyFeatureButton = void 0;
/**
 * Created by jonas on 2024-01-18.
 */
const GuiToggleButton_1 = require("../GuiToggleButton");
const Label_1 = require("../../labels/Label");
const GuiDefaults_1 = require("../../default/GuiDefaults");
const FontStatics_1 = require("../../../loader/font/FontStatics");
const NolimitLauncher_1 = require("../../../NolimitLauncher");
const ImgLoader_1 = require("../../../loader/ImgLoader");
const NolimitBonusFeatureTicket_1 = require("./parts/NolimitBonusFeatureTicket");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
class BuyFeatureButton extends GuiToggleButton_1.GuiToggleButton {
    constructor(data) {
        super(data.name, () => this.toggleCallback());
        this.featureData = data;
        this.featureTicket = new NolimitBonusFeatureTicket_1.NolimitBonusFeatureTicket(data.name);
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 20;
        style.fill = "#FFFFFF";
        style.fontWeight = FontStatics_1.FontWeight.NORMAL;
        this.costLabel = new Label_1.Label("-1", style);
        this.costLabel.anchor.set(0.5, 1);
        this.costLabel.position.set(Math.floor(this.featureTicket.size.x * 0.5), 153);
        this._goldenCost = new PIXI.Container();
        style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 22;
        style.fill = "#FFFC00";
        style.fontWeight = FontStatics_1.FontWeight.BOLD;
        this.goldenCostLabel = new Label_1.Label("-1", style);
        this.goldenCostLabel.anchor.set(0.5, 1);
        this.goldenCostLabel.position.set(Math.floor(this.featureTicket.size.x * 0.5), 153);
        this._goldenCostBackplate = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BONUS_BET_BACKPLATE), 36, 36, 36, 36);
        this._goldenCost.addChild(this._goldenCostBackplate, this.goldenCostLabel);
        this._goldenCost.visible = false;
        this.addChild(this.featureTicket);
        this.addChild(this.costLabel);
        this.addChild(this._goldenCost);
    }
    toggleCallback() {
        if (this.toggled) {
            this.featureTicket.setSelected(true);
            this._goldenCost.visible = true;
            this.costLabel.visible = false;
        }
        else {
            this.featureTicket.setSelected(false);
            this._goldenCost.visible = false;
            this.costLabel.visible = true;
        }
    }
    updateCostAndValidate(betLevelNumber) {
        const calculatedCost = +NolimitLauncher_1.NolimitLauncher.apiPlugin.currency.formatValue(this.featureData.price * betLevelNumber);
        this.costLabel.text = BuyFeatureButton.formatCurrencyWithDecimalCutoff(calculatedCost);
        this.goldenCostLabel.text = this.costLabel.text;
        this._goldenCostBackplate.width = this.goldenCostLabel.width + 50;
        this._goldenCostBackplate.height = this.goldenCostLabel.height + 32;
        this._goldenCostBackplate.position.set(this.goldenCostLabel.x, this.goldenCostLabel.y - this.goldenCostLabel.height * 0.5 + 5);
        this._goldenCostBackplate.pivot.set(this._goldenCostBackplate.width * 0.5, this._goldenCostBackplate.height * 0.5);
        const balance = NolimitLauncher_1.NolimitLauncher.apiPlugin.balance.getAmount();
        if (this.featureData.isBetLevelValid() && calculatedCost <= balance) {
            return true;
        }
        return false;
    }
    static formatCurrencyWithDecimalCutoff(value) {
        if (typeof value == "string") {
            value = parseFloat(value);
        }
        const minimumPrecision = (value < 10 || value % 1 != 0) ? 2 : 0;
        const formatted = NolimitLauncher_1.NolimitLauncher.apiPlugin.currency.format(value, { minimumPrecision: minimumPrecision });
        return formatted;
    }
    enable(enable) {
        super.enable(enable);
        if (enable) {
            this.alpha = 1;
        }
        else {
            if (NolimitLauncher_1.NolimitLauncher.apiPlugin.gameClientConfiguration.hideTicketLowBalance === true) {
                this.alpha = 0;
            }
            else {
                this.alpha = 0.6;
            }
        }
    }
}
exports.BuyFeatureButton = BuyFeatureButton;
//# sourceMappingURL=BuyFeatureButton.js.map