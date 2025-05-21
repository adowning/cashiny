"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASStopSettings = void 0;
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
class ASStopSettings {
    constructor() {
        ASStopSettings.reset();
    }
    static get remainingRounds() {
        return this._remainingRounds;
    }
    static set remainingRounds(value) {
        this._remainingRounds = value;
    }
    static get minBalanceLimit() {
        return this._minBalanceLimit;
    }
    static set minBalanceLimit(value) {
        this._minBalanceLimit = value;
        this._minBalanceLimitAmount = this.minBalanceLimit * NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.balance.getAmount();
    }
    static get minBalanceLimitAmount() {
        return this._minBalanceLimitAmount;
    }
    static get maxBalanceLimit() {
        return this._maxBalanceLimit;
    }
    static set maxBalanceLimit(value) {
        this._maxBalanceLimit = value;
        this._maxBalanceLimitAmount = this.maxBalanceLimit * NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.balance.getAmount();
    }
    static get maxBalanceLimitAmount() {
        return this._maxBalanceLimitAmount;
    }
    static get xBetLimit() {
        return this._xBetLimit;
    }
    static set xBetLimit(value) {
        this._xBetLimit = value;
    }
    static get xBetLimitAmount() {
        return this._xBetLimit * +NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
    }
    static get shouldReset() {
        return this._shouldReset;
    }
    static set shouldReset(value) {
        this._shouldReset = value;
    }
    static get appliedBet() {
        const boostBetData = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.betBoost;
        return boostBetData ? boostBetData.calculatedPrice : +NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
    }
    static reset() {
        ASStopSettings.minBalanceLimit = 0;
        ASStopSettings.maxBalanceLimit = 0;
        ASStopSettings.xBetLimit = 0;
        ASStopSettings.remainingRounds = 0;
        ASStopSettings.shouldReset = false;
    }
    static update(forceUpdate = false) {
        if (ASStopSettings.shouldReset || forceUpdate) {
            ASStopSettings.minBalanceLimit = ASStopSettings._minBalanceLimit;
            ASStopSettings.maxBalanceLimit = ASStopSettings._maxBalanceLimit;
        }
    }
}
exports.ASStopSettings = ASStopSettings;
//# sourceMappingURL=ASStopSettings.js.map