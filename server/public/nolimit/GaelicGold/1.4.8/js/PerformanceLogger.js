"use strict";
/**
 * Created by Ning Jiang on 11/21/2018.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceLogger = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const BalanceEvent_1 = require("../../core/balance/event/BalanceEvent");
const EventHandler_1 = require("../../core/event/EventHandler");
const ReelEvent_1 = require("../../core/reel/event/ReelEvent");
const ServerEvent_1 = require("../../core/server/event/ServerEvent");
const GameSetting_1 = require("../../core/setting/GameSetting");
const SpinEvent_1 = require("../../core/spin/event/SpinEvent");
const MathHelper_1 = require("../../core/utils/MathHelper");
const PerformanceMarkName_1 = require("./PerformanceMarkName");
class PerformanceLogger {
    constructor() {
        if (PerformanceLogger._instance) {
            debugger;
            throw new Error("Error: PerformanceLogger.constructor() - Instantiation failed: Singleton.");
        }
        PerformanceLogger._instance = this;
        if (GameSetting_1.GameSetting.isDevMode) {
            this.addEventListeners();
        }
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, BalanceEvent_1.BalanceEvent.BET, (event) => PerformanceLogger.addMark(PerformanceMarkName_1.PerformanceMarkName.SPIN_START));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.ALL_REELS_STOP_SPIN, (event) => this.onSpinStopping());
        EventHandler_1.EventHandler.addEventListener(this, SpinEvent_1.SpinEvent.STOPPED, (event) => this.onSpinStopped());
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_RECEIVED, (event) => this.onGameDataReceived());
    }
    static addMark(name, displayColor = 'blue') {
        if (!PerformanceLogger._instance) {
            return;
        }
        const time = Date.now();
        Logger_1.Logger.logDev("%c Performance Mark ", `background-color:${displayColor}; color:white; font-size: 12px; padding: 4px;`, name);
        for (let mark of this._marks) {
            if (mark.name === name) {
                mark.time = time;
                return;
            }
        }
        this._marks.push({ name: name, time: time });
    }
    static getMarkTime(name) {
        for (let mark of this._marks) {
            if (mark.name === name) {
                return mark.time;
            }
        }
        Logger_1.Logger.logDev(`Error: PerformanceLogger.getMarkTime() Cannot find mark with name ${name}!`);
        return -1;
    }
    static measureMark(measureName, startMark, endMark) {
        if (!PerformanceLogger._instance) {
            return;
        }
        const startTime = this.getMarkTime(startMark);
        const endTime = this.getMarkTime(endMark);
        Logger_1.Logger.logDev("%c Performance Measure ", `background-color:red; color:white; font-size: 12px; padding: 4px;`, `Measure ${measureName} from Mark ${startMark} to Mark ${endMark} is ${MathHelper_1.MathHelper.roundToDecimals((endTime - startTime) / 1000, 2)} seconds.`);
    }
    static timeStart(name) {
        console.time(name);
        console.log(`%c Time Start:${name} `, `background-color:grey; color:white; font-size: 12px; padding: 4px;`);
    }
    static timeEnd(name) {
        console.timeEnd(name);
    }
    onSpinStopping() {
        PerformanceLogger.addMark(PerformanceMarkName_1.PerformanceMarkName.SPIN_STOPPING);
        PerformanceLogger.measureMark("SPIN TIME", PerformanceMarkName_1.PerformanceMarkName.SPIN_START, PerformanceMarkName_1.PerformanceMarkName.SPIN_STOPPING);
    }
    onSpinStopped() {
        PerformanceLogger.addMark(PerformanceMarkName_1.PerformanceMarkName.SPIN_COMPLETED);
        PerformanceLogger.measureMark("TOTAL SPIN TIME", PerformanceMarkName_1.PerformanceMarkName.SPIN_START, PerformanceMarkName_1.PerformanceMarkName.SPIN_COMPLETED);
    }
    onGameDataReceived() {
        PerformanceLogger.addMark(PerformanceMarkName_1.PerformanceMarkName.GAME_DATA_RECEIVED);
        PerformanceLogger.measureMark("SERVER RESPONSE TIME", PerformanceMarkName_1.PerformanceMarkName.SPIN_START, PerformanceMarkName_1.PerformanceMarkName.GAME_DATA_RECEIVED);
    }
}
PerformanceLogger._marks = [];
exports.PerformanceLogger = PerformanceLogger;
//# sourceMappingURL=PerformanceLogger.js.map