"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKeypadPlugin = exports.KeypadPluginEvents = void 0;
var KeypadPluginEvents;
(function (KeypadPluginEvents) {
    KeypadPluginEvents["DISPLAY_BET_UPDATE"] = "KeypadPlugin_displayBetUpdate";
    KeypadPluginEvents["USER_BET_UPDATE"] = "KeypadPlugin_userBetUpdate";
})(KeypadPluginEvents = exports.KeypadPluginEvents || (exports.KeypadPluginEvents = {}));
function isKeypadPlugin(value) {
    return value.setWin !== undefined && value.setZeroBetSpinCounter !== undefined;
}
exports.isKeypadPlugin = isKeypadPlugin;
//# sourceMappingURL=KeypadPlugin.js.map