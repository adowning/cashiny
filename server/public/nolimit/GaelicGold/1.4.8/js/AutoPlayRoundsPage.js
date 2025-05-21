"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPlayRoundsPage = void 0;
const BasePage_1 = require("./BasePage");
const SlotKeypadViewSettings_1 = require("../../../SlotKeypadViewSettings");
const KeypadDefault_1 = require("../../../config/KeypadDefault");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const SlotKeypad_1 = require("../../../../SlotKeypad");
const LabelButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/LabelButton");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
/**
 * Created by jonas on 2019-10-23.
 */
class AutoPlayRoundsPage extends BasePage_1.BasePage {
    constructor(parentView, header) {
        super("autoplayRounds", parentView, header);
    }
    createContent() {
        const container = super.createContent();
        this._buttonContainer = new PIXI.Container();
        this._buttonContainer.name = "buttons";
        this._buttons = []; //this.createButtons(this._buttonContainer);
        container.addChild(this._buttonContainer);
        return container;
    }
    createButton(value) {
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        const button = new LabelButton_1.LabelButton("AutoPlayRoundsButton_" + value.toString(), value.toString(), style, activeColors, normalNonEmphasisColors);
        button.value = value;
        button.addClickCallback(() => this._parentView.onInteraction(button.name, button.value));
        button.setSize(KeypadDefault_1.KeypadDefault.DEFAULT_SMALL_BUTTON_SIZE.width, KeypadDefault_1.KeypadDefault.DEFAULT_SMALL_BUTTON_SIZE.height);
        button.enable(false);
        button.toggled = false;
        this._buttons.push(button);
        this._buttonContainer.addChild(button);
        return button;
    }
    onResize(bounds) {
        this.header.position.set(KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT, 0);
        this.content.position.set(0, this.header.y + this.header.height + 10);
        this.onResizeContent(bounds);
    }
    onResizeContent(bounds) {
        const margin = 15;
        const totalBoundsWidth = bounds.width - KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT * 2;
        const buttonSizeWithMargin = (KeypadDefault_1.KeypadDefault.DEFAULT_SMALL_BUTTON_SIZE.width + margin);
        let buttonsWillFit = Math.floor(totalBoundsWidth / buttonSizeWithMargin);
        if (buttonSizeWithMargin * (buttonsWillFit + 1) - margin <= totalBoundsWidth) {
            buttonsWillFit += 1;
        }
        const maxButtonsInRow = buttonsWillFit; // Math.min(buttonsWillFit, KeypadDefault.DEFAULT_BET_LEVELS_ROW_MAX);
        const rows = Math.ceil(this._buttons.length / maxButtonsInRow);
        const tempButtons = this._buttons.concat();
        for (let i = 0; i < rows; i++) {
            const lastRowNonMaxCount = tempButtons.length < maxButtonsInRow;
            const buttons = lastRowNonMaxCount ? tempButtons : tempButtons.splice(0, maxButtonsInRow);
            GuiLayout_1.GuiLayout.align(buttons, margin, GuiLayout_1.Align.TOP, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.offset(buttons, KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT, (KeypadDefault_1.KeypadDefault.DEFAULT_SMALL_BUTTON_SIZE.height + margin) * i);
        }
    }
    updateButtons(autoplayRounds) {
        let buttonsEnabled = true;
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRequiresStopLossLimit) {
            buttonsEnabled = SlotKeypad_1.SlotKeypad.autoplay.settings.minBalancePercent != undefined;
        }
        for (let i = 0; i < autoplayRounds.length; i++) {
            const value = autoplayRounds[i];
            if (this._buttons[i]) {
                this._buttons[i].value = value.toString();
                this._buttons[i].name = "AutoPlayRoundsButton_" + value.toString();
                this._buttons[i].label.text = value.toString();
            }
            else {
                this.createButton(value);
            }
            this._buttons[i].enable(buttonsEnabled);
        }
        const leftOvers = this._buttons.splice(autoplayRounds.length);
        for (let button of leftOvers) {
            this._buttonContainer.removeChild(button);
        }
    }
}
exports.AutoPlayRoundsPage = AutoPlayRoundsPage;
//# sourceMappingURL=AutoPlayRoundsPage.js.map