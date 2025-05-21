"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoPage = void 0;
const BasePage_1 = require("./BasePage");
const SlotKeypadViewSettings_1 = require("../../../SlotKeypadViewSettings");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const DemoView_1 = require("../DemoView");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const LabelButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/LabelButton");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
/**
 * Created by Jonas Wålekvist on 2019-12-19.
 */
class DemoPage extends BasePage_1.BasePage {
    constructor(parentView, header, headerYellow) {
        super("Demo", parentView, header, headerYellow);
    }
    createContent() {
        const container = super.createContent();
        this._buttonContainer = new PIXI.Container();
        this._buttonContainer.name = "buttons";
        this._buttons = this.createButtons(this._buttonContainer);
        this._outcomeQueueContainer = new PIXI.Container();
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        this._goButton = new LabelButton_1.LabelButton(DemoView_1.DemoView.GO_BUTTON, "ADD TO OS", style, activeColors, normalNonEmphasisColors);
        this._goButton.addClickCallback(() => this._parentView.onInteraction(this._goButton.name, undefined));
        this._goButton.resizeButtonToLabelWithMargin(20, 30, 20, 30);
        this._goButton.enable(false);
        this._clearOutcomeSetterButton = new LabelButton_1.LabelButton(DemoView_1.DemoView.CLEAR_OUTCOME_SETTER_BUTTON, "CLEAR OS", style, activeColors, normalNonEmphasisColors);
        this._clearOutcomeSetterButton.addClickCallback(() => this._parentView.onInteraction(this._clearOutcomeSetterButton.name, undefined));
        this._clearOutcomeSetterButton.resizeButtonToLabelWithMargin(20, 30, 20, 30);
        this._clearOutcomeSetterButton.enable(true);
        this._mainButtonContainer = new PIXI.Container();
        this._mainButtonContainer.addChild(this._goButton, this._clearOutcomeSetterButton);
        GuiLayout_1.GuiLayout.align([this._goButton, this._clearOutcomeSetterButton], 10);
        this._mainButtonContainer.pivot.set(this._mainButtonContainer.width * 0.5, 0);
        style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 14;
        this._clearButton = new LabelButton_1.LabelButton(DemoView_1.DemoView.CLEAR_BUTTON, "CLEAR", style, activeColors, normalNonEmphasisColors);
        this._clearButton.addClickCallback(() => this._parentView.onInteraction(this._clearButton.name, undefined));
        this._clearButton.resizeButtonToLabelWithMargin(10, 15, 10, 15);
        this._clearButton.enable(true);
        style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 12;
        this._queueLabel = new Label_1.Label("Queue:");
        this._queue = new Label_1.Label("...");
        this._queueLabel.position.set(0, 0);
        this._clearButton.position.set(this._queueLabel.width + 10, -Math.abs(this._queueLabel.height - this._clearButton.height) * 0.5);
        this._queue.position.set(10, this._queueLabel.y + this._queueLabel.height + 10);
        this._outcomeQueueContainer.addChild(this._queueLabel);
        this._outcomeQueueContainer.addChild(this._clearButton);
        this._outcomeQueueContainer.addChild(this._queue);
        container.addChild(this._buttonContainer);
        this.addChild(this._outcomeQueueContainer);
        this.addChild(this._mainButtonContainer);
        return container;
    }
    createButtons(container) {
        const buttons = [];
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 20;
        const outcomeJson = this._parentView.outcomeJson;
        for (let i = 0; i < outcomeJson.demo.length; i++) {
            let outcome = outcomeJson.demo[i];
            const button = new LabelButton_1.LabelButton(outcome.name, outcome.name, style, activeColors, normalNonEmphasisColors);
            button.value = i;
            button.addClickCallback(() => this._parentView.onInteraction(button.name, button.value));
            button.resizeButtonToLabelWithMargin(10, 15, 10, 15);
            button.enable(true);
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
        const buttonsWillFit = Math.floor(bounds.width / (this._largestButtonSize.x + margin));
        const maxButtonsInRow = buttonsWillFit;
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
                GuiLayout_1.GuiLayout.offset(buttons, horizOffset, (this._largestButtonSize.y + margin) * i + 20);
            }
            else {
                GuiLayout_1.GuiLayout.offset(buttons, 0, (this._largestButtonSize.y + margin) * i + 20);
            }
        }
        this.content.position.x = (bounds.width - this.content.width) * 0.5;
        this._outcomeQueueContainer.position.set(10, this.content.y + this.content.height + 50);
        this._mainButtonContainer.position.set(bounds.width * 0.5, bounds.height - 40 - this._mainButtonContainer.height);
    }
    updateButtons() {
        for (let button of this._buttons) {
            button.toggled = false;
        }
        this._clearOutcomeSetterButton.toggled = false;
        this._goButton.toggled = false;
        this._clearButton.toggled = false;
    }
    updateQueue() {
        let value = "";
        const outcomeQueue = this._parentView.outcomeQueue;
        for (let item of outcomeQueue) {
            value += "" + item.name + "\n";
        }
        this._queue.text = value;
        this._goButton.enable(outcomeQueue.length > 0);
    }
}
exports.DemoPage = DemoPage;
//# sourceMappingURL=DemoPage.js.map