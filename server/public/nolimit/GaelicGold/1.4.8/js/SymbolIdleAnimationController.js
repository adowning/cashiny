"use strict";
/**
 * Created by Ning Jiang on 3/20/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolIdleAnimationController = void 0;
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const Reels_1 = require("../../../core/reel/reelarea/Reels");
const MathHelper_1 = require("../../../core/utils/MathHelper");
const IdleAnimationController_1 = require("../IdleAnimationController");
class SymbolIdleAnimationController extends IdleAnimationController_1.IdleAnimationController {
    constructor(config) {
        super(config);
        this._hasSymbolIdle = GameConfig_1.GameConfig.instance.SYMBOL_STATES.idle != undefined;
    }
    onGameDataParsed(data) {
        this._betWinsData = data.betWins;
    }
    hasWin() {
        return this._betWinsData != null && this._betWinsData.length > 0;
    }
    playIdleAnimation() {
        if (!this._hasSymbolIdle) {
            return;
        }
        const reelId = MathHelper_1.MathHelper.randomNumberInRange(0, GameConfig_1.GameConfig.instance.REELS_NUM - 1);
        const symId = MathHelper_1.MathHelper.randomNumberInRange(0, GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[2] - 1);
        const symbol = Reels_1.Reels.getSymbol(reelId, symId);
        if (symbol) {
            this.playSymbolIdleAnimation(symbol);
        }
    }
    playSymbolIdleAnimation(symbol) {
        symbol.changeState({
            state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.idle,
            replay: false,
            onCompleteCallback: () => {
                symbol.changeState({ state: GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal });
            }
        });
    }
}
exports.SymbolIdleAnimationController = SymbolIdleAnimationController;
//# sourceMappingURL=SymbolIdleAnimationController.js.map