"use strict";
/**
 * Created by Ning Jiang on 12/8/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelAnimationState = void 0;
var ReelAnimationState;
(function (ReelAnimationState) {
    ReelAnimationState["IDLE"] = "idle";
    ReelAnimationState["INACTIVE"] = "inactive";
    // Spin states.
    ReelAnimationState["START_SPIN"] = "start_spin";
    ReelAnimationState["SPIN"] = "spin";
    ReelAnimationState["STOP_SPIN"] = "stop_spin";
    // Avalanche states.
    ReelAnimationState["ALL_OUT"] = "all_out";
    ReelAnimationState["AVALANCHE_START"] = "avalanche_start";
    ReelAnimationState["ALL_IN"] = "all_in";
    ReelAnimationState["AVALANCHE"] = "avalanche";
    ReelAnimationState["AVALANCHE_NEW"] = "avalanche_new";
})(ReelAnimationState = exports.ReelAnimationState || (exports.ReelAnimationState = {}));
//# sourceMappingURL=ReelAnimationState.js.map