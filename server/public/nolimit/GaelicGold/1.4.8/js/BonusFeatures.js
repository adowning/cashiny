"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameFeatureNames = exports.GameFeatureCategory = exports.BonusFeatureData = void 0;
// ---- INPUT DATA
//OUTPUT DATA
class BonusFeatureData {
    constructor(rawData) {
        this.name = rawData.name;
        this.type = rawData.type;
        this.price = rawData.price;
        this.betLevels = [];
    }
    updateBetLevels(rawData) {
        for (let featureName in rawData) {
            if (featureName == this.name) {
                this.betLevels = rawData[featureName];
            }
        }
    }
    getMaxBet() {
        let max = Number.MIN_VALUE;
        for (let i = 0; i < this.betLevels.length; i++) {
            max = Math.max(max, +this.betLevels[i]);
        }
        return max;
    }
}
exports.BonusFeatureData = BonusFeatureData;
var GameFeatureCategory;
(function (GameFeatureCategory) {
    GameFeatureCategory["BONUS_BUY"] = "BONUS_BUY";
    GameFeatureCategory["GAMBLE"] = "GAMBLE";
    GameFeatureCategory["BOOSTED_BET"] = "BOOSTED_BET";
})(GameFeatureCategory = exports.GameFeatureCategory || (exports.GameFeatureCategory = {}));
var GameFeatureNames;
(function (GameFeatureNames) {
    GameFeatureNames["BONUS_BUY"] = "BONUS_BUY";
    GameFeatureNames["GAMBLE_FIFTY_FIFTY"] = "GAMBLE_FIFTY_FIFTY";
    GameFeatureNames["GAMBLE_INTO_BONUS"] = "GAMBLE_INTO_BONUS";
    GameFeatureNames["BOOSTED_BET_X_ROWS"] = "BOOSTED_BET_X_ROWS";
    GameFeatureNames["BOOSTED_BET_LOCKED_REELS"] = "BOOSTED_BET_LOCKED_REELS";
    GameFeatureNames["NOLIMIT_WINNERS"] = "NOLIMIT_WINNERS";
})(GameFeatureNames = exports.GameFeatureNames || (exports.GameFeatureNames = {}));
//# sourceMappingURL=BonusFeatures.js.map