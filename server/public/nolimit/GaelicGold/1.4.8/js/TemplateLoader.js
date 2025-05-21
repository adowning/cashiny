"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateLoader = void 0;
class TemplateLoader {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
        this._assetsToLoad = [];
        this._loader = new PIXI.Loader(baseUrl, 10000);
    }
    add(templateAsset) {
        this._assetsToLoad.push(templateAsset);
    }
    load(assets) {
        if (assets) {
            for (let asset of assets) {
                this.add(asset);
            }
        }
        if (this._assetsToLoad.length > 0) {
            return this.loadInternal(this._assetsToLoad);
        }
        return Promise.resolve([]);
    }
    loadInternal(assets) {
        return new Promise((resolve, reject) => {
            for (let asset of assets) {
                this._loader.add(asset.name, asset.url, { crossOrigin: "*" });
            }
            this._loader.onError.add((error, loader, resource) => {
                loader.destroy();
                throw error;
            });
            this._loader.onComplete.add((loader, resources) => {
                for (let asset of this._assetsToLoad) {
                    asset.loadedData = resources[asset.name] != undefined ? resources[asset.name].data : undefined;
                }
                resolve(this._assetsToLoad);
            });
            this._loader.load();
        });
    }
}
exports.TemplateLoader = TemplateLoader;
//# sourceMappingURL=TemplateLoader.js.map