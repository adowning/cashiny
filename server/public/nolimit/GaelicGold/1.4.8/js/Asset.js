"use strict";
/**
 * Created by Jonas Wålekvist on 2017-11-09.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = exports.AssetQualityLevel = exports.SpriteSheetNameExtension = exports.DefaultQualityExtension = void 0;
var DefaultQualityExtension;
(function (DefaultQualityExtension) {
    DefaultQualityExtension["LOW"] = "@0.25x.";
    DefaultQualityExtension["MEDIUM"] = "@0.5x.";
    DefaultQualityExtension["HIGH"] = ".";
})(DefaultQualityExtension = exports.DefaultQualityExtension || (exports.DefaultQualityExtension = {}));
var SpriteSheetNameExtension;
(function (SpriteSheetNameExtension) {
    SpriteSheetNameExtension["SPRITE_SHEET_SAME_LAYOUT"] = "_sheetSameLayout.";
    SpriteSheetNameExtension["SPRITE_SHEET"] = "_sheet.";
})(SpriteSheetNameExtension = exports.SpriteSheetNameExtension || (exports.SpriteSheetNameExtension = {}));
var AssetQualityLevel;
(function (AssetQualityLevel) {
    AssetQualityLevel[AssetQualityLevel["META"] = 0] = "META";
    AssetQualityLevel[AssetQualityLevel["LOW"] = 1] = "LOW";
    AssetQualityLevel[AssetQualityLevel["MEDIUM"] = 2] = "MEDIUM";
    AssetQualityLevel[AssetQualityLevel["HIGH"] = 3] = "HIGH";
})(AssetQualityLevel = exports.AssetQualityLevel || (exports.AssetQualityLevel = {}));
class Asset {
    constructor(name, url, sameLayoutSheet = true, customExtensions) {
        this._qualityExtensions = Asset.createQualityExtensions(customExtensions);
        this.variants = [];
        this.name = name;
        let ext = Asset.getExtension(url);
        const strippedUrl = Asset.stripUrl(url, ext);
        if (ext == "fnt") {
            this.variants[AssetQualityLevel.META] = { name: name, url: url };
            return;
        }
        if (ext == "json") {
            if (sameLayoutSheet) {
                name = name + SpriteSheetNameExtension.SPRITE_SHEET_SAME_LAYOUT;
            }
            else {
                name = name + SpriteSheetNameExtension.SPRITE_SHEET;
            }
        }
        this.createVariants(name, strippedUrl, ext);
        console.warn("Asset deprecated. Use relevant specific asset class instead: TextureAsset, BitmapFontAsset or SpineAsset");
    }
    createVariants(name, strippedUrl, ext) {
        this.variants[AssetQualityLevel.HIGH] = {
            name: name,
            url: strippedUrl + this._qualityExtensions[AssetQualityLevel.HIGH] + ext
        };
        this.variants[AssetQualityLevel.MEDIUM] = {
            name: name,
            url: strippedUrl + this._qualityExtensions[AssetQualityLevel.MEDIUM] + ext
        };
        this.variants[AssetQualityLevel.LOW] = {
            name: name,
            url: strippedUrl + this._qualityExtensions[AssetQualityLevel.LOW] + ext
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
        extensions[AssetQualityLevel.HIGH] = customExtensions && customExtensions.high ? customExtensions.high : DefaultQualityExtension.HIGH;
        extensions[AssetQualityLevel.MEDIUM] = customExtensions && customExtensions.medium ? customExtensions.medium : DefaultQualityExtension.MEDIUM;
        extensions[AssetQualityLevel.LOW] = customExtensions && customExtensions.low ? customExtensions.low : DefaultQualityExtension.LOW;
        return extensions;
    }
}
exports.Asset = Asset;
//# sourceMappingURL=Asset.js.map