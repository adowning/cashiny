"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameMenuDialogView = exports.MenuButtonIDs = void 0;
const DialogView_1 = require("./DialogView");
const SlotKeypad_1 = require("../../../SlotKeypad");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const ScreenBounds_1 = require("@nolimitcity/slot-launcher/bin/display/ScreenBounds");
const HistoryPage_1 = require("./pages/HistoryPage");
const InfoPage_1 = require("./pages/InfoPage");
const GameSettingsPage_1 = require("./pages/GameSettingsPage");
const GameMenuNavigationBar_1 = require("./GameMenuNavigationBar");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
var MenuButtonIDs;
(function (MenuButtonIDs) {
    MenuButtonIDs["EXIT_TO_LOBBY"] = "EXIT_TO_LOBBY";
    MenuButtonIDs["HISTORY"] = "HISTORY";
    MenuButtonIDs["INFO"] = "INFO";
    MenuButtonIDs["SETTINGS"] = "SETTINGS";
    MenuButtonIDs["CLOSE"] = "CLOSE";
})(MenuButtonIDs = exports.MenuButtonIDs || (exports.MenuButtonIDs = {}));
class GameMenuDialogView extends DialogView_1.DialogView {
    openAndGoTo(section) {
        if (!this._isOpen) {
            if (section === InfoPage_1.SettingSectionIDs.GUIDE) {
                this.open();
                this._infoPage.goToSection(section);
            }
            else if (section === InfoPage_1.SettingSectionIDs.RULES) {
                this.open();
                this._infoPage.goToSection(section);
            }
            else if (section === InfoPage_1.SettingSectionIDs.PAYTABLE) {
                this.open();
                this._infoPage.goToSection(section);
            }
        }
    }
    constructor(controller, api) {
        super(controller, api, "GameMenu", false);
        this._htmlScreenContainer = GameMenuDialogView.getScreensContainer();
        this._screenSystem = SlotKeypad_1.SlotKeypad.apiPlugIn.screenSystem.create(this._htmlScreenContainer);
        this.init();
        this._init = true;
    }
    init() {
        super.init();
        this._menuBar = new GameMenuNavigationBar_1.GameMenuNavigationBar(this);
        this.addChild(this._menuBar);
        this._gameSettingsPage = new GameSettingsPage_1.GameSettingsPage(MenuButtonIDs.SETTINGS, this, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Game settings"));
        this._infoPage = new InfoPage_1.InfoPage(this._htmlScreenContainer, this._screenSystem, MenuButtonIDs.INFO, this);
        this._historyPage = new HistoryPage_1.HistoryPage(this._htmlScreenContainer, this._screenSystem, MenuButtonIDs.HISTORY, this, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Game history"));
    }
    preLoadHtmlPages() {
        const htmlPreloads = [];
        htmlPreloads.push(this._historyPage.load());
        htmlPreloads.push(this._infoPage.load());
        return Promise.all(htmlPreloads);
    }
    onResize() {
        super.onResize();
        if (!this.shouldResize()) {
            return;
        }
        const bounds = (0, ScreenBounds_1.cloneScreenBounds)(NolimitApplication_1.NolimitApplication.screenBounds);
        bounds.bottom -= this.bottomMargin;
        bounds.height -= this.bottomMargin;
        this._menuBar.onResize(bounds);
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            bounds.right -= this._menuBar.width;
            bounds.width -= this._menuBar.width;
        }
        else {
            bounds.bottom -= this._menuBar.height;
            bounds.height -= this._menuBar.height;
        }
        this._gameSettingsPage.position.set(bounds.left, bounds.top);
        this._gameSettingsPage.onResize(bounds);
        this._historyPage.position.set(bounds.left, bounds.top);
        this._historyPage.onResize(bounds);
        this._infoPage.position.set(bounds.left, bounds.top);
        this._infoPage.onResize(bounds);
    }
    onInteraction(name, value) {
        let playSound = true;
        switch (name) {
            case MenuButtonIDs.EXIT_TO_LOBBY:
                this._controller.exitToLobby();
                break;
            case MenuButtonIDs.HISTORY:
                this.setActivePage(this._historyPage);
                this.reportBackSettingPageChange(SlotKeypad_1.SettingPageIDs.HISTORY, true);
                break;
            case MenuButtonIDs.INFO:
                this.setActivePage(this._infoPage);
                this.reportBackSettingPageChange(SlotKeypad_1.SettingPageIDs.INFO, true);
                break;
            case MenuButtonIDs.SETTINGS:
                this.setActivePage(this._gameSettingsPage);
                this.reportBackSettingPageChange(SlotKeypad_1.SettingPageIDs.SETTINGS, true);
                break;
            case MenuButtonIDs.CLOSE:
                // TODO: Necessary to add which page is closed, prolly N/A in this scenario
                this.close();
                playSound = false;
                break;
        }
        if (playSound == true) {
            SlotKeypad_1.SlotKeypad.playButtonSound(name);
        }
        this.updateButtons();
    }
    open() {
        super.open();
        this.onResize();
        this.setActivePage(this._infoPage);
        this.updateButtons();
    }
    close() {
        this.setActivePage(null);
        this.reportBackSettingPageClosed();
        super.close();
    }
    reportBackSettingPageChange(page, activated) {
        SlotKeypad_1.SlotKeypad.apiPlugIn.externalApi.trigger(APIEventSystem_1.APIEvent.SETTING_PAGE_CHANGE, {
            name: page,
            value: activated
        });
    }
    reportBackSettingPageClosed() {
        SlotKeypad_1.SlotKeypad.apiPlugIn.externalApi.trigger(APIEventSystem_1.APIEvent.SETTING_PAGE_CHANGE, {
            name: 'gameMenu',
            value: false
        });
    }
    setActivePage(page) {
        if (page == null) {
            this._activePage.deactivate();
            this._htmlScreenContainer.style.display = "none";
            return;
        }
        if (page == this._activePage) {
            if (this._activePage.name !== "HISTORY") {
                this._activePage.activate();
            }
            return;
        }
        if (this._activePage) {
            this.removeChild(this._activePage);
            this._activePage.deactivate();
        }
        page.activate();
        this.addChild(page);
        this._activePage = page;
    }
    updateButtons() {
        this._menuBar.updateButtons(this._activePage.name);
    }
    static getScreensContainer() {
        let screens = document.querySelector('.nolimit.container.screensFrameContainer');
        if (screens == undefined) {
            const parent = document.querySelector('.nolimit.container');
            if (parent == undefined) {
                SlotKeypad_1.SlotKeypad.apiPlugIn.error.trigger("Can't find container element: .nolimit.container");
            }
            else {
                screens = document.createElement("div");
                screens.classList.add("screensFrameContainer");
                screens.style.display = "none";
                screens.style.position = "absolute";
                screens.style.width = "100%";
                screens.style.height = "100%";
                screens.style.top = "0px";
                screens.style.left = "0pxe";
                //screens.style.backgroundColor = "rgba(255,0,0,0.2)";
                parent.appendChild(screens);
            }
        }
        return screens;
    }
}
exports.GameMenuDialogView = GameMenuDialogView;
//# sourceMappingURL=GameMenuDialogView.js.map