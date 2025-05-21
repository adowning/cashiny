"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = void 0;
/**
 *
 *
 * Created: 2019-09-20
 * @author jonas
 */
const pixi_js_1 = require("pixi.js");
const GuiUtils_1 = require("../utils/GuiUtils");
class Icon extends pixi_js_1.Sprite {
    constructor(texture) {
        super(texture);
    }
    setColor(argb) {
        this.tint = GuiUtils_1.GuiUtils.getColorFromARGB(argb);
        this.alpha = GuiUtils_1.GuiUtils.getAlphaFromARGB(argb);
    }
}
exports.Icon = Icon;
//# sourceMappingURL=Icon.js.map