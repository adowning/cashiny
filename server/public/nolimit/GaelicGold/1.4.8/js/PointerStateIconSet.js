"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointerStateIconSet = void 0;
/**
 * Created by Jonas Wålekvist on 2019-09-24.
 */
const PointerState_1 = require("../PointerState");
class PointerStateIconSet extends PointerState_1.PointerStateSet {
    constructor(idle, down, over, disabled) {
        super(idle, down, over, disabled);
    }
    /**
     * @param state
     * @return Returns color for state, falls back to ButtonState.IDLE]
     */
    getItem(state) {
        return this[state] != undefined ? this[state] : this[PointerState_1.PointerState.IDLE];
    }
}
exports.PointerStateIconSet = PointerStateIconSet;
//# sourceMappingURL=PointerStateIconSet.js.map