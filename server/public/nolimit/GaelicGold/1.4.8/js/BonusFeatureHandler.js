"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BonusFeatureHandler = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const BonusFeatures_1 = require("./BonusFeatures");
const Logger_1 = require("../../utils/Logger");
class BonusFeatureHandler {
    get availableNames() {
        return this._availableNames;
    }
    get availableTypes() {
        return this._availableTypes;
    }
    get notAllowedFeatures() {
        return this._nowAllowedFeatures;
    }
    constructor(api) {
        this.featureBetLevelsChangeCallbacks = [];
        this._allowedGameFeatures = [];
        /**
         * Feature types categorised
         *
         * This is a map of all possible feature types a bonus feature can have.
         *
         *
         */
        this.allTypesByCategory = {
            [BonusFeatures_1.GameFeatureCategory.BONUS_BUY]: ["FREESPIN", "FEATURE_BUY"],
            [BonusFeatures_1.GameFeatureCategory.BOOSTED_BET]: ["BOOSTED_BET_X_ROWS", "BOOSTED_BET_LOCKED_REELS"],
        };
        this._bonusFeatureData = [];
        this._nowAllowedFeatures = [];
        this._hasInit = false;
        this.hasInitCallbacks = [];
        this.onInit = (data) => {
            if (data.featureBuyTimesBetValue) {
                for (let feature of data.featureBuyTimesBetValue) {
                    this._bonusFeatureData.push(new BonusFeatures_1.BonusFeatureData(feature));
                }
                this.updateFeatureBetLevels();
            }
            this._hasInit = true;
            for (let callback of this.hasInitCallbacks) {
                callback();
            }
            this.hasInitCallbacks = [];
            this.checkAllowedFeatures();
            for (let feature of this._bonusFeatureData) {
                if (feature.betLevels.length) {
                    this._availableTypes.add(feature.type);
                    this._availableNames.add(feature.name);
                }
            }
            this._api.events.on(APIEventSystem_1.APIEvent.FEATURE_BET_LEVELS, this.onFeatureBetLevels);
        };
        this.onFeatureBetLevels = (data) => {
            //Todo - this change business should be temporary. This data should only be sent from server once, and it should contain all possible values from the start.
            let change = BonusFeatureHandler.isFeatureBetLevelsChanged(this._inputFeatureBetLevels, data);
            this._inputFeatureBetLevels = data;
            if (change) {
                this.updateFeatureBetLevels();
                for (let callback of this.featureBetLevelsChangeCallbacks) {
                    callback(this._inputFeatureBetLevels);
                }
            }
        };
        this._api = api;
        this._availableTypes = new Set();
        this._availableNames = new Set();
        this._api.events.once(APIEventSystem_1.APIEvent.ALLOWED_GAME_FEATURES, (data) => {
            this._allowedGameFeatures = Array.isArray(data) ? data : data.allowedGameFeatures;
            this.checkAllowedFeatures();
        });
        this._api.events.once(APIEventSystem_1.APIEvent.FEATURE_BET_LEVELS, (data) => {
            this._inputFeatureBetLevels = data;
        });
        this._api.events.on(APIEventSystem_1.APIEvent.INIT, this.onInit);
    }
    checkAllowedFeatures() {
        for (let i = this._bonusFeatureData.length - 1; i >= 0; i--) {
            const feature = this._bonusFeatureData[i];
            if (this._allowedGameFeatures.indexOf(feature.name) < 0) {
                const removed = this._bonusFeatureData.splice(i, 1)[0];
                this._nowAllowedFeatures.push(removed);
            }
        }
    }
    updateFeatureBetLevels() {
        for (let feature of this._bonusFeatureData) {
            feature.updateBetLevels(this._inputFeatureBetLevels);
        }
        Logger_1.Logger.logDev("[BonusFeatureHandler] updateFeatureBetLevels :", this._bonusFeatureData);
    }
    addOnFeatureBetLevelsChangeCallback(callback) {
        this.featureBetLevelsChangeCallbacks.push(callback);
    }
    /**
     * To check feature bet level changed or not
     * @param oldFeatureBet : static variable set previously
     * @param newFeatureBet : new feature bet from featureBetLevels events
     */
    static isFeatureBetLevelsChanged(oldFeatureBet = {}, newFeatureBet = {}) {
        const keyArr = Object.keys(newFeatureBet);
        if (Object.keys(oldFeatureBet).length == keyArr.length) {
            for (let i = 0; i < keyArr.length; i++) {
                if (BonusFeatureHandler.getMaxFromArray(newFeatureBet[keyArr[i]]) != BonusFeatureHandler.getMaxFromArray(oldFeatureBet[keyArr[i]])) {
                    return true;
                }
            }
            return false;
        }
        else {
            return true;
        }
    }
    static getMaxFromArray(arr) {
        let max = Number.MIN_VALUE;
        for (let i = 0; i < arr.length; i++) {
            max = Math.max(max, +arr[i]);
        }
        return max;
    }
    getFeatureDataByTypes(types) {
        let result = [];
        for (let type of types) {
            result = result.concat(this.getFeatureDataByType(type));
        }
        return result;
    }
    getFeatureDataByType(type) {
        let result = [];
        for (let feature of this._bonusFeatureData) {
            if (feature.type === type) {
                result.push(feature);
            }
        }
        return result;
    }
    getFeatureDataByNames(names) {
        let result = [];
        for (let name of names) {
            result = result.concat(this.getFeatureDataByName(name));
        }
        return result;
    }
    getFeatureDataByName(name) {
        for (let feature of this._bonusFeatureData) {
            if (feature.name === name) {
                return feature;
            }
        }
        return undefined;
    }
    hasAnyType(types) {
        return this.findAnyInSet(this.availableTypes, types);
    }
    hasAnyName(names) {
        return this.findAnyInSet(this.availableNames, names);
    }
    findAnyInSet(set, list) {
        let result = false;
        for (let item of list) {
            result = set.has(item);
            if (result) {
                return result;
            }
        }
        return result;
    }
    hasInit() {
        if (this._hasInit) {
            return Promise.resolve(true);
        }
        return new Promise((resolve, reject) => {
            this.hasInitCallbacks.push(() => {
                resolve(true);
            });
        });
    }
}
exports.BonusFeatureHandler = BonusFeatureHandler;
//# sourceMappingURL=BonusFeatureHandler.js.map