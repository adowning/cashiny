"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpineAssetParser = void 0;
/// <reference types="pixi-spine" />
/**
 * Created by Jonas Wålekvist on 2018-04-26.
 */
const GameResources_1 = require("../GameResources");
class SpineAssetParser {
    constructor(loader) {
        this._loader = loader;
        this._rawResource = {};
        this._spineDataCache = {};
    }
    parseResource(resource, next) {
        if (!resource.data ||
            resource.type !== PIXI.LoaderResource.TYPE.JSON ||
            !resource.data.bones) {
            return next();
        }
        this._rawResource[resource.name] = resource;
        next();
    }
    /**
     * Creates and caches the data for spine animations. It only returns it if it's cached already. The main reson for
     * this to happen at this stage is because we need to create the spine Atlas file from preloaded textures.
     * So we can take advantage of smart loading.
     *
     * This setup uses textures allready in texture cache.
     * Instead of loading in a separate texture atlas for each spine animation.
     *
     *
     * You can filter/replace  parts of the texture ids in order to make the spine animation region ids match what we have ion texture cache.
     *
     * Example:
     *
     * In spine json:
     * main/myCoolFolder/myCoolTexture
     *
     * In main.json spritesheet:
     *
     * myCoolFolder/myCoolTexture
     *
     *
     * In this scenario we need to remove the "main/" part in order for the spine parser to locate the texture in the cache.
     *
     * By default the first part of the regionName is removed "main/myCoolFolder/myCoolTexture" => "myCoolFolder/myCoolTexture".
     *
     * That's because the n  you can include the etire source folder as image path in Spine (animation software) and dont bother with changing or keeping track of any texture names.
     *
     *
     *
     * @param {string} name Name of the resource (SpineAsset.name)
     * @param {RegExp} texturePathSearch RegExp to be replace with texturePathReplace in order to create correct texture cache paths (ids).
     * @param {string} texturePathReplace The string to replace the search regexp
     * @returns {PIXI.spine.core.SkeletonData} The data for creating PIXI.spine.Spine instances.
     */
    getSpineAsset(name, texturePathSearch = /^\w+\//gi, texturePathReplace = "") {
        if (this._spineDataCache[name]) {
            return this._spineDataCache[name];
        }
        const resource = this._rawResource[name];
        const spineRawJson = resource.data;
        let textureRegionNames = SpineAssetParser.getAllRegionNamesFromSpineData(spineRawJson);
        textureRegionNames = SpineAssetParser.removeDuplicates(textureRegionNames);
        const regionCacheIds = [];
        for (let name of textureRegionNames) {
            let regionData = {
                regionName: name,
                textureId: name.replace(texturePathSearch, texturePathReplace)
            };
            regionCacheIds.push(regionData);
        }
        const spineAtlas = new PIXI.spine.core.TextureAtlas();
        for (let data of regionCacheIds) {
            data = data;
            spineAtlas.addTexture(data.regionName, GameResources_1.GameResources.getTextures(data.textureId)[0]);
        }
        const spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas);
        const spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader);
        const metadata = resource.metadata || {};
        const metadataSkeletonScale = metadata ? resource.metadata.spineSkeletonScale : null;
        if (metadataSkeletonScale) {
            spineJsonParser.scale = metadataSkeletonScale;
        }
        this._spineDataCache[name] = spineJsonParser.readSkeletonData(resource.data);
        return this._spineDataCache[name];
    }
    static getAllRegionNamesFromSpineData(spineRawJson) {
        let names = [];
        for (let skinKey in spineRawJson.skins) {
            const skin = spineRawJson.skins[skinKey];
            const textureNames = this.findTexturesInSkin(skin);
            names = names.concat(textureNames);
        }
        return names;
    }
    static findTexturesInSkin(skin) {
        let textureNames = [];
        for (let slotKey in skin) {
            const slot = skin[slotKey];
            for (let attachmentKey in slot) {
                const attachment = slot[attachmentKey];
                if (attachment.type && attachment.type != "mesh") {
                    //Slot is bounding box, clipping, path or point. Skip.
                    continue;
                }
                if (attachment.type == "mesh" || (attachment.width && attachment.height)) {
                    //has texture
                    let textureName;
                    if (attachment.path) {
                        textureName = attachment.path;
                    }
                    else if (attachment.name) {
                        textureName = attachment.name;
                    }
                    else {
                        textureName = attachmentKey;
                    }
                    textureNames.push(textureName);
                }
                else {
                    //is skin placeholder
                    const skinTextureNames = SpineAssetParser.findTexturesInSkin(attachment);
                    textureNames = textureNames.concat(skinTextureNames);
                }
            }
        }
        return textureNames;
    }
    static removeDuplicates(textureRegionNames) {
        const cleanArray = [];
        for (let i = 0; i < textureRegionNames.length; i++) {
            const name = textureRegionNames[i];
            if (cleanArray.indexOf(name) < 0) {
                cleanArray.push(name);
            }
        }
        return cleanArray;
    }
}
exports.SpineAssetParser = SpineAssetParser;
//# sourceMappingURL=SpineAssetParser.js.map