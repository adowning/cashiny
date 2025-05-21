"use strict";
/**
 * Created by Jonas Wålekvist on 2019-12-17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgLoader = exports.ImgAssetConfig = void 0;
class ImgAssetConfig {
    constructor(url) {
        this.name = url;
        this.url = url;
    }
}
exports.ImgAssetConfig = ImgAssetConfig;
class ImgLoader {
    constructor(baseUrl) {
        this._internalLoader = new PIXI.Loader(baseUrl, 10000);
        this._assetsToLoad = [];
    }
    add(name, url) {
        this._assetsToLoad.push({ name: name, url: url });
    }
    load() {
        if (this._assetsToLoad.length > 0) {
            return this.loadInternal(this._assetsToLoad);
        }
        return Promise.resolve(true);
    }
    loadInternal(assets) {
        return new Promise((resolve, reject) => {
            for (let asset of assets) {
                this._internalLoader.add(asset.name, asset.url, { crossOrigin: "*" });
            }
            this._internalLoader.load();
            this._internalLoader.onError.add(() => {
                reject("error loading Img Asset");
            });
            this._internalLoader.onComplete.add(() => {
                resolve(true);
            });
        });
    }
    getImgTexture(name) {
        if (!PIXI.utils.TextureCache[name]) {
            throw new Error("Missing texture");
        }
        return PIXI.utils.TextureCache[name];
    }
    static getImgTexture(name) {
        if (!PIXI.utils.TextureCache[name]) {
            throw new Error("Missing texture");
        }
        return PIXI.utils.TextureCache[name];
    }
}
exports.ImgLoader = ImgLoader;
//# sourceMappingURL=ImgLoader.js.map