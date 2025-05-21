"use strict";
/**
 * Created by Ning Jiang on 8/16/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolStack = void 0;
const ArrayHelper_1 = require("../utils/ArrayHelper");
class SymbolStack {
    get symName() {
        return this._symName;
    }
    get totalNum() {
        return this._totalNum;
    }
    get symbols() {
        return this._symbols;
    }
    constructor(symName, totalNum) {
        this._symName = symName;
        this._totalNum = totalNum;
        this._symbols = ArrayHelper_1.ArrayHelper.initArrayWithValues(totalNum, (index) => null);
    }
    addSymbol(symbol) {
        if (this.verifySymbol(symbol)) {
            if (this._symbols[symbol.stackedSymName.index] != null) {
                debugger;
                throw new Error(`SymbolStack.addSymbol():There is symbol exist in the index where the symbol is going to be added!`);
            }
            this._symbols[symbol.stackedSymName.index] = symbol;
        }
    }
    removeSymbol(symbol) {
        if (this.verifySymbol(symbol)) {
            if (this._symbols[symbol.stackedSymName.index] != symbol) {
                debugger;
                throw new Error(`SymbolStack.removeSymbol():The index of the symbol to be removed does not match the stack!`);
            }
            this._symbols[symbol.stackedSymName.index] = null;
        }
    }
    verifySymbol(symbol) {
        if (!symbol.stackedSymName.isStacked) {
            return false;
        }
        if (symbol.stackedSymName.symName != this._symName) {
            return false;
        }
        return true;
    }
}
exports.SymbolStack = SymbolStack;
//# sourceMappingURL=SymbolStack.js.map