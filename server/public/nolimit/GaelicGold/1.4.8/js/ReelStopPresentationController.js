"use strict";
/**
 * Created by Ning Jiang on 12/9/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelStopPresentationController = void 0;
const BaseController_1 = require("../base/BaseController");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameConfig_1 = require("../gameconfig/GameConfig");
const ServerEvent_1 = require("../server/event/ServerEvent");
class ReelStopPresentationController extends BaseController_1.BaseController {
    get completeEvent() {
        return `reelStopPresentationEvent_${this.moduleName}Completed`;
    }
    constructor(index, name, tweakEnabled, betWinMode) {
        super(tweakEnabled, name, betWinMode);
        if (!this.onReelBounce && !this.onReelSpinStopped) {
            debugger;
            throw new Error(`ReelStopPresentation${name}.constructor():must implement at least one of onReelBounce and onReelSpinStopped to run dispatchCompleteEvent()!`);
        }
        if (GameConfig_1.GameConfig.instance.SPIN_MODE === 1 /* SpinMode.AVALANCHE */ && !this.onReelSpinStopped) {
            debugger;
            throw new Error(`ReelStopPresentation${name}.constructor():must implement onReelSpinStopped to dispatchCompleteEvent() for avalanche game!`);
        }
        this._index = index;
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        if (this.addFeatureEventHandlers) {
            this.addFeatureEventHandlers();
        }
    }
    onGameDataParsed(data) {
        this._gameData = data;
        if (this.parseFeatureGameData) {
            this.parseFeatureGameData(data);
        }
    }
    dispatchCompleteEvent(reelId) {
        // Logger.logDev(`${this.moduleName}ReelStopPresentation complete on reel${reelId}`);
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(this.completeEvent, {
            reelId: reelId,
            presentationIndex: this._index
        }));
    }
    reset() {
        this._gameData = null;
        if (this.resetFeature) {
            this.resetFeature();
        }
    }
}
exports.ReelStopPresentationController = ReelStopPresentationController;
//# sourceMappingURL=ReelStopPresentationController.js.map