"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASGameOptionsView = void 0;
/**
 * Created by jonas on 2023-05-26.
 */
const GameOptionSelectorComponent_1 = require("./GameOptionSelectorComponent");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const ASEnums_1 = require("../../../enums/ASEnums");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const ResponseParser_1 = require("../../../utils/ResponseParser");
const PromoPanelLabelIDs_1 = require("../../../enums/PromoPanelLabelIDs");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
class ASGameOptionsView extends PIXI.Container {
    constructor(actionSpinOptions, onUpdateCallback) {
        super();
        this.selectedOptions = new Map();
        this.visibleSelectorsAndElements = [];
        this.selectors = [];
        this.onSelection = (selector) => {
            const selection = selector.getSelection();
            if (selector.type == ASEnums_1.ASMainGamePickOptions.BOOSTED_BET) {
                if (selection) {
                    let title = "";
                    if (selection.id > 0) {
                        title = this.getTotalXBetCostFromFeatureName((selection === null || selection === void 0 ? void 0 : selection.name) || "");
                    }
                    selector.setTitleValue(title);
                    selection.displayValue = title;
                }
            }
            else {
                selector.setTitleValue((selection === null || selection === void 0 ? void 0 : selection.name) || "");
            }
            this.selectedOptions.set(selector.type, selection);
            this.onUpdateCallback();
        };
        this.onUpdateCallback = onUpdateCallback;
        this.originalOptionData = actionSpinOptions;
        if (actionSpinOptions.mainGame) {
            const skip = actionSpinOptions.mainGame.type == ASEnums_1.ASMainGamePickOptions.BOOSTED_BET; //&& !NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.boostedBetAllowed;
            if (!skip) {
                const selector = new GameOptionSelectorComponent_1.GameOptionSelectorComponent(actionSpinOptions.mainGame.type, this.onSelection, actionSpinOptions.mainGame.options, actionSpinOptions.mainGame.header(), "");
                this.selectors.push(selector);
                this.selectedOptions.set(selector.type, undefined);
            }
        }
        if (actionSpinOptions.bonusGame) {
            const selector = new GameOptionSelectorComponent_1.GameOptionSelectorComponent(actionSpinOptions.bonusGame.type, this.onSelection, actionSpinOptions.bonusGame.options, actionSpinOptions.bonusGame.header(), "");
            this.selectors.push(selector);
            this.selectedOptions.set(selector.type, undefined);
        }
        if (actionSpinOptions.automaticPickGame) {
            this.automaticPickDisclaimer = new Label_1.Label(actionSpinOptions.automaticPickGame.header(), PromoPanelTextStyles_1.PromoPanelTextStyles.ACTION_SPINS_OPTIONS_DISCLAIMER);
        }
    }
    init() {
        for (let selector of this.selectors) {
            if (selector.type == ASEnums_1.ASMainGamePickOptions.BOOSTED_BET) {
                selector.select(0);
            }
            if (selector.type == ASEnums_1.ASMainGamePickOptions.VOLATILITY) {
                selector.select(0);
            }
            if (selector.type == ASEnums_1.ASBonusPickOptions.PICK_MODE) {
                selector.select(0);
            }
            if (selector.type == ASEnums_1.ASBonusPickOptions.ROW_OPTIONS) {
                selector.select(0);
            }
        }
    }
    enableBonusOption(enable) {
        for (let selector of this.selectors) {
            if (selector.type == ASEnums_1.ASBonusPickOptions.ROW_OPTIONS || selector.type == ASEnums_1.ASBonusPickOptions.PICK_MODE) {
                selector.enable(enable);
                if (!enable) {
                    this.selectedOptions.delete(selector.type);
                }
                else {
                    this.selectedOptions.set(selector.type, selector.getSelection());
                }
            }
        }
    }
    setVisibleSelectors(bonus, xBet, volatility) {
        this.removeChild(...this.visibleSelectorsAndElements);
        this.visibleSelectorsAndElements = [];
        for (let selector of this.selectors) {
            if (selector.type == ASEnums_1.ASMainGamePickOptions.BOOSTED_BET && xBet) {
                this.visibleSelectorsAndElements.push(selector);
            }
            if (selector.type == ASEnums_1.ASMainGamePickOptions.VOLATILITY && volatility) {
                this.visibleSelectorsAndElements.push(selector);
            }
            if (selector.type == ASEnums_1.ASBonusPickOptions.PICK_MODE && bonus) {
                this.visibleSelectorsAndElements.push(selector);
            }
            if (selector.type == ASEnums_1.ASBonusPickOptions.ROW_OPTIONS && bonus) {
                this.visibleSelectorsAndElements.push(selector);
            }
        }
        if (this.automaticPickDisclaimer && bonus) {
            this.visibleSelectorsAndElements.push(this.automaticPickDisclaimer);
        }
        if (this.visibleSelectorsAndElements.length > 0) {
            GuiLayout_1.GuiLayout.align(this.visibleSelectorsAndElements, 25, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
            this.addChild(...this.visibleSelectorsAndElements);
        }
    }
    onUpdateBet() {
        for (let selector of this.selectors) {
            if (selector.type == ASEnums_1.ASMainGamePickOptions.BOOSTED_BET) {
                const selection = selector.getSelection();
                if (selection) {
                    let title = "";
                    if (selection.id > 0) {
                        title = this.getTotalXBetCostFromFeatureName((selection === null || selection === void 0 ? void 0 : selection.name) || "");
                    }
                    selector.setTitleValue(title);
                    selection.displayValue = title;
                }
            }
            if (selector.type == ASEnums_1.ASMainGamePickOptions.VOLATILITY) {
                this.visibleSelectorsAndElements.push(selector);
            }
        }
    }
    isAllMandatorySelected() {
        for (let value of this.selectedOptions.values()) {
            if (value == undefined) {
                return false;
            }
        }
        return true;
    }
    getTotalXBetCostFromFeatureName(featureName) {
        const cost = ResponseParser_1.ResponseParser.getBoostCost(featureName);
        const formattedCost = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.currency.format(+cost);
        const titleValue = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.TOTAL_COST) + " " + formattedCost;
        return titleValue;
    }
}
exports.ASGameOptionsView = ASGameOptionsView;
//# sourceMappingURL=ASGameOptionsView.js.map