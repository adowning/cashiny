"use strict";
/**
 * Created by Ning Jiang on 4/11/2016.
 * Modified by Jonas Wålekvist on  2017-04-27
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameResources = void 0;
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const EventHandler_1 = require("../event/EventHandler");
const GameConfig_1 = require("../gameconfig/GameConfig");
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
const SystemEvent_1 = require("../system/SystemEvent");
const AssetLoader_1 = require("./asset/AssetLoader");
const AssetLoaderEvent_1 = require("./asset/AssetLoaderEvent");
const AssetsConfig_1 = require("./asset/AssetsConfig");
const LoaderEvent_1 = require("./event/LoaderEvent");
const ResourcesGroupName_1 = require("./ResourcesGroupName");
const ErrorEvent_1 = require("../error/event/ErrorEvent");
const UserAgent_1 = require("../useragent/UserAgent");
const SlotGame_1 = require("../SlotGame");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const FontFaceObserver = require("fontfaceobserver");
/**
 * Singleton that reads images.json and can load assets based on device. It also uploads those
 * assets to the GPU if applicable.
 */
class GameResources {
    constructor() {
        this._fontsLoaded = false; // TODO: use promise to replace all the booleans.
        this._introImagesLoaded = false;
        this._configLoaded = false;
        if (GameResources._instance) {
            debugger;
            throw new Error("Error: GameResources.constructor() - Instantiation failed: Singleton.");
        }
        const resourceBaseUrl = GameConfig_1.GameConfig.instance.RESOURCE_BASE_URL != undefined ? GameConfig_1.GameConfig.instance.RESOURCE_BASE_URL : GameResources._DEFAULT_RESOURCE_BASE_URL;
        this._baseUrl = GameResources.getGamePath() + resourceBaseUrl;
        this._fontConfig = GameModuleConfig_1.GameModuleConfig.instance.FONTS_CONFIG;
        this._assetLoader = new AssetLoader_1.AssetLoader(this._baseUrl);
        EventHandler_1.EventHandler.addEventListener(this, AssetLoaderEvent_1.AssetLoaderEvent.LEVEL_COMPLETE, (event) => this.onAssetLevelComplete(event));
        EventHandler_1.EventHandler.addEventListener(this, AssetLoaderEvent_1.AssetLoaderEvent.ALL_LEVELS_COMPLETE, (event) => this.onAssetAllLevelsComplete(event));
        EventHandler_1.EventHandler.addLastEventListener(this, SystemEvent_1.SystemEvent.CONFIG_LOADED, () => this.onConfigLoaded());
        SlotGame_1.SlotGame.api.events.on(APIEventSystem_1.APIEvent.HALT, () => this._assetLoader.halt());
        GameResources._instance = this;
    }
    /**
     * Gets game path
     * @returns {string} game path
     */
    static getGamePath() {
        let gamePath = '';
        const scriptTags = document.getElementsByTagName('script');
        for (let i = 0; i < scriptTags.length; i++) {
            const path = scriptTags[i].src;
            if (/\/game\.js$/.test(path)) {
                gamePath = path.substr(0, path.length - '/game.js'.length);
                break;
            }
        }
        return gamePath;
    }
    /**
     * Loads all assets in a resource group and uploads relevant assets to GPU.
     * @param resourcesGroup The asset group key.
     */
    loadImages(resourcesGroup) {
        const assetGroups = AssetsConfig_1.AssetsConfig.getResourcesGroup(resourcesGroup);
        for (let assetGroup of assetGroups) {
            if (assetGroup && assetGroup.device && assetGroup.device !== UserAgent_1.UserAgent.deviceName) {
                //Current asset group device doesn't match device. Removed from loading.
                assetGroups.splice(assetGroups.indexOf(assetGroup), 1);
            }
        }
        this._assetLoader.loadResourceGroup(resourcesGroup, assetGroups);
    }
    onAssetLevelComplete(event) {
        //Logger.log(`%cGameResource.onAssetLevelComplete: ${event.name} , ${event.level}`,'background:#ccffcc;');
        if (event.level == 1) {
            this.onImagesLoadComplete(event.name);
        }
    }
    onAssetAllLevelsComplete(event) {
        if (event.name === ResourcesGroupName_1.ResourcesGroupName.INTRO) {
            this.loadImages(ResourcesGroupName_1.ResourcesGroupName.MAIN);
        }
        // Logger.log(`GameResources.onAssetAllLevelsComplete: ${event.name} , ${event.level}` );
    }
    /**
     * On load complete handler. Adds all image resources to renderer.plugins.prepare and uploads them all.
     *
     * @param resourcesGroup The asset group key.
     *
     */
    onImagesLoadComplete(resourcesGroup) {
        Logger_1.Logger.logDev(`%cGameResource.onImagesLoadComplete resourceGroup:${resourcesGroup}`, 'background:#00ff00;');
        if (resourcesGroup === ResourcesGroupName_1.ResourcesGroupName.INTRO) {
            this._introImagesLoaded = true;
            // Only load all fonts on init.
            this.checkInitResourcesLoading();
        }
        else {
            this.dispatchLoadComplete(resourcesGroup);
        }
    }
    /**
     * Dispatches LoaderEvent.RESOURCES_LOADED once loading of assets is complete.
     *
     * @param resourcesGroup The asset group key.
     */
    dispatchLoadComplete(resourcesGroup) {
        //  Logger.log(`%cGameResource.dispatchLoadComplete: ${resourcesGroup}`,'background:#ccffcc;');
        EventHandler_1.EventHandler.dispatchEvent(new LoaderEvent_1.LoaderEvent(LoaderEvent_1.LoaderEvent.RESOURCES_LOADED, resourcesGroup));
    }
    onConfigLoaded() {
        this._configLoaded = true;
        this.checkInitResourcesLoading();
    }
    checkInitResourcesLoading() {
        if (this._introImagesLoaded && this._fontsLoaded && this._configLoaded) {
            this.dispatchLoadComplete(ResourcesGroupName_1.ResourcesGroupName.INTRO);
        }
    }
    /**
     * Loads fonts
     */
    loadFonts() {
        let fontCounter = 0;
        for (let font in this._fontConfig) {
            fontCounter++;
        }
        for (let font in this._fontConfig) {
            const fontConfig = this._fontConfig[font];
            const newStyle = document.createElement("style");
            const fontFamily = "font-family: '" + fontConfig.fontFamily + "';\n";
            let src = "src: ";
            for (let i = 0; i < fontConfig.src.length; i++) {
                const url = "url('" + this._baseUrl + fontConfig.src[i].url + "') ";
                const format = "format('" + fontConfig.src[i].format + "')";
                src = src + url + format + (i === (fontConfig.src.length - 1) ? ";\n" : ",\n");
            }
            //Logger.logDev(`Game is loading font: ${src}`);
            const fontWeight = "font-weight: " + (fontConfig.fontWeight ? fontConfig.fontWeight : FontStatics_1.FontWeight.NORMAL) + ";\n";
            const fontStyle = "font-style: " + (fontConfig.fontStyle ? fontConfig.fontStyle : FontStatics_1.FontStyle.NORMAL) + ";\n";
            const fontFace = "@font-face {\n" + fontFamily + src + fontWeight + fontStyle + "}";
            newStyle.appendChild(document.createTextNode(fontFace));
            document.head.appendChild(newStyle);
            // To preload the font.
            const fontObserver = new FontFaceObserver(fontConfig.fontFamily, {
                weight: fontConfig.fontWeight ? fontConfig.fontWeight : FontStatics_1.FontWeight.NORMAL,
                style: fontConfig.fontStyle ? fontConfig.fontStyle : FontStatics_1.FontStyle.NORMAL
            });
            fontObserver.load(null, 60000).then(() => {
                // Logger.logDev(`Font loaded: ${src}`);
                fontCounter--;
                this.checkFontsLoaded(fontCounter);
            }, () => {
                Logger_1.Logger.logDev(`Font loading failed: ${src}`);
                this.onFontLoadError("Font loading failed");
            });
        }
        this.checkFontsLoaded(fontCounter);
    }
    onFontLoadError(message) {
        EventHandler_1.EventHandler.dispatchEvent(new ErrorEvent_1.ErrorEvent(ErrorEvent_1.ErrorEvent.ERROR, message, ErrorEvent_1.ErrorEvent.FONT_LOAD_ERROR));
        this._assetLoader.halt();
    }
    checkFontsLoaded(fontsLeft) {
        if (fontsLeft === 0 && !this._fontsLoaded) {
            this._fontsLoaded = true;
            Logger_1.Logger.logDev(`%cGameResource.checkFontsLoaded: true`, 'background:#ccffcc;');
            this.checkInitResourcesLoading();
        }
    }
    static getTextures(resourceName) {
        return GameResources._instance._assetLoader.getTextures(resourceName);
    }
    static getSpineAsset(resourceName) {
        return GameResources._instance._assetLoader.getSpineAsset(resourceName);
    }
}
GameResources._DEFAULT_RESOURCE_BASE_URL = "/resources/";
exports.GameResources = GameResources;
//# sourceMappingURL=GameResources.js.map