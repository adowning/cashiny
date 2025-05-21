"use strict";
/**
 * Created by Ning Jiang on 5/11/2016.
 * Refactored by Ning Jiang on 12/9/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinPresentationManager = void 0;
const BetLineEvent_1 = require("../betline/event/BetLineEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
const ScreenEvent_1 = require("../screen/event/ScreenEvent");
const GameSetting_1 = require("../setting/GameSetting");
const SpinEvent_1 = require("../spin/event/SpinEvent");
const ArrayHelper_1 = require("../utils/ArrayHelper");
const WinPresentationEvent_1 = require("./event/WinPresentationEvent");
class WinPresentationManager {
    constructor() {
        this._currentIndexes = [-1, -1];
        this._winPresentations = [];
        const factoryMethods = GameModuleConfig_1.GameModuleConfig.instance.WIN_PRESENTATIONS;
        if (factoryMethods) {
            let wps;
            for (let i = 0; i < factoryMethods.length; i++) {
                wps = [];
                for (let j = 0; j < factoryMethods[i].length; j++) {
                    wps.push(factoryMethods[i][j]([i, j]));
                }
                this._winPresentations.push(wps);
            }
        }
        const factoryMethod = GameModuleConfig_1.GameModuleConfig.instance.INDIVIDUAL_WIN_PRESENTATION;
        if (factoryMethod != undefined) {
            this._individualWin = factoryMethod();
        }
        else {
            throw new Error("No IndividualWinPresentationController defined");
        }
        this.resetLevelStates();
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addLastEventListener(this, SpinEvent_1.SpinEvent.STOPPED, (event) => this.onStartWinPresentations());
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.PICK_AND_CLICK_CLOSED, (event) => this.onPickAndClickClosed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.SKIP, (event) => this.onAbort());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.BEFORE_START, (event) => this.onReset());
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.SCREEN_START, (event) => this.onReset());
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.PICK_AND_CLICK_START, (event) => this.onReset());
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.BET_OPTION_CHANGED, (event) => this.onReset());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.IDLE, (event) => this.onSpinIdle());
        EventHandler_1.EventHandler.addEventListener(this, WinPresentationEvent_1.WinPresentationEvent.WIN_PRESENTATION_COMPLETED, (event) => this.onWinPresentationComplete(event.params[0], event.params[1]));
    }
    onStartWinPresentations() {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.WIN_PRESENTATIONS_STARTED));
        this.playNextPresentation(true);
    }
    onPickAndClickClosed(showWinPresentations) {
        if (showWinPresentations) {
            this.onStartWinPresentations();
        }
        else {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.ALL_PRESENTATIONS_COMPLETED));
        }
    }
    onAbort() {
        // abort the current playing win presentation.
        if (this._currentIndexes[0] > -1 && this._currentIndexes[1] > -1) {
            this._winPresentations[this._currentIndexes[0]][this._currentIndexes[1]].abort();
        }
    }
    onReset() {
        for (let i = 0; i < this._winPresentations.length; i++) {
            for (let j = 0; j < this._winPresentations[i].length; j++) {
                this._winPresentations[i][j].reset();
            }
        }
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.HIDE_ALL_BET_LINES));
        this._individualWin.abort();
        this.resetLevelStates();
    }
    onSpinIdle() {
        if (GameSetting_1.GameSetting.isNextAutoplayRound) {
            return;
        }
        this._individualWin.play();
    }
    onWinPresentationComplete(completedIndexes, hasWin) {
        if (completedIndexes[0] === -1) {
            // individual win.
            return;
        }
        if (this._currentIndexes[0] !== completedIndexes[0] || this._currentIndexes[1] !== completedIndexes[1]) {
            debugger;
            throw new Error("Error: WinPresentationManager.onWinPresentationComplete():Win Presentation index fault!");
        }
        this.playNextPresentation(hasWin);
    }
    playNextPresentation(shouldPlayNextLevel) {
        if (shouldPlayNextLevel) {
            this.playNextLevelPresentation();
        }
        else {
            this.playNextPresentationInTheSameLevel();
        }
    }
    playNextLevelPresentation() {
        const currentLevel = this._currentIndexes[0];
        if (currentLevel >= 0) {
            this._levelCompleteStates[currentLevel] = true;
        }
        this._currentIndexes[0]++;
        this._currentIndexes[1] = -1;
        // if the previous level is the last level, reset and complete.
        if (this._currentIndexes[0] >= this._winPresentations.length) {
            this._currentIndexes = [-1, -1];
            this.resetLevelStates();
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.ALL_PRESENTATIONS_COMPLETED));
        }
        else {
            this.playNextPresentationInTheSameLevel();
        }
    }
    playNextPresentationInTheSameLevel() {
        this._currentIndexes[1]++;
        // if the previous wp is the last one in its level, play the next level.
        if (this._currentIndexes[1] >= this._winPresentations[this._currentIndexes[0]].length) {
            this.playNextLevelPresentation();
        }
        else {
            this._winPresentations[this._currentIndexes[0]][this._currentIndexes[1]].play();
        }
    }
    resetLevelStates() {
        this._levelCompleteStates = ArrayHelper_1.ArrayHelper.initArrayWithValues(this._winPresentations.length, (index) => false);
    }
}
exports.WinPresentationManager = WinPresentationManager;
//# sourceMappingURL=WinPresentationManager.js.map