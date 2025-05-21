"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASBetPanelView = void 0;
/**
 * Created by jonas on 2023-05-05.
 */
const BetPanelView_1 = require("../../components/BetPanelView");
const BetDisplay_1 = require("../../components/BetDisplay");
const NolimitPromotionPlugin_1 = require("../../NolimitPromotionPlugin");
const PromoPanelLabelIDs_1 = require("../../enums/PromoPanelLabelIDs");
class ASBetPanelView extends BetPanelView_1.BetPanelView {
    constructor(incrementBtnId, decrementBtnId, buttonClickCallback, bgTint, isRoundsView = false) {
        ASBetPanelView._isRoundsView = isRoundsView;
        super(incrementBtnId, decrementBtnId, buttonClickCallback, bgTint);
        this.setBackgroundAlpha(1);
    }
    resize(isLandscapeLayout) {
        //const width = isLandscapeLayout ? 716 : 633
        this.setBackgroundSize(633, 120);
        this._betDisplay.position.set(this._betBackground.width * 0.5 - 177, 13);
        this._betSelector.position.set(this._betBackground.width * 0.5 + 177, 60);
        this._betDisplay.resize();
    }
    createBetDisplay() {
        let firstLabel;
        if (ASBetPanelView._isRoundsView) {
            this._formatValueAsCurrency = false;
            firstLabel = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.ROUNDS);
        }
        else {
            firstLabel = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.BET);
        }
        return new BetDisplay_1.BetDisplay(firstLabel);
    }
}
exports.ASBetPanelView = ASBetPanelView;
//# sourceMappingURL=ASBetPanelView.js.map