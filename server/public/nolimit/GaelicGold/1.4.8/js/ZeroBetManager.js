"use strict";
/**
 * Created by Ning Jiang on 11/24/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroBetManager = void 0;
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
class ZeroBetManager {
    get isCurrentZeroBet() {
        return this._isCurrentZeroBet;
    }
    constructor() {
        this._isCurrentZeroBet = false;
        this._zeroBetControllers = [];
        const factoryMethods = GameModuleConfig_1.GameModuleConfig.instance.ZERO_BETS;
        if (factoryMethods) {
            for (let i = 0; i < factoryMethods.length; i++) {
                this._zeroBetControllers.push(factoryMethods[i]());
            }
        }
    }
    tryPlayZeroBet() {
        return this.isNextZeroBet(true);
    }
    isNextZeroBet(onBet = false) {
        for (let i = 0; i < this._zeroBetControllers.length; i++) {
            if (this._zeroBetControllers[i].isTriggered) {
                if (onBet) {
                    this._isCurrentZeroBet = true;
                    this._zeroBetControllers[i].handleZeroBetCounter();
                }
                return true;
            }
        }
        this._isCurrentZeroBet = false;
        return false;
    }
}
exports.ZeroBetManager = ZeroBetManager;
//# sourceMappingURL=ZeroBetManager.js.map