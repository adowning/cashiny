"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLevelHandler = exports.BetLevelModeData = exports.isBetLevelEventData = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const Logger_1 = require("../../utils/Logger");
function isBetLevelEventData(value) {
    return value.bet !== undefined && value.availableBetLevels != undefined;
}
exports.isBetLevelEventData = isBetLevelEventData;
class BetLevelModeData {
    get bet() {
        return this._bet;
    }
    get betLevels() {
        return this._betLevels;
    }
    constructor(modeName, data) {
        this.modeName = modeName;
        this._bet = data.bet;
        this.updateAvailability(data);
    }
    addBuyTimesBetValue(data) {
        this._featureTimesBetValue = data;
    }
    addFeatureBetLevels(data) {
        this._featureBetLevels = data;
    }
    updateAvailability(data) {
        if (data.betLevels) {
            this._betLevels = data.betLevels;
        }
        else if (data.availableBetLevels && data.unavailableBetLevels) {
            this._betLevels = data.availableBetLevels.concat(data.unavailableBetLevels);
        }
        else {
            this._betLevels = [];
        }
    }
    isFirst() {
        return this._betLevels.indexOf(this.bet) === 0 || this._betLevels.indexOf(this.bet) === -1;
    }
    isLast() {
        return this._betLevels.indexOf(this.bet) === this._betLevels.length - 1;
    }
    increase() {
        if (this.isLast()) {
            return false;
        }
        const index = this._betLevels.indexOf(this.bet) + 1;
        return this.setLevel(this._betLevels[index]);
    }
    decrease() {
        if (this.isFirst()) {
            return false;
        }
        const index = this._betLevels.indexOf(this.bet) - 1;
        return this.setLevel(this._betLevels[index]);
    }
    getLevel() {
        return this._bet;
    }
    setLevel(level) {
        if (this._betLevels.indexOf(level) !== -1 && this._bet != level) {
            this._bet = level;
            return true;
        }
        else {
            Logger_1.Logger.warn('level', level, 'not found in', this._betLevels);
            return false;
        }
    }
    isValidBetForFeature(featureName) {
        var _a;
        if (((_a = this._featureBetLevels) === null || _a === void 0 ? void 0 : _a[featureName]) != undefined) {
            const index = this._featureBetLevels[featureName].indexOf(this._bet);
            return index > -1;
        }
        return false;
    }
    getMaxBetLevelForFeature(featureName) {
        var _a;
        if (((_a = this._featureBetLevels) === null || _a === void 0 ? void 0 : _a[featureName]) != undefined) {
            if (this._featureBetLevels[featureName].length > 0) {
                return this._featureBetLevels[featureName][this._featureBetLevels[featureName].length - 1];
            }
        }
        return "0";
    }
    getPriceForFeature(featureName) {
        for (let featureData of this._featureTimesBetValue) {
            if (featureData.name == featureName) {
                return featureData.price;
            }
        }
        throw new Error(`Could not find data for feature: ${featureName}`);
    }
    addMetaData(metaData) {
        this.metaData = metaData;
    }
}
exports.BetLevelModeData = BetLevelModeData;
class BetLevelHandler {
    constructor(api, gamePlugin) {
        var _a;
        this.betLevelModes = new Map();
        this.gameModeIndex = 0;
        this.allowedGameModes = [];
        this.modeMetaData = new Map();
        this.gamePlugin = gamePlugin;
        this.api = api;
        this.api.events.on(APIEventSystem_1.APIEvent.BET_LEVELS, (data) => this.onBetLevels(data));
        this.api.events.on(APIEventSystem_1.APIEvent.FEATURE_BET_LEVELS, (data) => this.onFeatureBetLevels(data));
        this.api.events.on(APIEventSystem_1.APIEvent.INIT, (data) => this.onInit(data));
        if (((_a = this.gamePlugin) === null || _a === void 0 ? void 0 : _a.getGameModeMetaData) != undefined) {
            const mData = this.gamePlugin.getGameModeMetaData();
            for (let key in mData) {
                this.modeMetaData.set(key, mData[key]);
            }
        }
        this.allowedGameModes = ["NORMAL"]; //Be normal until told otherwise.
        this.api.events.on(APIEventSystem_1.APIEvent.ALLOWED_GAME_MODES, (data) => {
            if (data.length > 0) {
                //Atm, there is only on game (kenneth must die wich only have 2 options. and the button used in keypad is a toggle button. This might change...
                this.allowedGameModes = [];
                for (let modeName of data) {
                    const meta = this.modeMetaData.get(modeName);
                    if (meta === null || meta === void 0 ? void 0 : meta.standard) {
                        //puts this last in the list.
                        this.allowedGameModes.push(modeName);
                    }
                    else {
                        //Puts non standard at the front.
                        this.allowedGameModes.unshift(modeName);
                    }
                }
            }
            this.setBetLevelMode(this.allowedGameModes[this.allowedGameModes.length - 1]);
        });
        this.api.betHandler.addBetDataInjectCallback((data) => {
            const mode = this.getSelectedBetLevelModeName();
            if (mode != "NORMAL") {
                if (data.playerInteraction == undefined) {
                    data.playerInteraction = {};
                }
                data.playerInteraction.gameMode = mode;
            }
            return data;
        });
    }
    getButtonLabels() {
        const labels = {
            onLabel: "",
            offLabel: ""
        };
        const last = this.allowedGameModes[this.allowedGameModes.length - 1];
        const lastMeta = this.modeMetaData.get(last);
        if (lastMeta) {
            labels.onLabel = lastMeta.buttonLabel || "";
        }
        const first = this.allowedGameModes[0];
        const firstMeta = this.modeMetaData.get(first);
        if (firstMeta) {
            labels.offLabel = firstMeta.buttonLabel || "";
        }
        return labels;
    }
    getAllowedModeNames() {
        return this.allowedGameModes.concat();
    }
    onInit(data) {
        this._featureBuyTimesBetValue = data.featureBuyTimesBetValue || [];
        this._featureBuyTimesBetValueAll = data.featureBuyTimesBetValueAll || undefined;
        this.addFeatureBuyTimesBetValueToMode(this._featureBuyTimesBetValue, this._featureBuyTimesBetValueAll);
    }
    addFeatureBuyTimesBetValueToMode(featureBuyTimesBetValue, featureBuyTimesBetValueAll) {
        if (featureBuyTimesBetValue == undefined || this.betLevelModes.size <= 0) {
            return;
        }
        if (this.betLevelModes.has("NORMAL")) {
            this.betLevelModes.get("NORMAL").addBuyTimesBetValue(featureBuyTimesBetValue);
        }
        else {
            if (featureBuyTimesBetValueAll != undefined) {
                for (let [key, value] of this.betLevelModes) {
                    if (featureBuyTimesBetValueAll[key] != undefined) {
                        value.addBuyTimesBetValue(featureBuyTimesBetValueAll[key]);
                    }
                }
            }
            else {
                throw new Error(`Error assigning featureBuyTimesBetValueAll`);
            }
        }
    }
    onFeatureBetLevels(data) {
        this._featureBetLevels = data;
        this.addFeatureBetLevelsToModes(this._featureBetLevels);
    }
    addFeatureBetLevelsToModes(data) {
        if (data == undefined || this.betLevelModes.size <= 0) {
            return;
        }
        if (this.betLevelModes.has("NORMAL")) {
            this.betLevelModes.get("NORMAL").addFeatureBetLevels(data);
        }
        else {
            for (let [key, value] of this.betLevelModes) {
                if (data[key] != undefined) {
                    value.addFeatureBetLevels(data[key]);
                }
            }
        }
    }
    onBetLevels(data) {
        let init = false;
        if (isBetLevelEventData(data)) {
            if (this.betLevelModes.has("NORMAL")) {
                this.betLevelModes.get("NORMAL").updateAvailability(data);
            }
            else {
                init = true;
                this.betLevelModes.set("NORMAL", new BetLevelModeData("NORMAL", data));
            }
        }
        else {
            for (let key in data) {
                if (this.betLevelModes.has(key)) {
                    this.betLevelModes.get(key).updateAvailability(data[key]);
                }
                else {
                    init = true;
                    this.betLevelModes.set(key, new BetLevelModeData(key, data[key]));
                }
            }
        }
        if (init) {
            const keys = Array.from(this.betLevelModes.keys());
            this.setBetLevelMode(keys[keys.length - 1]);
            this.addFeatureBetLevelsToModes(this._featureBetLevels);
        }
    }
    hasCapWinLimitToggle() {
        return this.allowedGameModes.length > 1;
    }
    isCapWinLimitToggled() {
        return this.gameModeIndex > 0;
    }
    toggleCapWinLimit() {
        let nextIndex = this.gameModeIndex + 1;
        nextIndex %= this.allowedGameModes.length;
        this.setBetLevelMode(this.allowedGameModes[nextIndex]);
    }
    setBetLevelMode(mode) {
        var _a;
        const index = this.allowedGameModes.indexOf(mode);
        if (index >= 0 && this.betLevelModes.has(mode) && ((_a = this.selectedBetLevelMode) === null || _a === void 0 ? void 0 : _a.modeName) != mode) {
            this.gameModeIndex = index;
            this.selectedBetLevelMode = this.betLevelModes.get(mode);
            this.triggerCurrentBetEvent();
            this.triggerBetModeChange();
        }
    }
    getSelectedBetLevelModeName() {
        var _a;
        return ((_a = this.selectedBetLevelMode) === null || _a === void 0 ? void 0 : _a.modeName) || "NOT_SET";
    }
    get allowedModes() {
        return [...this.betLevelModes.values()];
    }
    getSelectedMode() {
        return this.selectedBetLevelMode;
    }
    triggerCurrentBetEvent() {
        this.api.events.trigger(APIEventSystem_1.APIEvent.CURRENT_BET, this.getLevel());
    }
    triggerBetModeChange() {
        this.api.events.trigger(APIEventSystem_1.APIEvent.BET_GAME_MODE_CHANGED);
    }
    getMaxBetLevelForFeature(featureName) {
        return this.selectedBetLevelMode.getMaxBetLevelForFeature(featureName);
    }
    getPriceForFeature(featureName) {
        return this.selectedBetLevelMode.getPriceForFeature(featureName);
    }
    isValidBetLevelForFeature(featureName) {
        return this.selectedBetLevelMode.isValidBetForFeature(featureName);
    }
    setLevel(level) {
        const change = this.selectedBetLevelMode.setLevel(level);
        if (change) {
            this.triggerCurrentBetEvent();
        }
    }
    getLevel() {
        return this.selectedBetLevelMode.getLevel();
    }
    isFirst() {
        return this.selectedBetLevelMode.isFirst();
    }
    isLast() {
        return this.selectedBetLevelMode.isLast();
    }
    increase() {
        const change = this.selectedBetLevelMode.increase();
        if (change) {
            this.triggerCurrentBetEvent();
        }
    }
    decrease() {
        const change = this.selectedBetLevelMode.decrease();
        if (change) {
            this.triggerCurrentBetEvent();
        }
    }
    getAvailableLevels() {
        const result = [];
        const balance = this.api.balance.getAmount();
        for (let level of this.selectedBetLevelMode.betLevels) {
            if (+level <= balance) {
                result.push(level);
            }
        }
        return result;
    }
    getUnavailableLevels() {
        const result = [];
        const balance = this.api.balance.getAmount();
        for (let level of this.selectedBetLevelMode.betLevels) {
            if (+level > balance) {
                result.push(level);
            }
        }
        return result;
    }
    getBetLevels() {
        return this.selectedBetLevelMode.betLevels;
    }
    setMessage(message) {
        this._message = message;
    }
    getMessage() {
        return this._message;
    }
    clearMessage() {
        this._message = undefined;
    }
    isBroke() {
        return false;
    }
}
exports.BetLevelHandler = BetLevelHandler;
//# sourceMappingURL=BetLevelHandler.js.map