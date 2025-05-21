"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionSpinsController = void 0;
const ActionSpinsView_1 = require("./ActionSpinsView");
const NolimitPromotionPlugin_1 = require("../../NolimitPromotionPlugin");
const PromoPanelEvents_1 = require("../../events/PromoPanelEvents");
const PromoPanelButtonIDs_1 = require("../../enums/PromoPanelButtonIDs");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const APIBetType_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIBetType");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const gsap_1 = require("gsap");
const ASReplayController_1 = require("./replayActionSpin/ASReplayController");
const PromoPanelConfig_1 = require("../../config/PromoPanelConfig");
const ResponseParser_1 = require("../../utils/ResponseParser");
const Timer_1 = require("../../utils/Timer");
const ASStopSettings_1 = require("./settings/ASStopSettings");
const ASSettingsModel_1 = require("./settings/ASSettingsModel");
const ASEnums_1 = require("../../enums/ASEnums");
const CurrencyUtils_1 = require("../../utils/CurrencyUtils");
const StepList_1 = require("../../utils/StepList");
const SlotStateHandler_1 = require("@nolimitcity/slot-launcher/bin/plugins/apiplugin/SlotStateHandler");
const insufficientFunds = require('@nolimitcity/game-api/src/insufficient-funds');
class ActionSpinsController {
    get spinCountList() {
        return this._spinCountList;
    }
    get spinsLeft() {
        return this._spinsLeft;
    }
    set spinsLeft(value) {
        this._spinsLeft = value;
    }
    get nextMode() {
        return this._nextMode;
    }
    set nextMode(value) {
        this._nextMode = value;
    }
    get view() {
        return this._view;
    }
    set view(value) {
        this._view = value;
    }
    get replayController() {
        return this._replayController;
    }
    get promotionPlugin() {
        return this._promotionPlugin;
    }
    get selectedFeatureBet() {
        return this._selectedFeatureBet;
    }
    get isPaused() {
        return this._isPaused;
    }
    constructor(promotionPlugin) {
        this._normalMode = "NORMAL";
        this._spinsLeft = -1;
        this._isResponseReceived = false;
        this._isPaused = false;
        this._isOpen = false;
        this._isFreeBetsAwarded = false;
        this._freeFeatureBetsAwarded = false;
        this._spinCountList = new StepList_1.StepList([5, 10, 20, 50, 100, 200, 500, 1000]);
        this._wantsPause = false;
        this._isPlayingBonusInGame = false;
        this._returnedFromGame = false;
        this.actionSpinsBetDataInjector = (data) => {
            if (this._isPlayingBonusInGame) {
                if (data.playerInteraction) {
                    data.playerInteraction.actionSpin = true;
                }
                else {
                    data.playerInteraction = { actionSpin: true };
                }
            }
            return data;
        };
        this.onGameOptionUpdate = () => {
            var _a;
            console.log(this.view.gameOptionsView.selectedOptions);
            this.updateStartButtonState();
            //this.view.buyFeatureController.onGameOptionsUpdate(this.view.gameOptionsView.selectedOptions);
            if ((_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration) === null || _a === void 0 ? void 0 : _a.onActionSpinGameOptionSelection) {
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration.onActionSpinGameOptionSelection(this.view.gameOptionsView.selectedOptions);
            }
        };
        this._promotionPlugin = promotionPlugin;
        this.init();
        ActionSpinsController.settings = new ASSettingsModel_1.ASSettingsModel();
        this._betLevels = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getAvailableLevels();
        //this._spinCountList = new StepList(NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.autoPlaySettings.autoplayRounds);
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.addBetDataInjectCallback(this.actionSpinsBetDataInjector);
        ActionSpinsController.pickModes = [];
        if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) {
            if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.automaticPickGame) {
                ActionSpinsController.pickModes = ActionSpinsController.pickModes.concat(NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.automaticPickGame.pickNeededForModes);
            }
            if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.bonusGame) {
                ActionSpinsController.pickModes = ActionSpinsController.pickModes.concat(NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.bonusGame.pickNeededForModes);
            }
        }
        if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.hasCapWinLimitToggle()) {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.BET_GAME_MODE_CHANGED, () => {
                var _a;
                this.onRefresh();
                if ((_a = this.view) === null || _a === void 0 ? void 0 : _a.capToggle) {
                    this.view.capToggle.toggled = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.isCapWinLimitToggled();
                }
            });
        }
    }
    setFeatureBet(betFeature) {
        this._selectedFeatureBet = betFeature;
        this._view.onUpdateSelectedFeatureBet();
    }
    reset() {
        this.setBetLevels();
        this.updateSpinsCountButtons();
        ResponseParser_1.ResponseParser.setBoostAndGetCost("", true);
        ActionSpinsController.bonusBuyData = undefined;
        this._isFreeBetsAwarded = false;
        this._isPaused = false;
    }
    init() {
        this.addEventListeners();
    }
    addEventListeners() {
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.NAV_BUTTON_PRESSED, (buttonId) => this.onNavButtonPressed(buttonId));
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(PromoPanelEvents_1.PromoPanelEvents.PROMO_PANEL_CLOSED, () => this.close());
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.BALANCE, () => this.updateBalance());
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.BALANCE, (balance) => this.onBalanceUpdate(balance));
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.DIALOG, (data) => this.onDialog(data));
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.PAUSE, () => this.onExternalPause(true));
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.RESUME, () => this.onExternalPause(false));
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.HALT, () => this.onHalt());
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.FREE_BETS, (freeBets) => this.onFreeBets(freeBets));
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.FREE_FEATURE_BETS, (freeBets) => this.onFreeFeatureBets(freeBets));
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.REFRESH, () => this.onRefresh());
    }
    createView(scrollContainer) {
        if (this._view == undefined) {
            this._view = new ActionSpinsView_1.ActionSpinsView(this, scrollContainer);
            this._replayController = new ASReplayController_1.ASReplayController(this);
            this._popUpView = this._promotionPlugin.view.popUpView;
        }
    }
    open() {
        if (this.view) {
            if (!this._isOpen) {
                this._view.open();
                this._isOpen = true;
            }
            this.reset();
        }
    }
    onReplayCloseButtonClick() {
        NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.SHOW_HIDE_CLOSE_BUTTON, true);
        this._promotionPlugin.isActionSpinRound = false;
        this.reset();
        this.view.showWrapper();
        this.replayController.close();
    }
    close() {
        if (this._view) {
            this._isOpen = false;
            this._view.close();
        }
    }
    buttonClick(button, featureData, isManualCall = false) {
        Logger_1.Logger.logDev("Action Spin controller :: onButtonClick", button);
        !isManualCall && NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.playKeypadEffect("click");
        switch (button.name) {
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_BET_DOWN:
                this.onBetDownBtnPressed();
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.CAP_WIN_TOGGLE:
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.toggleCapWinLimit();
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_BET_UP:
                this.onBetUpBtnPressed();
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_COUNT_UP:
                this.stepSpinCount(true);
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_COUNT_DOWN:
                this.stepSpinCount(false);
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_BONUS_PICK_POP_UP_CLOSE:
                //this.view.bonusSelectionView.close();
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_SPIN_BUTTON:
                this.showConfirmationView();
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_SETTINGS:
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.OK_BTN:
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.AS_BONUS_SELECTION_OK_BTN:
                this.view.showWrapper();
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.AS_BONUS_SELECTION_CANCEL_BTN:
                this.view.showWrapper();
                break;
            default:
                Logger_1.Logger.warn("Button click : default case : ", button);
        }
    }
    onBuyButtonClicked(featureData, callback) {
        callback && callback(featureData);
    }
    updateStartButtonState() {
        let currentBet = +NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        const xBetOption = this.view.gameOptionsView.selectedOptions.get(ASEnums_1.ASMainGamePickOptions.BOOSTED_BET);
        if (xBetOption && xBetOption.id > 0) {
            currentBet = ResponseParser_1.ResponseParser.getBetCost(xBetOption.name);
        }
        const balance = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.balance.getAmount();
        const canAfford = currentBet <= balance;
        const allOptionsSelected = this.view.gameOptionsView.isAllMandatorySelected();
        const enableButton = canAfford && allOptionsSelected;
        this._view.mainGameView.actionButtonView.startButton.enableStartBtn(enableButton);
    }
    getSelectedBonusOption(nextMode, prevData) {
        var _a, _b, _c;
        let bonusOptionIndex = -1;
        //Normal pre-selected bonus options
        const selectedBonusOption = this._view.gameOptionsView.selectedOptions.get(ASEnums_1.ASBonusPickOptions.PICK_MODE);
        if (selectedBonusOption != undefined && selectedBonusOption.id > -1) {
            bonusOptionIndex = selectedBonusOption.id;
        }
        //Automatic pick options
        if (bonusOptionIndex == -1 && prevData) {
            if (((_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _a === void 0 ? void 0 : _a.automaticPickGame) != undefined) {
                if (((_b = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _b === void 0 ? void 0 : _b.automaticPickGame.pickNeededForModes.indexOf(nextMode)) > -1) {
                    bonusOptionIndex = (_c = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _c === void 0 ? void 0 : _c.automaticPickGame.optionSelection(prevData);
                }
            }
        }
        return bonusOptionIndex;
    }
    showConfirmationView() {
        let popUpData;
        if (this.selectedFeatureBet != undefined) {
            popUpData = this.makeFeatureBetPopUpData(this.selectedFeatureBet);
        }
        else {
            popUpData = this.makeNormalPopUpData();
        }
        this._popUpView.openActionSpins((button, betFeature) => {
            if (button.name == PromoPanelButtonIDs_1.PromoPanelButtonIDs.OK_BTN) {
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betFeatureController.setActiveBetFeature(betFeature === null || betFeature === void 0 ? void 0 : betFeature.name);
                this._popUpView.close();
                this.view.hideWrapper();
                this.startActionSpins();
            }
            else {
                this._popUpView.close();
                this.enableASMainScreen();
            }
        }, popUpData);
    }
    makeNormalPopUpData() {
        const popUpData = {
            isBonusBuy: false,
            bet: CurrencyUtils_1.CurrencyUtils.formatWithDecimalCutOff(this.view.getBet()),
            rounds: this.spinsLeft,
            image: "AS_GAME_LOGO"
        };
        popUpData.stopOnBonus = ActionSpinsController.settings.stopOnBonus;
        popUpData.options = [];
        const xBetOption = this.view.gameOptionsView.selectedOptions.get(ASEnums_1.ASMainGamePickOptions.BOOSTED_BET);
        if (xBetOption && xBetOption.id > 0) {
            popUpData.options.push(xBetOption);
        }
        const volatilityOption = this.view.gameOptionsView.selectedOptions.get(ASEnums_1.ASMainGamePickOptions.VOLATILITY);
        if (volatilityOption) {
            popUpData.options.push(volatilityOption);
        }
        if (!ActionSpinsController.settings.stopOnBonus) {
            const rowOption = this.view.gameOptionsView.selectedOptions.get(ASEnums_1.ASBonusPickOptions.ROW_OPTIONS);
            if (rowOption) {
                popUpData.options.push(rowOption);
            }
            const pickMode = this.view.gameOptionsView.selectedOptions.get(ASEnums_1.ASBonusPickOptions.PICK_MODE);
            if (pickMode) {
                popUpData.options.push(pickMode);
            }
        }
        return popUpData;
    }
    makeFeatureBetPopUpData(betFeature) {
        var _a, _b;
        const isBonus = betFeature.type === "FREESPIN";
        const popUpData = {
            isBonusBuy: isBonus,
            bet: CurrencyUtils_1.CurrencyUtils.formatWithDecimalCutOff(betFeature.getTotalCost()),
            featureData: betFeature,
            image: betFeature.name,
            rounds: this.spinsLeft
        };
        popUpData.stopOnBonus = ActionSpinsController.settings.stopOnBonus && !isBonus;
        popUpData.options = [];
        const rowOption = this.view.gameOptionsView.selectedOptions.get(ASEnums_1.ASBonusPickOptions.ROW_OPTIONS);
        if (rowOption) {
            popUpData.options.push(rowOption);
        }
        let isPickApplicableToSelectedFeatureBuy = true;
        if ((_b = (_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _a === void 0 ? void 0 : _a.bonusGame) === null || _b === void 0 ? void 0 : _b.pickNeededForBuyFeatures) {
            isPickApplicableToSelectedFeatureBuy = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.bonusGame.pickNeededForBuyFeatures.indexOf(betFeature.name) > -1;
        }
        const pickMode = this.view.gameOptionsView.selectedOptions.get(ASEnums_1.ASBonusPickOptions.PICK_MODE);
        if (pickMode && isPickApplicableToSelectedFeatureBuy) {
            popUpData.options.push(pickMode);
        }
        return popUpData;
    }
    onBetDownBtnPressed(enableOnly = false) {
        const currentBetLevel = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        let currentBetIndex = this._betLevels.indexOf(currentBetLevel);
        if (currentBetIndex != -1) {
            !enableOnly && --currentBetIndex;
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.setLevel(this._betLevels[currentBetIndex]);
            this.updateBetButtons(currentBetIndex);
        }
        else {
            Logger_1.Logger.warn("Error invalid bet index : ", currentBetIndex);
        }
    }
    onBetUpBtnPressed() {
        const currentBetLevel = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        let currentBetIndex = this._betLevels.indexOf(currentBetLevel);
        if (currentBetIndex != -1) {
            ++currentBetIndex;
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.setLevel(this._betLevels[currentBetIndex]);
            this.updateBetButtons(currentBetIndex);
        }
        else {
            Logger_1.Logger.warn("Error invalid bet index : ", currentBetIndex);
        }
    }
    stepSpinCount(up) {
        if (this._spinCountList.current() != this._spinsLeft) {
            //This occurs when you change spin count during paused AS.
            let clone = this._spinCountList.getListClone(false);
            let newIndex = 0;
            for (let i = 0; i < clone.length; i++) {
                if (clone[i] > this._spinsLeft) {
                    newIndex = up ? i : --i;
                    break;
                }
            }
            this._spinCountList.setIndex(newIndex);
        }
        else {
            if (up) {
                this._spinCountList.next();
            }
            else {
                this._spinCountList.prev();
            }
        }
        this.updateSpinsCountButtons();
    }
    updateSpinsCountButtons() {
        this.spinsLeft = this._spinCountList.current();
        this.view.spinsPanel.setValue(this.spinsLeft);
        this.replayController.view.setSpinsLeft(this.spinsLeft);
        this.replayController.view.enablePlayPauseBtn(this.eligibleForNextSpin());
        if (this._spinCountList.isFirst()) {
            this._view.spinsPanel.betSelector.enableDownButton(false);
        }
        else {
            this._view.spinsPanel.betSelector.enableDownButton(true);
        }
        if (this._spinCountList.isLast()) {
            this._view.spinsPanel.betSelector.enableUpButton(false);
        }
        else {
            this._view.spinsPanel.betSelector.enableUpButton(true);
        }
        const currentBet = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        this.view.onUpdateBuyFeaturePrice(currentBet);
    }
    updateBetButtons(currBetIndex) {
        const currentBet = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        this._view.onBetChange(currentBet);
        this._view.disableBetButtons();
        const balance = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.balance.getAmount();
        if (currBetIndex < this._betLevels.length - 1 && (+this._betLevels[currBetIndex] < balance)) {
            this._view.betPanel.betSelector.enableUpButton(true);
        }
        if (currBetIndex > 0) {
            this._view.betPanel.betSelector.enableDownButton(true);
        }
        this.view.onUpdateBuyFeaturePrice(currentBet);
        this.updateStartButtonState();
    }
    onBalanceUpdate(balance) {
        if (this._isOpen && !this._replayController.view.isOpen) {
            this.setBetLevels();
        }
    }
    setBetLevels() {
        this._betLevels = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getAvailableLevels();
        const currentBetLevel = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        const currentBetIndex = this._betLevels.indexOf(currentBetLevel);
        ASStopSettings_1.ASStopSettings.update(true);
        this.updateBetButtons(currentBetIndex);
        this.updateStartButtonState();
    }
    isOpen() {
        return this._promotionPlugin.view.isOpen && this.replayController.view.isOpen && !NolimitPromotionPlugin_1.NolimitPromotionPlugin.IS_MINIMIZED;
    }
    startActionSpins(featureData) {
        if (featureData) {
            //This means we do feature buy!
            ActionSpinsController.bonusBuyData = { featureData: featureData };
            ResponseParser_1.ResponseParser.setBoostAndGetCost("", true);
            this.view.hideWrapper();
        }
        this.replayController.open();
        this._promotionPlugin.isActionSpinRound = true;
        this._wantsPause = false;
        this.nextMode = this._normalMode;
        this.startSpin();
    }
    updateBalance() {
        if (this.isOpen()) {
            setTimeout(() => {
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.ACTION_SPINS_ROUND_COMPLETE);
            }, 0);
        }
    }
    enableASMainScreen() {
        this.onBetDownBtnPressed(true);
        this.view.enableASMainTab();
    }
    onNavButtonPressed(btnId) {
        if (btnId == PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS) {
            this.open();
        }
        else {
            this.close();
        }
    }
    pauseGame(pause, startSpin = false) {
        this._wantsPause = pause;
        if (!pause) {
            this._isPaused = false;
            if (startSpin) {
                this.startWhenReady();
            }
        }
    }
    isLowBalance() {
        const balance = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.balance.getAmount();
        let bet = this.view.getBet();
        if (ActionSpinsController.bonusBuyData) {
            bet = ActionSpinsController.bonusBuyData.featureData.price * bet;
        }
        else if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.betBoost) {
            bet = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.betBoost.calculatedPrice;
        }
        Logger_1.Logger.logDev("Action Spin : isLowBalance check ", bet, balance);
        return bet > balance;
    }
    stopSpin() {
        var _a;
        if ((_a = this._roundInfoTl) === null || _a === void 0 ? void 0 : _a.isActive()) {
            this._roundInfoTl.add(() => {
                NolimitApplication_1.NolimitApplication.apiPlugin.slotStates.stateIsReady().then(() => {
                    this.onGameStopped();
                });
            });
        }
        else {
            if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.SCREEN) && this._returnedFromGame == true) {
                this.onGameStopped();
            }
            else {
                NolimitApplication_1.NolimitApplication.apiPlugin.slotStates.stateIsReady().then(() => {
                    this.onGameStopped();
                });
            }
        }
    }
    onHalt() {
        if (this.isOpen()) {
            this.onExternalPause(true);
        }
    }
    onExternalPause(wantPause) {
        if (this.isOpen()) {
            if (wantPause) {
                this.pauseGame(true);
                this.replayController.view.addBlur();
            }
            else {
                this.replayController.view.removeBlur();
            }
        }
    }
    onFreeBets(freeBets) {
        if (this.isOpen()) {
            this._isFreeBetsAwarded = true;
            this.onExternalPause(true);
        }
    }
    onFreeFeatureBets(freeBets) {
        if (this.isOpen()) {
            this._freeFeatureBetsAwarded = true;
            this.pauseGame(true);
        }
    }
    onDialog(data) {
        if (this.isOpen()) {
            this.onExternalPause(data == "open");
            if (this._isFreeBetsAwarded && data == "close") {
                this._isFreeBetsAwarded = false;
                this.closeDownActionSpins();
            }
        }
    }
    closeDownActionSpins() {
        this.onReplayCloseButtonClick();
        this._promotionPlugin.close();
    }
    onRefresh() {
        if (this._isOpen) {
            this.setBetLevels();
            if (this._replayController.view.isOpen && this._isPaused) {
                this.replayController.onGameStopped(this.eligibleForNextSpin());
            }
        }
    }
    onGameStopped() {
        this._isPaused = true;
        this._wantsPause = false;
        if (this._freeFeatureBetsAwarded == true) {
            this._freeFeatureBetsAwarded = false;
            this.closeDownActionSpins();
            return;
        }
        this.replayController.onGameStopped(this.eligibleForNextSpin());
    }
    startWhenReady() {
        if (this._wantsPause) {
            this.stopSpin();
        }
        else {
            if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.SCREEN) && this._returnedFromGame == true) {
                //We need this in order to restart AS if the last configured spin was played in game. When we return we will again be in state screen if not just continuing with as spins.
                this.startSpin();
                if (!this._isPaused) {
                    this._returnedFromGame = false;
                }
            }
            else {
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.slotStates.stateIsReady().then(() => {
                    this._returnedFromGame = false;
                    this.startSpin();
                });
            }
        }
    }
    startSpin() {
        if (this.nextMode === this._normalMode) {
            if (this.isLowBalance()) {
                this.showInsufficientFunds();
                return;
            }
            this.spinsLeft--;
        }
        if (this.spinsLeft > -1) {
            this.makeBet();
            this._isResponseReceived = false;
        }
        else {
            this.onGameStopped();
        }
    }
    makeBet() {
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.dialog.lock("PIXIDialog"); //ToLock dialog
        let betType = APIBetType_1.APIBetType.NORMAL_BET;
        if (ActionSpinsController.isGambleMode(this.nextMode)) {
            betType = APIBetType_1.APIBetType.GAMBLE_BET;
        }
        else if (this.nextMode !== this._normalMode && !ActionSpinsController.isPickMode(this.nextMode)) {
            betType = APIBetType_1.APIBetType.ZERO_BET;
        }
        else if (ActionSpinsController.isPickMode(this.nextMode)) {
            const asDataPromise = this.actionSpinDataPromise();
            ResponseParser_1.ResponseParser.gameDataPromise().then((gameData) => {
                this.onGameDataPromiseResolved(gameData, asDataPromise);
            });
            const selectedBonusOptionIndex = this.getSelectedBonusOption(this.nextMode, this.prevData);
            if (selectedBonusOptionIndex > -1) {
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.actionSpinsPickAndClickBet(selectedBonusOptionIndex, true);
                Logger_1.Logger.logDev("Action Spin : Saved pick mode has been taken : ", selectedBonusOptionIndex);
            }
            else {
                Logger_1.Logger.warn("Error :: Action Spin Bonus mode not selected, default zero index picked", this.view.gameOptionsView.selectedOptions);
                const selectedBonusOption = 0;
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.actionSpinsPickAndClickBet(selectedBonusOption, true);
            }
            return;
        }
        let betCost = 0;
        const asDataPromise = this.actionSpinDataPromise();
        ResponseParser_1.ResponseParser.gameDataPromise().then((gameData) => {
            this.replayController.accumulatedBet += betCost;
            this.onGameDataPromiseResolved(gameData, asDataPromise);
        }).catch(reason => {
            //Some error
            this.stopSpin();
        });
        //Here make actual bet with bethandler.
        if (betType === APIBetType_1.APIBetType.GAMBLE_BET) {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.gambleBet(true, undefined, undefined, true);
        }
        else if (ActionSpinsController.bonusBuyData && betType !== APIBetType_1.APIBetType.ZERO_BET) {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.lightningSpinsFeatureBet(ActionSpinsController.bonusBuyData.featureData.name);
            Timer_1.Timer.measureTimeAtStateStart(PromoPanelConfig_1.Mode.NORMAL, Timer_1.FlowState.BET);
            this.replayController.placedBet = (ActionSpinsController.bonusBuyData.featureData.price * this.view.betPanel.getValue());
            betCost = this.replayController.placedBet;
        }
        else {
            if (betType === APIBetType_1.APIBetType.NORMAL_BET) {
                this.replayController.placedBet = ASStopSettings_1.ASStopSettings.appliedBet;
                betCost = this.replayController.placedBet;
            }
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.lightningSpinsBet(betType);
            Timer_1.Timer.measureTimeAtStateStart(PromoPanelConfig_1.Mode.NORMAL, Timer_1.FlowState.BET);
        }
        this.replayController.updateSpinsLeft(this.spinsLeft);
    }
    onGameDataPromiseResolved(gameData, asDataPromise) {
        ResponseParser_1.ResponseParser.addASReplayWinData(gameData, this._view.betPanel.getValue(), this._fsData);
        if (gameData.asReplayWinData.freeSpinTriggeredThisSpin || this._fsData) {
            this._fsData = gameData;
        }
        if (gameData.nextMode === PromoPanelConfig_1.Mode.NORMAL && this._fsData) {
            this._fsData = undefined;
        }
        //if round is complete, we add the AS data, which includes replay id and time. This is extra data.
        if (gameData.asReplayWinData.isRoundComplete) {
            Logger_1.Logger.logDev("Action Spin : onGameDataPromiseResolved round finished ", gameData, gameData.asReplayWinData);
            if (gameData.nextMode === this._normalMode) {
                if (this._actionSpinData) {
                    this._roundInfoTl = this._replayController.updateRawData(gameData.asReplayWinData, this._actionSpinData);
                    this.onBetResponseReceived(gameData, gameData.asReplayWinData.waitForAnimation);
                    this._actionSpinData = undefined;
                }
                else {
                    asDataPromise.then((asData) => {
                        this._roundInfoTl = this._replayController.updateRawData(gameData.asReplayWinData, asData);
                        this.onBetResponseReceived(gameData, gameData.asReplayWinData.waitForAnimation);
                        this._actionSpinData = undefined;
                    });
                }
            }
            else {
                this._roundInfoTl = this._replayController.updateRawData(gameData.asReplayWinData);
                this.onBetResponseReceived(gameData, gameData.asReplayWinData.waitForAnimation);
            }
        }
        else {
            Logger_1.Logger.logDev("Action Spin : onGameDataPromiseResolved round not finished ", gameData, gameData.asReplayWinData);
            this.onBetResponseReceived(gameData, gameData.asReplayWinData.waitForAnimation);
        }
    }
    actionSpinDataPromise() {
        return new Promise((resolve) => {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.once(PromoPanelEvents_1.PromoPanelEvents.ACTION_SPIN_DATA, (data) => {
                this._actionSpinData = data;
                resolve(data);
            });
        });
    }
    showInsufficientFunds() {
        this.stopSpin();
        insufficientFunds.show(NolimitApplication_1.NolimitApplication.apiPlugin);
    }
    eligibleForNextSpin() {
        let shouldSpin;
        const balance = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.balance.getAmount();
        const bet = this._replayController.placedBet || ASStopSettings_1.ASStopSettings.appliedBet;
        ASStopSettings_1.ASStopSettings.shouldReset = false;
        shouldSpin = (bet <= balance);
        //placed bet will be the price of a feature so condition already evaluated in prev line.
        // if (shouldSpin && ActionSpinsController.bonusBuyData && ActionSpinsController.bonusBuyData.bonusBuyCount > -1) {
        //     shouldSpin = balance >= (ActionSpinsController.bonusBuyData.featureData.price * bet);
        // }
        if (shouldSpin && ASStopSettings_1.ASStopSettings.maxBalanceLimitAmount) {
            shouldSpin = !(NolimitApplication_1.NolimitApplication.apiPlugin.balance.getAmount() > (ASStopSettings_1.ASStopSettings.maxBalanceLimitAmount)); //#227
            ASStopSettings_1.ASStopSettings.shouldReset = !shouldSpin;
        }
        if (shouldSpin && ASStopSettings_1.ASStopSettings.minBalanceLimitAmount) {
            shouldSpin = !(NolimitApplication_1.NolimitApplication.apiPlugin.balance.getAmount() < (ASStopSettings_1.ASStopSettings.minBalanceLimitAmount) + bet); //#227
            ASStopSettings_1.ASStopSettings.shouldReset = !shouldSpin;
        }
        return shouldSpin && this.spinsLeft > -1;
    }
    isBuyFeatureScreen() {
        return !this.view.mainGameView.visible;
    }
    onBetResponseReceived(data, waitForAnimation = false) {
        Logger_1.Logger.logDev("onBetResponseReceived : data ", data);
        this.prevData = data;
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.STOP);
        let delay = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.minimumSpinTime * 0.001 || 0.001;
        if (waitForAnimation) {
            delay = Math.max(this._roundInfoTl.duration() - this._roundInfoTl.time() - 0.2, delay);
        }
        gsap_1.TweenLite.to({}, delay, { onComplete: () => this.proceedBetResponse(data) });
    }
    proceedBetResponse(data) {
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.DONE);
        Timer_1.Timer.measureTimeAtStateStart(PromoPanelConfig_1.Mode.NORMAL, Timer_1.FlowState.WIN);
        this._isResponseReceived = true;
        this.nextMode = data.nextMode;
        this._singleWin = data.totalBetLineWinnings;
        if (this.nextMode === this._normalMode) {
            NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.ACTION_SPINS_ROUND_COMPLETE);
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.FINISH);
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.dialog.unlock("PIXIDialog");
            this.startWhenReady();
        }
        else if (this.shouldPlayMaxWinInGame(data)) {
            this.promotionPlugin.minimize();
            this._isPlayingBonusInGame = true;
            this.onBonusRedirectToGameSide();
            //this is verified to exist in "this.shouldPlayMaxWinInGame"
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.maxWin.playMaxWinInGame(data).then(value => {
                this._returnedFromGame = true;
                this._isPlayingBonusInGame = false;
                this._replayController.view.maximized();
                this.promotionPlugin.maximize();
                this.startWhenReady();
            });
            return;
        }
        else if (this.shouldStopOnBonus(data)) {
            //STOP ON BONUS
            const featureName = data.asReplayWinData.featureName || ""; // || NolimitPromotionPlugin.bonusOptionsData.features[data.nextMode] || "";
            this._replayController.view.createStopOnBonusRound(featureName, data.nextMode);
            this._replayController.view.enablePlayPauseBtn(false);
            this._replayController.view.setPlayState(false);
            this._wantsPause = false;
            //Continue in action spins
            this._replayController.onClickContinuePlayBonusInReplayFunc = () => {
                this._replayController.view.removeStopOnBonusRound();
                this.replayController.view.enablePlayPauseBtn(true);
                this.startSpin();
            };
            //Play in game
            this._replayController.onClickPlayBonusInGamePlayFunc = () => {
                this.launchBonusInGame(data);
                this.replayController.view.removeStopOnBonusRound();
                this.replayController.view.enablePlayPauseBtn(true);
            };
            return;
        }
        else {
            //If not a new round, just do spin, it's zero bet.
            this.startSpin();
        }
    }
    launchBonusInGame(data) {
        var _a;
        this.promotionPlugin.minimize();
        this._isPlayingBonusInGame = true;
        const betData = {
            type: "FAKE_BET",
            isFakeBet: true,
            replayAndFeatureBuy: true //To fool balance to not subtract bet
        };
        if ((_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration) === null || _a === void 0 ? void 0 : _a.onPlayBonusInGame) {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration.onPlayBonusInGame(data);
            NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger("redirectingToBonusInGame", data);
            this.onBonusRedirectToGameSide();
        }
        else {
            const tl = new gsap_1.TimelineMax();
            tl.add(() => { NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger("redirectingToBonusInGame", data); });
            tl.add(() => { NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.BET, betData); });
            tl.add(() => { NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.GAME, data); }, 0.1);
            tl.add(() => { this.onBonusRedirectToGameSide(); }, 0.2);
        }
        NolimitApplication_1.NolimitApplication.apiPlugin.slotStates.stateIsReady().then(() => {
            this._returnedFromGame = true;
            this._isPlayingBonusInGame = false;
            this._replayController.view.maximized();
            this.promotionPlugin.maximize();
            NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger("redirectingToBonusInGameComplete");
            const tl = new gsap_1.TimelineMax();
            tl.add(() => { this.startSpin(); }, 0.2);
        });
    }
    onBonusRedirectToGameSide() {
        NolimitApplication_1.NolimitApplication.apiPlugin.events.once(APIEventSystem_1.APIEvent.GAME, (gameData) => {
            ResponseParser_1.ResponseParser.addASReplayWinData(gameData, this._view.betPanel.getValue(), this._fsData);
            if (gameData.asReplayWinData.freeSpinTriggeredThisSpin || this._fsData) {
                this._fsData = gameData;
            }
            if (gameData.nextMode === PromoPanelConfig_1.Mode.NORMAL && this._fsData) {
                this._fsData = undefined;
            }
            this.nextMode = gameData.nextMode;
            if (gameData.asReplayWinData.isRoundComplete) {
                if (gameData.nextMode === this._normalMode) {
                    if (this._actionSpinData) {
                        const asData = {
                            time: this._actionSpinData.time,
                            gameRoundId: this._actionSpinData.gameRoundId
                        };
                        Logger_1.Logger.logDev("Action Spin : afterRedirectToMainGame data ", asData, gameData.asReplayWinData);
                        this._roundInfoTl = this._replayController.updateRawData(gameData.asReplayWinData, asData);
                        this._actionSpinData = undefined;
                    }
                    else {
                        this.actionSpinDataPromise().then((asData) => {
                            Logger_1.Logger.logDev("Action Spin : afterRedirectMainGame roundId data ", asData, gameData.asReplayWinData);
                            this._roundInfoTl = this._replayController.updateRawData(gameData.asReplayWinData, asData);
                            this._actionSpinData = undefined;
                        });
                    }
                }
                else {
                    Logger_1.Logger.logDev("Action Spin : onBonusRedirectToGameSide nextMode is not normal :: roundId data ", gameData.asReplayWinData);
                    this._roundInfoTl = this._replayController.updateRawData(gameData.asReplayWinData);
                    setTimeout(() => this.onBonusRedirectToGameSide(), 0);
                }
            }
            else {
                setTimeout(() => this.onBonusRedirectToGameSide(), 0);
            }
        });
    }
    shouldPlayMaxWinInGame(data) {
        var _a, _b, _c, _d, _e, _f;
        if (!data.asReplayWinData.isWinCapHit) {
            return false;
        }
        let shouldPlay = true;
        if ((_b = (_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _a === void 0 ? void 0 : _a.maxWin) === null || _b === void 0 ? void 0 : _b.shouldPlayMaxWinInGame) {
            shouldPlay = (_d = (_c = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _c === void 0 ? void 0 : _c.maxWin) === null || _d === void 0 ? void 0 : _d.shouldPlayMaxWinInGame(data);
        }
        return shouldPlay && ((_f = (_e = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _e === void 0 ? void 0 : _e.maxWin) === null || _f === void 0 ? void 0 : _f.playMaxWinInGame) != undefined;
    }
    shouldStopOnBonus(data) {
        const isStopOnBonusSetting = ActionSpinsController.settings.stopOnBonus;
        const isLegalMode = ActionSpinsController.isLegalStopOnBonusMode(data);
        const isFreeSpinTriggered = data.asReplayWinData.freeSpinTriggeredThisSpin;
        let betFeatureUseStopOnBonus = true;
        const feature = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betFeatureController.getActiveBetFeature();
        if ((feature === null || feature === void 0 ? void 0 : feature.type) === "FREESPIN") {
            betFeatureUseStopOnBonus = false;
        }
        return isStopOnBonusSetting && isLegalMode && isFreeSpinTriggered && betFeatureUseStopOnBonus;
    }
    static isLegalStopOnBonusMode(data) {
        var _a;
        if ((_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration) === null || _a === void 0 ? void 0 : _a.isLegalStopOnBonusMode) {
            return NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration.isLegalStopOnBonusMode(data);
        }
        return ActionSpinsController.isNormalMode(data.mode) || ActionSpinsController.isPickMode(data.nextMode);
    }
    static isLegalGambleMode(mode) {
        var _a;
        if ((_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration) === null || _a === void 0 ? void 0 : _a.isLegalGambleMode) {
            return NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration.isLegalGambleMode(mode);
        }
        return false;
    }
    static isNormalMode(mode) {
        return mode.indexOf("NORMAL") > -1;
    }
    static isGambleMode(mode) {
        if (mode.indexOf("GAMBLE") > -1 && ActionSpinsController.isLegalGambleMode(mode)) {
            return true;
        }
        return false;
    }
    static isPickMode(mode) {
        if (mode.indexOf("PICK") > -1) {
            return true;
        }
        for (let neededMode of ActionSpinsController.pickModes) {
            if (neededMode == mode) {
                return true;
            }
        }
        return false;
    }
    static triggerSound(sound) {
        var _a;
        if ((_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration) === null || _a === void 0 ? void 0 : _a.onActionSpinPlaySound) {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.promoPanelGameConfiguration.onActionSpinPlaySound(sound);
        }
    }
}
ActionSpinsController.bonusBuyData = undefined;
exports.ActionSpinsController = ActionSpinsController;
//# sourceMappingURL=ActionSpinsController.js.map