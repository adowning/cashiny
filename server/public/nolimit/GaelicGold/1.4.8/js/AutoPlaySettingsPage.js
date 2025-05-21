"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPlaySettingsPage = void 0;
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const BasePage_1 = require("./BasePage");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const TextInput_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/TextInput");
const SlotKeypadViewSettings_1 = require("../../../SlotKeypadViewSettings");
const KeypadDefault_1 = require("../../../config/KeypadDefault");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
const SlotKeypad_1 = require("../../../../SlotKeypad");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const LabelButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/LabelButton");
/**
 * Created by jonas on 2019-10-23.
 */
class AutoPlaySettingsPage extends BasePage_1.BasePage {
    constructor(parentView, header) {
        super("autoplaySettings", parentView, header);
        this._addLimitMustBeSet = false;
    }
    updateDomElement(show) {
        if (show) {
            this._stopWhenExceedInput.addDom();
        }
        else {
            this._stopWhenExceedInput.removeDom();
        }
    }
    createContent() {
        const container = super.createContent();
        const stopWhenExceedWinTranslation = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Stop when single win exceeds");
        this._stopWhenExceedWin = this.createStopWhenExceedWin(stopWhenExceedWinTranslation);
        this._stopWhenExceedWin.name = "stopWhenExceedContainer";
        this._stopWhenBalanceIsLowerButtons = [];
        const minBalanceTranslation = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Stop before the balance is lower than");
        const labelColor = SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRequiresStopLossLimit ? GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.AUTOPLAY_COLOR) : GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR);
        const minBalance = this.createStopWhenBalance(minBalanceTranslation, "StopWhenBalanceIsLower", ["0%", "50%", "75%"], [0, 0.5, 0.75], this._stopWhenBalanceIsLowerButtons, labelColor, true);
        this._stopWhenBalanceIsLower = minBalance.container;
        this._calculatedMinBalance = minBalance.calculatedValueLabel;
        this._stopWhenBalanceIsLower.name = "stopWhenBalanceIsLower";
        this._stopWhenBalanceIsHigherButtons = [];
        const maxBalanceTranslation = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Stop when the balance is higher than");
        const maxBalance = this.createStopWhenBalance(maxBalanceTranslation, "StopWhenBalanceIsHigher", ["150%", "200%", "500%"], [1.5, 2, 5], this._stopWhenBalanceIsHigherButtons);
        this._stopWhenBalanceIsHigher = maxBalance.container;
        this._calculatedMaxBalance = maxBalance.calculatedValueLabel;
        this._stopWhenBalanceIsHigher.name = "stopWhenBalanceIsHigher";
        container.addChild(this._stopWhenExceedWin, this._stopWhenBalanceIsLower, this._stopWhenBalanceIsHigher);
        GuiLayout_1.GuiLayout.align([
            this._stopWhenExceedWin,
            this._stopWhenBalanceIsLower,
            this._stopWhenBalanceIsHigher
        ], 20, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
        return container;
    }
    onResizeContent(bounds) {
        super.onResizeContent(bounds);
        const totalWidth = this._stopWhenBalanceIsLower.width + this._stopWhenBalanceIsHigher.width + 20 + KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT * 2;
        if (totalWidth < bounds.width) {
            GuiLayout_1.GuiLayout.align([
                this._stopWhenExceedWin,
                this._stopWhenBalanceIsLower
            ], 20, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
            const yOffset = this._stopWhenBalanceIsLower.y + 20;
            GuiLayout_1.GuiLayout.align([
                this._stopWhenBalanceIsLower,
                this._stopWhenBalanceIsHigher
            ], 40, GuiLayout_1.Align.TOP, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.offset([
                this._stopWhenBalanceIsLower,
                this._stopWhenBalanceIsHigher
            ], 0, yOffset);
            GuiLayout_1.GuiLayout.offset([
                this._stopWhenExceedWin,
                this._stopWhenBalanceIsLower,
                this._stopWhenBalanceIsHigher
            ], KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT, 20);
        }
        else {
            GuiLayout_1.GuiLayout.align([
                this._stopWhenExceedWin,
                this._stopWhenBalanceIsLower,
                this._stopWhenBalanceIsHigher
            ], 20, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
            GuiLayout_1.GuiLayout.offset([
                this._stopWhenExceedWin,
                this._stopWhenBalanceIsLower,
                this._stopWhenBalanceIsHigher
            ], KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT, 20);
        }
    }
    createLossLimitMustBeSet(labelString) {
        const container = new PIXI.Container();
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_STYLE.clone();
        style.fontSize = 16;
        const label = new Label_1.Label(labelString, style);
        container.addChild(label);
        GuiLayout_1.GuiLayout.align([label], 10, 0, GuiLayout_1.Direction.VERTICAL);
        return container;
    }
    createStopWhenExceedWin(labelString) {
        const currencyCode = this._parentView.api.options.hideCurrency ? '' : this._parentView.api.currency.getSymbol();
        const container = new PIXI.Container();
        const label = new Label_1.Label(labelString);
        const inputCont = new PIXI.Container();
        const input = new TextInput_1.TextInput("maxSingleWin", (name, value) => this._parentView.onInteraction(name, value), 330, GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE);
        input.setDomParent(SlotKeypad_1.SlotKeypad.apiPlugIn.getGameElement());
        const currencyLabel = new Label_1.Label(currencyCode, GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE);
        GuiLayout_1.GuiLayout.align([
            input,
            currencyLabel
        ], 10, 0.5);
        inputCont.addChild(input, currencyLabel);
        this._stopWhenExceedInput = input;
        container.addChild(label, inputCont);
        GuiLayout_1.GuiLayout.align([label, inputCont], 10, 0, GuiLayout_1.Direction.VERTICAL);
        return container;
    }
    createStopWhenBalance(labelText, buttonType, buttonLabels, buttonValues, buttonArray, labelARGB = SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR, addLimitMustBeSet = false) {
        const container = new PIXI.Container();
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_STYLE.clone();
        style.fill = GuiUtils_1.GuiUtils.getColorFromARGB(labelARGB);
        const label = new Label_1.Label(labelText, style);
        const buttons = this.createButtons(KeypadDefault_1.KeypadDefault.DEFAULT_SMALL_BUTTON_SIZE, buttonType, buttonLabels, buttonValues, buttonArray);
        style = GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_STYLE.clone();
        style.fill = GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.AUTOPLAY_COLOR);
        const calculatedBalance = new Label_1.Label("-1 CUR", style);
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRequiresStopLossLimit && addLimitMustBeSet) {
            const lossLimitMustBeSetTranslation = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Loss limit needs to be set to activate autoplay.");
            this._lossLimitMustBeSet = this.createLossLimitMustBeSet(lossLimitMustBeSetTranslation);
            this._lossLimitMustBeSet.name = "lossLimitMustBeSet";
        }
        GuiLayout_1.GuiLayout.align(buttons.children, 15);
        GuiLayout_1.GuiLayout.align((SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRequiresStopLossLimit && addLimitMustBeSet) ? [
            label,
            buttons,
            calculatedBalance,
            this._lossLimitMustBeSet
        ] : [
            label,
            buttons,
            calculatedBalance
        ], 10, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
        container.addChild(label);
        container.addChild(buttons);
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRequiresStopLossLimit && addLimitMustBeSet) {
            container.addChild(this._lossLimitMustBeSet);
            GuiLayout_1.GuiLayout.modifyMargin(this._lossLimitMustBeSet, -15, GuiLayout_1.Direction.VERTICAL, buttons);
            this._addLimitMustBeSet = addLimitMustBeSet;
            this._buttons = buttons;
        }
        container.addChild(calculatedBalance);
        return { container: container, calculatedValueLabel: calculatedBalance };
    }
    createButtons(size, buttonType, labels, values, buttonArray) {
        const container = new PIXI.Container();
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        for (let i = 0; i < values.length; i++) {
            const value = values[i];
            const label = labels[i];
            const button = new LabelButton_1.LabelButton(buttonType + "_" + label, label, style, activeColors, normalNonEmphasisColors);
            button.value = value;
            button.addClickCallback(() => this._parentView.onInteraction(button.name, button.value));
            button.setSize(size.width, size.height);
            button.enable(true);
            button.toggled = false;
            buttonArray.push(button);
            container.addChild(button);
        }
        return container;
    }
    updateValues(settings) {
        if (settings.maxSingleWin) {
            this._stopWhenExceedInput.setElementValue(settings.maxSingleWin);
        }
        else {
            this._stopWhenExceedInput.setElementValue(-1);
        }
        for (let button of this._stopWhenBalanceIsLowerButtons) {
            button.toggled = button.value == settings.minBalancePercent;
            if (settings.minBalancePercentText) {
                this._calculatedMinBalance.text = settings.minBalancePercentText;
                this._calculatedMinBalance.alpha = 1;
                if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRequiresStopLossLimit) {
                    this._lossLimitMustBeSet.alpha = 0;
                }
            }
            else {
                this._calculatedMinBalance.text = "-1 CUR";
                if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRequiresStopLossLimit) {
                    this._lossLimitMustBeSet.alpha = 1;
                }
                this._calculatedMinBalance.alpha = 0;
            }
        }
        for (let button of this._stopWhenBalanceIsHigherButtons) {
            button.toggled = button.value == settings.maxBalancePercent;
            if (settings.maxBalancePercentText) {
                this._calculatedMaxBalance.text = settings.maxBalancePercentText;
                this._calculatedMaxBalance.alpha = 1;
            }
            else {
                this._calculatedMaxBalance.text = "-1 CUR";
                this._calculatedMaxBalance.alpha = 0;
            }
        }
    }
}
exports.AutoPlaySettingsPage = AutoPlaySettingsPage;
//# sourceMappingURL=AutoPlaySettingsPage.js.map