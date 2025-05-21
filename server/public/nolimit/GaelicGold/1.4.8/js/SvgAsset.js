"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgAsset = void 0;
/**
 * Created by Jonas Wålekvist on 2019-10-01.
 */
const NolimitApplication_1 = require("../NolimitApplication");
class SvgAsset {
    constructor(name, url, options) {
        this._name = name;
        this._url = url;
        this._resolution = options.scale;
        this._svgResource = new PIXI.resources.SVGResource(url, options);
    }
    load() {
        return new Promise((resolve, reject) => {
            this._svgResource.load().then((value) => {
                const baseTexture = new PIXI.BaseTexture(value, { resolution: this._resolution });
                const texture = new PIXI.Texture(baseTexture);
                const sprite = new PIXI.Sprite(texture);
                const renderTexture = PIXI.RenderTexture.create({ width: texture.width, height: texture.height });
                NolimitApplication_1.NolimitApplication.pixiApp.renderer.render(sprite, renderTexture);
                PIXI.Texture.addToCache(renderTexture, this._name);
                if (value.source instanceof HTMLCanvasElement) {
                    texture.destroy(true);
                }
                resolve(renderTexture);
            });
        });
    }
}
exports.SvgAsset = SvgAsset;
//# sourceMappingURL=SvgAsset.js.map