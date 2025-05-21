"use strict";
/**
 * Created by Ning Jiang on 3/20/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdleAnimationController = void 0;
const EventHandler_1 = require("../../core/event/EventHandler");
const ScreenEvent_1 = require("../../core/screen/event/ScreenEvent");
const ServerEvent_1 = require("../../core/server/event/ServerEvent");
const SpinEvent_1 = require("../../core/spin/event/SpinEvent");
const MathHelper_1 = require("../../core/utils/MathHelper");
const gsap_1 = require("gsap");
class IdleAnimationController {
    constructor(config) {
        this._startTime = 3;
        this._minInterval = 0.1;
        this._maxInterval = 2;
        this._isPlaying = false;
        if (config) {
            if (config.startTime != undefined) {
                this._startTime = config.startTime;
            }
            if (config.minInterval != undefined) {
                this._minInterval = config.minInterval;
            }
            if (config.maxInterval != undefined) {
                this._maxInterval = config.maxInterval;
            }
        }
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.GAME_START, (event) => this.onGameStart());
    }
    onGameStart() {
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.BEFORE_START, (event) => this.onIdleStop());
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.PICK_AND_CLICK_START, (event) => this.onIdleStop());
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.SCREEN_START, (event) => this.onIdleStop());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.IDLE, (event) => this.onIdle());
        this.onIdle();
    }
    onIdle() {
        if (this.hasWin()) {
            return;
        }
        this._isPlaying = true;
        this.play(this._startTime, false);
    }
    play(startTime, playBefore) {
        if (!this._isPlaying) {
            return;
        }
        if (playBefore) {
            this.playIdleAnimation();
        }
        this._idleTimer = gsap_1.TweenLite.to(this, startTime, { onComplete: () => this.play(MathHelper_1.MathHelper.randomNumberInRange(this._minInterval, this._maxInterval), true) });
    }
    onIdleStop() {
        this._isPlaying = false;
        if (this._idleTimer) {
            this._idleTimer.pause();
            this._idleTimer.kill();
            this._idleTimer = null;
        }
        if (this.stopIdleAnimation) {
            this.stopIdleAnimation();
        }
    }
}
exports.IdleAnimationController = IdleAnimationController;
//# sourceMappingURL=IdleAnimationController.js.map