"use strict";
/**
 * Created by Ning Jiang on 9/11/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinParsedGameData = void 0;
const ParsedGameData_1 = require("../../../core/server/data/ParsedGameData");
class SpinParsedGameData extends ParsedGameData_1.ParsedGameData {
    get nearWinReels() {
        return this._nearWinReels;
    }
    get nearWinBigWinReels() {
        return this._nearWinBigWinReels;
    }
    constructor(rawData, dataParser) {
        super(rawData, dataParser);
        this._nearWinReels = dataParser.parseNearWinReels(rawData);
        this._nearWinBigWinReels = dataParser.parseNearWinBigWinReels(rawData);
    }
}
exports.SpinParsedGameData = SpinParsedGameData;
//# sourceMappingURL=SpinParsedServerData.js.map