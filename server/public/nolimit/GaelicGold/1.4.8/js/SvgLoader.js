"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgLoader = exports.SvgAssetConfig = void 0;
/**
 * Created by Jonas Wålekvist on 2019-10-03.
 */
const SvgAsset_1 = require("./SvgAsset");
class SvgAssetConfig {
    constructor(url, height, width) {
        this.url = url;
        this.name = url;
        this.height = height;
        this.width = width;
    }
}
exports.SvgAssetConfig = SvgAssetConfig;
class SvgLoader {
    constructor(baseUrl, resolution) {
        this._baseUrl = baseUrl;
        this._resolution = resolution;
        this._assetsToLoad = [];
    }
    add(name, url, width, height) {
        const options = {
            scale: this._resolution,
            width: width ? width * this._resolution : undefined,
            height: height ? height * this._resolution : undefined,
            autoLoad: false,
        };
        this._assetsToLoad.push(new SvgAsset_1.SvgAsset(name, this._baseUrl + url, options));
    }
    load() {
        if (this._assetsToLoad.length > 0) {
            return this.loadInternal(this._assetsToLoad);
        }
        return Promise.resolve(true);
    }
    loadInternal(svgAssets) {
        const promises = [];
        for (let svg of svgAssets) {
            promises.push(svg.load());
        }
        return Promise.all(promises).then((values => this.loadComplete(values)));
    }
    loadComplete(values) {
        this._assetsToLoad = [];
        return Promise.resolve(true);
    }
    getSvgTexture(name) {
        if (!PIXI.utils.TextureCache[name]) {
            throw new Error("Missing texture: " + name);
        }
        return PIXI.utils.TextureCache[name];
    }
    static getSvgTexture(name) {
        if (!PIXI.utils.TextureCache[name]) {
            throw new Error("Missing texture: " + name);
        }
        return PIXI.utils.TextureCache[name];
    }
}
exports.SvgLoader = SvgLoader;
//# sourceMappingURL=SvgLoader.js.map