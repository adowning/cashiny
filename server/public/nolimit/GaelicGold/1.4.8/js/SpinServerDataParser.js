"use strict";
/**
 * Created by Ning Jiang on 9/11/2019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinServerDataParser = void 0;
const GameConfig_1 = require("../../../core/gameconfig/GameConfig");
const ServerDataParser_1 = require("../../../core/server/ServerDataParser");
const ArrayHelper_1 = require("../../../core/utils/ArrayHelper");
class SpinServerDataParser extends ServerDataParser_1.ServerDataParser {
    constructor() {
        super();
    }
    parseNearWinReels(rawData) {
        return rawData.nearWinReels == null ? ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => false) : rawData.nearWinReels.concat();
    }
    parseNearWinBigWinReels(rawData) {
        return rawData.nearWinBigWinReels == null ? ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => false) : rawData.nearWinBigWinReels.concat();
    }
}
exports.SpinServerDataParser = SpinServerDataParser;
//# sourceMappingURL=SpinServerDataParser.js.map