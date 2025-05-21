"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAutoPlayPlugin = void 0;
/**
 * Created by Jonas Wålekvist on 2019-10-14.
 */
function isAutoPlayPlugin(value) {
    return value.updateData !== undefined && value.cancelAutoPlay !== undefined;
}
exports.isAutoPlayPlugin = isAutoPlayPlugin;
//# sourceMappingURL=AutoPlayPlugin.js.map