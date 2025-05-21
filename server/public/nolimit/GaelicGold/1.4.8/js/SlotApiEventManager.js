"use strict";
/**
 * Created by Ning Jiang on 3/31/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotApiEventManager = void 0;
const BalanceEvent_1 = require("../balance/event/BalanceEvent");
const ErrorEvent_1 = require("../error/event/ErrorEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameConfig_1 = require("../gameconfig/GameConfig");
const SoundEvent_1 = require("../resource/sound/event/SoundEvent");
const ServerEvent_1 = require("../server/event/ServerEvent");
const SpinEvent_1 = require("../spin/event/SpinEvent");
const SpinController_1 = require("../spin/SpinController");
const StageEvent_1 = require("../stage/event/StageEvent");
const SystemEvent_1 = require("../system/SystemEvent");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const SlotApiEvent_1 = require("./event/SlotApiEvent");
const APISettingsSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APISettingsSystem");
const JurisdictionEvent_1 = require("../jurisdiction/JurisdictionEvent");
const SlotGame_1 = require("../SlotGame");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const KeypadPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/KeypadPlugin");
const SlotStateHandler_1 = require("@nolimitcity/slot-launcher/bin/plugins/apiplugin/SlotStateHandler");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
class SlotApiEventManager {
    constructor(slotApi) {
        this._slotApi = slotApi;
        this.initSlotApiEvents();
        this.initGameEvents();
    }
    // Api events
    initSlotApiEvents() {
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.INIT, this.onInit);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.CONFIG, this.onConfig);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.RESIZE, this.onResize);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.FAST_SPIN, this.onFastspin);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.READY, this.onReady);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.STATE, this.onState);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.BET, this.onBet);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.CURRENCY, this.onCurrency);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.BALANCE, this.onBalance);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.BET_LEVELS, this.onBetLevels);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.FREE_BETS, this.onFreeBets);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.GAME, this.onGame);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.STOP, this.onStop);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.SKIP, this.onKeypadSkip);
        this._slotApi.events.on(SlotApiEvent_1.SlotApiEvent.MIN_SPIN_TIME, this.onMinSpinTime);
        this._slotApi.settings.on(APISettingsSystem_1.APISetting.SFX, this.onSoundEffectSetting);
        this._slotApi.settings.on(APISettingsSystem_1.APISetting.MUSIC, this.onSoundLoopSetting);
        this._slotApi.settings.on(APISettingsSystem_1.APISetting.LEFT_HAND_MODE, this.onLeftHanded);
        this._slotApi.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_IS_ACTIVE, (isActive) => this.onActionSpins(isActive));
    }
    onActionSpins(isActive) {
        EventHandler_1.EventHandler.enabled = !isActive;
    }
    addPluginEventListener() {
        SlotGame_1.SlotGame.keypad.events.on(KeypadPlugin_1.KeypadPluginEvents.DISPLAY_BET_UPDATE, (betLevel) => this.onCurrentBet(betLevel));
    }
    onInit(data) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ServerEvent_1.ServerEvent.INIT_DATA_RECEIVED, data));
    }
    onConfig(data) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SystemEvent_1.SystemEvent.CONFIG_LOADED, data));
    }
    onResize(size) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.CONTAINER_RESIZED, size));
    }
    onSoundEffectSetting(setting) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SoundEvent_1.SoundEvent.EFFECTS_SETTING, setting));
    }
    onSoundLoopSetting(setting) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SoundEvent_1.SoundEvent.LOOPS_SETTING, setting));
    }
    onLeftHanded(setting) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.LEFT_HANDED_SETTING, setting));
    }
    onFastspin(isFastSpin) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.FASTSPIN, isFastSpin));
    }
    onReady() {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SlotApiEvent_1.SlotApiEventIntroCommand.API_READY));
    }
    onButtonPosition(position) {
        //TODO - What is this? Relevant with new keypad?
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SlotApiEvent_1.SlotApiEvent.BUTTON_POSITION, position));
    }
    onState(state) {
        switch (state) {
            case SlotStateHandler_1.SlotState.GAMBLE_DONE:
                EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SlotApiEvent_1.SlotApiEvent.GAMBLE_DONE));
                break;
        }
        // let gameState:string;
        // switch(newState){
        //     case SlotApiEvent.READY:
        //         gameState = GameState.GAMESTATE_READY;
        //         break;
        //     case SlotApiEvent.STARTING:
        //         gameState = GameState.GAMESTATE_STARTING;
        //         break;
        //     case SlotApiEvent.STOPPABLE:
        //         gameState = GameState.GAMESTATE_STOPPABLE;
        //         break;
        //     case SlotApiEvent.STOPPING:
        //         gameState = GameState.GAMESTATE_STOPPING;
        //         break;
        //     case SlotApiEvent.SKIPPABLE:
        //         gameState = GameState.GAMESTATE_SKIPPABLE;
        //         break;
        //     case SlotApiEvent.SKIPPED:
        //         gameState = GameState.GAMESTATE_SKIPPED;
        //         break;
        //     case SlotApiEvent.DONE:
        //         gameState = GameState.GAMESTATE_DONE;
        //         break;
        //     case SlotApiEvent.FINISHING:
        //         gameState = GameState.GAMESTATE_FINISHING;
        //         break;
        //     default:
        //         debugger;
        //         throw new Error("SlotApiEventManager: slotgame state " + newState + " is not recognized.");
        // }
        // EventHandler.dispatchEvent(new GameEvent(gameState));
    }
    onBet(obj) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.BET, obj));
    }
    onCurrency(currency) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.CURRENCY, currency));
    }
    onBalance(balance) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.BALANCE, balance));
    }
    onBetLevels(levels) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.BET_LEVELS, levels));
    }
    onFreeBets(freeBets) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.FREE_BETS, freeBets));
    }
    onGame(data) {
        if (SlotGame_1.SlotGame.jackpot && SlotGame_1.SlotGame.jackpot.isActive) {
            SlotGame_1.SlotGame.jackpot.addOnSpinCompleteCallback(() => {
                EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ServerEvent_1.ServerEvent.GAME_DATA_RECEIVED, data));
            });
        }
        else {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ServerEvent_1.ServerEvent.GAME_DATA_RECEIVED, data));
        }
    }
    onStop() {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.STOP, true));
    }
    onKeypadSkip() {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.SKIP));
    }
    // eg: "4.00"
    onCurrentBet(betValue) {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.CURRENT_BET, betValue));
    }
    onMinSpinTime(minSpinTime) {
        let spinTime = minSpinTime / 1000;
        if (GameConfig_1.GameConfig.instance.MIN_STOPPING_TIME) {
            spinTime = Math.max(0, (spinTime - GameConfig_1.GameConfig.instance.MIN_STOPPING_TIME));
        }
        SpinController_1.SpinController.MIN_SPIN_TIME = spinTime;
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(JurisdictionEvent_1.JurisdictionEvent.MINIMUM_STOP_TIME, minSpinTime));
    }
    // Game events
    initGameEvents() {
        EventHandler_1.EventHandler.addEventListener(this, BalanceEvent_1.BalanceEvent.ZERO_BET, (event) => this.onZeroBet(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, BalanceEvent_1.BalanceEvent.PICK_AND_CLICK, (event) => this.onPickAndClick(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.STARTED, (event) => this.onSpinStarted());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.STOPPED, (event) => this.onSpinStopped());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.WANT_SKIPPABLE, (event) => this.onSpinWantSkippable());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.DONE, (event) => this.onSpinDone());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.FINISHING, (event) => this.onSpinFinishing());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.FINISH, (event) => this.onSpinFinish());
        EventHandler_1.EventHandler.addEventListener(this, StageEvent_1.StageEvent.WANT_RESIZE, (event) => this.onWantResize());
        EventHandler_1.EventHandler.addEventListener(this, ErrorEvent_1.ErrorEvent.ERROR, (event) => this.onGameError(event));
        EventHandler_1.EventHandler.addEventListener(this, SystemEvent_1.SystemEvent.SHOW_DIALOG, (event) => this.showDialog(event.params[0]));
    }
    onZeroBet(fsLeft) {
        this._slotApi.betHandler.zeroBet();
        if (fsLeft == undefined) {
            fsLeft = -1;
        }
        SlotGame_1.SlotGame.keypad.setZeroBetSpinCounter(fsLeft);
    }
    onPickAndClick(index) {
        this._slotApi.betHandler.pickAndClickBet(index);
    }
    onSpinStarted() {
        this._slotApi.events.trigger(SlotApiEvent_1.SlotApiEvent.STARTED);
    }
    onSpinStopped() {
        // This will also trigger the STOP event handler inside the game.
        this._slotApi.events.trigger(SlotApiEvent_1.SlotApiEvent.STOP);
    }
    onSpinWantSkippable() {
        this._slotApi.events.trigger(SlotApiEvent_1.SlotApiEvent.SKIPPABLE);
    }
    onSpinDone() {
        this._slotApi.events.trigger(SlotApiEvent_1.SlotApiEvent.DONE);
    }
    onSpinFinishing() {
        this._slotApi.events.trigger(SlotApiEvent_1.SlotApiEvent.FINISHING);
    }
    onSpinFinish() {
        this._slotApi.events.trigger(SlotApiEvent_1.SlotApiEvent.FINISH);
    }
    /**
     * @deprecated since, v 1.0.0
     */
    onWantResize() {
        Logger_1.Logger.warn("Requesting resize is bad for performance and should be avoided if possible.");
        NolimitApplication_1.NolimitApplication.pixiApp.resize();
    }
    onGameError(event) {
        this._slotApi.events.trigger(SlotApiEvent_1.SlotApiEvent.ERROR, { code: event.code, message: event.errorMessage });
    }
    showDialog(message) {
        //TODO - implement dialog system.
        //this._slotApi.dialog.open(this._slotApi.translations.render('generic-message', {message}));
    }
}
exports.SlotApiEventManager = SlotApiEventManager;
//# sourceMappingURL=SlotApiEventManager.js.map