"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameInfo = exports.isGameInfoData = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const Logger_1 = require("../../utils/Logger");
function isGameInfoData(value) {
    return value.displayName !== undefined || value.maxMultiplier != undefined || value.maxMultiplierProbability != undefined || value.volatility != undefined;
}
exports.isGameInfoData = isGameInfoData;
class GameInfo {
    constructor(api) {
        this._needsUpdate = false;
        this._hasInit = false;
        this._api = api;
        this.displayName = api.options.game;
        this.gameInfos = new Map();
        api.events.on(APIEventSystem_1.APIEvent.GAME_INFO, (data) => this.onGameInfo(data));
        api.events.on(APIEventSystem_1.APIEvent.BET_GAME_MODE_CHANGED, () => this.modeChanged());
    }
    modeChanged() {
        const selectedModeName = this._api.betLevel.getSelectedBetLevelModeName();
        const selectedInfo = this.gameInfos.get(selectedModeName);
        if (selectedInfo != undefined) {
            this._hasInit = true;
            this.selectedModeInfo = selectedInfo;
            this.updateValues();
        }
        else {
            this._needsUpdate = true;
            Logger_1.Logger.warn("No game info found for game mode: " + selectedModeName);
        }
    }
    updateScreen(screen) {
        const maxMultipliers = screen.find('span.maxMultiplier');
        for (let element of maxMultipliers) {
            element.innerHTML = this.selectedModeInfo.maxMultiplier;
        }
        const maxMultiplierProbability = screen.find('span.maxMultiplierProbability');
        for (let element of maxMultiplierProbability) {
            element.innerHTML = this.selectedModeInfo.maxMultiplierProbability;
        }
        // #617, https://github.com/nolimitcity/QA/issues/601
        const commonRulesVolatility = screen.find('span.commonRulesVolatility');
        for (let element of commonRulesVolatility) {
            element.innerHTML = this.selectedModeInfo.volatility;
        }
    }
    onGameInfo(data) {
        if (isGameInfoData(data)) {
            this.gameInfos.set("NORMAL", {
                displayName: data.displayName,
                maxMultiplier: data.maxMultiplier,
                maxMultiplierProbability: "1:" + data.maxMultiplierProbability,
                volatility: data.volatility
            });
        }
        else {
            for (let key in data) {
                this.gameInfos.set(key, {
                    displayName: data[key].displayName,
                    maxMultiplier: data[key].maxMultiplier,
                    maxMultiplierProbability: "1:" + data[key].maxMultiplierProbability,
                    volatility: data[key].volatility
                });
            }
        }
        if (this._needsUpdate) {
            this._needsUpdate = false;
            this.modeChanged();
        }
    }
    updateValues() {
        if (this._hasInit) {
            const formattedRtp = this._api.rtp.getFormattedRtp();
            this.displayName = this.selectedModeInfo.displayName;
            if (this._api.gameClientConfiguration.showRtpWatermark) {
                this.displayName += ", " + this._api.translations.translate("Rtp:") + " " + formattedRtp;
            }
            if (this._api.gameClientConfiguration.showMaxWinProbabilityWatermark) {
                this.displayName += ", " + this._api.translations.translate("Max win probability:") + " " + this.selectedModeInfo.maxMultiplierProbability;
            }
            this.updateDom();
        }
    }
    updateDom() {
        const nameTag = document.querySelector('#game-name-version');
        if (nameTag) {
            nameTag.innerHTML = this.displayName;
        }
    }
}
exports.GameInfo = GameInfo;
//# sourceMappingURL=GameInfo.js.map