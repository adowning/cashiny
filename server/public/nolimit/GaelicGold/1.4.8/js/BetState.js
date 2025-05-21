"use strict";
/**
 * Created by jonas on 2019-09-25.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetStateSet = exports.BetState = void 0;
var BetState;
(function (BetState) {
    BetState[BetState["NORMAL"] = 0] = "NORMAL";
    BetState[BetState["AUTOPLAY"] = 1] = "AUTOPLAY";
    BetState[BetState["ZERO_BET"] = 2] = "ZERO_BET";
    BetState[BetState["FREE_BETS"] = 3] = "FREE_BETS";
    BetState[BetState["BOOSTED_BET"] = 4] = "BOOSTED_BET";
    BetState[BetState["HIDDEN"] = 5] = "HIDDEN";
})(BetState = exports.BetState || (exports.BetState = {}));
class BetStateSet {
    constructor(normal, autoplay, zeroBet, freeBets, boostedBet, hidden) {
        this[BetState.NORMAL] = normal;
        this[BetState.AUTOPLAY] = autoplay;
        this[BetState.ZERO_BET] = zeroBet;
        this[BetState.FREE_BETS] = freeBets;
        this[BetState.BOOSTED_BET] = boostedBet;
        this[BetState.HIDDEN] = hidden;
    }
    getItem(state) {
        return this[state];
    }
    clone() {
        return new BetStateSet(this[BetState.NORMAL], this[BetState.AUTOPLAY], this[BetState.ZERO_BET], this[BetState.FREE_BETS], this[BetState.BOOSTED_BET], this[BetState.HIDDEN]);
    }
}
exports.BetStateSet = BetStateSet;
BetState.NORMAL, BetState.AUTOPLAY, BetState.ZERO_BET, BetState.FREE_BETS, BetState.BOOSTED_BET, BetState.HIDDEN;
//# sourceMappingURL=BetState.js.map