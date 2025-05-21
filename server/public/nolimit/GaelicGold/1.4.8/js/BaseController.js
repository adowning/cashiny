"use strict";
/**
 * Created by Ning Jiang on 12/5/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const TweakEvent_1 = require("../../dev/tweaker/event/TweakEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameConfig_1 = require("../gameconfig/GameConfig");
class BaseController {
    get moduleName() {
        return this._name;
    }
    constructor(tweakEnabled = false, tweakModuleHeadline, betWinMode) {
        this.checkBetWinMode(betWinMode);
        this._tweakEnabled = tweakEnabled;
        this._name = tweakModuleHeadline;
        if (this._tweakEnabled) {
            this.initTweakModule();
        }
    }
    checkBetWinMode(betWinMode) {
        if (!betWinMode) {
            betWinMode = 0 /* BetWinMode.ALL */;
        }
        if (betWinMode === 0 /* BetWinMode.ALL */) {
            return;
        }
        if (betWinMode != GameConfig_1.GameConfig.instance.BET_WIN_MODE) {
            debugger;
            throw new Error(`Moudle ${this.moduleName} doesn't support the current Bet_WIN_MODE in the GameConfig!`);
        }
    }
    initTweakModule() {
        if (this._name == undefined) {
            debugger;
            throw new Error("Error: BaseController.initTweakModule(): name is missing when tweak is enabled!");
        }
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(TweakEvent_1.TweakEvent.ADD_MODULE, this._name));
    }
    addTweakModuleSlider(config) {
        if (this._name == undefined) {
            debugger;
            throw new Error("Error: BaseController.addTweakModuleSlider(): name is missing when tweak is enabled!");
        }
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(TweakEvent_1.TweakEvent.ADD_SLIDER_TO_MODULE, this._name, config));
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map