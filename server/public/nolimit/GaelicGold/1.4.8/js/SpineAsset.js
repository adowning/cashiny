"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpineAsset = void 0;
/**
 * Class description
 *
 * Created: 2018-05-11
 * @author jonas
 */
const Asset_1 = require("../Asset");
class SpineAsset {
    constructor(name, url) {
        this.name = name;
        this.variants = [];
        this.variants[Asset_1.AssetQualityLevel.META] = { name: this.name, url: url };
    }
}
exports.SpineAsset = SpineAsset;
//# sourceMappingURL=SpineAsset.js.map