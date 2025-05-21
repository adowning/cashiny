"use strict";
/**
 * Created by Pankaj on 2020/01/02.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = exports.FlowState = void 0;
const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
var FlowState;
(function (FlowState) {
    FlowState["IDLE"] = "IDLE";
    FlowState["BET"] = "BET";
    FlowState["BET_COMPLETED"] = "BET_COMPLETED";
    FlowState["RESULT"] = "RESULT";
    FlowState["WIN"] = "WIN";
})(FlowState = exports.FlowState || (exports.FlowState = {}));
class Timer {
    static measureTimeAtStateStart(mode, state) {
        if (mode != PromoPanelConfig_1.Mode.NORMAL) {
            return;
        }
        if (state == FlowState.BET) {
            this._betStartDateTime = Date.now();
        }
        if (state == FlowState.WIN) {
            const minTime = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.minimumSpinTime;
            const duration = Date.now() - this._betStartDateTime;
            if (duration < minTime) {
                this.roundStatsLogger.log(`%c Duration BET_START -> RESULT_END:  ${duration} ms, (jurisdiction requirement: ${minTime})`, `background-color:#AA0000; color:white;`);
            }
            else {
                this.roundStatsLogger.log(`%c Duration BET_START -> RESULT_END:  ${duration} ms, (jurisdiction requirement: ${minTime})`, `background-color:#00AA00; color:white;`);
            }
        }
        if (state == FlowState.BET_COMPLETED) {
            const minTime = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.minimumSpinTime;
            const duration = Date.now() - this._betStartDateTime;
            if (duration < minTime) {
                this.roundStatsLogger.log(`%c Duration BET_START -> BET_COMPLETED:  ${duration} ms, (jurisdiction requirement: ${minTime})`, `background-color:#AA00AA; color:white;`);
            }
            else {
                this.roundStatsLogger.log(`%c Duration BET_START -> BET_COMPLETED:  ${duration} ms, (jurisdiction requirement: ${minTime})`, `background-color:#00AA00; color:white;`);
            }
        }
    }
}
Timer.roundStatsLogger = Logger_1.Logger.createNamedLogger("Stats");
Timer._betStartDateTime = 0;
exports.Timer = Timer;
//# sourceMappingURL=Timer.js.map