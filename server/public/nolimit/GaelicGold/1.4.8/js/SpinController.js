"use strict";
/**
 * Created by Ning Jiang on 4/1/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const BalanceEvent_1 = require("../balance/event/BalanceEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameConfig_1 = require("../gameconfig/GameConfig");
const PickAndClickManager_1 = require("../pickandclick/PickAndClickManager");
const ReelEvent_1 = require("../reel/event/ReelEvent");
const ScreenEvent_1 = require("../screen/event/ScreenEvent");
const ScreenManager_1 = require("../screen/ScreenManager");
const ServerEvent_1 = require("../server/event/ServerEvent");
const GameSetting_1 = require("../setting/GameSetting");
const ArrayHelper_1 = require("../utils/ArrayHelper");
const WinPresentationEvent_1 = require("../winpresentation/event/WinPresentationEvent");
const ZeroBetManager_1 = require("../zerobet/ZeroBetManager");
const SpinEvent_1 = require("./event/SpinEvent");
const SlotGame_1 = require("../SlotGame");
const APIBetType_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIBetType");
const SlotApiEvent_1 = require("../slotapiadapter/event/SlotApiEvent");
const GameMode_1 = require("../gamemode/GameMode");
class SpinController {
    constructor() {
        this._zeroBetManager = this.createZeroBetManager();
        this._screenManager = this.createScreenManager();
        this._pickAndClickManager = this.createPickAndClickManager();
        this._isQuickStop = false;
        this._isSpinning = false;
        this._stopDataReceived = false;
        this._stopActionReceived = false;
        this._stopDelay = 0;
        this.addEventListeners();
    }
    createZeroBetManager() {
        return new ZeroBetManager_1.ZeroBetManager();
    }
    createScreenManager() {
        return new ScreenManager_1.ScreenManager();
    }
    createPickAndClickManager() {
        return new PickAndClickManager_1.PickAndClickManager();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addLastEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.GAME_READY, (event) => this.onGameReady());
        EventHandler_1.EventHandler.addLastEventListener(this, ScreenEvent_1.ScreenEvent.GAME_START, (event) => this.onGameStart());
        EventHandler_1.EventHandler.addEventListener(this, SlotApiEvent_1.SlotApiEvent.GAMBLE_DONE, (event) => this.onGambleDone());
        EventHandler_1.EventHandler.addLastEventListener(this, BalanceEvent_1.BalanceEvent.BET, (event) => this.onBet(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.ALL_REELS_SPIN_STARTED, (event) => this.onAllReelsSpinStarted());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.STOP, (event) => this.onStop(event.params[0]));
        EventHandler_1.EventHandler.addLastEventListener(this, ReelEvent_1.ReelEvent.ALL_REELS_SPIN_STOPPED, (event) => this.onAllReelsSpinStopped());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.ADD_STOP_DELAY, (event) => this.addStopDelay(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, WinPresentationEvent_1.WinPresentationEvent.ALL_PRESENTATIONS_COMPLETED, (event) => this.onAllWinPresentationsCompleted());
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.SCREEN_CLOSED, (event) => this.tryPlayZeroBet(false));
    }
    onGameDataParsed(data) {
        this._mode = data.mode;
        this._nextMode = data.nextMode;
        if (this.parseGameData) {
            this.parseGameData(data);
        }
        // Don't run when init.
        if (this._isSpinning) {
            this._stopDataReceived = true;
            // #78 BeforeSpinStop feature when super slow network.
            if (this._stopActionReceived && !this._isQuickStop && this.tryDelaySpin()) {
                // Wait for the spin delay done.
            }
            else {
                this.tryStop();
            }
        }
    }
    onGameReady() {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.IDLE));
    }
    onGameStart() {
        this.checkNext(true);
    }
    onGambleDone() {
        this.checkNext(false);
    }
    checkNext(isInit) {
        this.tryPickAndClick(isInit);
    }
    tryPickAndClick(isInit) {
        if (isInit && this._pickAndClickManager.tryRestoreSelectedPickAndClick()) {
            return;
        }
        if (this._pickAndClickManager.tryPlayPickAndClick()) {
            return;
        }
        this.tryPlayScreens(isInit);
    }
    tryPlayScreens(isInit) {
        if (this._screenManager.tryPlayScreen()) {
            return;
        }
        this.tryPlayZeroBet(isInit);
    }
    tryPlayZeroBet(isInit) {
        if (this._zeroBetManager.tryPlayZeroBet()) {
            return;
        }
        this.tryGamble(isInit);
    }
    tryGamble(isInit) {
        if (SlotGame_1.SlotGame.gamblePlugin && SlotGame_1.SlotGame.gamblePlugin.hasGamble()) {
            SlotGame_1.SlotGame.gamblePlugin.startGamble();
            return;
        }
        if (this._nextMode == GameMode_1.GameMode.GAMBLE) {
            throw new Error("Missing Gamble plugin");
        }
        if (!isInit) {
            this.finishGameRound();
        }
    }
    finishGameRound() {
        // Tells the individual wp to start.
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.IDLE));
        Logger_1.Logger.logDev("Game Round Finished!");
        // Tells the api the round is finished.
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.FINISH));
    }
    // API sent BET, Start new spin
    onBet(bet) {
        this._isQuickStop = false;
        this._isSpinning = true;
        this._mode = this._nextMode;
        this._nextMode = null;
        this._isZeroBet = this._zeroBetManager.isNextZeroBet();
        if (bet.type == APIBetType_1.APIBetType.GAMBLE_BET) {
            return;
        }
        // For previous round to finish everything.
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.BEFORE_START, this.getReelsGameConfigFromPreviousGameData()));
        this.startSpin();
    }
    // extra this function out for the game which need to do some feature before the spin really start. the feature handling might be added to the framework in the feature.
    startSpin() {
        // Tell other modules in game to start spin.
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.START, {
            isFastSpin: GameSetting_1.GameSetting.isFastSpin,
            activeReels: this.getReelsGameConfigFromPreviousGameData()
        }));
    }
    // The reelsConfig specifying if the reel should be active for spin.
    // eg: returns [true, true, true, true, true] normally for spin all 5 reels.
    getReelsGameConfigFromPreviousGameData() {
        return ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, (index) => true);
    }
    onAllReelsSpinStarted() {
        // Tells the api
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.STARTED));
        this.addStopDelay(this.getSpinTime());
        this.onSpinTimerDone();
    }
    onSpinTimerDone() {
        if (!this.tryDelaySpin()) {
            this.wantStopSpin();
        }
    }
    tryDelaySpin() {
        if (this._stopDelay > 0) {
            this._spinTimer = gsap_1.TweenLite.to(this, this._stopDelay, { onComplete: () => this.onSpinTimerDone() });
            this._stopDelay = 0;
            return true;
        }
        return false;
    }
    getSpinTime() {
        const spinTime = GameSetting_1.GameSetting.isFastSpin ? GameConfig_1.GameConfig.instance.REEL_FAST_SPIN_SPIN_TIME : GameConfig_1.GameConfig.instance.REEL_SPIN_TIME;
        if (this._isZeroBet) {
            return spinTime;
        }
        return Math.max(spinTime, SpinController.MIN_SPIN_TIME);
    }
    // In second. eg: in Oktoberfest, when entering party mode, increase this delay for playing intro.
    addStopDelay(delay) {
        this._stopDelay += delay;
    }
    onStop(isQuickStop) {
        if (!this._isSpinning) {
            // When not quick stop, this handler will be triggered again when all reels have stopped and the game sends
            // STOP to the api. it shouldn't do anything in this case.
            return;
        }
        if (isQuickStop) {
            this._isQuickStop = true;
        }
        this.wantStopSpin();
    }
    wantStopSpin() {
        if (this._spinTimer && this._spinTimer.isActive()) {
            this._spinTimer.pause();
            this._spinTimer.kill();
        }
        this._stopActionReceived = true;
        this.tryStop();
    }
    // This can be triggered twice if quick stop is triggered while stopping.
    tryStop() {
        if (this._stopActionReceived && this._stopDataReceived) {
            // Tells the rest of the game module to stop spin.
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.ALL_REELS_STOP_SPIN, {
                quickStop: this._isQuickStop,
                fastSpin: GameSetting_1.GameSetting.isFastSpin
            }));
        }
    }
    onAllReelsSpinStopped() {
        this._stopActionReceived = false;
        this._stopDataReceived = false;
        this._isSpinning = false;
        this._stopDelay = 0;
        // Tells the api that the spin is stopped
        // Tells the win presentation to start.
        // This will trigger onStop again but it shouldn't do anything when the reels are already stopped.
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.STOPPED));
    }
    onAllWinPresentationsCompleted() {
        Logger_1.Logger.logDev("SpinController.onAllWinPresentationCompleted()");
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.DONE));
        this.checkNext(false);
    }
    parseGameData(data) { }
}
SpinController.MIN_SPIN_TIME = 0;
exports.SpinController = SpinController;
//# sourceMappingURL=SpinController.js.map