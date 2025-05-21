"use strict";
/**
 * Created by Jonas Wålekvist on 2019-10-25.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiPlugin = void 0;
function isApiPlugin(value) {
    return value.communication !== undefined && value.slotStates !== undefined;
}
exports.isApiPlugin = isApiPlugin;
//# sourceMappingURL=ApiPlugin.js.map