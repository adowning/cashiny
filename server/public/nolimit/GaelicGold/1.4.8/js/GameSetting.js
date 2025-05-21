"use strict";
/**
 * Created by Ning Jiang on 11/22/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSetting = exports.AssetsQualitySetting = void 0;
const Asset_1 = require("../resource/asset/Asset");
const UserAgent_1 = require("../useragent/UserAgent");
var AssetsQualitySetting;
(function (AssetsQualitySetting) {
    AssetsQualitySetting[AssetsQualitySetting["NONE"] = 0] = "NONE";
    AssetsQualitySetting[AssetsQualitySetting["LOW"] = 1] = "LOW";
    AssetsQualitySetting[AssetsQualitySetting["MEDIUM"] = 2] = "MEDIUM";
    AssetsQualitySetting[AssetsQualitySetting["HIGH"] = 3] = "HIGH";
})(AssetsQualitySetting = exports.AssetsQualitySetting || (exports.AssetsQualitySetting = {}));
class GameSetting {
    constructor(apiAdapter) {
        if (GameSetting._instance) {
            debugger;
            throw new Error("Error: GameSetting.constructor() - Instantiation failed: Singleton.");
        }
        GameSetting._instance = this;
        GameSetting._instance._apiAdapter = apiAdapter;
        GameSetting._quality = GameSetting.getQualitySetting(apiAdapter.getQuality());
        GameSetting._smartLoading = apiAdapter.getSmartLoading();
        GameSetting._replayMode = apiAdapter.getReplayMode();
    }
    static getQualitySetting(value) {
        switch (value) {
            case "high":
                return AssetsQualitySetting.HIGH;
            case "medium":
                return AssetsQualitySetting.MEDIUM;
            case "low":
                return AssetsQualitySetting.LOW;
            default:
                return AssetsQualitySetting.NONE;
        }
    }
    static get quality() {
        return GameSetting._quality;
    }
    static get smartLoading() {
        return GameSetting._smartLoading;
    }
    static get replayMode() {
        return GameSetting._replayMode;
    }
    static get isDevMode() {
        return GameSetting.DEFAULT_DEV_MODE || GameSetting._runTimeDevMode;
    }
    static set isDevMode(value) {
        GameSetting._runTimeDevMode = value;
    }
    static get isFastSpin() {
        var _a, _b;
        if ((_a = GameSetting._instance) === null || _a === void 0 ? void 0 : _a._apiAdapter) {
            return (_b = GameSetting._instance._apiAdapter.isFastSpin()) !== null && _b !== void 0 ? _b : false;
        }
        else {
            debugger;
            throw new Error("Error: GameSetting.isFastSpin: GameSetting is not initialized!");
        }
    }
    static get isSoundLoopOn() {
        var _a, _b;
        if ((_a = GameSetting._instance) === null || _a === void 0 ? void 0 : _a._apiAdapter) {
            return (_b = GameSetting._instance._apiAdapter.isSoundLoopOn()) !== null && _b !== void 0 ? _b : false;
        }
        else {
            debugger;
            throw new Error("Error: GameSetting.isSoundLoopOn: GameSetting is not initialized!");
        }
    }
    static get isSoundEffectsOn() {
        var _a, _b;
        if ((_a = GameSetting._instance) === null || _a === void 0 ? void 0 : _a._apiAdapter) {
            return (_b = GameSetting._instance._apiAdapter.isSoundEffectsOn()) !== null && _b !== void 0 ? _b : false;
        }
        else {
            debugger;
            throw new Error("Error: GameSetting.isSoundEffectsOn: GameSetting is not initialized!");
        }
    }
    static get isLeftHanded() {
        var _a, _b;
        if ((_a = GameSetting._instance) === null || _a === void 0 ? void 0 : _a._apiAdapter) {
            return (_b = GameSetting._instance._apiAdapter.isLeftHanded()) !== null && _b !== void 0 ? _b : false;
        }
        debugger;
        throw new Error("Error: GameSetting.isLeftHanded: GameSetting is not initialized!");
    }
    static get isAutoplayRound() {
        var _a, _b;
        if ((_a = GameSetting._instance) === null || _a === void 0 ? void 0 : _a._apiAdapter) {
            return (_b = GameSetting._instance._apiAdapter.isAutoplayRound()) !== null && _b !== void 0 ? _b : false;
        }
        debugger;
        throw new Error("Error: GameSetting.isAutoPlayRound: GameSetting is not initialized!");
    }
    static get isNextAutoplayRound() {
        var _a, _b;
        if ((_a = GameSetting._instance) === null || _a === void 0 ? void 0 : _a._apiAdapter) {
            return (_b = GameSetting._instance._apiAdapter.isNextAutoplayRound()) !== null && _b !== void 0 ? _b : false;
        }
        debugger;
        throw new Error("Error: GameSetting.isNextAutoplayRound: GameSetting is not initialized!");
    }
    static getDefaultQualities() {
        if (GameSetting.smartLoading == false) {
            switch (GameSetting.quality) {
                case AssetsQualitySetting.HIGH:
                    return [Asset_1.AssetQualityLevel.HIGH];
                case AssetsQualitySetting.MEDIUM:
                    return [Asset_1.AssetQualityLevel.MEDIUM];
                case AssetsQualitySetting.LOW:
                    return [Asset_1.AssetQualityLevel.LOW];
                default:
                    return UserAgent_1.UserAgent.isMobile ? [Asset_1.AssetQualityLevel.MEDIUM] : [Asset_1.AssetQualityLevel.HIGH];
            }
        }
        switch (GameSetting.quality) {
            case AssetsQualitySetting.HIGH:
                return [Asset_1.AssetQualityLevel.MEDIUM, Asset_1.AssetQualityLevel.HIGH];
            case AssetsQualitySetting.MEDIUM:
                return [Asset_1.AssetQualityLevel.LOW, Asset_1.AssetQualityLevel.MEDIUM];
            case AssetsQualitySetting.LOW:
                return [Asset_1.AssetQualityLevel.LOW];
            default:
                return UserAgent_1.UserAgent.isMobile ? [Asset_1.AssetQualityLevel.LOW, Asset_1.AssetQualityLevel.MEDIUM] : [Asset_1.AssetQualityLevel.MEDIUM, Asset_1.AssetQualityLevel.HIGH];
        }
    }
}
GameSetting.DEFAULT_DEV_MODE = false;
exports.GameSetting = GameSetting;
//# sourceMappingURL=GameSetting.js.map