"use strict";
/**
 * Created by jonas on 2019-10-23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneScreenBounds = void 0;
function cloneScreenBounds(bounds) {
    return {
        top: bounds.top,
        left: bounds.left,
        bottom: bounds.bottom,
        right: bounds.right,
        center: bounds.center,
        width: bounds.width,
        height: bounds.height,
        scale: bounds.scale
    };
}
exports.cloneScreenBounds = cloneScreenBounds;
//# sourceMappingURL=ScreenBounds.js.map