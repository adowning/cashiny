"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetStateColorSet = void 0;
const BetState_1 = require("../BetState");
/**
 * Created by jonas on 2019-09-25.
 */
class BetStateColorSet extends BetState_1.BetStateSet {
    constructor(normal, autoPlay, zeroBet, freeBets, boostedBet) {
        super(normal, autoPlay, zeroBet, freeBets, boostedBet);
    }
    /**
     * @param state
     * @return Returns color for state, falls back to ButtonState.IDLE]
     */
    getItem(state) {
        return this[state] != undefined ? this[state] : this[BetState_1.BetState.NORMAL];
    }
    clone() {
        return super.clone();
    }
}
exports.BetStateColorSet = BetStateColorSet;
//# sourceMappingURL=BetStateColorSet.js.map