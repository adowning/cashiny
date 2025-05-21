"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helper = void 0;
const NolimitConfig_1 = require("../settings/NolimitConfig");
class Helper {
    static shrinkTextWidth(text, textContainer, maxWidth) {
        while (textContainer.width > maxWidth) {
            if (this.isString(textContainer.style.fontSize)) {
                if (textContainer.style.fontSize.indexOf("em") > -1) {
                    debugger;
                    throw new Error("Helper.shrinkTextWidth(), I am lazy so I don't want to parse em, please use number or px.");
                }
                textContainer.style.fontSize = parseInt(textContainer.style.fontSize);
            }
            textContainer.style.fontSize--;
            if (textContainer.style.fontSize <= 10) {
                textContainer.style.fontSize = 10;
                return;
            }
        }
    }
    static isString(object) {
        return typeof object == "string";
    }
    static isDefaultScreenRatio(bounds) {
        const max = Math.max(bounds.width, bounds.height);
        const min = Math.min(bounds.width, bounds.height);
        return (max / min) > NolimitConfig_1.NolimitConfig.DEFAULT_SCREEN_MIN_RATIO;
    }
}
exports.Helper = Helper;
//# sourceMappingURL=Helper.js.map