"use strict";
/**
 * Created by Jonas Wålekvist on 2019-10-16.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoPlayView = void 0;
const SlotKeypad_1 = require("../../../SlotKeypad");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const DialogView_1 = require("./DialogView");
const AutoPlayRoundsPage_1 = require("./pages/AutoPlayRoundsPage");
const AutoPlaySettingsPage_1 = require("./pages/AutoPlaySettingsPage");
const ScreenBounds_1 = require("@nolimitcity/slot-launcher/bin/display/ScreenBounds");
const KeypadDefault_1 = require("../../config/KeypadDefault");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
class AutoPlayView extends DialogView_1.DialogView {
    constructor(controller, api) {
        super(controller, api, "AutoPlaySettings", true);
    }
    init() {
        super.init();
        this._settingsPage = new AutoPlaySettingsPage_1.AutoPlaySettingsPage(this, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Autoplay settings"));
        this._settingsPage.name = "AutoPlaySettingsPage";
        this._roundsPage = new AutoPlayRoundsPage_1.AutoPlayRoundsPage(this, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Number of Rounds"));
        this._roundsPage.name = "NumberOfRoundsPage";
        this._sectionDivider = new PIXI.Graphics();
        this._content = new PIXI.Container();
        this._content.addChild(this._settingsPage);
        this._content.addChild(this._sectionDivider);
        this._content.addChild(this._roundsPage);
        this.addChild(this._content);
    }
    drawSectionDivider(bounds, isLandsScape) {
        this._sectionDivider.clear();
        this._sectionDivider.lineStyle(1, 0xffffff, 0.6);
        const margin = KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT;
        this._sectionDivider.moveTo(margin, 0);
        this._sectionDivider.lineTo(bounds.width - margin * 2, 0);
    }
    onResize() {
        super.onResize();
        if (!this.shouldResize()) {
            return;
        }
        const bounds = (0, ScreenBounds_1.cloneScreenBounds)(NolimitApplication_1.NolimitApplication.screenBounds);
        bounds.bottom -= this.bottomMargin;
        this.drawSectionDivider(bounds, NolimitApplication_1.NolimitApplication.isLandscape);
        this._settingsPage.onResize(bounds);
        this._roundsPage.onResize(bounds);
        GuiLayout_1.GuiLayout.align([this._settingsPage, this._sectionDivider, this._roundsPage], 10, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
        this._content.position.set(bounds.left, bounds.top);
    }
    onInteraction(name, value) {
        let shouldClose = false;
        let playSound = true;
        const buttonType = name.split("_")[0];
        if (buttonType == "maxSingleWin") {
            this.autoPlaySettingsData.maxSingleWin = value;
            playSound = false;
        }
        if (buttonType == "StopWhenBalanceIsLower") {
            if (this.autoPlaySettingsData.minBalancePercent == value) {
                this.autoPlaySettingsData.minBalancePercent = undefined;
            }
            else {
                this.autoPlaySettingsData.minBalancePercent = value;
            }
        }
        if (buttonType == "StopWhenBalanceIsHigher") {
            if (this.autoPlaySettingsData.maxBalancePercent == value) {
                this.autoPlaySettingsData.maxBalancePercent = undefined;
            }
            else {
                this.autoPlaySettingsData.maxBalancePercent = value;
            }
        }
        if (buttonType == "AutoPlayRoundsButton") {
            this.autoPlaySettingsData.rounds = parseInt(value);
            shouldClose = true;
        }
        this._controller.updateAutoplaySettings(this.autoPlaySettingsData);
        this._settingsPage.updateValues(SlotKeypad_1.SlotKeypad.autoplay.settings);
        this._roundsPage.updateButtons(SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRounds);
        if (playSound && !shouldClose) {
            SlotKeypad_1.SlotKeypad.playButtonSound(buttonType);
        }
        if (shouldClose) {
            this.close(true);
        }
    }
    open() {
        super.open();
        this.autoPlaySettingsData = SlotKeypad_1.SlotKeypad.autoplay.settings;
        this._settingsPage.updateValues(SlotKeypad_1.SlotKeypad.autoplay.settings);
        this._roundsPage.updateButtons(SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRounds);
        this.onResize();
        this._settingsPage.updateDomElement(true);
    }
    close(shouldStartAutoplay = false) {
        if (!shouldStartAutoplay) {
        }
        this._settingsPage.updateDomElement(false);
        this.reportBackSettingPageClosed();
        super.close();
    }
    reportBackSettingPageClosed() {
        SlotKeypad_1.SlotKeypad.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.SETTING_PAGE_CHANGE, {
            name: 'gameMenu',
            value: false
        });
    }
}
exports.AutoPlayView = AutoPlayView;
//# sourceMappingURL=AutoPlayView.js.map