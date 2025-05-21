"use strict";
/**
 * Created by Jonas Wålekvist on 2019-09-24.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerStateSet = exports.PointerState = void 0;
var PointerState;
(function (PointerState) {
    PointerState[PointerState["IDLE"] = 0] = "IDLE";
    PointerState[PointerState["DOWN"] = 1] = "DOWN";
    PointerState[PointerState["OVER"] = 2] = "OVER";
    PointerState[PointerState["DISABLED"] = 3] = "DISABLED";
})(PointerState = exports.PointerState || (exports.PointerState = {}));
/**
 * Generic set for pointer states.
 */
class PointerStateSet {
    constructor(idle, down, over, disabled) {
        this[PointerState.IDLE] = idle;
        this[PointerState.DOWN] = down;
        this[PointerState.OVER] = over;
        this[PointerState.DISABLED] = disabled;
    }
    getItem(state) {
        return this[state];
    }
    clone() {
        return new PointerStateSet(this[PointerState.IDLE], this[PointerState.DOWN], this[PointerState.OVER], this[PointerState.DISABLED]);
    }
}
exports.PointerStateSet = PointerStateSet;
PointerState.IDLE, PointerState.DOWN, PointerState.OVER, PointerState.DISABLED;
//# sourceMappingURL=PointerState.js.map