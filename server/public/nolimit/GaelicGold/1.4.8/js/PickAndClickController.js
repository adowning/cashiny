"use strict";
/**
 * Created by Ning Jiang on 1/28/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickAndClickController = void 0;
// TODO: This is very much duplicated with Screens, need to be refactored.
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const BalanceEvent_1 = require("../balance/event/BalanceEvent");
const BaseController_1 = require("../base/BaseController");
const BetLineEvent_1 = require("../betline/event/BetLineEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const ScreenEvent_1 = require("../screen/event/ScreenEvent");
const ParsedInitData_1 = require("../server/data/ParsedInitData");
const ServerEvent_1 = require("../server/event/ServerEvent");
const GameSetting_1 = require("../setting/GameSetting");
const SpinEvent_1 = require("../spin/event/SpinEvent");
const StageEvent_1 = require("../stage/event/StageEvent");
const SlotGame_1 = require("../SlotGame");
class PickAndClickController extends BaseController_1.BaseController {
    get isTriggered() {
        return this._isTriggered;
    }
    get isRestoreSelectedTriggered() {
        return this._isRestoreSelectedTriggered;
    }
    constructor(name, config, tweakEnabled) {
        super(tweakEnabled, name);
        this._autoClick = false;
        this._isTriggered = false;
        this._isRestoreSelectedTriggered = false;
        this._isWaiting = false;
        this._replayPlayerSelectionIndex = -1;
        this._autoClick = config.autoClickTime != null && config.autoClickTime > 0;
        if (this._autoClick) {
            this._autoClickTime = config.autoClickTime;
        }
        this._view = config.viewCreator((index, autoClicked) => this.onButtonClick(index, autoClicked), this._autoClick);
        this._showWinPresentations = config.showWinPresentations;
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.BEFORE_START, (event) => this.onBeforeSpinStart());
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        if (this.addFeatureEventHandlers) {
            this.addFeatureEventHandlers();
        }
    }
    onBeforeSpinStart() {
        this.reset();
    }
    reset() {
        this._serverData = null;
        this._buttonConfigs = null;
        this._isTriggered = false;
        this._isWaiting = false;
        this._replayPlayerSelectionIndex = -1;
        if (this.resetFeatureGameData) {
            this.resetFeatureGameData();
        }
    }
    onGameDataParsed(data) {
        this._serverData = data;
        if (this._isWaiting) {
            this._isWaiting = false;
            this.finish();
        }
        else {
            this._isRestoreSelectedTriggered = data instanceof ParsedInitData_1.ParsedInitData && data.isRestoreState && this.calculateIsRestoreTriggered(data);
            this._isTriggered = this.calculateIsTriggered(data);
            if (this._isTriggered || this._isRestoreSelectedTriggered) {
                this._buttonConfigs = this.parseButtonConfigs(data);
                if (GameSetting_1.GameSetting.replayMode) {
                    if (data.replayNextPlayerInteraction == null) {
                        debugger;
                        throw new Error("PickAndClickController.onGameDataParsed() nextPlayerInteraction is missing from the server response when replay!");
                    }
                    this._replayPlayerSelectionIndex = data.replayNextPlayerInteraction.selectedIndex;
                    if (this._replayPlayerSelectionIndex < 0) {
                        debugger;
                        throw new Error("PickAndClickController.onGameDataParsed() nextPlayerInteraction.selectedIndex is not a valid number!");
                    }
                }
                if (this.parseFeatureGameData) {
                    this.parseFeatureGameData(data);
                }
            }
        }
    }
    start(isRestoreSelected) {
        Logger_1.Logger.logDev(`Starting PickAndClick ${this.moduleName}`);
        EventHandler_1.EventHandler.dispatchEvent((new GameEvent_1.GameEvent(ScreenEvent_1.ScreenEvent.PICK_AND_CLICK_START)));
        this.show(isRestoreSelected);
    }
    // when restoreSelected, show the selection and the animation after.
    show(isRestoreSelected) {
        this._view.show(this._buttonConfigs, this._serverData, isRestoreSelected ? () => this.finish() : () => this.onShowComplete());
        this.hideKeypad();
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.SET_ENABLED, false));
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.HIDE_ALL_BET_LINES));
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.WANT_RESIZE));
        // When restore in freespin, don't show the intro but we need the intro to init the freespin scene.
        if (this.doTransitions) {
            this.doTransitions();
        }
    }
    onShowComplete() {
        this._view.enableButtons(true);
        if (GameSetting_1.GameSetting.replayMode) {
            this.playReplay();
            return;
        }
        // Start auto close timer.
        if (this._autoClick) {
            this._view.startTimer(this._autoClickTime);
        }
    }
    playReplay() {
        this._view.clickButton(this._replayPlayerSelectionIndex);
    }
    onButtonClick(index, autoClicked = false) {
        if (this._isWaiting) {
            // Use this to make sure the button is not triggered more than once because of the messy button events handling.
            return;
        }
        this._isWaiting = true;
        this._view.enableButtons(false);
        this._view.stopTimer();
        this._view.wait();
        Logger_1.Logger.logDev(`Selected index - ${index}`);
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.PICK_AND_CLICK, index));
    }
    finish() {
        this.close();
    }
    close() {
        this._view.close(this._serverData, () => this.onCloseComplete());
    }
    onCloseComplete() {
        Logger_1.Logger.logDev(`Close PickAndClick ${this.moduleName}`);
        this.reset();
        this.showKeypad();
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.WANT_RESIZE));
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.SET_ENABLED, true));
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ScreenEvent_1.ScreenEvent.PICK_AND_CLICK_CLOSED, this._showWinPresentations));
    }
    hideKeypad() {
        SlotGame_1.SlotGame.keypad.hide();
    }
    showKeypad() {
        SlotGame_1.SlotGame.keypad.show();
    }
}
exports.PickAndClickController = PickAndClickController;
//# sourceMappingURL=PickAndClickController.js.map