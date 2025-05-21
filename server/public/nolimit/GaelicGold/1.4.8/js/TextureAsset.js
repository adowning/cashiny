"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureAsset = void 0;
/**
 * Class description
 *
 * Created: 2018-05-11
 * @author jonas
 */
const Asset_1 = require("../Asset");
class TextureAsset {
    constructor(name, url, sameLayoutSheet = true, customExtensions) {
        this.name = name;
        this.variants = [];
        this._qualityExtensions = TextureAsset.createQualityExtensions(customExtensions);
        let ext = TextureAsset.getExtension(url);
        const strippedUrl = TextureAsset.stripUrl(url, ext);
        //If ext == json, then this assumes that this is a json texture atlas.
        if (ext == "json") {
            if (sameLayoutSheet) {
                name = name + Asset_1.SpriteSheetNameExtension.SPRITE_SHEET_SAME_LAYOUT;
            }
            else {
                name = name + Asset_1.SpriteSheetNameExtension.SPRITE_SHEET;
            }
        }
        this.createVariants(name, strippedUrl, ext);
    }
    createVariants(name, strippedUrl, ext) {
        this.variants[Asset_1.AssetQualityLevel.HIGH] = {
            name: name,
            url: strippedUrl + this._qualityExtensions[Asset_1.AssetQualityLevel.HIGH] + ext
        };
        this.variants[Asset_1.AssetQualityLevel.MEDIUM] = {
            name: name,
            url: strippedUrl + this._qualityExtensions[Asset_1.AssetQualityLevel.MEDIUM] + ext
        };
        this.variants[Asset_1.AssetQualityLevel.LOW] = {
            name: name,
            url: strippedUrl + this._qualityExtensions[Asset_1.AssetQualityLevel.LOW] + ext
        };
    }
    static getExtension(url) {
        let ext = url.split(".").pop();
        if (!ext) {
            throw new Error(`Asset url is not pointing to a valid file.`);
        }
        else {
            return ext;
        }
    }
    static stripUrl(url, ext) {
        return url.slice(0, -(ext.length + 1));
    }
    static createQualityExtensions(customExtensions) {
        let extensions = [];
        extensions[Asset_1.AssetQualityLevel.HIGH] = customExtensions && customExtensions.high ? customExtensions.high : Asset_1.DefaultQualityExtension.HIGH;
        extensions[Asset_1.AssetQualityLevel.MEDIUM] = customExtensions && customExtensions.medium ? customExtensions.medium : Asset_1.DefaultQualityExtension.MEDIUM;
        extensions[Asset_1.AssetQualityLevel.LOW] = customExtensions && customExtensions.low ? customExtensions.low : Asset_1.DefaultQualityExtension.LOW;
        return extensions;
    }
}
exports.TextureAsset = TextureAsset;
//# sourceMappingURL=TextureAsset.js.map