"use strict";
/**
 * Created by Jerker Nord on 2016-04-13.
 *
 * Keep this separated since there are different ways to do this and it's not finalized.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelPartCreator = void 0;
const StateReelSymbol_1 = require("../../reelsymbol/StateReelSymbol");
class ReelPartCreator {
    constructor(newSymbolCreator) {
        if (newSymbolCreator != undefined) {
            this._newSymbolCreator = newSymbolCreator;
        }
    }
    // Override or create new method to create feature special symbols in subclass.
    createNewSymbol(symName, reelId, state, size) {
        if (this._newSymbolCreator) {
            return this._newSymbolCreator(symName, reelId, state, size);
        }
        return new StateReelSymbol_1.StateReelSymbol(symName, reelId, state, size);
    }
    deleteSymbol(symbol) {
        symbol.onRemove();
    }
}
exports.ReelPartCreator = ReelPartCreator;
//# sourceMappingURL=ReelPartCreator.js.map