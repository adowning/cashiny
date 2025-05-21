"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMenuNavigationBar = void 0;
const SlotKeypadViewSettings_1 = require("../../SlotKeypadViewSettings");
const SlotKeypad_1 = require("../../../SlotKeypad");
const SlotKeypadUtils_1 = require("../../utils/SlotKeypadUtils");
const GameMenuDialogView_1 = require("./GameMenuDialogView");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const APIOptions_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIOptions");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const SkinLoader_1 = require("../../../SkinLoader");
/**
 * Created by Jonas Wålekvist on 2020-02-17.
 */
class GameMenuNavigationBar extends PIXI.Container {
    constructor(dialogView) {
        super();
        this.name = "GameMenuNavigationBar";
        this._parentView = dialogView;
        this.createMenuBar();
    }
    drawMenuBackPlate(bounds) {
        this._backPlate.clear();
        this._backPlate.beginFill(0x000000, 0.2);
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._backPlate.drawRect(2, 0, 109, bounds.height);
            this._backPlate.endFill();
            this._backPlate.lineStyle(2, 0xFFFFFF, 0.6);
            this._backPlate.moveTo(1, 0);
            this._backPlate.lineTo(1, bounds.height);
        }
        else {
            this._backPlate.drawRect(0, 2, bounds.width, 109);
            this._backPlate.endFill();
            this._backPlate.lineStyle(2, 0xFFFFFF, 0.6);
            this._backPlate.moveTo(0, 1);
            this._backPlate.lineTo(bounds.width, 1);
        }
    }
    drawSeparators() {
        this._exitSeparator.clear();
        this._exitSeparator.lineStyle(0.6, 0xffffff);
        this._closeButtonSeparator.clear();
        this._closeButtonSeparator.lineStyle(0.6, 0xffffff);
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._exitSeparator.lineTo(70, 0);
            this._closeButtonSeparator.lineTo(70, 0);
        }
        else {
            this._exitSeparator.lineTo(0, 70);
            this._closeButtonSeparator.lineTo(0, 70);
        }
    }
    onResize(bounds) {
        this.drawMenuBackPlate(bounds);
        this.drawSeparators();
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            GuiLayout_1.GuiLayout.align(this._navigationSection.children, 30, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.VERTICAL);
            GuiLayout_1.GuiLayout.align(this._exitLobbySection.children, 21, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.VERTICAL);
            GuiLayout_1.GuiLayout.align(this._closeButtonSection.children, 6, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.VERTICAL);
            this._exitLobbySection.pivot.set(this._exitLobbySection.width * 0.5, 0);
            this._closeButtonSection.pivot.set(this._closeButtonSection.width * 0.5, this._closeButtonSection.height);
            this._navigationSection.pivot.set(this._navigationSection.width * 0.5, this._navigationSection.height);
            this._exitLobbySection.position.y = 40;
            this._closeButtonSection.position.y = bounds.height - 5;
            this._navigationSection.position.y = this._closeButtonSection.y - this._closeButtonSection.height - 40;
            this._exitLobbySection.position.x = this._backPlate.width * 0.5;
            this._closeButtonSection.position.x = this._backPlate.width * 0.5;
            this._navigationSection.position.x = this._backPlate.width * 0.5;
            this.pivot.set(this.width, 0);
            this.position.set(bounds.right, bounds.top);
        }
        else {
            GuiLayout_1.GuiLayout.align(this._navigationSection.children, 30, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.align(this._exitLobbySection.children, 21, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.align(this._closeButtonSection.children, 6, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
            this._exitLobbySection.pivot.set(0, this._exitLobbySection.height * 0.5);
            this._closeButtonSection.pivot.set(this._closeButtonSection.width, this._closeButtonSection.height * 0.5);
            this._navigationSection.pivot.set(this._navigationSection.width, this._navigationSection.height * 0.5);
            this._exitLobbySection.position.x = 20;
            this._closeButtonSection.position.x = bounds.width - 5;
            this._navigationSection.position.x = this._closeButtonSection.x - this._closeButtonSection.width - 40;
            this._exitLobbySection.position.y = this._backPlate.height * 0.5;
            this._closeButtonSection.position.y = this._backPlate.height * 0.5;
            this._navigationSection.position.y = this._backPlate.height * 0.5;
            this.pivot.set(0, this.height);
            this.position.set(bounds.left, bounds.bottom);
        }
    }
    onOrientationChanged() {
    }
    createMenuBar() {
        this._backPlate = new PIXI.Graphics();
        this._backPlate.beginFill(0xff0000, 0.6);
        this._backPlate.drawRect(0, 2, 109, 109);
        this._backPlate.endFill();
        this._backPlate.lineStyle(2, 0xFFFFFF, 0.6);
        this._backPlate.moveTo(0, 1);
        this._backPlate.lineTo(109, 1);
        this._buttons = [];
        let onColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let offColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let onIcons;
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.EXIT_LOBBY)));
        this._exitLobbyButton = new IconToggleButton_1.IconToggleButton(GameMenuDialogView_1.MenuButtonIDs.EXIT_TO_LOBBY, onIcons, onColors, undefined, offColors);
        this._exitLobbyButton.addClickCallback(() => this._parentView.onInteraction(this._exitLobbyButton.name, this._exitLobbyButton.name));
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.HISTORY)));
        this._historyButton = new IconToggleButton_1.IconToggleButton(GameMenuDialogView_1.MenuButtonIDs.HISTORY, onIcons, onColors, undefined, offColors);
        this._historyButton.addClickCallback(() => this._parentView.onInteraction(this._historyButton.name, this._historyButton.name));
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.INFO)));
        this._infoButton = new IconToggleButton_1.IconToggleButton(GameMenuDialogView_1.MenuButtonIDs.INFO, onIcons, onColors, undefined, offColors);
        this._infoButton.addClickCallback(() => this._parentView.onInteraction(this._infoButton.name, this._infoButton.name));
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SETTINGS)));
        this._settingButton = new IconToggleButton_1.IconToggleButton(GameMenuDialogView_1.MenuButtonIDs.SETTINGS, onIcons, onColors, undefined, offColors);
        this._settingButton.addClickCallback(() => this._parentView.onInteraction(this._settingButton.name, this._settingButton.name));
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.MENU_CLOSE)));
        this._closeButton = new IconToggleButton_1.IconToggleButton(GameMenuDialogView_1.MenuButtonIDs.CLOSE, onIcons, onColors, undefined, offColors);
        this._closeButton.addClickCallback(() => this._parentView.onInteraction(this._closeButton.name, this._closeButton.name));
        this._buttons.push(this._exitLobbyButton);
        this._buttons.push(this._historyButton);
        this._buttons.push(this._infoButton);
        this._buttons.push(this._settingButton);
        this._buttons.push(this._closeButton);
        this._exitLobbySection = new PIXI.Container();
        this._exitSeparator = new PIXI.Graphics();
        this._exitLobbySection.addChild(this._exitLobbyButton);
        this._exitLobbySection.addChild(this._exitSeparator);
        this._navigationSection = new PIXI.Container();
        this._navigationSection.addChild(this._historyButton);
        this._navigationSection.addChild(this._infoButton);
        this._navigationSection.addChild(this._settingButton);
        this._closeButtonSection = new PIXI.Container();
        this._closeButtonSeparator = new PIXI.Graphics();
        this._closeButtonSection.addChild(this._closeButtonSeparator);
        this._closeButtonSection.addChild(this._closeButton);
        this.addChild(this._backPlate);
        this.addChild(this._exitLobbySection);
        this.addChild(this._navigationSection);
        this.addChild(this._closeButtonSection);
        for (let button of this._buttons) {
            button.enable(true);
        }
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.options.device === APIOptions_1.Device.DESKTOP) {
            if (!SlotKeypad_1.SlotKeypad.apiPlugIn.options.showExitButtonDesktop) {
                SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._exitLobbySection);
            }
        }
        else {
            if (SlotKeypad_1.SlotKeypad.apiPlugIn.options.hideExitButton) {
                SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._exitLobbySection);
            }
        }
    }
    updateButtons(activePageName) {
        for (let button of this._buttons) {
            button.toggled = (activePageName === button.name);
        }
    }
}
exports.GameMenuNavigationBar = GameMenuNavigationBar;
//# sourceMappingURL=GameMenuNavigationBar.js.map