"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseParser = void 0;
const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
const Helper_1 = require("./Helper");
const ASEnums_1 = require("../enums/ASEnums");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const Timer_1 = require("./Timer");
class ResponseParser {
    static addASReplayWinData(data, bet, prevResponse) {
        const parsedData = ResponseParser.getParsedData(data, bet, prevResponse);
        const totalWin = parsedData.totalWin;
        const totalSpinWinnings = +parsedData.totalSpinWinnings;
        const winType = parsedData.winType || ASEnums_1.WINTYPE.NORMAL;
        const calculatedTotalWinTimesBet = Helper_1.Helper.getTotalMultipliedWin(totalWin, data.playedBetValue);
        const calculatedTotalWinTimesBetThisSpin = Helper_1.Helper.getTotalMultipliedWin(totalSpinWinnings, data.playedBetValue);
        const asReplayData = {
            totalWin: totalWin,
            totalSpinWinnings: totalSpinWinnings,
            calculatedTotalWinTimesBet: calculatedTotalWinTimesBet,
            calculatedTimesBetThisSpin: calculatedTotalWinTimesBetThisSpin,
            nextMode: data.nextMode,
            mode: data.mode,
            wasFeatureBuy: parsedData.wasFeatureBuy,
            freeSpinTriggeredThisSpin: parsedData.freeSpinTriggeredThisSpin,
            balance: NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.balance.getAmount().toFixed(PromoPanelConfig_1.PromoPanelConfig.DECIMAL_CUTOFF),
            isBigWin: parsedData.isBigWin,
            winType: winType,
            featureName: parsedData.featureName || "",
            isRoundComplete: parsedData.isRoundComplete,
            isBonusEnd: parsedData.isBonusEnd,
            isWinCapHit: parsedData.isWinCapHit,
            isWinBelowStake: false,
            waitForAnimation: parsedData.waitForAnimation,
        };
        asReplayData.isWinBelowStake = this.isWinBelowStake(asReplayData, data);
        data.asReplayWinData = asReplayData;
        //Logger.logDev("Action Spin : ReplayData :", asReplayData);
        return asReplayData;
    }
    static getParsedData(data, bet, prevResponse) {
        var _a;
        if ((_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _a === void 0 ? void 0 : _a.getParsedData) {
            return NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData.getParsedData(data, bet, prevResponse);
        }
        else {
            throw new Error("ActionSpinOptions.getParsedData not found. Can't play action spins without it.");
        }
    }
    static getBetCost(featureNameOrData) {
        let cost = +NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        let featureData;
        if (typeof featureNameOrData === "string") {
            featureData = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.bonusFeatures.getFeatureDataByName(featureNameOrData); //BOOSTED_BET
        }
        else {
            featureData = featureNameOrData;
        }
        if (featureData) {
            cost = (featureData.price * 100 * cost * 10000) / 1000000;
        }
        return cost;
    }
    static getBoostCost(featureNameOrData) {
        let cost = +NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        let featureData;
        if (typeof featureNameOrData === "string") {
            featureData = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.bonusFeatures.getFeatureDataByName(featureNameOrData); //BOOSTED_BET
        }
        else {
            featureData = featureNameOrData;
        }
        if (featureData) {
            cost = (featureData.price * 100 * cost * 10000) / 1000000;
        }
        const minimumPrecision = (cost < PromoPanelConfig_1.PromoPanelConfig.NO_DECIMALS_CUTOFF_POINT || cost % 1 != 0) ? 2 : 0;
        const formatted = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.currency.formatValue(cost, { minimumPrecision: minimumPrecision });
        return formatted;
    }
    static setBoostAndGetCost(featureName, shouldSet = false) {
        let cost = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betLevel.getLevel();
        let boostData = undefined;
        if (featureName) {
            const featureData = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.bonusFeatures.getFeatureDataByName(featureName); //BOOSTED_BET
            if (featureData) {
                boostData = {
                    featureName: featureData.name,
                    price: featureData.price
                };
                cost = ResponseParser.getBoostCost(featureData);
            }
        }
        shouldSet && NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betHandler.setBoost(boostData);
        return cost;
    }
    static isWinBelowStake(asReplayData, data) {
        let win = +asReplayData.totalSpinWinnings;
        if (asReplayData.isRoundComplete && asReplayData.nextMode === PromoPanelConfig_1.Mode.NORMAL) {
            win = +asReplayData.totalWin;
        }
        if (asReplayData.winType === ASEnums_1.WINTYPE.MULTIPLIER) {
            win *= data.playedBetValue;
        }
        return NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.gameClientConfiguration.belowStakeWinRestriction && win <= data.playedBetValue;
    }
    static gameDataPromise() {
        return new Promise((resolve, reject) => {
            NolimitApplication_1.NolimitApplication.apiPlugin.events.once(APIEventSystem_1.APIEvent.GAME, (data) => {
                if (data.isFakeData) {
                    NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.FINISH);
                    reject();
                }
                else {
                    Logger_1.Logger.logDev("Promo Panel GameData", data.mode, data.nextMode);
                    Timer_1.Timer.measureTimeAtStateStart(PromoPanelConfig_1.Mode.NORMAL, Timer_1.FlowState.BET_COMPLETED);
                    resolve(data);
                }
            });
        });
    }
}
exports.ResponseParser = ResponseParser;
//# sourceMappingURL=ResponseParser.js.map