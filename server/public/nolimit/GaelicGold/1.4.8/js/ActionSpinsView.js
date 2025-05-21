"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionSpinsView = void 0;
const FeatureBasePanel_1 = require("../FeatureBasePanel");
const PromoPanelAssetConfig_1 = require("../../config/PromoPanelAssetConfig");
const NolimitPromotionPlugin_1 = require("../../NolimitPromotionPlugin");
const PromoPanelLabelIDs_1 = require("../../enums/PromoPanelLabelIDs");
const PromoPanelTextStyles_1 = require("../../config/PromoPanelTextStyles");
const ActionSpinsController_1 = require("./ActionSpinsController");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const Helper_1 = require("../../utils/Helper");
const PromoPanelConfig_1 = require("../../config/PromoPanelConfig");
const PromoPanelButtonIDs_1 = require("../../enums/PromoPanelButtonIDs");
const ActionSpinMainGameView_1 = require("./ActionSpinMainGameView");
const ASStopSettings_1 = require("./settings/ASStopSettings");
const PromoPanelEvents_1 = require("../../events/PromoPanelEvents");
const ASBetPanelView_1 = require("./ASBetPanelView");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const ASGameOptionsView_1 = require("./subViews/ASGameOptionsView");
const ASNolimitBonusView_1 = require("./subViews/ASNolimitBonusView");
const LimitCapButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/LimitCapButton");
class ActionSpinsView extends FeatureBasePanel_1.FeatureBasePanel {
    get capToggle() {
        return this._capToggle;
    }
    get mainGameView() {
        return this._mainGameView;
    }
    get gameOptionsView() {
        return this._gameOptionsView;
    }
    constructor(controller, scroll) {
        super(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_ICON, NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.ACTION_SPINS), PromoPanelTextStyles_1.PromoPanelTextStyles.FEATURE_ACTION_SPIN_REPLAY_TITLE);
        this._currentState = "";
        this.stopOnBonusCallback = (stopOnBonus) => {
            this.updateOptionsState();
        };
        this._controller = controller;
        this._scroll = scroll;
    }
    init() {
        super.init();
        this._wrapper = new PIXI.Container();
        this._wrapper.name = "MAIN_VIEW_WRAPPER";
        this.addChild(this._wrapper);
        this._mainGameView = new ActionSpinMainGameView_1.ActionSpinMainGameView(this._controller);
        this._gameOptionsView = new ASGameOptionsView_1.ASGameOptionsView(NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData, this._controller.onGameOptionUpdate);
        this._nolimitBonusView = new ASNolimitBonusView_1.ASNolimitBonusView(this._controller);
        this.betPanel = new ASBetPanelView_1.ASBetPanelView(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_BET_UP, PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_BET_DOWN, (button) => this._controller.buttonClick(button), ActionSpinsView.ACTIVE_COLOR);
        this.spinsPanel = new ASBetPanelView_1.ASBetPanelView(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_COUNT_UP, PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_COUNT_DOWN, (button) => this._controller.buttonClick(button), ActionSpinsView.ACTIVE_COLOR, true);
        this._betAndSpinsContainer = new PIXI.Container();
        this._betAndSpinsContainer.addChild(this.betPanel, this.spinsPanel);
        this._betAndSpinsContainer.name = "betAndSpinsContainer";
        if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.hasCapWinLimitToggle()) {
            this._capToggle = new LimitCapButton_1.LimitCapButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.CAP_WIN_TOGGLE);
            this._capToggle.toggled = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.isCapWinLimitToggled();
            this._capToggle.enable(true);
            this._capToggle.addClickCallback(() => this._controller.buttonClick(this._capToggle));
            const labels = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getButtonLabels();
            this._capToggle.addBylines(labels.onLabel, labels.offLabel);
            this._betAndSpinsContainer.addChild(this._capToggle);
        }
        this._wrapper.addChild(this._logo, this._title); //we need to hide all content when replay view shown.
        this._wrapper.addChild(this._betAndSpinsContainer, this._nolimitBonusView, this._gameOptionsView, this._mainGameView);
        this._gameOptionsView.init();
        this._gameOptionsView.setVisibleSelectors(true, true, true);
        ActionSpinsController_1.ActionSpinsController.settings.addCallback(ActionSpinsController_1.ActionSpinsController.settings.STOP_ON_BONUS, this.stopOnBonusCallback);
        this.updateOptionsState();
    }
    onOrientationChanged() {
        this._controller.replayController.view.onOrientationChanged();
    }
    onResize() {
        if (this._isOpen) {
            const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
            const landscapeLayout = NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(bounds);
            let availableWidth = bounds.width;
            this._scroll.position.set(0, 105);
            const newScrollRect = new PIXI.Rectangle(PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, 0, bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - 1);
            if (landscapeLayout) {
                availableWidth = bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT;
            }
            else if (NolimitApplication_1.NolimitApplication.isLandscape && !Helper_1.Helper.isDefaultScreenRatio(bounds)) {
                availableWidth = bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT;
            }
            else {
                const topBarHeight = ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.TOP_BAR).height - 10;
                newScrollRect.width = availableWidth;
                newScrollRect.height = bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - topBarHeight - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT;
                newScrollRect.x = 0;
                newScrollRect.y = topBarHeight;
            }
            this._scroll.resize(newScrollRect.width, newScrollRect.height);
            this._scroll.position.set(newScrollRect.x, newScrollRect.y);
            this.position.set(0, 0);
            super.onResize();
            this._scroll.updateContent();
            const margin = 7;
            this.betPanel.resize(landscapeLayout);
            this.betPanel.pivot.set(this.betPanel.width * 0.5, 0);
            this.spinsPanel.resize(landscapeLayout);
            this.spinsPanel.pivot.set(this.spinsPanel.width * 0.5, 0);
            this.spinsPanel.position.set(0, this.betPanel.height + margin);
            if (this._capToggle) {
                this._capToggle.position.set(Math.floor(this._capToggle.width * -0.5), this.spinsPanel.y + this.spinsPanel.height + margin);
            }
            let yAdvance = 145;
            this._betAndSpinsContainer.position.set(availableWidth * 0.5, yAdvance);
            yAdvance += this._betAndSpinsContainer.height;
            if (this._nolimitBonusView.visible) {
                yAdvance += margin * 2;
                this._nolimitBonusView.position.set(availableWidth * 0.5 - this._nolimitBonusView.width * 0.5, yAdvance);
                yAdvance += this._nolimitBonusView.height;
            }
            yAdvance += margin * 2;
            this._gameOptionsView.position.set(availableWidth * 0.5, yAdvance);
            this._gameOptionsView.pivot.set(this.betPanel.width * 0.5, 0);
            yAdvance += this._gameOptionsView.height;
            yAdvance += margin * 4;
            //OR MAIN GAME
            this._mainGameView.resize(landscapeLayout);
            this._mainGameView.position.set(availableWidth * 0.5, yAdvance);
            this._controller.replayController.view.onResize();
        }
    }
    onUpdateBuyFeaturePrice(currentBet) {
        return 0;
    }
    onUpdateSelectedFeatureBet() {
        this.updateOptionsState();
    }
    updateOptionsState() {
        var _a, _b, _c;
        this._nolimitBonusView.updateBonusButtonStates();
        let isStopOnBonusEnabled = true;
        if (((_a = this._controller.selectedFeatureBet) === null || _a === void 0 ? void 0 : _a.type) === "FREESPIN") {
            isStopOnBonusEnabled = false;
        }
        this._mainGameView.setStopOnBonusEnableState(isStopOnBonusEnabled);
        let isPickNeededForSelectedFeatureBuy = false;
        if ((_c = (_b = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _b === void 0 ? void 0 : _b.bonusGame) === null || _c === void 0 ? void 0 : _c.pickNeededForBuyFeatures) {
            if (this._controller.selectedFeatureBet) {
                isPickNeededForSelectedFeatureBuy = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.bonusGame.pickNeededForBuyFeatures.indexOf(this._controller.selectedFeatureBet.name) > -1;
            }
        }
        if (isPickNeededForSelectedFeatureBuy || (!ActionSpinsController_1.ActionSpinsController.settings.stopOnBonus && isStopOnBonusEnabled)) {
            this._gameOptionsView.enableBonusOption(true);
        }
        else {
            this._gameOptionsView.enableBonusOption(false);
        }
        this._controller.onGameOptionUpdate();
    }
    open() {
        super.open();
        this.showWrapper();
        this._controller.onGameOptionUpdate();
        this._scroll.visible = true;
        this.enableScroll(true);
        this._scroll.updateContent();
    }
    close() {
        super.close();
        ASStopSettings_1.ASStopSettings.reset();
        this.enableScroll(false);
        this._scroll.visible = false;
        this._currentState = "";
    }
    disableBetButtons() {
        this.betPanel.betSelector.enableUpButton(false);
        this.betPanel.betSelector.enableDownButton(false);
    }
    onBetChange(bet) {
        this.gameOptionsView.onUpdateBet();
        this._nolimitBonusView.updateBetLevel(bet);
        this.betPanel.setValue(+bet);
    }
    getBet() {
        return this.betPanel.getValue();
    }
    hideWrapper() {
        this._wrapper.visible = false;
        this._scroll.updateContent();
    }
    showWrapper() {
        this._wrapper.visible = true;
        this._scroll.reAddMouseHoverListener();
        this._scroll.updateContent();
    }
    enableScroll(value) {
        this._scroll.scrollEnabled = value;
    }
    enableASMainTab() {
        this._controller.updateStartButtonState();
        NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.TOGGLE_BUTTONS_ON_LIGHTING_SPINS, true);
    }
}
ActionSpinsView.ACTIVE_COLOR = PIXI.utils.string2hex("#f57f20");
exports.ActionSpinsView = ActionSpinsView;
//# sourceMappingURL=ActionSpinsView.js.map