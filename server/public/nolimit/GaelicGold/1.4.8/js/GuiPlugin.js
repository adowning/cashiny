"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiPlugin = void 0;
const NolimitApplication_1 = require("../../NolimitApplication");
const OpenSans_1 = require("../../loader/font/OpenSans");
const FontLoader_1 = require("../../loader/FontLoader");
const GuiDefaultTextures_1 = require("../default/GuiDefaultTextures");
const ImgLoader_1 = require("../../loader/ImgLoader");
class GuiPlugin {
    constructor() {
        this.name = "GuiPlugin";
    }
    init() {
        const fontLoader = new FontLoader_1.FontLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_300);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_400);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_700);
        fontLoader.add(OpenSans_1.OpenSans.ITALIC_700);
        fontLoader.add(OpenSans_1.OpenSans.ITALIC_800);
        const imgLoader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        for (let asset of GuiDefaultTextures_1.GuiDefaultTextures.getImgConfigs()) {
            imgLoader.add(asset.name, asset.url);
        }
        const promise = Promise.all([imgLoader.load(), fontLoader.load()]);
        return promise.then((value) => {
            return Promise.resolve(this);
        });
    }
    getReady() {
        return Promise.resolve(this);
    }
    getReadyToStart() {
        return Promise.resolve(this);
    }
    start() {
        return Promise.resolve(this);
    }
}
exports.GuiPlugin = GuiPlugin;
//# sourceMappingURL=GuiPlugin.js.map