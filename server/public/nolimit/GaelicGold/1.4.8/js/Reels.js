"use strict";
/**
 * Created by Jerker Nord on 2016-04-13.
 * Refactored by Ning Jiang on 2016-12-6.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reels = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const AvalancheReelController_1 = require("../../../game/reel/avalanchereel/AvalancheReelController");
const AvalancheReelEvent_1 = require("../../../game/reel/avalanchereel/AvalancheReelEvent");
const SpinReelController_1 = require("../../../game/reel/spinreel/SpinReelController");
const SpinReelEvent_1 = require("../../../game/reel/spinreel/SpinReelEvent");
const BaseController_1 = require("../../base/BaseController");
const EventHandler_1 = require("../../event/EventHandler");
const GameEvent_1 = require("../../event/GameEvent");
const GameConfig_1 = require("../../gameconfig/GameConfig");
const GameModuleConfig_1 = require("../../gamemoduleconfig/GameModuleConfig");
const SoundConfig_1 = require("../../resource/sound/SoundConfig");
const SlotGame_1 = require("../../SlotGame");
const SpinEvent_1 = require("../../spin/event/SpinEvent");
const ArrayHelper_1 = require("../../utils/ArrayHelper");
const ReelEvent_1 = require("../event/ReelEvent");
const ReelAnimationState_1 = require("../reel/ReelAnimationState");
const ReelAreaView_1 = require("./ReelAreaView");
class Reels extends BaseController_1.BaseController {
    constructor() {
        super(true, "Reels");
        if (Reels._instance) {
            debugger;
            throw new Error("Error: Reels.constructor() - Instantiation failed: Singleton.");
        }
        this._reelsNum = GameConfig_1.GameConfig.instance.REELS_NUM;
        this._reelsSpinStates = ArrayHelper_1.ArrayHelper.initArrayWithValues(this._reelsNum, () => false);
        this._reelsActualSpinningStates = ArrayHelper_1.ArrayHelper.initArrayWithValues(this._reelsNum, () => false);
        this._quickStop = false;
        this._fastSpin = false;
        this._isSpinSoundPlaying = false;
        const spinningSoundStopDelay = SoundConfig_1.SoundConfig.instance.REELS_SPINNING_STOP_DELAY != null ? SoundConfig_1.SoundConfig.instance.REELS_SPINNING_STOP_DELAY : 0;
        this.addTweakModuleSlider({
            text: "Spinning Sound Stop Delay",
            minValue: 0,
            maxValue: 1,
            startValue: spinningSoundStopDelay,
            onValueChangeCallback: (text, newValue) => this.onSpinningSoundStopDelayChanged(newValue)
        });
        this._spinningSoundStopDelay = spinningSoundStopDelay;
        Reels._reelAreaView = GameModuleConfig_1.GameModuleConfig.instance.REEL_AREA_VIEW ? GameModuleConfig_1.GameModuleConfig.instance.REEL_AREA_VIEW() : new ReelAreaView_1.ReelAreaView();
        this.addEventListeners();
    }
    onSpinningSoundStopDelayChanged(newValue) {
        this._spinningSoundStopDelay = newValue;
    }
    static init() {
        this._instance = GameModuleConfig_1.GameModuleConfig.instance.REELS ? GameModuleConfig_1.GameModuleConfig.instance.REELS() : new Reels();
        for (let i = 0; i < GameConfig_1.GameConfig.instance.REELS_NUM; i++) {
            const reel = GameModuleConfig_1.GameModuleConfig.instance.REEL_CONTROLLER ? GameModuleConfig_1.GameModuleConfig.instance.REEL_CONTROLLER(i) : this.createDefaultReelController(i);
            Reels._reels[reel.reelId] = reel;
            Reels._reelAreaView.addReelView(reel);
        }
    }
    static createDefaultReelController(reelId) {
        switch (GameConfig_1.GameConfig.instance.SPIN_MODE) {
            case 0 /* SpinMode.SPIN */:
                return new SpinReelController_1.SpinReelController(reelId);
            case 1 /* SpinMode.AVALANCHE */:
                return new AvalancheReelController_1.AvalancheReelController(reelId);
            default:
                throw new Error(`Reels.createDefaultReelController() Invalid spin type in config`);
        }
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.BEFORE_START, (event) => this.onBeforeSpinStart());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.START, (event) => this.onSpinStart(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.REEL_SPIN_STARTED, (event) => this.onReelSpinStarted(event.params[0]));
        EventHandler_1.EventHandler.addLastEventListener(this, ReelEvent_1.ReelEvent.ALL_REELS_STOP_SPIN, (event) => this.onStopSpin(event.params[0]));
        EventHandler_1.EventHandler.addLastEventListener(this, ReelEvent_1.ReelEvent.REEL_STOP_SPIN_ANIMATION_COMPLETE, (event) => this.onReelSpinAnimationStopped(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.REEL_STOP_SPIN_COMPLETE, (event) => this.onReelSpinStopped(event.params[0]));
        if (GameConfig_1.GameConfig.instance.SPIN_MODE === 0 /* SpinMode.SPIN */) {
            EventHandler_1.EventHandler.addLastEventListener(this, SpinReelEvent_1.SpinReelEvent.REEL_STOP_SPIN_BOUNCE_STARTED, (event) => this.onReelBounceStarted(event.params[0]));
        }
    }
    static addReelAvalancheToTimeline(reelId, timeline, delay = 0, addDelay = false, positions) {
        if (GameConfig_1.GameConfig.instance.SPIN_MODE != 1 /* SpinMode.AVALANCHE */) {
            debugger;
            Logger_1.Logger.logDev("Reels.addReelAvalancheToTimeline() only support avalanche game!");
            return 0;
        }
        return this._reels[reelId].addAvalancheToTimeline(timeline, delay, addDelay, positions);
    }
    static allReelsAvalanche() {
        if (GameConfig_1.GameConfig.instance.SPIN_MODE != 1 /* SpinMode.AVALANCHE */) {
            debugger;
            Logger_1.Logger.logDev("Reels.addReelAvalancheToTimeline() only support avalanche game!");
            return new gsap_1.TimelineLite();
        }
        const timeline = new gsap_1.TimelineLite();
        timeline.add(() => EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(AvalancheReelEvent_1.AvalancheReelEvent.ALL_REELS_AVALANCHE_STARTED)));
        let reelDelay = 0;
        Reels._reels.forEach((reel, reelId) => {
            reelDelay = this.addReelAvalancheToTimeline(reelId, timeline, reelDelay, reelId > 0);
        });
        timeline.add(() => EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(AvalancheReelEvent_1.AvalancheReelEvent.ALL_REELS_AVALANCHE_COMPLETE)));
        return timeline;
    }
    onBeforeSpinStart() {
        this._quickStop = false;
    }
    onSpinStart(config) {
        this._fastSpin = config.isFastSpin;
        this._activeReels = config.activeReels;
        let delay = 0;
        for (let i = 0; i < this._reelsNum; i++) {
            delay = Reels._reels[i].startSpin({
                active: this._activeReels[i],
                fastSpin: this._fastSpin
            }, delay);
        }
        this.startSpinSounds();
    }
    startSpinSounds() {
        /*
        //Todo - What is the deal with these? Why is this an array? We need to rename these so they make sens.
        if(SoundConfig.instance.REELS_SPIN_START != null) {
            EventHandler.dispatchEvent(new GameEvent(SoundEvent.PLAY_SOUND_EFFECT, SoundConfig.instance.REELS_SPIN_START));
            this._isSpinSoundPlaying = true;
        }
        */
        if (SoundConfig_1.SoundConfig.instance.REELS_SPINNING_START_ON_SPIN_START != null) {
            SlotGame_1.SlotGame.sound.playEffect(SoundConfig_1.SoundConfig.instance.REELS_SPINNING_START_ON_SPIN_START);
            this._isSpinSoundPlaying = true;
        }
    }
    onReelSpinStarted(reelId) {
        this._reelsSpinStates[reelId] = true;
        this._reelsActualSpinningStates[reelId] = true;
        if (this._reelsSpinStates.indexOf(false) === -1) {
            if (SoundConfig_1.SoundConfig.instance.REELS_SPINNING != null) {
                SlotGame_1.SlotGame.sound.playEffect(SoundConfig_1.SoundConfig.instance.REELS_SPINNING);
                this._isSpinSoundPlaying = true;
            }
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.ALL_REELS_SPIN_STARTED));
        }
    }
    // Added fastSpin because sometime the fastSpin can be canceled by features.
    onStopSpin(stopData) {
        this._quickStop = stopData.quickStop;
        this._fastSpin = stopData.fastSpin;
        const spinStopOffset = this.getSpinStopOffset();
        let stopDelay = 0;
        for (let i = 0; i < this._reelsNum; i++) {
            const reel = Reels._reels[i];
            if (reel.currentState === ReelAnimationState_1.ReelAnimationState.IDLE) {
                continue;
            }
            const stopSpinData = {
                quickStop: this._quickStop,
                fastSpin: this._fastSpin,
                active: this._activeReels[i],
                spinStopOffset: spinStopOffset
            };
            stopDelay = reel.stopSpin(stopSpinData, stopDelay);
        }
    }
    getSpinStopOffset() {
        let spinStopOffset = 0;
        if (GameConfig_1.GameConfig.instance.SPIN_MODE === 0 /* SpinMode.SPIN */) {
            Reels._reels.forEach((spinReel, reelId) => {
                spinStopOffset = Math.max(spinStopOffset, spinReel.getSpinStopOffset());
            });
        }
        return spinStopOffset;
    }
    onReelBounceStarted(stopData) {
        this._reelsActualSpinningStates[stopData.reelId] = false;
        this.stopSpinSoundOnLastReel();
    }
    stopSpinSoundOnLastReel() {
        if (!this._isSpinSoundPlaying) {
            return;
        }
        if (!this._reelsActualSpinningStates.includes(true)) {
            this.stopSpinSounds();
        }
    }
    stopSpinSounds() {
        if (SoundConfig_1.SoundConfig.instance.REELS_SPINNING != null) {
            SlotGame_1.SlotGame.sound.stopEffect(SoundConfig_1.SoundConfig.instance.REELS_SPINNING, this._spinningSoundStopDelay);
        }
        if (SoundConfig_1.SoundConfig.instance.REELS_SPINNING_START_ON_SPIN_START != null) {
            SlotGame_1.SlotGame.sound.stopEffect(SoundConfig_1.SoundConfig.instance.REELS_SPINNING_START_ON_SPIN_START, this._spinningSoundStopDelay);
        }
        this._isSpinSoundPlaying = false;
    }
    onReelSpinAnimationStopped(stopData) {
        this._reelsActualSpinningStates[stopData.reelId] = false;
        this.stopSpinSoundOnLastReel();
        if (!this._reelsActualSpinningStates.includes(true)) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.ALL_REELS_SPIN_ANIMATION_STOPPED));
        }
    }
    onReelSpinStopped(reelId) {
        this._reelsSpinStates[reelId] = false;
        if (this._reelsSpinStates.indexOf(true) == -1) {
            Logger_1.Logger.logDev(`Reels.onReelSpinStopped():All reels stopped!`);
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.ALL_REELS_SPIN_STOPPED));
        }
    }
    static getReel(reelId) {
        return Reels._reels[reelId];
    }
    static getSymbol(reelId, symbolId, onlyVisibleStackedSymbol = true) {
        return Reels._reels[reelId].findSymbol(symbolId, onlyVisibleStackedSymbol);
    }
    static allSymbols(reelId) {
        return Reels._reels[reelId].allSymbols;
    }
    // if symbol doesn't exist, return false.
    static moveSymbolToTop(reelId, symbolId) {
        return Reels._reels[reelId].moveSymbolToTop(symbolId);
    }
    static addChildOnReel(reelId, child) {
        return Reels._reels[reelId].addChildOnView(child);
    }
    static removedChildOnReel(reelId, child) {
        return Reels._reels[reelId].removedChildOnView(child);
    }
}
Reels._reels = [];
exports.Reels = Reels;
//# sourceMappingURL=Reels.js.map