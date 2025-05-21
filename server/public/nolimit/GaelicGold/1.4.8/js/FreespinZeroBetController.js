"use strict";
/**
 * Created by Ning Jiang on 11/24/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreespinZeroBetController = void 0;
const GameMode_1 = require("../../core/gamemode/GameMode");
const ZeroBetController_1 = require("../../core/zerobet/ZeroBetController");
class FreespinZeroBetController extends ZeroBetController_1.ZeroBetController {
    constructor() {
        super();
    }
    getZeroBetNumberLeft(data) {
        return data.freespinsLeft;
    }
    shouldSubtractZeroBetCounter() {
        return true;
    }
    shouldShowZeroBetCounter() {
        return true;
    }
    calculateIsTriggered(data) {
        return data.nextMode === GameMode_1.GameMode.FREESPIN;
    }
}
exports.FreespinZeroBetController = FreespinZeroBetController;
//# sourceMappingURL=FreespinZeroBetController.js.map