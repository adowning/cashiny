"use strict";
/**
 * Created by Ning Jiang on 11/22/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameConfig = void 0;
const StateReelSymbol_1 = require("../reelsymbol/StateReelSymbol");
class GameConfig {
    static set gameConfig(value) {
        GameConfig._gameConfig = value;
        GameConfig.updateGameConfig();
    }
    static get instance() {
        return GameConfig._gameConfig;
    }
    static updateGameConfig() {
        // Filter stacked symbols on REEL_SETS if any.
        if (GameConfig.instance.STACKED_SYMBOLS != null) {
            for (let reelSetKey in GameConfig.instance.REEL_SETS) {
                GameConfig.instance.REEL_SETS[reelSetKey].forEach((reelSet, reelId) => {
                    GameConfig.instance.REEL_SETS[reelSetKey][reelId] = StateReelSymbol_1.StateReelSymbol.filterStackedSymbolsReelSet(GameConfig.instance.REEL_SETS[reelSetKey][reelId], reelId);
                });
            }
        }
        // Game Specific update.
        if (GameConfig.instance.updateGameConfig) {
            GameConfig.instance.updateGameConfig();
        }
    }
}
exports.GameConfig = GameConfig;
//# sourceMappingURL=GameConfig.js.map