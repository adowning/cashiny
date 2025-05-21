"use strict";
/**
 * Created by Ning Jiang on 8/9/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeforeSpinStopPresentationManager = void 0;
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
const ReelEvent_1 = require("../reel/event/ReelEvent");
const ServerEvent_1 = require("../server/event/ServerEvent");
const SpinEvent_1 = require("../spin/event/SpinEvent");
class BeforeSpinStopPresentationManager {
    constructor() {
        this._presentations = [];
        const factoryMethods = GameModuleConfig_1.GameModuleConfig.instance.BEFORE_SPIN_STOP_PRESENTATIONS;
        if (factoryMethods) {
            factoryMethods.forEach((factoryMethod, index) => {
                this._presentations.push(factoryMethod(index));
            });
        }
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.BEFORE_START, (event) => this.onBeforeSpinStart());
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.ALL_REELS_STOP_SPIN, (event) => this.onStartStopSpin(event.params[0]));
    }
    onBeforeSpinStart() {
        this._presentations.forEach((presentation) => {
            presentation.reset();
        });
    }
    onGameDataParsed(data) {
        // currently we assume all the presentations start from the beginning together and no queuing. Can add queuing handling when we need it.
        let maxDelay = 0;
        this._presentations.forEach((presentation, index) => {
            maxDelay = Math.max(maxDelay, presentation.tryStartPresentation(data));
        });
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.ADD_STOP_DELAY, maxDelay));
    }
    onStartStopSpin(stopData) {
        this._presentations.forEach((presentation) => {
            presentation.abort(stopData);
        });
    }
}
exports.BeforeSpinStopPresentationManager = BeforeSpinStopPresentationManager;
//# sourceMappingURL=BeforeSpinStopPresentationManager.js.map