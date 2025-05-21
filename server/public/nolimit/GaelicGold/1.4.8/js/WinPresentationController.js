"use strict";
/**
 * Created by Ning Jiang on 4/26/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinPresentationController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const BaseController_1 = require("../base/BaseController");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const ServerEvent_1 = require("../server/event/ServerEvent");
const SpinEvent_1 = require("../spin/event/SpinEvent");
const WinPresentationEvent_1 = require("./event/WinPresentationEvent");
class WinPresentationController extends BaseController_1.BaseController {
    constructor(indexes, config) {
        super(config.tweakEnabled, config.name, config.betWinMode);
        this._isPlaying = false;
        this._isDataDirty = false;
        this._indexes = indexes;
        this._skippable = config.skippable === true;
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, WinPresentationEvent_1.WinPresentationEvent.UPDATE_WIN_PRESENTATION_BET_WINS, (event) => this.onUpdateBetWins(event.params[0]));
        if (this.addFeatureEventHandlers) {
            this.addFeatureEventHandlers();
        }
    }
    onGameDataParsed(data) {
        this._gameData = data;
        this._betWinsData = data.betWins;
        if (this.parseFeatureGameData) {
            this.parseFeatureGameData(data);
        }
        this._isDataDirty = true;
    }
    onUpdateBetWins(wins) {
        this._betWinsData = wins.concat();
    }
    reset() {
        if (this._isDataDirty) {
            this._gameData = null;
            this._betWinsData = null;
            this._isDataDirty = false;
            if (this.resetFeature) {
                this.resetFeature();
            }
        }
    }
    play() {
        if (this.hasWin()) {
            Logger_1.Logger.logDev(`[WinPresentation]-${this.moduleName}.startWinPresentation(), skippable = ${this._skippable}`);
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.WIN_PRESENTATION_STARTED, this._indexes, this.moduleName));
            if (this._skippable) {
                EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(SpinEvent_1.SpinEvent.WANT_SKIPPABLE));
            }
            this._isPlaying = true;
            this.startWinPresentation();
        }
        else {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.WIN_PRESENTATION_COMPLETED, this._indexes, false));
        }
    }
    abort() {
        if (this._isPlaying && this._skippable) {
            Logger_1.Logger.logDev(`[WinPresentation]-${this.moduleName}.abort()`);
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.WIN_PRESENTATION_ABORTED, this.moduleName));
            this.abortWinPresentation();
        }
    }
    /* This is for overriding, could also be
     * if(this._timeline && this._timeline.isActive()) {
     *     this._timeline.progress(1);
     * }
     * So you don't need to handle anything special.
     */
    abortWinPresentation() {
        this.finish(true);
    }
    finish(isAborted = false) {
        Logger_1.Logger.logDev(`[WinPresentation]-${this.moduleName}.finish()`);
        this._isPlaying = false;
        this.stopWinPresentation(isAborted);
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(WinPresentationEvent_1.WinPresentationEvent.WIN_PRESENTATION_COMPLETED, this._indexes, true));
    }
}
exports.WinPresentationController = WinPresentationController;
//# sourceMappingURL=WinPresentationController.js.map