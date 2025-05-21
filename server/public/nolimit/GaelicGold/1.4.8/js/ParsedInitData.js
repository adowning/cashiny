"use strict";
/**
 * Created by Ning Jiang on 4/27/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedInitData = void 0;
const ParsedServerData_1 = require("./ParsedServerData");
class ParsedInitData extends ParsedServerData_1.ParsedServerData {
    get betLines() {
        return this._betLines;
    }
    get symbolValues() {
        return this._symbolValues;
    }
    get isRestoreState() {
        return this._isRestoreState;
    }
    get initReelSet() {
        return this._initReelSet;
    }
    constructor(rawData, dataParser) {
        super(rawData, dataParser);
        this._betLines = dataParser.parseBetLines(rawData);
        this._symbolValues = dataParser.parseSymbolValues(rawData);
        this._isRestoreState = dataParser.parseIsRestoreState(rawData);
        this._initReelSet = dataParser.parseInitReelSet(rawData);
    }
    parseScatterPositions(rawData, dataParser) {
        return dataParser.parseScatterPositionsEnteringFreespin(rawData);
    }
}
exports.ParsedInitData = ParsedInitData;
//# sourceMappingURL=ParsedInitData.js.map