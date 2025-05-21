"use strict";
/**
 * Created by Jonas Wålekvist on 2019-09-24.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleStateSet = exports.ToggleState = void 0;
var ToggleState;
(function (ToggleState) {
    ToggleState[ToggleState["OFF"] = 0] = "OFF";
    ToggleState[ToggleState["ON"] = 1] = "ON";
})(ToggleState = exports.ToggleState || (exports.ToggleState = {}));
/**
 * Generic set for toggle states.
 */
class ToggleStateSet {
    constructor(on, off) {
        this[ToggleState.ON] = on;
        this[ToggleState.OFF] = off;
    }
    /**
     *
     * @param state
     * @return returns Item for state, falls back to ToggleState.ON
     */
    getItem(state) {
        return this[state] != undefined ? this[state] : this[ToggleState.ON];
    }
    clone() {
        return new ToggleStateSet(this[ToggleState.ON], this[ToggleState.OFF]);
    }
}
exports.ToggleStateSet = ToggleStateSet;
ToggleState.OFF, ToggleState.ON;
//# sourceMappingURL=ToggleState.js.map