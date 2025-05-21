"use strict";
/**
 * Created by Ning Jiang on 2/6/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModuleConfig = void 0;
const GameConfig_1 = require("../gameconfig/GameConfig");
const AssetsConfig_1 = require("../resource/asset/AssetsConfig");
const SoundConfig_1 = require("../resource/sound/SoundConfig");
class GameModuleConfig {
    static set instance(value) {
        if (GameModuleConfig._moduleConfig) {
            debugger;
            throw new Error("GameModuleConfig.instance() - Instantiation failed: Singleton.");
        }
        GameModuleConfig._moduleConfig = value;
        GameConfig_1.GameConfig.gameConfig = value.GAME_CONFIG;
        SoundConfig_1.SoundConfig.soundConfig = value.SOUND_CONFIG;
        AssetsConfig_1.AssetsConfig.addToAssetsConfig(value.RESOURCES_CONFIG);
    }
    static get instance() {
        return GameModuleConfig._moduleConfig;
    }
}
exports.GameModuleConfig = GameModuleConfig;
//# sourceMappingURL=GameModuleConfig.js.map