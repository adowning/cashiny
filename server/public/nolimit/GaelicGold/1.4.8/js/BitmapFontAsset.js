"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitmapFontAsset = void 0;
/**
 * Class description
 *
 * Created: 2018-05-11
 * @author jonas
 */
const Asset_1 = require("../Asset");
class BitmapFontAsset {
    constructor(name, url) {
        this.name = name;
        this.variants = [];
        this.variants[Asset_1.AssetQualityLevel.META] = { name: this.name, url: url };
    }
}
exports.BitmapFontAsset = BitmapFontAsset;
//# sourceMappingURL=BitmapFontAsset.js.map