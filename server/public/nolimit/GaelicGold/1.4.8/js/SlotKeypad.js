"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotKeypad = exports.SettingsExtEventIDs = exports.SettingPageIDs = exports.KeypadValueIDs = exports.KeypadButtonIDs = void 0;
/**
 * Class description
 *
 * Created: 2019-09-10
 * @author jonas
 */
const GuiButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/GuiButton");
const KeypadPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/KeypadPlugin");
const SpinButtonState_1 = require("./core/view/buttons/state/SpinButtonState");
const SoundPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/SoundPlugin");
const PromotionPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/PromotionPlugin");
const ApiPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/ApiPlugin");
const AutoPlayPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/AutoPlayPlugin");
const BetState_1 = require("./core/view/buttons/state/BetState");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const NolimitLauncher_1 = require("@nolimitcity/slot-launcher/bin/NolimitLauncher");
const KeypadView_1 = require("./core/view/KeypadView");
const gsap_1 = require("gsap");
const BetLevelsDialogView_1 = require("./core/view/dialogs/BetLevelsDialogView");
const AutoPlayView_1 = require("./core/view/dialogs/AutoPlayView");
const GameMenuDialogView_1 = require("./core/view/dialogs/GameMenuDialogView");
const SlotKeypadViewSettings_1 = require("./core/SlotKeypadViewSettings");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const SlotStateHandler_1 = require("@nolimitcity/slot-launcher/bin/plugins/apiplugin/SlotStateHandler");
const APIBetType_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIBetType");
const APIExternalApi_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIExternalApi");
const APISettingsSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APISettingsSystem");
const FontLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/FontLoader");
const TemplateLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/TemplateLoader");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const DemoView_1 = require("./core/view/dialogs/DemoView");
const APIOptions_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIOptions");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const SlotKeypadUtils_1 = require("./core/utils/SlotKeypadUtils");
const KeyboardInput_1 = require("./core/handlers/KeyboardInput");
const InfoPage_1 = require("./core/view/dialogs/pages/InfoPage");
const SkinLoader_1 = require("./SkinLoader");
const KeypadSound_1 = require("./core/view/KeypadSound");
const NolimitBonusIntroPage_1 = require("./core/intro/NolimitBonusIntroPage");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const NolimitBoosterIntroPage_1 = require("./core/intro/NolimitBoosterIntroPage");
var KeypadButtonIDs;
(function (KeypadButtonIDs) {
    KeypadButtonIDs["FAST_SPIN"] = "FAST_SPIN";
    KeypadButtonIDs["PROMO_BUTTON"] = "PROMO_BUTTON";
    KeypadButtonIDs["DEMO"] = "DEMO";
    KeypadButtonIDs["SOUND"] = "SOUND";
    KeypadButtonIDs["AUTO_PLAY"] = "autoplay";
    KeypadButtonIDs["SPIN"] = "spin";
    KeypadButtonIDs["FULLSCREEN_SPIN"] = "FULLSCREEN_SPIN";
    KeypadButtonIDs["MENU"] = "menu";
    KeypadButtonIDs["NOLIMIT_BONUS_MENU"] = "nolimitBonusMenu";
    KeypadButtonIDs["BET_LEVEL"] = "bet-level";
    KeypadButtonIDs["EXIT_REPLAY"] = "exitReplay";
    KeypadButtonIDs["LIMIT_CAP"] = "limitCap";
})(KeypadButtonIDs = exports.KeypadButtonIDs || (exports.KeypadButtonIDs = {}));
var KeypadValueIDs;
(function (KeypadValueIDs) {
    KeypadValueIDs["BET"] = "BET";
    KeypadValueIDs["WIN"] = "WIN";
    KeypadValueIDs["BALANCE"] = "BALANCE";
    KeypadValueIDs["FREE_BETS_TOTAL_WIN"] = "FREE_BETS_TOTAL_WIN";
    KeypadValueIDs["TOTAL_COST"] = "TOTAL_COST";
})(KeypadValueIDs = exports.KeypadValueIDs || (exports.KeypadValueIDs = {}));
var SettingPageIDs;
(function (SettingPageIDs) {
    SettingPageIDs["GAME_MENU"] = "gameMenuPage";
    SettingPageIDs["INFO"] = "infoPage";
    SettingPageIDs["SETTINGS"] = "settingsPage";
    SettingPageIDs["BET_LEVEL"] = "betLevelPage";
    SettingPageIDs["AUTOPLAY"] = "autoplayPage";
    SettingPageIDs["HISTORY"] = "historyPage";
})(SettingPageIDs = exports.SettingPageIDs || (exports.SettingPageIDs = {}));
var SettingsExtEventIDs;
(function (SettingsExtEventIDs) {
    SettingsExtEventIDs["SOUND_MASTER"] = "soundMaster";
    SettingsExtEventIDs["FAST_SPIN"] = "fastSpin";
    SettingsExtEventIDs["AUTOPLAY"] = "autoplay";
    SettingsExtEventIDs["OPEN_SETTINGS_SECTION"] = "openSettingsSection";
})(SettingsExtEventIDs = exports.SettingsExtEventIDs || (exports.SettingsExtEventIDs = {}));
class SlotKeypad {
    get showing() {
        return (this._view && this._view.visible);
    }
    constructor(gameConfig) {
        this.name = "SlotKeypad";
        this._balancePrecision = 2;
        this._hasOpenConfirmDialog = false;
        this._disableSpinButtonOnGamble = false;
        this.gameConfig = gameConfig;
        this.skinLoader = new SkinLoader_1.SkinLoader();
        SlotKeypad.skinLoader = this.skinLoader;
        SlotKeypad._instance = this;
    }
    fetchPlugins() {
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if ((0, SoundPlugin_1.isSoundPlugin)(plugin)) {
                SlotKeypad.sound = plugin;
            }
            if ((0, AutoPlayPlugin_1.isAutoPlayPlugin)(plugin)) {
                SlotKeypad.autoplay = plugin;
            }
            if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                SlotKeypad.apiPlugIn = plugin;
                SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.INIT, (data) => this.onInitData());
            }
            if ((0, PromotionPlugin_1.isPromotionPlugin)(plugin)) {
                SlotKeypad.promoPlugin = plugin;
            }
        }
        if (SlotKeypad.sound == undefined) {
            return Promise.reject(new Error("SlotKeypad is missing SoundPlugin"));
        }
        if (SlotKeypad.apiPlugIn == undefined) {
            return Promise.reject(new Error("SlotKeypad is missing  ApiPlugin"));
        }
        if (SlotKeypad.autoplay == undefined) {
            return Promise.reject(new Error("SlotKeypad is missing  AutoPlayPlugin"));
        }
        return Promise.resolve();
    }
    //-- Plugin interface implementation
    destroy() {
        this.events.shutdown();
        SlotKeypad.sound = undefined;
        SlotKeypad.autoplay = undefined;
        SlotKeypad.apiPlugIn = undefined;
        SlotKeypad.promoPlugin = undefined;
        SlotKeypad.NO_DECIMALS_CUTOFF_POINT = undefined;
        SlotKeypad.svgLoader = undefined;
        SlotKeypad.skinLoader = undefined;
        SlotKeypad.VERSION = undefined;
    }
    init() {
        return new Promise((resolve, reject) => {
            this.fetchPlugins().catch((reason) => {
                return Promise.reject(reason);
            });
            this.events = SlotKeypad.apiPlugIn.eventSystemFactory.create();
            SlotKeypad.self = this;
            this.skinLoader.loadIntroAssets().then(() => {
                resolve(this);
            });
        });
    }
    getReady() {
        const fontLoader = new FontLoader_1.FontLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        fontLoader.add(OpenSans_1.OpenSans.ITALIC_600);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_300);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_400);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_700);
        const promise = Promise.all([this.skinLoader.load(), fontLoader.load()]);
        return promise.then((value) => {
            SlotKeypad.apiPlugIn.settings.set(APISettingsSystem_1.APISetting.DEVICE_HAS_ROUNDED_CORNERS, SlotKeypad.apiPlugIn.options.device == APIOptions_1.Device.MOBILE);
            this._view = new KeypadView_1.KeypadView(this);
            if (SlotKeypad.apiPlugIn.options.demo && SlotKeypad.apiPlugIn.options.token) {
                this._demoView = new DemoView_1.DemoView(this, SlotKeypad.apiPlugIn);
                this._demoView.load().then((outcome) => {
                    this._view.betPanel.demoButton.enable(true);
                });
            }
            else {
                this.disableDemoButton();
            }
            this._betLevelsView = new BetLevelsDialogView_1.BetLevelsDialogView(this, SlotKeypad.apiPlugIn);
            this._autoPlaySettingsView = new AutoPlayView_1.AutoPlayView(this, SlotKeypad.apiPlugIn);
            this._gameMenuView = new GameMenuDialogView_1.GameMenuDialogView(this, SlotKeypad.apiPlugIn);
            this.addEventListeners();
            return this._gameMenuView.preLoadHtmlPages().then(values => {
                return this;
            });
        });
    }
    getReadyToStart() {
        return new Promise((resolve, reject) => {
            var _a;
            const urlParams = new URLSearchParams(window.parent.location.search);
            const myParam = urlParams.get('showGameInfoContainer');
            if (!!myParam) {
                const divElement = document.createElement("div");
                divElement.id = "openPaytable";
                (_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.append(divElement);
                divElement.addEventListener("click", () => {
                    var _a;
                    const button = new GuiButton_1.GuiButton("menu");
                    this.buttonClick(button);
                    (_a = document.activeElement) === null || _a === void 0 ? void 0 : _a.removeChild(divElement);
                });
            }
            //Update button state
            this._view.betPanel.fastSpinButton.toggled = SlotKeypad.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.FAST_SPIN, false);
            //Enable
            this._view.betPanel.promoButton.enable(true);
            this._view.betPanel.betLevelButton.enable(true);
            this._view.betPanel.spinButton.enable(true);
            this._view.betPanel.nolimitBonusMenu.enable(true);
            this._view.betPanel.fastSpinButton.enable(true);
            this._view.betPanel.autoplayButton.enable(true);
            this._view.betPanel.menuButton.enable(true);
            this._view.betPanel.limitCapButton.enable(true);
            this._view.betPanel.soundButton.enable(true);
            //set allowance
            if (!SlotKeypad.promoPlugin || !SlotKeypad.promoPlugin.hasPromotions()) {
                SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._view.betPanel.promoButton);
            }
            if (SlotKeypad.apiPlugIn.options.autoplay === false) {
                SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._view.betPanel.autoplayButton);
                this._view.betPanel.onResize();
            }
            if (SlotKeypad.apiPlugIn.gameClientConfiguration.isSet) {
                this.applyGameClientConfiguration();
            }
            else {
                SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.GAME_CLIENT_CONFIGURATION_APPLIED, () => this.applyGameClientConfiguration());
            }
            SlotKeypad.apiPlugIn.settings.set(APISettingsSystem_1.APISetting.LEFT_HAND_MODE, false); //Todo - this is causing issues with overlapping gfx in current betpanel layout. Disabling.
            if (!SlotKeypad.apiPlugIn.betLevel.hasCapWinLimitToggle()) {
                SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._view.betPanel.limitCapButton);
            }
            else {
                const labels = SlotKeypad.apiPlugIn.betLevel.getButtonLabels();
                this._view.betPanel.limitCapButton.addBylines(labels.onLabel, labels.offLabel);
                this._view.betPanel.limitCapButton.toggled = SlotKeypad.apiPlugIn.betLevel.isCapWinLimitToggled();
                SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.BET_GAME_MODE_CHANGED, () => {
                    this._view.betPanel.limitCapButton.toggled = SlotKeypad.apiPlugIn.betLevel.isCapWinLimitToggled();
                    const activeFeature = SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature();
                    if (activeFeature != undefined) {
                        if (activeFeature.isBetLevelAndCostValid() == false) {
                            SlotKeypad.apiPlugIn.betFeatureController.setActiveBetFeature();
                        }
                    }
                    this.updateBet();
                });
            }
            resolve(this);
        });
    }
    start() {
        return new Promise((resolve, reject) => {
            this._view.onOrientationChanged();
            this._view.onResize();
            this._view.alpha = 0;
            NolimitApplication_1.NolimitApplication.addLayer("Keypad", this._view);
            if (SlotKeypad.apiPlugIn.options.device == APIOptions_1.Device.DESKTOP && !SlotKeypad.apiPlugIn.isReplay && SlotKeypad.apiPlugIn.gameClientConfiguration.spacebarSpinAllowed) {
                this._keyboardInput = new KeyboardInput_1.KeyboardInput(SlotKeypad.apiPlugIn, this);
            }
            gsap_1.TweenLite.to(this._view, 0.2, {
                alpha: 1, ease: gsap_1.Linear.easeNone, onComplete: () => {
                    resolve(this);
                }
            });
        });
    }
    static getGuiGuideData(data) {
        const bonusFeatures = [];
        const boosterFeatures = [];
        //Todo -move this to a updateScreen function. This needs to be updated every timme we open because of the new gameModes.
        const bonusData = SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures();
        for (let bonusFeature of bonusData) {
            const data = {
                name: bonusFeature.name,
                maxBet: SlotKeypad.apiPlugIn.currency.format(bonusFeature.getMaxBet()),
                price: bonusFeature.price,
                image: bonusFeature.displayConfig.imageUrl,
                description: bonusFeature.displayConfig.description,
            };
            if (bonusFeature.type === "FREESPIN") {
                bonusFeatures.push(data);
            }
            else {
                boosterFeatures.push(data);
            }
        }
        data.hasNolimitBonus = (bonusFeatures.length > 0);
        data.bonusFeatures = bonusFeatures;
        data.hasNolimitBooster = (boosterFeatures.length > 0);
        data.boosterFeatures = boosterFeatures;
        data.skin = SlotKeypad.skinLoader.getSkinData();
        return data;
    }
    getKeypadGuide() {
        const templateLoader = new TemplateLoader_1.TemplateLoader(SlotKeypad.apiPlugIn.resources.getStaticRoot());
        templateLoader.add({
            name: "gui-guide",
            url: "node_modules/@nolimitcity/slot-keypad/resources/default/templates/gui-guide.mustache"
        });
        return templateLoader.load().then((assets) => {
            for (let asset of assets) {
                if (asset.name == "gui-guide" && asset.loadedData) {
                    return asset.loadedData;
                }
            }
            throw new Error("SlotKeypad could not load gui-guide");
        });
    }
    getIntroPages() {
        return new Promise((resolve, reject) => {
            const fontLoader = new FontLoader_1.FontLoader(NolimitApplication_1.NolimitApplication.resourcePath);
            fontLoader.add(OpenSans_1.OpenSans.NORMAL_600);
            fontLoader.add(OpenSans_1.OpenSans.NORMAL_800);
            return Promise.all([fontLoader.load(), this.skinLoader.loadIntroAssets(), (SlotKeypad.apiPlugIn.betFeatureController).hasInit()]).then(() => {
                const pages = [];
                const features = SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures();
                let bonuses = 0;
                let boosters = 0;
                for (let feature of features) {
                    if (feature.type === "FREESPIN") {
                        bonuses += 1;
                    }
                    else {
                        boosters += 1;
                    }
                }
                if (bonuses > 0) {
                    pages.push(new NolimitBonusIntroPage_1.NolimitBonusIntroPage());
                }
                if (boosters > 0) {
                    pages.push(new NolimitBoosterIntroPage_1.NolimitBoosterIntroPage());
                }
                resolve(pages);
            });
        });
    }
    applyGameClientConfiguration() {
        if (!SlotKeypad.apiPlugIn.gameClientConfiguration.fastSpinEnabled) {
            SlotKeypad.apiPlugIn.settings.set(APISettingsSystem_1.APISetting.FAST_SPIN, false);
            SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._view.betPanel.fastSpinButton);
        }
        if (!SlotKeypad.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayAllowed) {
            SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._view.betPanel.autoplayButton);
        }
        if (SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures().length <= 0) {
            SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._view.betPanel.nolimitBonusMenu);
        }
        this._view.betPanel.onResize();
    }
    setupMaxInactivityTimerForJurisdiction() {
        if (SlotKeypad.apiPlugIn.gameClientConfiguration.maxInactivityInMinutes && SlotKeypad.apiPlugIn.gameClientConfiguration.maxInactivityInMinutes > 0) {
            // TODO: Add timer for max inactivity jurisdiction rule (Spain)
            this.createJurisdictionMaxInactivityInterval();
        }
    }
    isMaxInactivityForJurisdictionApplied() {
        if (SlotKeypad.apiPlugIn.gameClientConfiguration.maxInactivityInMinutes && SlotKeypad.apiPlugIn.gameClientConfiguration.maxInactivityInMinutes > 0) {
            return true;
        }
        return false;
    }
    createJurisdictionMaxInactivityInterval() {
        if (this.isMaxInactivityForJurisdictionApplied()) {
            const startDate = new Date();
            let endDate = this._currentEndDate = new Date(startDate.getTime() + SlotKeypad.apiPlugIn.gameClientConfiguration.maxInactivityInMinutes * 60000); // Date now + maxInactivity minutes;
            Logger_1.Logger.logDev("SlotKeypad - Inactivity, setting up max inactivity timer for jurisdiction: " + SlotKeypad.apiPlugIn.gameClientConfiguration.jurisdictionName);
            Logger_1.Logger.logDev("SlotKeypad - Inactivity Time in Minutes: " + SlotKeypad.apiPlugIn.gameClientConfiguration.maxInactivityInMinutes);
            Logger_1.Logger.logDev("SlotKeypad - Inactivity Start Date: " + startDate);
            Logger_1.Logger.logDev("SLotKeypad - Inactivity End Date: " + endDate);
            clearInterval(this._maxInactivityInterval);
            let iVal = this._maxInactivityInterval = setInterval(function () {
                // Test diff
                let now = new Date();
                let diffMs = (endDate - now);
                let diffMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                Logger_1.Logger.logDev("SlotKeypad - Inactivity, minute countdown: " + diffMinutes);
                // Trigger func
                if (diffMinutes <= 0) {
                    clearInterval(iVal);
                    Logger_1.Logger.logDev("SlotKeypad - Inactivity, time limit met, showing dialog at time: " + now);
                    // End interval and trigger dialog, desktop or mobile
                    if (SlotKeypad.apiPlugIn.options.device === 'mobile') {
                        SlotKeypad.apiPlugIn.dialog.showGameDialog({
                            message: SlotKeypad.apiPlugIn.translations.translate("You have reached the maximum inactivity time and you have to restart the game to continue playing."),
                            okButtonLabel: "OK",
                            onOkClick: () => {
                                SlotKeypad.apiPlugIn.externalApi.trigger(APIExternalApi_1.APIExternalApiEvent.EXIT).or(history.back.bind(history));
                            }
                        });
                    }
                    else {
                        SlotKeypad.apiPlugIn.dialog.showNoCloseGameDialog({
                            message: SlotKeypad.apiPlugIn.translations.translate("You have reached the maximum inactivity time and you have to restart the game to continue playing.")
                        });
                    }
                }
            }, 59 * 1000);
        }
    }
    forceCheckInactivity() {
        if (this._currentEndDate && this._maxInactivityInterval) {
            let now = new Date();
            let diffMs = (this._currentEndDate - now);
            let diffMinutes = Math.round(((diffMs % 86400000) % 3600000) / 60000);
            Logger_1.Logger.logDev("SlotKeypad - Inactivity, force check on page visibility, time left on inactivity: " + diffMinutes);
            if (diffMinutes <= 0) {
                clearInterval(this._maxInactivityInterval);
                Logger_1.Logger.logDev("SlotKeypad - Inactivity, time limit met, showing dialog at time: " + now);
                // End interval and trigger dialog, desktop or mobile
                if (SlotKeypad.apiPlugIn.options.device === 'mobile') {
                    SlotKeypad.apiPlugIn.dialog.showGameDialog({
                        message: SlotKeypad.apiPlugIn.translations.translate("You have reached the maximum inactivity time and you have to restart the game to continue playing."),
                        okButtonLabel: "OK",
                        onOkClick: () => {
                            SlotKeypad.apiPlugIn.externalApi.trigger(APIExternalApi_1.APIExternalApiEvent.EXIT).or(history.back.bind(history));
                        }
                    });
                }
                else {
                    SlotKeypad.apiPlugIn.dialog.showNoCloseGameDialog({
                        message: SlotKeypad.apiPlugIn.translations.translate("You have reached the maximum inactivity time and you have to restart the game to continue playing.")
                    });
                }
            }
        }
    }
    ;
    disableDemoButton() {
        SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this._view.betPanel.demoButton);
    }
    addEventListeners() {
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.CURRENCY, (data) => SlotKeypadUtils_1.SlotKeypadUtils.doFontHack(data));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.REFRESH, (...value) => this.onRefresh(value));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.BET, (bet) => this.onBet(bet));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_ROUND_COMPLETE, () => this.updateBalance());
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.STATE, (state) => this.onState(state));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.FAST_SPIN, (data) => this.onFastSpin(data));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.AUTO_PLAY, () => this.onAutoPlay());
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.SELECTED_FEATURE_BET_CHANGED, () => this.updateBet());
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.CURRENT_BET, () => this.updateBet());
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.HALT, () => this.onHalt());
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.PAUSE, () => this.onPause(true));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.RESUME, () => this.onPause(false));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.FREEZE, () => this.onFreeze(true));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.UNFREEZE, () => this.onFreeze(false));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.HIDDEN, (hidden) => this.onHidden(hidden));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.GAME, (data) => this.onGameData(data));
        SlotKeypad.apiPlugIn.events.on("redirectingToBonusInGame", (data) => this.onPlayBonusInGame(data));
        SlotKeypad.apiPlugIn.events.on("redirectingToBonusInGameComplete", (data) => this.onPlayBonusInGameComplete(data));
        SlotKeypad.apiPlugIn.settings.on(APIEventSystem_1.APIEvent.MUSIC, (value) => this.onMusic(value));
        SlotKeypad.apiPlugIn.settings.on(APIEventSystem_1.APIEvent.SFX, (value) => this.onSfx(value));
        SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.SETTING_PAGE_CHANGE, (action) => this.onSettingPageChange(action));
        NolimitApplication_1.NolimitApplication.events.on(NolimitApplication_1.NolimitApplication.DIALOG_OPENED, () => this.dialogOpened());
        NolimitApplication_1.NolimitApplication.events.on(NolimitApplication_1.NolimitApplication.DIALOG_CLOSING, () => this.dialogClosing());
        NolimitApplication_1.NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.DIALOG, (data) => this.onApiDialog(data));
        NolimitApplication_1.NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.GUI_REFRESH, (data) => this.onGuiRefresh(data));
        SlotKeypad.apiPlugIn.freeBets.events.on(SlotKeypad.apiPlugIn.freeBets.FREE_BETS_START, () => this.onFreeBetsStart());
        SlotKeypad.apiPlugIn.freeBets.events.on(SlotKeypad.apiPlugIn.freeBets.FREE_BETS_START_FROM_ACTION_SPINS, () => this.hideAllKeypadStuff());
        SlotKeypad.apiPlugIn.freeBets.events.on(SlotKeypad.apiPlugIn.freeBets.FREE_BETS_END, () => this.onFreeBetsEnd());
        SlotKeypad.apiPlugIn.freeBets.events.on(SlotKeypad.apiPlugIn.freeBets.FREE_BETS_UPDATE, () => this.onFreeBetsUpdate());
        SlotKeypad.apiPlugIn.freeFeatureBet.events.on(SlotKeypad.apiPlugIn.freeFeatureBet.FREE_FEATURE_BET_START, () => this.onFreeFeatureBetStart());
        SlotKeypad.apiPlugIn.freeFeatureBet.events.on(SlotKeypad.apiPlugIn.freeFeatureBet.FREE_FEATURE_BET_END, () => this.onFreeFeatureBetEnd());
    }
    onGuiRefresh(data) {
        if (SlotKeypad.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.READY)) {
            this.updateBet();
            this.updateBalance();
            this.updateSoundButton();
            if (SlotKeypad.apiPlugIn.freeBets.hasFreeBets()) {
                this.updateFreeBetsTotalWin();
            }
            if ((data === null || data === void 0 ? void 0 : data.hideBalance) != undefined) {
                this._view.betPanel.balance.visible = data.hideBalance !== true;
            }
        }
    }
    hideAllKeypadStuff() {
        this._view.visible = false;
    }
    onFreeFeatureBetStart() {
        this._view.betPanel.promoButton.enable(false);
        this._view.betPanel.promoButton.visible = false;
        this._view.betPanel.nolimitBonusMenu.enable(false);
        this._view.betPanel.nolimitBonusMenu.setVisible(false);
        this.setSpinButtonBetState();
        this._view.betPanel.autoplayButton.spinsCounterLabel.setColor(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_FEATURE_BET_COLOR);
        this._view.betPanel.betLevelButton.enable(false);
        this._view.betPanel.betLevelButton.hide();
        this.updateBet();
    }
    onFreeFeatureBetEnd() {
        this._view.betPanel.promoButton.enable(true);
        this._view.betPanel.promoButton.visible = true;
        this._view.betPanel.nolimitBonusMenu.enable(true);
        this._view.betPanel.nolimitBonusMenu.setVisible(true);
        this.setSpinButtonBetState();
        this._view.betPanel.bet.setLabel(SlotKeypad.apiPlugIn.translations.translate("BET"));
        this._view.betPanel.bet.setColor(GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR));
        this._view.betPanel.autoplayButton.enable(true);
        this._view.betPanel.autoplayButton.spinsCounterLabel.setColor(SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR);
        this._view.betPanel.betLevelButton.show();
        this._view.betPanel.betLevelButton.enable(true);
        this.updateBet(); //Freebets end
        this._view.betPanel.onResize();
    }
    onFreeBetsUpdate() {
        this._view.betPanel.bet.setLabel(SlotKeypad.apiPlugIn.freeBets.getBetHeader());
        this._view.betPanel.bet.setColor(GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR));
        this.updateFreeBetsTotalWin(true);
    }
    onFreeBetsStart() {
        this._view.betPanel.promoButton.enable(false);
        this._view.betPanel.promoButton.visible = false;
        this._view.betPanel.nolimitBonusMenu.enable(false);
        this._view.betPanel.nolimitBonusMenu.setVisible(false);
        this.setSpinButtonBetState();
        this._view.betPanel.autoplayButton.spinsCounterLabel.setColor(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR);
        this._view.betPanel.betLevelButton.enable(false);
        this._view.betPanel.betLevelButton.hide();
        this.updateBet(); //Freebets start
        this.updateFreeBetsTotalWin();
    }
    updateFreeBetsTotalWin(ignoreUpdatedBalance = false) {
        let win = SlotKeypad.apiPlugIn.freeBets.getFormattedWin();
        const currentWin = SlotKeypad.apiPlugIn.freeBets.getCurrentWinnings();
        if (win != undefined && ignoreUpdatedBalance) {
            win = SlotKeypad.apiPlugIn.currency.format(currentWin - this._currentRoundBalance);
        }
        if (win != undefined && (currentWin - this._currentRoundBalance) > 0) {
            this._view.betPanel.freeBetsTotalWin.visible = true;
            this._view.betPanel.freeBetsTotalWin.setValue(win);
            this._view.betPanel.onResize();
        }
        else {
            this._view.betPanel.freeBetsTotalWin.visible = false;
            this._view.betPanel.freeBetsTotalWin.setValue("");
            this._view.betPanel.onResize();
        }
    }
    onFreeBetsEnd() {
        this._view.betPanel.promoButton.enable(true);
        this._view.betPanel.promoButton.visible = true;
        this._view.betPanel.nolimitBonusMenu.enable(true);
        this._view.betPanel.nolimitBonusMenu.setVisible(true);
        this.setSpinButtonBetState();
        this._view.betPanel.bet.setLabel(SlotKeypad.apiPlugIn.translations.translate("BET"));
        this._view.betPanel.bet.setColor(GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR));
        this._view.betPanel.autoplayButton.spinsCounterLabel.setColor(SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR);
        this._view.betPanel.betLevelButton.show();
        this._view.betPanel.betLevelButton.enable(true);
        this._view.betPanel.freeBetsTotalWin.visible = false;
        this._view.betPanel.freeBetsTotalWin.setValue("-1");
        this.updateBet(); //Freebets end
        this._view.betPanel.onResize();
    }
    onApiDialog(data) {
        //  const explicitHide:boolean = data === "open";
        //  this._view.setStateVisibility(explicitHide ? 0.05 : undefined, explicitHide);
    }
    onAutoPlay() {
        if (!this._view.betPanel.autoplayButton.toggled && SlotKeypad.autoplay.isAutoplayRound) {
            this.reportBackSettingChange('autoplay', true);
        }
        this._view.betPanel.autoplayButton.toggled = SlotKeypad.autoplay.isAutoplayRound;
        this._view.betPanel.autoplayButton.setCount(SlotKeypad.autoplay.rounds);
        if (SlotKeypad.autoplay.rounds <= 0) {
            this.reportBackSettingChange('autoplay', false);
        }
        this.setSpinButtonBetState();
        // TODO: On every autoplay round
        if (SlotKeypad.autoplay.rounds <= 0) {
            this.reportBackSettingChange('autoplay', false);
        }
        const state = SlotKeypad.apiPlugIn.slotStates.getState();
        if (!SlotKeypad.autoplay.isAutoplayRound && state != SlotStateHandler_1.SlotState.READY && state != SlotStateHandler_1.SlotState.FINISH) {
            this._view.betPanel.autoplayButton.enable(false);
            this.reportBackSettingChange('autoplay', false);
        }
        this._view.setStateVisibility();
    }
    onFastSpin(isFastSpin) {
        this._view.betPanel.fastSpinButton.toggled = isFastSpin;
    }
    clickSpin() {
        if (!this._hasOpenConfirmDialog) {
            this._view.betPanel.spinButton.clickButton();
        }
    }
    buttonClick(button) {
        Logger_1.Logger.logDev(`SlotKeypad.buttonClicked[${button.name}]`);
        if (!this.interactionEnabled) {
            return;
        }
        const cancelAutoPlay = this.cancelAutoPlay(button);
        let playSound = true;
        switch (button.name) {
            case KeypadButtonIDs.AUTO_PLAY:
                if (!cancelAutoPlay && !this._autoPlaySettingsView.isOpen) {
                    if (SlotKeypad.apiPlugIn.freeBets.hasFreeBets()) {
                        SlotKeypad.autoplay.playFreeRoundsAutoplay();
                    }
                    else {
                        this._autoPlaySettingsView.open();
                        this.reportBackSettingPageChange(SettingPageIDs.AUTOPLAY, true);
                    }
                }
                break;
            case KeypadButtonIDs.BET_LEVEL:
                this._betLevelsView.open();
                this.reportBackSettingPageChange(SettingPageIDs.BET_LEVEL, true);
                break;
            case KeypadButtonIDs.FULLSCREEN_SPIN:
                this.clickSpin();
                playSound = false;
                break;
            case KeypadButtonIDs.SPIN:
                this.onSpinButtonClicked();
                playSound = false; //Has it's own sound trigger.
                break;
            case KeypadButtonIDs.MENU:
                this._gameMenuView.open();
                this.reportBackSettingPageChange(SettingPageIDs.GAME_MENU, true);
                break;
            case KeypadButtonIDs.LIMIT_CAP:
                this.toggleLimitCap();
                break;
            case KeypadButtonIDs.FAST_SPIN:
                this.toggleFastSpin();
                break;
            case KeypadButtonIDs.SOUND:
                SlotKeypad.sound.toggleQuickMute();
                break;
            case KeypadButtonIDs.NOLIMIT_BONUS_MENU:
                this.toggleNolimitBonusMenu();
                break;
            case KeypadButtonIDs.PROMO_BUTTON:
                SlotKeypad.promoPlugin.open();
                break;
            case KeypadButtonIDs.DEMO:
                this._demoView.open();
                break;
            case KeypadButtonIDs.EXIT_REPLAY:
                this.exitReplay();
                break;
        }
        if (playSound) {
            SlotKeypad.playButtonSound(button.name);
        }
        // Handle any interaction
        this.onAnyInteraction();
    }
    static playButtonSound(buttonName = "", defaultSound = KeypadSound_1.KeypadSound.CLICK) {
        var _a;
        let shouldPlayDefault = true;
        if ((_a = SlotKeypad._instance.gameConfig) === null || _a === void 0 ? void 0 : _a.playKeypadButtonSound) {
            shouldPlayDefault = SlotKeypad._instance.gameConfig.playKeypadButtonSound(buttonName);
        }
        if (shouldPlayDefault) {
            SlotKeypad.sound.playKeypadEffect(defaultSound);
        }
    }
    onAnyInteraction() {
        this.setupMaxInactivityTimerForJurisdiction();
    }
    cancelAutoPlay(button) {
        if (SlotKeypad.autoplay.isAutoplayRound) {
            const CANCEL_BUTTONS = [KeypadButtonIDs.AUTO_PLAY, KeypadButtonIDs.MENU, KeypadButtonIDs.BET_LEVEL, KeypadButtonIDs.PROMO_BUTTON];
            for (let buttonName of CANCEL_BUTTONS) {
                if (buttonName == button.name) {
                    SlotKeypad.autoplay.cancelAutoPlay();
                    this.reportBackSettingChange(SettingsExtEventIDs.AUTOPLAY, false);
                    return true;
                }
            }
        }
        return false;
    }
    //------------------ Util func
    static formatCurrencyWithDecimalCutoff(value) {
        if (typeof value == "string") {
            value = parseFloat(value);
        }
        const minimumPrecision = (value < SlotKeypad.NO_DECIMALS_CUTOFF_POINT || value % 1 != 0) ? 2 : 0;
        const formatted = SlotKeypad.apiPlugIn.currency.format(value, { minimumPrecision: minimumPrecision });
        return formatted;
    }
    static formatCurrencyValueWithDecimalCutoff(value) {
        if (typeof value == "string") {
            value = parseFloat(value);
        }
        const minimumPrecision = (value < SlotKeypad.NO_DECIMALS_CUTOFF_POINT || value % 1 != 0) ? 2 : 0;
        const formatted = SlotKeypad.apiPlugIn.currency.formatValue(value, { minimumPrecision: minimumPrecision });
        return formatted;
    }
    updateBet() {
        let betLevel = SlotKeypad.apiPlugIn.betLevel.getLevel();
        if (SlotKeypad.apiPlugIn.freeBets.hasFreeBets()) {
            betLevel = SlotKeypad.apiPlugIn.freeBets.getBet();
            this._view.betPanel.bet.setLabel(SlotKeypad.apiPlugIn.freeBets.getBetHeader());
            this._view.betPanel.bet.setColor(GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR));
        }
        if (SlotKeypad.apiPlugIn.freeFeatureBet.hasFreeFeatureBet()) {
            betLevel = SlotKeypad.apiPlugIn.freeFeatureBet.getBet();
            this._view.betPanel.bet.setLabel(SlotKeypad.apiPlugIn.freeFeatureBet.getBetHeader());
            this._view.betPanel.bet.setColor(GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_FEATURE_BET_COLOR));
        }
        this.updateBetFeatureState();
        this._view.betPanel.bet.setValue(SlotKeypad.formatCurrencyWithDecimalCutoff(betLevel));
        this._view.betPanel.nolimitBonusMenu.updateBetLevel(betLevel);
        this.events.trigger(KeypadPlugin_1.KeypadPluginEvents.DISPLAY_BET_UPDATE, betLevel);
    }
    updateBetFeatureState() {
        const activeBetFeature = SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature();
        if (activeBetFeature != undefined) {
            const totalCost = activeBetFeature.getTotalCost();
            const totalCostFormatted = SlotKeypad.formatCurrencyWithDecimalCutoff(totalCost);
            this._view.betPanel.totalCost.setValue(totalCostFormatted);
            this._view.betPanel.spinButton.setTotalCost(totalCostFormatted);
            if (!this._view.betPanel.totalCost.visible) {
                //Show if not  visible
                //this._view.betPanel.spinButton.spinState = SpinButtonState.BOOST;
                this.setSpinButtonBetState();
                this._view.betPanel.autoplayButton.customToggledColorSet = new PointerStateColorSet_1.PointerStateColorSet(SlotKeypadViewSettings_1.SlotKeypadViewSettings.BOOSTED_BET_COLOR);
                this._view.betPanel.totalCost.visible = true;
                this._view.betPanel.onResize();
            }
        }
        else {
            this._view.betPanel.spinButton.setTotalCost();
            if (this._view.betPanel.totalCost.visible) {
                //Hide if visible
                //this._view.betPanel.spinButton.spinState = SpinButtonState.SPIN;
                this.setSpinButtonBetState();
                this._view.betPanel.autoplayButton.customToggledColorSet = undefined;
                //this._view.betPanel.autoplayButton.spinsCounterLabel.setColor(SlotKeypadViewSettings.NORMAL_COLOR);
                this._view.betPanel.totalCost.visible = false;
                this._view.betPanel.onResize();
            }
        }
    }
    updateBalance() {
        let amount = SlotKeypad.apiPlugIn.balance.getAmount();
        //#370, If there is a win with 3 decimals or more, display amount with 4 decimals
        /* Disabled for release 2022-03-17
        const amountToString:string = amount.toString();
        if (amountToString.indexOf(".") > -1){
            if ((amountToString.length - amountToString.indexOf(".")) > 3){
                this._balancePrecision = 4;
            }
        }
         */
        const balance = SlotKeypad.apiPlugIn.balance.getFormattedBalance(this._balancePrecision);
        this._view.betPanel.balance.setValue(balance);
        SlotKeypad.apiPlugIn.externalApi.trigger("balance", SlotKeypad.apiPlugIn.balance.toString());
    }
    increaseBetLevel() {
        const fromValue = SlotKeypad.apiPlugIn.betLevel.getLevel();
        SlotKeypad.apiPlugIn.betLevel.increase();
        this.updateBet(); //setNewBetLevel
        this.events.trigger(KeypadPlugin_1.KeypadPluginEvents.USER_BET_UPDATE, {
            from: fromValue,
            to: SlotKeypad.apiPlugIn.betLevel.getLevel()
        });
    }
    decreaseBetLevel() {
        const fromValue = SlotKeypad.apiPlugIn.betLevel.getLevel();
        SlotKeypad.apiPlugIn.betLevel.decrease();
        this.updateBet(); //setNewBetLevel
        this.events.trigger(KeypadPlugin_1.KeypadPluginEvents.USER_BET_UPDATE, {
            from: fromValue,
            to: SlotKeypad.apiPlugIn.betLevel.getLevel()
        });
    }
    newBetLevelSelected(level) {
        const fromValue = SlotKeypad.apiPlugIn.betLevel.getLevel();
        SlotKeypad.apiPlugIn.betLevel.setLevel(level);
        const activeFeature = SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature();
        if (activeFeature != undefined) {
            if (activeFeature.isBetLevelAndCostValid() == false) {
                SlotKeypad.apiPlugIn.betFeatureController.setActiveBetFeature();
            }
        }
        //Updated here and not only ready is because we want to update before the close dialog animation. So for example mini paytable will be updated before dialog is removed.
        this.updateBet(); //setNewBetLevel
        this.events.trigger(KeypadPlugin_1.KeypadPluginEvents.USER_BET_UPDATE, {
            from: fromValue,
            to: SlotKeypad.apiPlugIn.betLevel.getLevel()
        });
    }
    updateAutoplaySettings(data) {
        SlotKeypad.autoplay.updateData(data);
    }
    /*
           - report back to external api
           - Function for opening settings and scroll to correct section
     */
    reportBackSettingPageChange(page, activated) {
        SlotKeypad.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.SETTING_PAGE_CHANGE, {
            name: page,
            value: activated
        });
    }
    reportBackSettingChange(setting, activated) {
        SlotKeypad.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.SETTING_CHANGE, {
            name: setting,
            value: activated
        });
    }
    onSettingPageChange(action) {
        if (action && action.page && action.section) {
            this.openGameSection(action.page, action.section, action.close || false);
        }
        else if (action && action.page && !action.section) {
            // autoplay, betpage etc.
        }
    }
    openGameSection(page, section, close = false) {
        if (close) {
            this.reportBackSettingPageChange(page, false);
        }
        if (page === "gameMenu") {
            if (close && this._gameMenuView.isOpen) {
                this._gameMenuView.close();
            }
            else {
                switch (section) {
                    case "history":
                        //this._gameMenuView.openAndGoTo(SettingPageIDs.HISTORY , section);
                        break;
                    case "settings":
                        //this._gameMenuView.openAndGoTo(SettingPageIDs.SETTINGS, section);
                        break;
                    case "paytable":
                        this._gameMenuView.openAndGoTo(InfoPage_1.SettingSectionIDs.PAYTABLE);
                        break;
                    case "rules":
                        this._gameMenuView.openAndGoTo(InfoPage_1.SettingSectionIDs.RULES);
                        break;
                    case "guide":
                        this._gameMenuView.openAndGoTo(InfoPage_1.SettingSectionIDs.GUIDE);
                        break;
                    default:
                        break;
                }
            }
        }
        if (page === "autoplayMenu") {
            this._autoPlaySettingsView;
            switch (section) {
                default:
                    break;
            }
        }
        if (page === "betLevelMenu") {
            this._betLevelsView;
            switch (section) {
                default:
                    break;
            }
        }
        this.reportBackSettingPageChange(page, true);
    }
    //------------------ Event listeners
    onBet(bet) {
        if (bet.type == APIBetType_1.APIBetType.GAMBLE_BET) {
            if (bet.playerInteraction.gambleCollected !== true) {
                this._view.betPanel.hideWin();
            }
        }
        else if (bet.type !== APIBetType_1.APIBetType.ZERO_BET) {
            this._view.betPanel.hideWin();
        }
        /*        if (bet.type === APIBetType.FEATURE_BET && SlotKeypad.apiPlugIn.freeFeatureBet.hasFreeFeatureBet() == false) {
                    this.updateBet();  //on feature bet
                }*/
        if (SlotKeypad.apiPlugIn.freeFeatureBet.hasFreeFeatureBet() == false) {
            this.updateBalance();
        }
    }
    setSpinButtonBetState() {
        if (SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature() != undefined) {
            this._view.betPanel.spinButton.betState = BetState_1.BetState.BOOSTED_BET;
        }
        else if (SlotKeypad.autoplay.isAutoplayRound) {
            this._view.betPanel.spinButton.betState = BetState_1.BetState.AUTOPLAY;
        }
        else if (this._view.betPanel.zeroBetCounter.visible) {
            this._view.betPanel.spinButton.betState = BetState_1.BetState.ZERO_BET;
        }
        else {
            this._view.betPanel.spinButton.betState = SlotKeypad.apiPlugIn.freeBets.hasFreeBets() ? BetState_1.BetState.FREE_BETS : BetState_1.BetState.NORMAL;
        }
    }
    onState(state) {
        //Disabled in all states except ready.
        this._view.betPanel.demoButton.enable(false);
        switch (state) {
            case SlotStateHandler_1.SlotState.RESTORE:
                this.updateBalance();
                this.updateBet(); //on state == RESTORE
                this.setSpinButtonBetState();
                this._view.setStateVisibility();
                break;
            case SlotStateHandler_1.SlotState.READY:
                this._currentRoundBalance = 0;
                this._view.betPanel.interactionEnabled = true;
                this.setupMaxInactivityTimerForJurisdiction();
                this.updateBalance();
                this.updateBet(); //on state == ready
                this.setSpinButtonBetState();
                this._view.betPanel.spinButton.spinState = SpinButtonState_1.SpinButtonState.SPIN;
                this._view.setStateVisibility();
                this._view.betPanel.demoButton.enable(true);
                this.reportBackSettingChange(APIEventSystem_1.APIEvent.AUDIO_MASTER_MUTED, !SlotKeypad.sound.isQuickMute());
                break;
            case SlotStateHandler_1.SlotState.STARTING:
                this.updateFreeBetsTotalWin(true);
                this._view.setStateVisibility();
                this._view.betPanel.spinButton.enable(false);
                this._view.betPanel.nolimitBonusMenu.enable(false);
                this._view.betPanel.promoButton.enable(false);
                this._view.betPanel.menuButton.enable(false);
                this._view.betPanel.limitCapButton.enable(false);
                this._view.betPanel.fullscreenSpinButton.enable(false);
                this._view.betPanel.betLevelButton.enable(false);
                this._view.betPanel.autoplayButton.enable(this._view.betPanel.autoplayButton.toggled);
                break;
            case SlotStateHandler_1.SlotState.STOPPABLE:
                if (SlotKeypad.apiPlugIn.gameClientConfiguration.fastSpinEnabled) {
                    this._view.betPanel.spinButton.enable(true);
                    this._view.betPanel.fullscreenSpinButton.enable(true);
                    this._view.betPanel.spinButton.spinState = SpinButtonState_1.SpinButtonState.STOP;
                }
                break;
            case SlotStateHandler_1.SlotState.STOPPING:
                this._view.betPanel.spinButton.enable(false);
                this._view.betPanel.fullscreenSpinButton.enable(false);
                break;
            case SlotStateHandler_1.SlotState.SKIPPABLE:
                this._view.betPanel.spinButton.enable(true);
                this._view.betPanel.fullscreenSpinButton.enable(true);
                this._view.betPanel.spinButton.spinState = SpinButtonState_1.SpinButtonState.ABORT;
                break;
            case SlotStateHandler_1.SlotState.SKIPPED:
                this._view.betPanel.spinButton.enable(false);
                this._view.betPanel.fullscreenSpinButton.enable(false);
                break;
            case SlotStateHandler_1.SlotState.DONE:
                this._view.betPanel.spinButton.enable(false);
                this._view.betPanel.fullscreenSpinButton.enable(false);
                break;
            case SlotStateHandler_1.SlotState.FINISHING:
                break;
            case SlotStateHandler_1.SlotState.FINISH:
                this._currentRoundBalance = 0;
                this.updateBalance();
                this._view.betPanel.nolimitBonusMenu.enable(true);
                this._view.betPanel.spinButton.enable(true);
                this._view.betPanel.fullscreenSpinButton.enable(false);
                this._view.betPanel.autoplayButton.enable(true);
                this._view.betPanel.betLevelButton.enable(true);
                this._view.betPanel.menuButton.enable(true);
                this._view.betPanel.limitCapButton.enable(true);
                this._view.betPanel.promoButton.enable(true);
                this._view.setStateVisibility();
                break;
            case SlotStateHandler_1.SlotState.SCREEN:
                this._view.betPanel.interactionEnabled = false;
                this._view.setStateVisibility(0);
                break;
            case SlotStateHandler_1.SlotState.DIALOG:
                this._view.betPanel.interactionEnabled = false;
                this._view.setStateVisibility(0.2, true);
                break;
            case SlotStateHandler_1.SlotState.GAMBLE:
                //You can enter this state directly from free spin and other modes.
                this.setSpinButtonBetState();
                if (this._disableSpinButtonOnGamble) {
                    this._view.betPanel.spinButton.enable(false);
                }
                else {
                    this._view.betPanel.spinButton.spinState = SpinButtonState_1.SpinButtonState.GAMBLE;
                    this._view.betPanel.spinButton.enable(true);
                }
                this._view.betPanel.promoButton.enable(false);
                this._view.betPanel.menuButton.enable(false);
                this._view.betPanel.limitCapButton.enable(false);
                this._view.betPanel.fullscreenSpinButton.enable(false);
                this._view.betPanel.betLevelButton.enable(false);
                this._view.betPanel.autoplayButton.enable(this._view.betPanel.autoplayButton.toggled);
                this._view.betPanel.nolimitBonusMenu.enable(false);
                this._view.setStateVisibility();
                this._view.betPanel.nolimitBonusMenu.hideForGamble();
                break;
            case SlotStateHandler_1.SlotState.GAMBLING:
                this._view.betPanel.spinButton.enable(false);
                break;
            case SlotStateHandler_1.SlotState.GAMBLE_COLLECT:
                //this._view.setStateVisibility();
                this._view.betPanel.spinButton.enable(false);
                this._view.betPanel.promoButton.enable(false);
                this._view.betPanel.menuButton.enable(false);
                this._view.betPanel.limitCapButton.enable(false);
                this._view.betPanel.fullscreenSpinButton.enable(false);
                this._view.betPanel.betLevelButton.enable(false);
                this._view.betPanel.autoplayButton.enable(this._view.betPanel.autoplayButton.toggled);
                break;
            case SlotStateHandler_1.SlotState.GAMBLE_DONE:
                this._view.betPanel.demoButton.enable(true);
                this._view.betPanel.nolimitBonusMenu.showForGamble();
                break;
        }
    }
    onPlayBonusInGame(data) {
        this._disableSpinButtonOnGamble = true;
        this._view.betPanel.interactionEnabled = true;
    }
    onPlayBonusInGameComplete(data) {
        this._view.betPanel.interactionEnabled = false;
        this._disableSpinButtonOnGamble = false;
    }
    onSpinButtonClicked() {
        switch (SlotKeypad.apiPlugIn.slotStates.getState()) {
            case SlotStateHandler_1.SlotState.READY:
                SlotKeypad.apiPlugIn.betHandler.bet();
                this._view.betPanel.spinButton.playClickedAnimation();
                break;
            case SlotStateHandler_1.SlotState.STARTING:
                break;
            case SlotStateHandler_1.SlotState.STOPPABLE:
                SlotKeypad.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.STOP);
                this._view.betPanel.fullscreenSpinButton.playClickedAnimation();
                break;
            case SlotStateHandler_1.SlotState.STOPPING:
                break;
            case SlotStateHandler_1.SlotState.SKIPPABLE:
                SlotKeypad.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.SKIP);
                this._view.betPanel.fullscreenSpinButton.playClickedAnimation();
                break;
            case SlotStateHandler_1.SlotState.SKIPPED:
                break;
            case SlotStateHandler_1.SlotState.GAMBLE:
                SlotKeypad.apiPlugIn.betHandler.bet();
                this._view.betPanel.spinButton.playClickedAnimation();
                break;
            case SlotStateHandler_1.SlotState.DONE:
                break;
            case SlotStateHandler_1.SlotState.FINISHING:
                break;
            case SlotStateHandler_1.SlotState.SCREEN:
                break;
        }
    }
    dialogOpened() {
        //this._view.hide(0);
    }
    dialogClosing() {
        this._view.setStateVisibility(0.18, false, true);
    }
    //------------------ Public interface
    /**
     * @deprecated
     */
    setWinLegacy(value, isTotalWin, valueBelowStakeRestriction, instantHide) {
        this.showWin(value, isTotalWin, valueBelowStakeRestriction, instantHide);
    }
    setWin(value, isTotalWin, valueBelowStakeRestriction, instantHide) {
        this.showWin(value, isTotalWin, valueBelowStakeRestriction, instantHide);
        this.updateBalance();
    }
    showWin(value, isTotalWin, valueBelowStakeRestriction, instantHide) {
        this._currentRoundBalance = value;
        const valueString = SlotKeypad.apiPlugIn.currency.format(value);
        // https://github.com/nolimitcity/tombstonerip/issues/245 stupid different game has different enhanced bet and UKGC need to use the enhanced acutual bet value instead of the playedBetValue.
        if (valueBelowStakeRestriction == null) {
            // #235 -> whatever value is going to be set, compare that value with playedBetValue, irrespective of total win or anything -> decided by Emil.
            valueBelowStakeRestriction = (SlotKeypad.apiPlugIn.gameClientConfiguration.belowStakeWinRestriction && (value <= this._playedBetValue));
        }
        if (value <= 0) {
            this._view.betPanel.hideWin(instantHide ? 0 : 0.5).add(() => {
                this._view.betPanel.win.setLabel(isTotalWin ? SlotKeypad.apiPlugIn.translations.translate("TOTAL WIN") : SlotKeypad.apiPlugIn.translations.translate("WIN"));
                this._view.betPanel.win.setValue(valueString);
            });
        }
        else {
            // #235
            let label;
            if (!valueBelowStakeRestriction) {
                label = (isTotalWin ? SlotKeypad.apiPlugIn.translations.translate("TOTAL WIN") : SlotKeypad.apiPlugIn.translations.translate("WIN"));
            }
            else {
                label = "";
            }
            this._view.betPanel.win.setLabel(label);
            this._view.betPanel.win.setValue(valueString);
            this._view.betPanel.showWin();
        }
    }
    hide(duration = 0) {
        return this._view.hide(duration);
    }
    show(duration = 0) {
        this._view.visible = true;
        return this._view.show(duration);
    }
    setZeroBetSpinCounter(count) {
        if (count < 0) {
            this._view.betPanel.zeroBetCounter.hide();
            this._view.betPanel.zeroBetCounter.setCount(count);
            this.setSpinButtonBetState();
            this._view.betPanel.autoplayButton.showSpinCounterLabel();
            this._view.onResize();
        }
        else {
            this._view.betPanel.zeroBetCounter.setCount(count);
            this._view.betPanel.zeroBetCounter.show();
            this.setSpinButtonBetState();
            this._view.betPanel.autoplayButton.hideSpinCounterLabel();
            this._view.onResize();
        }
    }
    getBalanceBarHeight() {
        return 35;
    }
    getSpinButtonCenter() {
        return this._view.betPanel.spinButtonCenter.clone();
    }
    disableQuickStop() {
        if (SlotKeypad.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.STOPPABLE)) {
            this._view.betPanel.spinButton.enable(false);
            this._view.betPanel.fullscreenSpinButton.enable(false);
        }
    }
    get interactionEnabled() {
        var _a, _b;
        return (_b = (_a = this._view) === null || _a === void 0 ? void 0 : _a.betPanel) === null || _b === void 0 ? void 0 : _b.interactionEnabled;
    }
    // this helps in hiding all the elements in keypad, specially during character intro.
    toggleVisibility(visible) {
        this._view.visible = visible;
    }
    //------------------ Public interface END
    onRefresh(...value) {
        if (SlotKeypad.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.READY, SlotStateHandler_1.SlotState.SCREEN, SlotStateHandler_1.SlotState.DIALOG)) {
            this.updateBalance();
            this.updateBet(); //refresh
        }
        this._betLevelsView.onRefresh();
    }
    exitToLobby() {
        SlotKeypad.apiPlugIn.externalApi.trigger(APIExternalApi_1.APIExternalApiEvent.EXIT).or(history.back.bind(history));
    }
    exitReplay() {
        SlotKeypad.apiPlugIn.externalApi.trigger(APIExternalApi_1.APIExternalApiEvent.EXIT_REPLAY);
    }
    toggleBoolSetting(setting) {
        const value = !SlotKeypad.apiPlugIn.settings.get(setting, false);
        SlotKeypad.apiPlugIn.settings.set(APISettingsSystem_1.APISetting.FAST_SPIN, value);
        return value;
    }
    openNolimitBonusMenu() {
        this._view.betPanel.nolimitBonusMenu.open();
        this._view.betPanel.tempHideWin();
    }
    closeNolimitBonusMenu() {
        this._view.betPanel.nolimitBonusMenu.close();
        this._view.betPanel.releaseTempHideWin();
    }
    toggleNolimitBonusMenu() {
        if (!this._view.betPanel.nolimitBonusMenu.isOpen) {
            this.openNolimitBonusMenu();
        }
        else {
            this.closeNolimitBonusMenu();
        }
    }
    toggleLimitCap() {
        SlotKeypad.apiPlugIn.betLevel.toggleCapWinLimit();
        //    this._view.betPanel.limitCapButton.toggled = SlotKeypad.apiPlugIn.betLevel.isCapWinLimitToggled();
    }
    toggleFastSpin() {
        const value = this.toggleBoolSetting(APISettingsSystem_1.APISetting.FAST_SPIN);
        SlotKeypad.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.FAST_SPIN, value);
        this.reportBackSettingChange('fastSpin', value);
    }
    onMusic(value) {
        this.updateSoundButton();
    }
    onSfx(value) {
        this.updateSoundButton();
    }
    updateSoundButton() {
        if (SlotKeypad.sound.loading) {
            this._view.betPanel.soundButton.toggled = false;
            this._view.betPanel.soundButton.enable(false);
            this._view.betPanel.soundButton.startLoadingAnimation();
            // TODO: For some reason, this is firing twice
            this.reportBackSettingChange(APIEventSystem_1.APIEvent.AUDIO_MASTER_MUTED, SlotKeypad.sound.isQuickMute());
        }
        else {
            this._view.betPanel.soundButton.stopLoadingAnimation();
            this._view.betPanel.soundButton.toggled = !SlotKeypad.sound.isQuickMute();
            this._view.betPanel.soundButton.enable(true);
            // TODO: For some reason, this is firing twice
            this.reportBackSettingChange(APIEventSystem_1.APIEvent.AUDIO_MASTER_MUTED, !SlotKeypad.sound.isQuickMute());
        }
        //this.reportBackSettingChange('soundMaster', !SlotKeypad.sound.isQuickMute());
    }
    onHidden(hidden) {
        if (!hidden) {
            this.forceCheckInactivity();
        }
        this.updateSoundButton();
    }
    // #235
    onGameData(data) {
        this._playedBetValue = data.playedBetValue;
    }
    // #235
    onInitData() {
        const betLevel = SlotKeypad.apiPlugIn.freeBets.hasFreeBets() ? SlotKeypad.apiPlugIn.freeBets.getBet() : SlotKeypad.apiPlugIn.betLevel.getLevel();
        this._playedBetValue = parseFloat(betLevel);
    }
    onFreeze(freeze) {
        if (freeze) {
            this._view.setStateVisibility(0.2, true);
        }
        else {
            this._view.setStateVisibility();
        }
    }
    onPause(paused) {
        this.updateSoundButton();
        if (paused) {
            this._view.setStateVisibility(0.2, true);
        } /*
        else {
            this._view.setStateVisibility();
        }*/
    }
    onHalt() {
        this._view.halt();
    }
    static showConfirmFeatureBetPopUp(name) {
        this._instance._hasOpenConfirmDialog = true;
        SlotKeypad.apiPlugIn.events.trigger("modal", "open");
        return this._instance._view.betPanel.betFeatureConfirmPopUp.open(name).then(value => {
            this._instance._hasOpenConfirmDialog = false;
            SlotKeypad.apiPlugIn.events.trigger("modal", "close");
            return value;
        });
    }
}
SlotKeypad.NO_DECIMALS_CUTOFF_POINT = 10;
SlotKeypad.VERSION = require('../package.json').version;
exports.SlotKeypad = SlotKeypad;
//# sourceMappingURL=SlotKeypad.js.map