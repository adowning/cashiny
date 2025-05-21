"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimesBetDisplay = void 0;
const PromoPanelTextLabel_1 = require("../../PromoPanelTextLabel");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const CurrencyUtils_1 = require("../../../utils/CurrencyUtils");
class TimesBetDisplay extends PIXI.Container {
    constructor(totalMultipliedWin, betGroupMaxWidth) {
        super();
        this._betSign = new PIXI.Sprite(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_MENU_BET));
        this._betSign.anchor.set(0, 0.5);
        this._betSign.tint = 0x000000;
        this._betGroupMaxWidth = betGroupMaxWidth || 150;
        this._betGroupMaxWidth -= (this._betSign.width + 10);
        this._timesBetLabel = new PromoPanelTextLabel_1.TextLabelAdvanced("", PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_X_BET_STYLE, {
            landscapeMaxWidth: this._betGroupMaxWidth,
            portraitMaxWidth: this._betGroupMaxWidth
        });
        this._timesBetLabel.anchor.set(0, 0.5);
        const xText = new Label_1.Label("x", PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_X_BET_STYLE);
        xText.anchor.set(0, 0.5);
        this._xText = xText;
        this.addChild(this._timesBetLabel, this._xText, this._betSign);
        this.updateTimesBet(totalMultipliedWin);
    }
    updateTimesBet(value) {
        this._timesBetLabel.text = CurrencyUtils_1.CurrencyUtils.toFixedIfNecessary(value, 2);
        this.onResize();
    }
    onResize() {
        this._timesBetLabel.onResize();
        this._timesBetLabel.position.set(0, 0);
        this._xText.position.set(this._timesBetLabel.width + 5, 0);
        this._betSign.position.set(this._xText.x + this._xText.width + 5, 0);
    }
    get timesBetLabel() {
        return this._timesBetLabel;
    }
}
exports.TimesBetDisplay = TimesBetDisplay;
//# sourceMappingURL=TimesBetDisplay.js.map