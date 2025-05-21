"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitPromotionPlugin = void 0;
/**
 * Created by Jonas Wålekvist on 2019-12-05.
 */
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const NolimitLauncher_1 = require("@nolimitcity/slot-launcher/bin/NolimitLauncher");
const ApiPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/ApiPlugin");
const PromoPanelView_1 = require("./PromoPanelView");
const GuiButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/GuiButton");
const PromoPanelAssetConfig_1 = require("./config/PromoPanelAssetConfig");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const KeypadPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/KeypadPlugin");
const PromoPanelEvents_1 = require("./events/PromoPanelEvents");
const PromoPanelButtonIDs_1 = require("./enums/PromoPanelButtonIDs");
const PromoPanelConfig_1 = require("./config/PromoPanelConfig");
const GUIScrollContainer_1 = require("@nolimitcity/slot-launcher/bin/gui/scroll/GUIScrollContainer");
const ReplayController_1 = require("./feature/winners/ReplayController");
const FontLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/FontLoader");
const SoundPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/SoundPlugin");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const APIBetType_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIBetType");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const TemplateLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/TemplateLoader");
const IntroPageCreator_1 = require("./intro/IntroPageCreator");
const BonusFeatures_1 = require("@nolimitcity/slot-launcher/bin/plugins/apiplugin/BonusFeatures");
const ActionSpinsController_1 = require("./feature/actionspins/ActionSpinsController");
const ASEnums_1 = require("./enums/ASEnums");
const ResponseParser_1 = require("./utils/ResponseParser");
class NolimitPromotionPlugin {
    constructor(config) {
        this.name = "PromoPanel";
        this.GAME_FEATURE_ASSETS_FORMAT = ".png";
        this._featureControllerMap = new Map();
        this._isActionSpinRound = false;
        if (config) {
            NolimitPromotionPlugin.promoPanelGameConfiguration = config;
            NolimitPromotionPlugin.ASOptionsData = config.getActionSpinOptions && config.getActionSpinOptions();
        }
    }
    static fetchPlugins() {
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if ((0, SoundPlugin_1.isSoundPlugin)(plugin)) {
                NolimitPromotionPlugin.sound = plugin;
            }
            else if ((0, KeypadPlugin_1.isKeypadPlugin)(plugin)) {
                NolimitPromotionPlugin.keypadPlugin = plugin;
            }
            else if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                NolimitPromotionPlugin.apiPlugIn = plugin;
            }
        }
        if (NolimitPromotionPlugin.sound == undefined) {
            return Promise.reject(new Error("NolimitPromotionPlugin is missing SoundPlugin"));
        }
        if (NolimitPromotionPlugin.apiPlugIn == undefined) {
            return Promise.reject(new Error("NolimitPromotionPlugin is missing ApiPlugin"));
        }
        if (NolimitPromotionPlugin.keypadPlugin == undefined) {
            return Promise.reject(new Error("NolimitPromotionPlugin is missing KeypadPlugin"));
        }
        return Promise.resolve();
    }
    static onBet(bet) {
        if (bet.type === APIBetType_1.APIBetType.ZERO_BET) {
            NolimitPromotionPlugin.isZeroBet = true;
        }
        else if (bet.type === APIBetType_1.APIBetType.FREE_BET) {
            NolimitPromotionPlugin.isFreeBet = true;
            //NolimitApplication.events.trigger(PromoPanelEvents.DISABLE_NAV_BUTTON, PromoPanelButtonIDs.BUY_FEATURE);
        }
        else {
            NolimitPromotionPlugin.isFreeBet = false;
            NolimitPromotionPlugin.isZeroBet = false;
            !NolimitPromotionPlugin.getButtonConfigByBtnId(PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_BONUS).isDisabled && NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.ENABLE_NAV_BUTTON, PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_BONUS);
        }
    }
    /**
     * To retrieve default button config.
     */
    static getDefaultButtonConfig() {
        let defaultButton = PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG[0];
        for (let i = 0; i < PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG.length; i++) {
            const buttonConfig = PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG[i];
            if (!buttonConfig.isDisabled && buttonConfig.isDefault) {
                defaultButton = buttonConfig;
                break;
            }
        }
        return defaultButton;
    }
    /**
     * To retrieve button config by btn id.
     * @param btnId
     */
    static getButtonConfigByBtnId(btnId) {
        let buttonConfig = PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG[0];
        for (let i = 0; i < PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG.length; i++) {
            const btnConfig = PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG[i];
            if (btnConfig.id == btnId) {
                buttonConfig = btnConfig;
                break;
            }
        }
        return buttonConfig;
    }
    /**
     * To retrieve button config by btn id.
     * @param btnId
     */
    static deleteButtonConfigByBtnId(btnId) {
        //let buttonConfig: ButtonConfig = PromoPanelConfig.FEATURE_BTN_CONFIG[0];
        for (let i = 0; i < PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG.length; i++) {
            const btnConfig = PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG[i];
            if (btnConfig.id == btnId) {
                PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG.splice(i, 1);
                break;
            }
        }
        //return buttonConfig;
    }
    /**
     * To customize a feature by button id (disable, make default)
     * @param buttonId - id of button
     * @param isDefault - to open by default view by pressing this button
     * @param isDisabled - to disable state but visible
     * @param shouldHide - to hide button not visible
     * @param shouldReAligned - to reAligned button sequence
     */
    static customizeFeature(buttonId, isDefault, isDisabled, shouldHide = false, shouldReAligned = false) {
        if (shouldHide && shouldReAligned) {
            this.deleteButtonConfigByBtnId(buttonId);
        }
        else {
            let buttonConfig = NolimitPromotionPlugin.getButtonConfigByBtnId(buttonId);
            buttonConfig.isDefault = isDefault;
            buttonConfig.isDisabled = isDisabled;
            buttonConfig.shouldHide = shouldHide;
            buttonConfig.shouldReAligned = shouldReAligned;
        }
    }
    static saveToLocalStorage(key, value) {
        NolimitPromotionPlugin.apiPlugIn.settings.set(key, value);
    }
    static getFromLocalStorage(key, defaultValue) {
        return NolimitPromotionPlugin.apiPlugIn.settings.get(key, defaultValue);
    }
    // ---- NolimitPlugin interface implementation
    init() {
        return new Promise((resolve) => {
            NolimitPromotionPlugin.fetchPlugins().catch((reason) => {
                return Promise.reject(reason);
            });
            this.loadResourcePromise = this.loadGameResources();
            this._bonusBuyFeatureTypes = NolimitPromotionPlugin.apiPlugIn.bonusFeatures.allTypesByCategory[BonusFeatures_1.GameFeatureCategory.BONUS_BUY];
            resolve(this);
        });
    }
    addAssetsToLoader(loader, assets) {
        for (let asset of assets) {
            loader.add(asset.name, asset.url);
        }
    }
    getReady() {
        if (!this.hasPromotions()) {
            return Promise.resolve(this);
        }
        const fontLoader = new FontLoader_1.FontLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_300);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_400);
        fontLoader.add(OpenSans_1.OpenSans.ITALIC_600);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_600);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_700);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_800);
        fontLoader.add(OpenSans_1.OpenSans.ITALIC_800);
        NolimitPromotionPlugin.imgLoader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        this.addAssetsToLoader(NolimitPromotionPlugin.imgLoader, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getNavigationAssets());
        if (this.hasActionSpin()) {
            this.addAssetsToLoader(NolimitPromotionPlugin.imgLoader, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getNolimitBonusAssets());
            this.addAssetsToLoader(NolimitPromotionPlugin.imgLoader, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getActionSpinsAssets());
            this.addAssetsToLoader(NolimitPromotionPlugin.imgLoader, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getActionSpinsGameFeedAssets());
        }
        if (this.hasNolimitWinners()) {
            this.addAssetsToLoader(NolimitPromotionPlugin.imgLoader, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getNolimitWinnersAssets());
        }
        const promise = Promise.all([NolimitPromotionPlugin.imgLoader.load(), fontLoader.load()]);
        return promise.then(() => this.loadComplete());
    }
    /**
     * To load game feature assets( from nolimit/promopanel folder at game side).
     */
    getReadyToStart() {
        if (!this.hasPromotions()) {
            return Promise.resolve(this);
        }
        return this.loadResourcePromise.then(() => {
            if (!this.hasNolimitWinners()) {
                NolimitPromotionPlugin.customizeFeature(PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_WINNERS, false, true, false);
            }
            if (!this.hasActionSpin()) {
                NolimitPromotionPlugin.customizeFeature(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS, false, true, true, true);
            }
            this.initializeFeatureController();
            return Promise.resolve(this);
        });
    }
    start() {
        return Promise.resolve(this);
    }
    /**
     * This function is called in the getReady phase. And here all init data
     */
    getKeypadGuide() {
        const templateLoader = new TemplateLoader_1.TemplateLoader(NolimitPromotionPlugin.apiPlugIn.resources.getStaticRoot());
        templateLoader.add({
            name: "gui-guide",
            url: "node_modules/@nolimitcity/promo-panel/resources/default/templates/gui-guide.mustache"
        });
        const data = {
            hasNolimitBonus: false,
            hasNolimitWinners: this.hasNolimitWinners(),
            hasActionSpin: this.hasActionSpin(),
            hasNolimitTournaments: this.hasNolimitTournaments(),
            hasNolimitVoucher: this.hasNolimitVoucher(),
            location: ".." + PromoPanelAssetConfig_1.PromoPanelAssetConfig.getGameResourcePath()
        };
        return templateLoader.load().then((assets) => {
            for (let asset of assets) {
                if (asset.name == "gui-guide" && asset.loadedData) {
                    return NolimitPromotionPlugin.apiPlugIn.translations.render(asset.loadedData, data);
                }
            }
            throw new Error("NolimitPromotionPlugin could not load gui-guide");
        });
    }
    getIntroPages() {
        if (NolimitPromotionPlugin.apiPlugIn.isReplay) {
            return Promise.resolve([]);
        }
        const creator = new IntroPageCreator_1.IntroPageCreator();
        return this.loadResourcePromise.then(() => {
            return creator.getIntroPages(this);
        });
    }
    // ---- PromotionPlugin interface implementation
    open() {
        this.setSavedSettings();
        NolimitPromotionPlugin.isFreeBet = NolimitPromotionPlugin.apiPlugIn.freeBets.hasFreeBets();
        ResponseParser_1.ResponseParser.setBoostAndGetCost(undefined, true);
        this._view.open();
        this.buttonClick(new GuiButton_1.GuiButton(NolimitPromotionPlugin.getDefaultButtonConfig().id), true);
        NolimitPromotionPlugin.apiPlugIn.events.trigger(PromoPanelEvents_1.PromoPanelEvents.PROMO_PANEL_OPENED);
    }
    /**
     * To minimize promo panel view
     */
    minimize() {
        NolimitPromotionPlugin.IS_MINIMIZED = true;
        NolimitApplication_1.NolimitApplication.minimizeDialog(this.view);
        this.view.visible = false;
        NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.ACTION_SPINS_IS_ACTIVE, false);
        NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(PromoPanelEvents_1.PromoPanelEvents.PROMO_PANEL_MINIMIZED);
    }
    /**
     * To maximize promo panel view
     */
    maximize() {
        this.view.visible = true;
        NolimitApplication_1.NolimitApplication.addDialog(this.view, true);
        NolimitPromotionPlugin.IS_MINIMIZED = false;
        NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.ACTION_SPINS_IS_ACTIVE, true);
        NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(PromoPanelEvents_1.PromoPanelEvents.PROMO_PANEL_MAXIMIZED);
    }
    /**
     * To close promo panel view
     */
    close(isFeatureBuy = false, isFreeBetTriggered = false) {
        this._view.close(isFreeBetTriggered);
    }
    /**
     * This is not safe to call in init phase. Things will be undefined.
     */
    hasPromotions() {
        const hasNolimitWinners = this.hasNolimitWinners();
        const hasNolimitTournaments = this.hasNolimitTournaments();
        const hasNolimitVoucher = this.hasNolimitVoucher();
        const hasNoLimitLightningSpins = this.hasActionSpin();
        const hasReplay = NolimitPromotionPlugin.apiPlugIn.options.replay;
        return (hasNolimitWinners || hasNolimitTournaments || hasNolimitVoucher || hasNoLimitLightningSpins) && !hasReplay;
    }
    hasNolimitBonus() {
        return false;
    }
    hasActionSpinsBonus() {
        const hasFeatureBuy = NolimitPromotionPlugin.apiPlugIn.bonusFeatures.hasAnyType(this._bonusBuyFeatureTypes);
        const isAllowed = NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.featureBuyEnabled;
        return hasFeatureBuy && isAllowed;
    }
    hasNolimitWinners() {
        return (NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.nolimitWinnersEnabled);
    }
    hasActionSpin() {
        var _a;
        const value = !NolimitPromotionPlugin.apiPlugIn.options.funMode && NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.actionSpin && ((_a = NolimitPromotionPlugin.ASOptionsData) === null || _a === void 0 ? void 0 : _a.hasActionSpin);
        return value == true;
    }
    hasNolimitTournaments() {
        return false;
    }
    hasNolimitVoucher() {
        return false;
    }
    /**
     * Trigger refresh event to handle balance related stuffs
     */
    onRefresh() {
        NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.BALANCE_UPDATE_EVENT, NolimitPromotionPlugin.apiPlugIn.balance.getAmount());
    }
    /**
     * To handle click of a nav panel buttons.
     * @param button
     * @param isManualCall
     */
    buttonClick(button, isManualCall = false) {
        !isManualCall && NolimitPromotionPlugin.sound.playKeypadEffect("click");
        switch (button.name) {
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_BONUS:
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_WINNERS:
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS:
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.VOUCHER:
                const controller = this._featureControllerMap.get(button.name);
                controller && this.initializeFeatureView(controller, button.name);
                NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.DISABLE_ALL_NAV_BUTTON);
                NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.NAV_BUTTON_PRESSED, button.name);
                this._view.backgroundColor = NolimitPromotionPlugin.getButtonConfigByBtnId(button.name).viewBackgroundColor;
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.CLOSE:
                this.close();
                break;
            default:
                Logger_1.Logger.warn("button click :: no match case : ", button);
        }
    }
    setSavedSettings() {
        NolimitPromotionPlugin.savedSettings = {
            asStopOnBonus: !!NolimitPromotionPlugin.apiPlugIn.settings.get(ASEnums_1.LocalStorageSettingsKey.AS_STOP_ON_BONUS),
            asBonusTabSelected: !!NolimitPromotionPlugin.apiPlugIn.settings.get(ASEnums_1.LocalStorageSettingsKey.AS_BONUS_TAB_SELECTED)
        };
    }
    closeAllView() {
        var _a, _b;
        (_b = (_a = this._featureControllerMap.get(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS)) === null || _a === void 0 ? void 0 : _a.view) === null || _b === void 0 ? void 0 : _b.close();
        this.close();
    }
    /**
     * Loads game specific assets (they are needed for intro as well)
     */
    loadGameResources() {
        var _a, _b;
        const imgLoader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        this.addAssetsToLoader(imgLoader, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getCommonAssets());
        if (NolimitPromotionPlugin.ASOptionsData) {
            let addedImages = [];
            (_a = NolimitPromotionPlugin.ASOptionsData.mainGame) === null || _a === void 0 ? void 0 : _a.options.forEach((option) => {
                if (addedImages.indexOf(option.image) < 0) {
                    imgLoader.add(option.image, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getGameResourcePathForActionSpins() + option.image);
                    addedImages.push(option.image);
                }
            });
            (_b = NolimitPromotionPlugin.ASOptionsData.bonusGame) === null || _b === void 0 ? void 0 : _b.options.forEach((option) => {
                if (addedImages.indexOf(option.image) < 0) {
                    imgLoader.add(option.image, PromoPanelAssetConfig_1.PromoPanelAssetConfig.getGameResourcePathForActionSpins() + option.image);
                    addedImages.push(option.image);
                }
            });
        }
        return NolimitPromotionPlugin.apiPlugIn.getInitData().then(() => {
            var _a, _b;
            if (this.hasActionSpin()) {
                if (!((_b = (_a = NolimitPromotionPlugin.ASOptionsData) === null || _a === void 0 ? void 0 : _a.graphics) === null || _b === void 0 ? void 0 : _b.backgroundTextureName)) {
                    imgLoader.add("AS_REPLAY_BG", PromoPanelAssetConfig_1.PromoPanelAssetConfig.getGameResourcePathForActionSpins() + "REPLAY_BG" + PromoPanelConfig_1.PromoPanelConfig.JPG_FORMAT);
                }
                imgLoader.add("AS_GAME_LOGO", PromoPanelAssetConfig_1.PromoPanelAssetConfig.getGameResourcePathForActionSpins() + "GAME_LOGO" + this.GAME_FEATURE_ASSETS_FORMAT);
                imgLoader.add("ActionSpinAnimation0", "/node_modules/@nolimitcity/promo-panel/resources/default/animation/Actionspin0.json");
            }
            return imgLoader.load();
        });
    }
    /**
     * To initialize Promotional feature controller objects
     */
    initializeFeatureController() {
        PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG.forEach((buttonConfig) => {
            switch (buttonConfig.id) {
                case PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_WINNERS:
                    if (!buttonConfig.isDisabled) {
                        this._featureControllerMap.set(buttonConfig.id, new ReplayController_1.ReplayController(this));
                    }
                    break;
                case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS:
                    if (!buttonConfig.isDisabled) {
                        this._featureControllerMap.set(buttonConfig.id, new ActionSpinsController_1.ActionSpinsController(this));
                    }
                    break;
                case PromoPanelButtonIDs_1.PromoPanelButtonIDs.VOUCHER:
                    //this._featureControllerMap.set(featureId, new BuyFeatureController(this));
                    break;
            }
        });
    }
    loadComplete() {
        this._view = new PromoPanelView_1.PromoPanelView(this);
        this.hide();
        this.addEventListeners();
        return Promise.resolve(this);
    }
    /**
     * To initialize Promo feature view with scroller
     * To add scroller and feature view in promo panel view
     * @param controller
     */
    initializeFeatureView(controller, buttonName) {
        if (!controller.view) {
            const scrollConfig = {
                color: 0xffffff,
                thickness: 3
            };
            const scroller = new GUIScrollContainer_1.GUIScrollContainer(0, 0, false, true, true, scrollConfig);
            scroller.name = buttonName.toUpperCase() + "_GUIScrollContainer";
            controller.createView(scroller);
            scroller.addContent(controller.view);
            this._view.featureContainer.addChild(scroller);
        }
    }
    addEventListeners() {
        NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.REFRESH, () => this.onRefresh());
        NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.BET, (bet) => NolimitPromotionPlugin.onBet(bet));
        NolimitApplication_1.NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.BROKE, () => this.closeAllView());
    }
    /**
     * To hide a promo panel
     */
    hide() {
        this._view.hide();
    }
    get isActionSpinRound() {
        return this._isActionSpinRound;
    }
    set isActionSpinRound(value) {
        this._isActionSpinRound = value;
    }
    get view() {
        return this._view;
    }
}
NolimitPromotionPlugin.isZeroBet = false;
NolimitPromotionPlugin.isFreeBet = false;
NolimitPromotionPlugin.IS_MINIMIZED = false;
exports.NolimitPromotionPlugin = NolimitPromotionPlugin;
//# sourceMappingURL=NolimitPromotionPlugin.js.map