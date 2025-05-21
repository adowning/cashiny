"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitConfig = void 0;
/**
 * Created by Ning Jiang on 11/13/2017.
 */
class NolimitConfig {
    static get isDevMode() {
        var _a;
        return (((_a = window.nolimit) === null || _a === void 0 ? void 0 : _a.development) === true) || false;
    }
}
NolimitConfig.DEFAULT_SCREEN_MIN_RATIO = 1.6;
exports.NolimitConfig = NolimitConfig;
//# sourceMappingURL=NolimitConfig.js.map