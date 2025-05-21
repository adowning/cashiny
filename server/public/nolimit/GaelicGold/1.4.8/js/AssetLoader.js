"use strict";
/**
 * Class description
 *
 * Created: 2017-11-10
 * @author jonas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetLoader = void 0;
const Asset_1 = require("./Asset");
const TextureParser_1 = require("./TextureParser");
const EventHandler_1 = require("../../event/EventHandler");
const AssetLoaderEvent_1 = require("./AssetLoaderEvent");
const ErrorEvent_1 = require("../../error/event/ErrorEvent");
const ResourcesGroupName_1 = require("../ResourcesGroupName");
const GameSetting_1 = require("../../setting/GameSetting");
const SpineAssetParser_1 = require("./SpineAssetParser");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
class AssetLoader {
    constructor(baseUrl) {
        this._baseUrl = baseUrl;
        this.createLoader();
    }
    loadResourceGroup(resourceGroup, assetGroups) {
        this._loadLoopIndex = 0;
        this._totalAutoLoadLoops = 0;
        this._resourceGroup = resourceGroup;
        if (assetGroups == null) {
            console.warn("AssetLoader.loadResourceGroup, assetGroups is null");
            this._loadLoopIndex = 1;
            this.dispatchLoadLoopComplete();
            this.dispatchAllLoopsComplete();
            return;
        }
        this._assetsGroups = assetGroups;
        for (let assetGroup of this._assetsGroups) {
            if (assetGroup.autoLoad == null) {
                assetGroup.autoLoad = GameSetting_1.GameSetting.getDefaultQualities().concat();
            }
            assetGroup.autoLoad.unshift(Asset_1.AssetQualityLevel.META);
            this._totalAutoLoadLoops = this._totalAutoLoadLoops < assetGroup.autoLoad.length ? assetGroup.autoLoad.length : this._totalAutoLoadLoops;
            if (assetGroup.animations) {
                this._textureParser.addAnimationRegister(assetGroup.animations);
            }
        }
        this.autoLoadLevel();
    }
    createLoader() {
        this._loader = new PIXI.Loader(undefined, 10000);
        this._textureParser = new TextureParser_1.TextureParser(this._loader);
        this._spineAssetParser = new SpineAssetParser_1.SpineAssetParser(this._loader);
        const blobParser = this._loader._afterMiddleware[0];
        const textureParser = this._loader._afterMiddleware[1];
        const bitmapFontParser = this._loader._afterMiddleware[2];
        const spriteSheetParser = this._loader._afterMiddleware[3];
        const spineParser = this._loader._afterMiddleware[4];
        this._loader._afterMiddleware = [];
        this._loader._afterMiddleware.push(blobParser);
        //(<any>this._loader)._afterMiddleware.push(textureParser);
        this._loader._afterMiddleware.push(bitmapFontParser);
        // (<any>this._loader)._afterMiddleware.push(spriteSheetParser);
        // (<any>this._loader)._afterMiddleware.push(spineParser);
        this._loader.use((resource, next) => this._textureParser.parseResource(resource, next));
        this._loader.use((resource, next) => this._spineAssetParser.parseResource(resource, next));
        this._loader.onProgress.add((loader, resource) => this.onLoaderProgress(loader, resource));
        this._loader.onError.add((error, loader, resource) => AssetLoader.onLoaderError(error, loader, resource));
    }
    addGroupToLoader(assetGroup) {
        const quality = assetGroup.autoLoad.shift();
        if (quality == undefined) {
            return 0;
        }
        let assetsAddedCount = 0;
        for (let asset of assetGroup.assets) {
            let variant = asset.variants[quality];
            if (variant) {
                this._loader.add(variant.name, this._baseUrl + variant.url);
                assetsAddedCount++;
            }
        }
        return assetsAddedCount;
    }
    autoLoadLevel() {
        let assetsAddedCount = 0;
        for (let i = 0; i < this._assetsGroups.length; i++) {
            assetsAddedCount += this.addGroupToLoader(this._assetsGroups[i]);
        }
        if (assetsAddedCount > 0) {
            this._loader.load((loader, resources) => this.onLevelLoaded(loader, resources));
        }
        else {
            this.onLevelLoaded(this._loader, this._resources);
        }
    }
    onLevelLoaded(loader, resources) {
        loader.reset();
        this.dispatchLoadLoopComplete();
        if (this._loadLoopIndex < this._totalAutoLoadLoops - 1) {
            this._loadLoopIndex++;
            this.autoLoadLevel();
            return;
        }
        //this._textureParser.destroyOldBaseTextures();
        this.dispatchAllLoopsComplete();
    }
    dispatchAllLoopsComplete() {
        Logger_1.Logger.logDev(`%cAssetLoader.dispatchAllLoopsComplete resourceGroup:${this._resourceGroup} , loadLoop: ${this._loadLoopIndex}`, 'background:#99ea99;');
        EventHandler_1.EventHandler.dispatchEvent(new AssetLoaderEvent_1.AssetLoaderEvent(AssetLoaderEvent_1.AssetLoaderEvent.ALL_LEVELS_COMPLETE, this._resourceGroup, this._loadLoopIndex));
    }
    dispatchLoadLoopComplete() {
        Logger_1.Logger.logDev(`%cAssetLoader.dispatchLoadLoopComplete resourceGroup:${this._resourceGroup} , loadLoop: ${this._loadLoopIndex}`, 'background:#ddffdd;');
        if (this._resourceGroup === ResourcesGroupName_1.ResourcesGroupName.INTRO) {
            this._textureParser.ready = true;
        }
        EventHandler_1.EventHandler.dispatchEvent(new AssetLoaderEvent_1.AssetLoaderEvent(AssetLoaderEvent_1.AssetLoaderEvent.LEVEL_COMPLETE, this._resourceGroup, this._loadLoopIndex));
    }
    getTextures(name) {
        return this._textureParser.getFrameTextures(name);
    }
    getSpineAsset(name) {
        return this._spineAssetParser.getSpineAsset(name);
    }
    /**
     * On load progress handler
     *
     * @param loader
     * @param resource
     */
    onLoaderProgress(loader, resource) {
        //const progress:number = loader.progress;
        //const resourceLoaded:PIXI.loaders.Resource = resource;
        //progress bar?
        this.dispatchProgress(loader.progress);
    }
    dispatchProgress(progress) {
        EventHandler_1.EventHandler.dispatchEvent(new AssetLoaderEvent_1.AssetLoaderEvent(AssetLoaderEvent_1.AssetLoaderEvent.PROGRESS, this._resourceGroup, this._loadLoopIndex, progress));
    }
    /**
     * On load error handler
     * @param error
     * @param loader
     * @param resource
     */
    static onLoaderError(error, loader, resource) {
        const errorMessage = error.message;
        Logger_1.Logger.logDev(error.message, loader, resource);
        if (GameSetting_1.GameSetting.isDevMode == false) {
            EventHandler_1.EventHandler.dispatchEvent(new ErrorEvent_1.ErrorEvent(ErrorEvent_1.ErrorEvent.ERROR, errorMessage, ErrorEvent_1.ErrorEvent.ASSET_LOAD_ERROR));
        }
    }
    halt() {
        this._loader.destroy();
    }
}
exports.AssetLoader = AssetLoader;
//# sourceMappingURL=AssetLoader.js.map