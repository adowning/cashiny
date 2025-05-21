"use strict";
/**
 * Created by Ning Jiang on 7/9/2016.
 * Refactored by Ning Jiang on 12/9/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelStopPresentationManager = void 0;
const AvalancheReelEvent_1 = require("../../game/reel/avalanchereel/AvalancheReelEvent");
const SpinReelEvent_1 = require("../../game/reel/spinreel/SpinReelEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameConfig_1 = require("../gameconfig/GameConfig");
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
const ReelEvent_1 = require("../reel/event/ReelEvent");
const SoundConfig_1 = require("../resource/sound/SoundConfig");
const SpinEvent_1 = require("../spin/event/SpinEvent");
const ArrayHelper_1 = require("../utils/ArrayHelper");
const SlotGame_1 = require("../SlotGame");
class ReelStopPresentationManager {
    constructor() {
        this._numReels = GameConfig_1.GameConfig.instance.REELS_NUM;
        this._presentations = [];
        const factoryMethods = GameModuleConfig_1.GameModuleConfig.instance.REEL_STOP_PRESENTATIONS;
        if (factoryMethods) {
            factoryMethods.forEach((factoryMethod, index) => {
                this._presentations.push(factoryMethod(index));
            });
        }
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.BEFORE_START, (event) => this.onBeforeSpinStart());
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.REEL_STOP_SPIN_ANIMATION_COMPLETE, (event) => this.onReelSpinStopped(event.params[0]));
        if (GameConfig_1.GameConfig.instance.SPIN_MODE === 1 /* SpinMode.AVALANCHE */) {
            EventHandler_1.EventHandler.addEventListener(this, AvalancheReelEvent_1.AvalancheReelEvent.REEL_STOP_SPIN_SYMBOL_ATTENTION_START, (event) => this.onReelSpinStopSymbolAttentionStart(event.params[0]));
        }
        else {
            EventHandler_1.EventHandler.addEventListener(this, SpinReelEvent_1.SpinReelEvent.REEL_STOP_SPIN_BOUNCE_STARTED, (event) => this.onReelBounce(event.params[0]));
        }
        for (let i = 0; i < this._presentations.length; i++) {
            EventHandler_1.EventHandler.addEventListener(this, this._presentations[i].completeEvent, (event) => this.onPresentationComplete(event.params[0]));
        }
    }
    onBeforeSpinStart() {
        // Reset all states.
        this._presentationStates = ArrayHelper_1.ArrayHelper.initArrayWithValues(this._numReels, () => {
            return ArrayHelper_1.ArrayHelper.initArrayWithValues(this._presentations.length, () => false);
        });
        for (let i = 0; i < this._presentations.length; i++) {
            this._presentations[i].reset();
        }
    }
    onReelBounce(data) {
        this._presentations.forEach((presentation) => {
            if (presentation.onReelBounce) {
                presentation.onReelBounce(data);
            }
        });
        this.playReelBouncingSound(data);
    }
    playReelBouncingSound(data) {
        for (let i = 0; i < this._presentations.length; i++) {
            if (this._presentations[i].playReelBouncingSound && this._presentations[i].playReelBouncingSound(data)) {
                return;
            }
        }
        // If not special bounce sound by feature, play the default sound.
        if (SoundConfig_1.SoundConfig.instance.REELS_DEFAULT_BOUNCE != null && SoundConfig_1.SoundConfig.instance.REELS_DEFAULT_BOUNCE[data.reelId] != null) {
            SlotGame_1.SlotGame.sound.playEffect(SoundConfig_1.SoundConfig.instance.REELS_DEFAULT_BOUNCE[data.reelId]);
        }
    }
    onReelSpinStopSymbolAttentionStart(data) {
        this._presentations.forEach((presentation) => {
            if (presentation.onReelStopSymbolAttention) {
                presentation.onReelStopSymbolAttention(data); // Play sound in presentations.
            }
        });
    }
    onReelSpinStopped(data) {
        this._presentations.forEach((presentation) => {
            if (presentation.onReelSpinStopped) {
                presentation.onReelSpinStopped(data);
            }
        });
        this.playReelStopSound(data);
        // handle if there is no presentation in game.
        if (this._presentations.length === 0) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_STOP_PRESENTATIONS_COMPLETE, data.reelId));
        }
    }
    playReelStopSound(data) {
        if (!data.active) {
            return;
        }
        for (let i = 0; i < this._presentations.length; i++) {
            if (this._presentations[i].playReelStopSound && this._presentations[i].playReelStopSound(data)) {
                return;
            }
        }
        if (SoundConfig_1.SoundConfig.instance.REELS_DEFAULT_STOP != null && SoundConfig_1.SoundConfig.instance.REELS_DEFAULT_STOP[data.reelId] != null) {
            SlotGame_1.SlotGame.sound.playEffect(SoundConfig_1.SoundConfig.instance.REELS_DEFAULT_STOP[data.reelId]);
        }
    }
    onPresentationComplete(completeData) {
        const reelStates = this._presentationStates[completeData.reelId];
        reelStates[completeData.presentationIndex] = true;
        for (let i = 0; i < reelStates.length; i++) {
            if (!reelStates[i]) {
                return;
            }
        }
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_STOP_PRESENTATIONS_COMPLETE, completeData.reelId));
    }
}
exports.ReelStopPresentationManager = ReelStopPresentationManager;
//# sourceMappingURL=ReelStopPresentationManager.js.map