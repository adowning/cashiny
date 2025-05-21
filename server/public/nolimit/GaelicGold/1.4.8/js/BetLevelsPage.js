"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLevelsPage = void 0;
/**
 * Created by jonas on 2019-10-23.
 */
const BasePage_1 = require("./BasePage");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const SlotKeypadViewSettings_1 = require("../../../SlotKeypadViewSettings");
const KeypadDefault_1 = require("../../../config/KeypadDefault");
const SlotKeypad_1 = require("../../../../SlotKeypad");
const LabelButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/LabelButton");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
class BetLevelsPage extends BasePage_1.BasePage {
    constructor(parentView, header, headerYellow) {
        super("Betlevels", parentView, header, headerYellow);
    }
    createContent() {
        const container = super.createContent();
        this._buttonContainer = new PIXI.Container();
        this._buttonContainer.name = "buttons";
        this._buttons = this.createButtons(this._buttonContainer);
        container.addChild(this._buttonContainer);
        return container;
    }
    createButtons(container) {
        const available = this._parentView.api.betLevel.getAvailableLevels();
        const unavailable = this._parentView.api.betLevel.getUnavailableLevels();
        const levels = available.concat(unavailable);
        const buttons = [];
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        for (let betValue of levels) {
            const formattedValue = SlotKeypad_1.SlotKeypad.formatCurrencyValueWithDecimalCutoff(betValue);
            style.fontSize = 40;
            const button = new LabelButton_1.LabelButton(betValue, formattedValue, style, activeColors, normalNonEmphasisColors);
            button.addClickCallback(() => this._parentView.onInteraction(button.name, button.value));
            button.enable(true);
            button.resizeButtonToLabelWithMargin(10, 15, 10, 15);
            buttons.push(button);
            container.addChild(button);
        }
        this._largestButtonSize = GuiLayout_1.GuiLayout.getLargestSize(buttons);
        for (let button of buttons) {
            button.setSize(this._largestButtonSize.x, this._largestButtonSize.y);
        }
        return buttons;
    }
    onResize(bounds) {
        super.onResize(bounds);
        const margin = 15;
        let buttonsWillFit = Math.floor(bounds.width / (this._largestButtonSize.x + margin));
        const maxButtonsInRow = Math.min(buttonsWillFit, KeypadDefault_1.KeypadDefault.DEFAULT_BET_LEVELS_ROW_MAX);
        const rows = Math.ceil(this._buttons.length / maxButtonsInRow);
        const tempButtons = this._buttons.concat();
        for (let i = 0; i < rows; i++) {
            const lastRowNonMaxCount = tempButtons.length < maxButtonsInRow;
            const buttons = lastRowNonMaxCount ? tempButtons : tempButtons.splice(0, maxButtonsInRow);
            GuiLayout_1.GuiLayout.align(buttons, margin, GuiLayout_1.Align.TOP, GuiLayout_1.Direction.HORIZONTAL);
            if (lastRowNonMaxCount) {
                const lastRowWidth = (this._largestButtonSize.x * buttons.length) + margin * (buttons.length - 1);
                const totalWidth = (this._largestButtonSize.x * maxButtonsInRow) + margin * (maxButtonsInRow - 1);
                const horizOffset = (totalWidth - lastRowWidth) * 0.5;
                GuiLayout_1.GuiLayout.offset(buttons, horizOffset, (this._largestButtonSize.y + margin) * i);
            }
            else {
                GuiLayout_1.GuiLayout.offset(buttons, 0, (this._largestButtonSize.y + margin) * i);
            }
        }
        this.content.position.x = (bounds.width - this.content.width) * 0.5;
        this.content.position.y += 20;
    }
    updateButtons() {
        const unavailable = this._parentView.api.betLevel.getUnavailableLevels();
        const value = this._parentView.api.betLevel.getLevel();
        for (let button of this._buttons) {
            button.toggled = button.name == value;
            if (unavailable.indexOf(button.name) >= 0) {
                button.enable(false);
            }
            else {
                button.enable(true);
            }
        }
    }
}
exports.BetLevelsPage = BetLevelsPage;
//# sourceMappingURL=BetLevelsPage.js.map