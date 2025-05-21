"use strict";
/**
 * Created by Jonas Wålekvist on 2017-11-09.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextureParser = void 0;
const Asset_1 = require("./Asset");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
class TextureParser {
    constructor(loader) {
        this.ready = false;
        this._loader = loader;
        this._spriteSheetCache = {};
        this._animationCache = {};
        this._animationRegister = {};
        this._oldBaseTextures = [];
    }
    parseResource(resource, next) {
        //sprite sheet
        if (resource.type == PIXI.LoaderResource.TYPE.JSON && resource.data.frames) {
            this.processSpriteSheet(resource);
        }
        //Image
        if (resource.data && resource.type === PIXI.LoaderResource.TYPE.IMAGE) {
            this.processBaseTexture(resource);
        }
        next();
    }
    addAnimationRegister(animations) {
        for (let key in animations) {
            this._animationRegister[key] = animations[key];
        }
    }
    getFrameTextures(name) {
        let searchName = name;
        if (this._animationRegister[name]) {
            searchName = this._animationRegister[name];
        }
        //Single image
        if (PIXI.utils.TextureCache[searchName]) {
            return [PIXI.utils.TextureCache[searchName]];
        }
        //Animation not in animation cache - add to cache
        if (!this._animationCache[name]) {
            let frameNames = [];
            for (let textureName in PIXI.utils.TextureCache) {
                if (textureName.search("^" + searchName) < 0) {
                    continue;
                }
                let frameNumberString = textureName.split(searchName).pop();
                if (!frameNumberString) {
                    continue;
                }
                let result = parseFloat(frameNumberString);
                if (!isNaN(result)) {
                    frameNames.push(textureName);
                }
            }
            if (frameNames.length != 0) {
                frameNames = frameNames.sort();
                this._animationCache[name] = frameNames;
            }
        }
        //Animation in animation cache
        if (this._animationCache[name]) {
            let frameTextures = [];
            for (let frameName of this._animationCache[name]) {
                frameTextures.push(PIXI.utils.TextureCache[frameName]);
            }
            return frameTextures;
        }
        //No ref at all
        if (this.ready) {
            if (name === "missingResource") {
                throw new Error(`Error: TextureParser.getTexture(): [${name}] is not in texture cache, please check if you install slot-game correctly!`);
            }
            else {
                Logger_1.Logger.logDev(`Error: TextureParser.getTexture(): [${name}] is not in texture cache`);
                return this.getFrameTextures("missingResource");
            }
        }
        else {
            throw new Error(`Error: TextureParser.getTexture(): [${name}] You cannot use texture before it's loaded!`);
        }
    }
    processSpriteSheet(resource) {
        const sameLayoutSheet = resource.name.search(Asset_1.SpriteSheetNameExtension.SPRITE_SHEET_SAME_LAYOUT) >= 0;
        const searchIndex = resource.name.search(Asset_1.SpriteSheetNameExtension.SPRITE_SHEET);
        if (searchIndex >= 0) {
            //strip search
            let name = resource.name.substring(0, searchIndex);
            name += resource.name.substring(searchIndex - 1 + Asset_1.SpriteSheetNameExtension.SPRITE_SHEET.length);
            let sheet = resource.data;
            if (this._spriteSheetCache[name] && sameLayoutSheet == false) {
                sheet.dirty = true;
            }
            this._spriteSheetCache[name] = sheet;
            const baseUrl = resource.url.substring(0, resource.url.lastIndexOf("/")) + "/";
            let loadOptions = {
                crossOrigin: resource.crossOrigin,
                loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE,
                metadata: resource.metadata.imageMetadata,
                parentResource: resource
            };
            this._loader.add(name, baseUrl + sheet.meta.image, loadOptions);
        }
    }
    postProcessFrames(resource) {
        const resourceName = resource.name;
        if (!this._spriteSheetCache[resourceName]) {
            return;
        }
        const sheet = this._spriteSheetCache[resourceName];
        let baseTexture = PIXI.utils.BaseTextureCache[resourceName];
        for (let frameName in sheet.frames) {
            let texture;
            let resolution = baseTexture.resolution;
            if (PIXI.utils.TextureCache[frameName]) {
                texture = PIXI.utils.TextureCache[frameName];
                texture.baseTexture = baseTexture;
                if (sheet.dirty == true) {
                    TextureParser.updateTextureFrame(texture, sheet.frames[frameName], resolution);
                }
                texture.updateUvs();
            }
            else {
                const texture = new PIXI.Texture(baseTexture);
                TextureParser.updateTextureFrame(texture, sheet.frames[frameName], resolution);
                PIXI.Texture.addToCache(texture, frameName);
                //texture.requiresUpdate = true;
            }
        }
    }
    static updateTextureFrame(texture, frameData, resolution) {
        const rect = frameData.frame;
        if (rect) {
            if (frameData.trimmed) {
                if (texture.trim) {
                    texture.trim.x = frameData.spriteSourceSize.x / resolution;
                    texture.trim.y = frameData.spriteSourceSize.y / resolution;
                    texture.trim.width = rect.w / resolution;
                    texture.trim.height = rect.h / resolution;
                }
                else {
                    texture.trim = new PIXI.Rectangle(frameData.spriteSourceSize.x / resolution, frameData.spriteSourceSize.y / resolution, rect.w / resolution, rect.h / resolution);
                }
            }
            texture.rotate = frameData.rotated ? 2 : 0;
            texture.frame.x = rect.x / resolution;
            texture.frame.y = rect.y / resolution;
            texture.frame.width = frameData.rotated ? rect.h / resolution : rect.w / resolution;
            texture.frame.height = frameData.rotated ? rect.w / resolution : rect.h / resolution;
            texture.orig = new PIXI.Rectangle(0, 0, frameData.sourceSize.w / resolution, frameData.sourceSize.h / resolution);
        }
        texture.updateUvs();
    }
    processBaseTexture(resource) {
        if (resource.data && resource.type === PIXI.LoaderResource.TYPE.IMAGE) {
            const name = resource.name;
            if (PIXI.utils.BaseTextureCache[name]) {
                const oldBase = PIXI.BaseTexture.removeFromCache(name);
                const newBase = new PIXI.BaseTexture(resource.data, { scaleMode: PIXI.settings.SCALE_MODE, resolution: PIXI.utils.getResolutionOfUrl(resource.url) });
                newBase.resolution = PIXI.utils.getResolutionOfUrl(resource.url);
                PIXI.utils.TextureCache[name].baseTexture = newBase;
                PIXI.BaseTexture.addToCache(newBase, name);
                this._oldBaseTextures.push(oldBase);
                newBase.update();
            }
            else {
                let baseTexture = new PIXI.BaseTexture(resource.data, { scaleMode: PIXI.settings.SCALE_MODE, resolution: PIXI.utils.getResolutionOfUrl(resource.url) });
                baseTexture.resolution = PIXI.utils.getResolutionOfUrl(resource.url);
                resource.texture = new PIXI.Texture(baseTexture);
                PIXI.BaseTexture.addToCache(baseTexture, name);
                PIXI.Texture.addToCache(resource.texture, name);
            }
            this.postProcessFrames(resource);
        }
        this.destroyOldBaseTextures();
    }
    destroyOldBaseTextures() {
        let oldBase = this._oldBaseTextures.pop();
        while (oldBase) {
            oldBase.destroy();
            oldBase = this._oldBaseTextures.pop();
        }
    }
}
exports.TextureParser = TextureParser;
//# sourceMappingURL=TextureParser.js.map