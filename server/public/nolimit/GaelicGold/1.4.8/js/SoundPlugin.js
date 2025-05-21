"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSoundPlugin = void 0;
function isSoundPlugin(value) {
    return value.isLoaded !== undefined && value.player !== undefined;
}
exports.isSoundPlugin = isSoundPlugin;
//# sourceMappingURL=SoundPlugin.js.map