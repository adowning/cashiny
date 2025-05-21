"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontLoader = void 0;
/**
 * Created by Jonas Wålekvist on 2020-01-27.
 */
const FontCache_1 = require("./font/FontCache");
class FontLoader {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
        this._assetsToLoad = [];
    }
    add(fontAsset) {
        this._assetsToLoad.push(fontAsset);
    }
    load() {
        if (this._assetsToLoad.length > 0) {
            return this.loadInternal(this._assetsToLoad);
        }
        return Promise.resolve(true);
    }
    loadInternal(fontAsset) {
        const promises = [];
        for (let font of fontAsset) {
            promises.push(FontCache_1.FontCache.addFontFace(font, this._baseUrl));
        }
        const all = Promise.all(promises);
        return all.then((values => this.loadComplete(values)));
    }
    loadComplete(values) {
        /*      for (let value of values){
                    console.log(value);
                }*/
        this._assetsToLoad = [];
        return Promise.resolve(true);
    }
}
exports.FontLoader = FontLoader;
//# sourceMappingURL=FontLoader.js.map