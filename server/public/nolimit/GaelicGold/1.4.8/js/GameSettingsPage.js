"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSettingsPage = void 0;
/**
 * Created by jonas on 2019-10-23.
 */
const BasePage_1 = require("./BasePage");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const SlotKeypad_1 = require("../../../../SlotKeypad");
const KeypadDefault_1 = require("../../../config/KeypadDefault");
const APISettingsSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APISettingsSystem");
const GUIScrollContainer_1 = require("@nolimitcity/slot-launcher/bin/gui/scroll/GUIScrollContainer");
const RadioButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/RadioButton");
const APIOptions_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIOptions");
class GameSettingsPage extends BasePage_1.BasePage {
    constructor(name, parentView, header) {
        super(name, parentView, header);
    }
    createContent() {
        const container = new GUIScrollContainer_1.GUIScrollContainer(720, 720, false);
        this._buttons = [];
        this._soundSettingsContainer = this.createButtonGroup([
            { id: APISettingsSystem_1.APISetting.MUSIC, label: "Music" },
            { id: APISettingsSystem_1.APISetting.SFX, label: "Sound effects" }
        ]);
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.options.device == APIOptions_1.Device.DESKTOP && SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.spacebarSpinAllowed) {
            this._generalSettingsContainer = this.createButtonGroup([
                { id: APISettingsSystem_1.APISetting.CLOCK, label: "Show clock" },
                { id: APISettingsSystem_1.APISetting.USE_SPACE_TO_SPIN, label: "Use spacebar to spin" },
            ]);
        }
        else {
            this._generalSettingsContainer = this.createButtonGroup([
                { id: APISettingsSystem_1.APISetting.CLOCK, label: "Show clock" }
                //{id : APISetting.LEFT_HAND_MODE, label : "Left hand mode"}, //Todo - solve gui issue with overlapping gfx if this is enabled.
            ]);
        }
        this._separator = new PIXI.Graphics();
        const content = new PIXI.Container();
        content.addChild(this._soundSettingsContainer, this._separator, this._generalSettingsContainer);
        container.addContent(content);
        return container;
    }
    drawSeparator(length, vertical) {
        this._separator.clear();
        this._separator.lineStyle(1, 0xffffff, 0.6);
        if (vertical) {
            this._separator.moveTo(0, 0);
            this._separator.lineTo(0, length);
        }
        else {
            this._separator.moveTo(0, 0);
            this._separator.lineTo(length, 0);
        }
    }
    onResize(bounds) {
        super.onResize(bounds);
        this.drawSeparator(bounds.width - KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT * 2, false);
        GuiLayout_1.GuiLayout.align([this._soundSettingsContainer, this._separator, this._generalSettingsContainer], 30, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
        GuiLayout_1.GuiLayout.offset([this._soundSettingsContainer, this._separator, this._generalSettingsContainer], KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT, 20);
        this.content.resize(bounds.width, bounds.height - this.content.position.y);
    }
    buttonClickCallback(button) {
        const value = !SlotKeypad_1.SlotKeypad.apiPlugIn.settings.get(button.name, false);
        SlotKeypad_1.SlotKeypad.apiPlugIn.settings.set(button.name, value);
        button.toggled = value;
    }
    createButtonGroup(buttonConf, minWidth = 0) {
        const container = new PIXI.Container();
        for (let conf of buttonConf) {
            const button = new RadioButton_1.RadioButton(conf.id, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate(conf.label));
            button.addClickCallback(() => this.buttonClickCallback(button));
            button.enable(true);
            button.toggled = SlotKeypad_1.SlotKeypad.apiPlugIn.settings.get(button.name, false);
            container.addChild(button);
            this._buttons.push(button);
        }
        this.layoutButtonGroup(container);
        if (minWidth > 0) {
            const paddingGfx = new PIXI.Graphics();
            paddingGfx.beginFill(0, 1);
            paddingGfx.drawRect(0, 0, minWidth, 2);
            container.addChild(paddingGfx);
        }
        return container;
    }
    layoutButtonGroup(group) {
        GuiLayout_1.GuiLayout.align(group.children, 50, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
        GuiLayout_1.GuiLayout.offset(group.children, 10, 0);
    }
    activate() {
        for (let button of this._buttons) {
            button.toggled = SlotKeypad_1.SlotKeypad.apiPlugIn.settings.get(button.name, false);
            if (button.name == APISettingsSystem_1.APISetting.CLOCK) {
                button.enable(SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.clockSettings.allowSetting);
                if (!SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.clockSettings.allowSetting) {
                    this._generalSettingsContainer.removeChild(button);
                    this.layoutButtonGroup(this._generalSettingsContainer);
                }
            }
        }
    }
}
exports.GameSettingsPage = GameSettingsPage;
//# sourceMappingURL=GameSettingsPage.js.map