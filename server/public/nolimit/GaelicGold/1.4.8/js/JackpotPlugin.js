"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJackpotPlugin = exports.JackpotPluginEvents = void 0;
/**
 * Created by Jonas Wålekvist on 2019-11-08.
 */
class JackpotPluginEvents {
}
JackpotPluginEvents.SPIN_COMPLETE = "jackpotSpinComplete";
exports.JackpotPluginEvents = JackpotPluginEvents;
function isJackpotPlugin(value) {
    return value.addOnSpinCompleteCallback !== undefined && value.isActive !== undefined;
}
exports.isJackpotPlugin = isJackpotPlugin;
//# sourceMappingURL=JackpotPlugin.js.map