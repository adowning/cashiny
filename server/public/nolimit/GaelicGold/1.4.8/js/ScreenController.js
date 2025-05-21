"use strict";
/**
 * Created by Ning Jiang on 11/24/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const BaseController_1 = require("../base/BaseController");
const BetLineEvent_1 = require("../betline/event/BetLineEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const ServerEvent_1 = require("../server/event/ServerEvent");
const SpinEvent_1 = require("../spin/event/SpinEvent");
const StageEvent_1 = require("../stage/event/StageEvent");
const ScreenEvent_1 = require("./event/ScreenEvent");
const SlotGame_1 = require("../SlotGame");
class ScreenController extends BaseController_1.BaseController {
    get isTriggered() {
        return this._isTriggered;
    }
    constructor(name, config, tweakEnabled) {
        super(tweakEnabled, name);
        this._autoClose = false;
        this._isTriggered = false;
        this._hasStarted = false;
        this._isShowing = false;
        this._autoClose = config.autoCloseTime != null && config.autoCloseTime > 0;
        if (this._autoClose) {
            this._autoCloseTime = config.autoCloseTime;
        }
        this._view = config.viewCreator(() => this.finish(), this._autoClose);
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
        this._serverData = null;
        this._isTriggered = false;
        if (this.resetFeatureGameData) {
            this.resetFeatureGameData();
        }
    }
    onGameDataParsed(data) {
        this._serverData = data;
        this._isTriggered = this.calculateIsTriggered(data);
        if (this._isTriggered) {
            if (this.parseFeatureGameData) {
                this.parseFeatureGameData(data);
            }
        }
    }
    start() {
        Logger_1.Logger.logDev(`Starting Screen ${this.moduleName}`);
        EventHandler_1.EventHandler.dispatchEvent((new GameEvent_1.GameEvent(ScreenEvent_1.ScreenEvent.SCREEN_START)));
        this._hasStarted = true;
        if (!this.show()) {
            this.finish();
        }
    }
    // Return false if it only does some restore/transition but no need to show. eg: restore in the middle of Freespin.
    show() {
        if (this.shouldShow()) {
            this._view.show(this._serverData, () => this.onShowComplete());
            this.hideKeypad();
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.SET_ENABLED, false));
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.HIDE_ALL_BET_LINES));
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.WANT_RESIZE));
            this._isShowing = true;
        }
        // When restore in freespin, don't show the intro but we need the intro to init the freespin scene.
        if (this.doTransitions) {
            this.doTransitions();
        }
        return this._isShowing;
    }
    shouldShow() {
        return true;
    }
    onShowComplete() {
        // Start auto close timer.
        if (this._autoClose) {
            this._view.startTimer(this._autoCloseTime, () => this.finish());
        }
        this._view.enableButton();
    }
    finish() {
        if (!this._hasStarted) {
            // Use this to make sure the button is not triggered more than once because of the messy button events handling.
            return;
        }
        this._hasStarted = false;
        this.close();
    }
    close() {
        if (this._isShowing) {
            this._view.stopTimer();
            this._view.close(() => this.onCloseComplete());
            this._isShowing = false;
        }
        else {
            this.onCloseComplete();
        }
    }
    onCloseComplete() {
        Logger_1.Logger.logDev(`Close Screen ${this.moduleName}`);
        this.showKeypad();
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.WANT_RESIZE));
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.SET_ENABLED, true));
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ScreenEvent_1.ScreenEvent.SCREEN_CLOSED));
    }
    /**
     * @deprecated Not used any more
     */
    shouldOnlyHideKeypadButtons() {
        return false;
    }
    hideKeypad() {
        SlotGame_1.SlotGame.keypad.hide();
    }
    showKeypad() {
        SlotGame_1.SlotGame.keypad.show();
    }
}
exports.ScreenController = ScreenController;
//# sourceMappingURL=ScreenController.js.map