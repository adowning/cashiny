"use strict";
/**
 * Created by Ning Jiang on 1/25/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelSymbolStateCreator = void 0;
const GameConfig_1 = require("../gameconfig/GameConfig");
const GameResources_1 = require("../resource/GameResources");
const StateReelSymbol_1 = require("./StateReelSymbol");
const TimelineSprite_1 = require("../animation/TimelineSprite");
class ReelSymbolStateCreator {
    constructor() { }
    createStateAnimation(symbol, stateConfig) {
        if (this[`${stateConfig.keyword}StateCreator`]) {
            return this[`${stateConfig.keyword}StateCreator`](symbol, stateConfig.keyword, stateConfig);
        }
        return this.getBasicStateAnimation(symbol, stateConfig.keyword, stateConfig);
    }
    getBasicStateAnimation(symbol, stateKey, stateConfig) {
        if (stateConfig.symbols && stateConfig.symbols.indexOf(symbol.stackedSymName.symName) === -1) {
            return null;
        }
        if (!stateConfig.texturesCreator) {
            stateConfig.texturesCreator = (symName, stateKey) => ReelSymbolStateCreator.defaultSymbolStateTexturesCreator(symName, stateKey);
        }
        const textures = stateConfig.texturesCreator(symbol.stackedSymName.symName, stateKey);
        if (textures == null || textures.length === 0) {
            return null;
        }
        const fps = stateConfig.fpsGetter ? stateConfig.fpsGetter(symbol.stackedSymName.symName, stateKey) : GameConfig_1.GameConfig.instance.BROWSER_FPS;
        const sprite = new TimelineSprite_1.TimelineSprite(textures, fps);
        if (stateConfig.scaleGetter) {
            const scale = stateConfig.scaleGetter(symbol.stackedSymName.symName, stateKey);
            sprite.scale.set(scale[0], scale[1]);
        }
        StateReelSymbol_1.StateReelSymbol.setStackedSymbolStateAnchor(symbol, sprite);
        if (stateConfig.offsetGetter) {
            const offset = stateConfig.offsetGetter(symbol.stackedSymName.symName, stateKey);
            sprite.position.set(offset[0], offset[1]);
        }
        return sprite;
    }
    hiddenStateCreator(symbol, stateKey, stateConfig) {
        return null;
    }
    static defaultSymbolStateTexturesCreator(symName, stateKey) {
        return GameResources_1.GameResources.getTextures(`${symName}_${stateKey}`);
    }
}
exports.ReelSymbolStateCreator = ReelSymbolStateCreator;
//# sourceMappingURL=ReelSymbolStateCreator.js.map