"use strict";
/**
 * Created by jonas on 2019-09-25.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinButtonStateSet = exports.SpinButtonState = void 0;
var SpinButtonState;
(function (SpinButtonState) {
    SpinButtonState["SPIN"] = "SPIN";
    SpinButtonState["STOP"] = "STOP";
    SpinButtonState["ABORT"] = "ABORT";
    SpinButtonState["COUNT"] = "COUNT";
    SpinButtonState["GAMBLE"] = "GAMBLE";
    SpinButtonState["BOOST"] = "BOOST";
})(SpinButtonState = exports.SpinButtonState || (exports.SpinButtonState = {}));
class SpinButtonStateSet {
    constructor(spin, stop, abort, play, gamble, boost) {
        this[SpinButtonState.SPIN] = spin;
        this[SpinButtonState.STOP] = stop;
        this[SpinButtonState.ABORT] = abort;
        this[SpinButtonState.COUNT] = play;
        this[SpinButtonState.GAMBLE] = gamble;
        this[SpinButtonState.BOOST] = boost;
    }
    getItem(state) {
        return this[state];
    }
    clone() {
        return new SpinButtonStateSet(this[SpinButtonState.SPIN], this[SpinButtonState.STOP], this[SpinButtonState.ABORT], this[SpinButtonState.COUNT], this[SpinButtonState.GAMBLE], this[SpinButtonState.BOOST]);
    }
}
exports.SpinButtonStateSet = SpinButtonStateSet;
SpinButtonState.SPIN, SpinButtonState.STOP, SpinButtonState.ABORT, SpinButtonState.COUNT, SpinButtonState.GAMBLE, SpinButtonState.BOOST;
//# sourceMappingURL=SpinButtonState.js.map