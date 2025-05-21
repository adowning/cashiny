"use strict";
/**
 * Created by jonas on 2019-10-02.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitApplication = void 0;
const GSAPCompatabilityWrapper_1 = require("./utils/GSAPCompatabilityWrapper");
Promise.resolve().then(() => __importStar(require("pixi.js")));
const PIXI = __importStar(require("pixi.js"));
const PerformanceFreezeBlur_1 = require("./effects/PerformanceFreezeBlur");
const APIEventSystem_1 = require("./interfaces/APIEventSystem");
const APIOptions_1 = require("./interfaces/APIOptions");
const SvgLoader_1 = require("./loader/SvgLoader");
const NolimitLauncher_1 = require("./NolimitLauncher");
const ApiPlugin_1 = require("./plugins/ApiPlugin");
const SlotStateHandler_1 = require("./plugins/apiplugin/SlotStateHandler");
const Logger_1 = require("./utils/Logger");
const ViewPort_1 = require("./utils/ViewPort");
const gsap_1 = require("gsap");
const APIErrorSystem_1 = require("./interfaces/APIErrorSystem");
const eventSystem = require('@nolimitcity/core/api/event-system');
class NolimitApplication {
    static get hasOpenDialog() {
        return NolimitApplication._instance._hasOpenDialog;
    }
    static get resourcePath() {
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
    static get pixiLoader() {
        return NolimitApplication._instance._pixiApp.loader;
    }
    static get pixiApp() {
        return NolimitApplication._instance._pixiApp;
    }
    static get globalScale() {
        return NolimitApplication._instance._globalScale;
    }
    get frame() {
        return { width: 720, height: 720 };
    }
    get stage() {
        return this._internalStage;
    }
    constructor() {
        this.name = "NolimitApplication";
        this._paused = false;
        this._globalScale = 1;
        this.placement = {
            x: 0.5,
            y: 0.5
        };
        this._layers = {};
        this.onWebGLContextLost = (event) => {
            Logger_1.Logger.logDev(event.type, event);
            NolimitApplication.apiPlugin.events.trigger("error", { code: -1005, message: "Graphics init failed" });
        };
        this.animate = () => {
            this._pixiApp.render();
        };
    }
    fetchPlugins() {
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                NolimitApplication.apiPlugin = plugin;
            }
        }
        if (NolimitApplication.apiPlugin == undefined) {
            return Promise.reject(new Error("NolimitApplication is missing  ApiPlugin"));
        }
        return Promise.resolve();
    }
    init() {
        return new Promise((resolve, reject) => {
            this.fetchPlugins().catch((reason) => {
                return Promise.reject(reason);
            });
            this.addEventListeners();
            NolimitApplication.events = eventSystem.create();
            this._gameElement = NolimitApplication.apiPlugin.getGameElement();
            this.nolimitContainer = document.querySelector('.nolimit.container');
            let resolution = NolimitApplication.apiPlugin.isReplay ? NolimitLauncher_1.NolimitLauncher.instance.settings.maxResolutionReplay : NolimitLauncher_1.NolimitLauncher.instance.settings.maxResolution;
            resolution = Math.min(resolution, 2); //Clamp to 2, you should not be able to override to higher resolution than 2.
            NolimitApplication.resolution = Math.min(Math.max(window.devicePixelRatio, 1), resolution);
            PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
            try {
                this._pixiApp = new PIXI.Application({
                    autoStart: false,
                    width: 1280,
                    height: 720,
                    autoDensity: false,
                    antialias: false,
                    resolution: NolimitApplication.resolution,
                    sharedTicker: false,
                    backgroundColor: 0x000000
                });
            }
            catch (error) {
                NolimitApplication.apiPlugin.error.trigger(NolimitApplication.apiPlugin.translations.translate("Your device or browser doesn't support WebGL. Please check that WebGL is supported and activated."), APIErrorSystem_1.APIErrorCode.GRAPHICS);
            }
            this._internalStage = new PIXI.Container();
            this._internalStage.name = "Stage";
            this._pixiApp.stage.addChild(this._internalStage);
            this._dialogLayer = new PIXI.Container();
            this._dialogLayer.name = "Dialog";
            this._pixiApp.stage.addChild(this._dialogLayer);
            this._keypadLayer = new PIXI.Container();
            this._keypadLayer.name = "Keypad";
            this._pixiApp.stage.addChild(this._keypadLayer);
            this._gameElement.appendChild(this._pixiApp.renderer.view);
            this._pixiApp.renderer.view.addEventListener("webglcontextlost", this.onWebGLContextLost, false);
            NolimitApplication.svgLoader = new SvgLoader_1.SvgLoader(NolimitApplication.resourcePath, NolimitApplication.resolution);
            NolimitApplication._instance = this;
            this._freezeBlur = new PerformanceFreezeBlur_1.PerformanceFreezeBlur(this._internalStage);
            resolve(this);
        });
    }
    destroyRenderer() {
        GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.pauseGlobalTimeline();
        this._pixiApp.renderer.view.parentNode.removeChild(this._pixiApp.renderer.view);
        NolimitApplication.pixiApp.renderer.destroy();
    }
    reInitRenderer() {
        NolimitApplication.resolution = Math.min(Math.max(window.devicePixelRatio, 1), 2);
        try {
            this._pixiApp = new PIXI.Application({
                autoStart: false,
                width: 1280,
                height: 720,
                autoDensity: false,
                antialias: false,
                resolution: NolimitApplication.resolution,
                sharedTicker: false,
                backgroundColor: 0x000000
            });
        }
        catch (error) {
            NolimitApplication.apiPlugin.error.trigger(NolimitApplication.apiPlugin.translations.translate("Your device or browser doesn’t support WebGL. Please check that WebGL is supported and activated."));
        }
        GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.resumeGlobalTimeline();
        NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.RE_INIT_RENDERER_DONE);
        this._pixiApp.stage.addChild(this._internalStage);
        this._pixiApp.stage.addChild(this._dialogLayer);
        this._pixiApp.stage.addChild(this._keypadLayer);
        this._gameElement.appendChild(this._pixiApp.renderer.view);
        this._pixiApp.renderer.view.addEventListener("webglcontextlost", this.onWebGLContextLost, false);
        this.resize();
        ViewPort_1.ViewPort.triggerResize();
    }
    getReady() {
        return new Promise((resolve, reject) => {
            this.resize();
            GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.initTicker(this.animate);
            resolve(this);
        });
    }
    getReadyToStart() {
        return new Promise((resolve, reject) => {
            resolve(this);
        });
    }
    start() {
        return new Promise((resolve, reject) => {
            resolve(this);
        });
    }
    destroy() {
        ViewPort_1.ViewPort.shutDown();
        GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.removeTicker(this.animate);
        this._pixiApp.destroy(true, { children: true, texture: true, baseTexture: true });
        console.log("NolimitApp destroy");
    }
    addEventListeners() {
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.CONFIG, (config) => {
            const ratio = config.size.width / config.size.height;
            if (NolimitApplication.apiPlugin.options.device == APIOptions_1.Device.DESKTOP) {
                ViewPort_1.ViewPort.confineToRatio(this.nolimitContainer, ratio);
            }
            ViewPort_1.ViewPort.onResize((width, height) => {
                //Calculate global scale (used for html scaling and such)
                const scale = Math.min((width / this.frame.width), height / this.frame.height);
                this._globalScale = scale;
                if (this.nolimitContainer != null) {
                    this.nolimitContainer.style.fontSize = (10 * scale) + "px";
                }
                //Calculating renderer size
                let rendererWidth = config.size.width;
                let rendererHeight = config.size.height;
                if (width >= config.size.width && height >= config.size.height) {
                    const landscape = width >= height;
                    let newRatio = Math.max(width, height) / Math.min(width, height); //Ratio is calculated as width/height relationship and later flipped for portrait
                    rendererWidth = rendererHeight * newRatio;
                    if (!landscape) {
                        const temp = rendererWidth;
                        rendererWidth = rendererHeight;
                        rendererHeight = temp;
                    }
                }
                else {
                    //If screen is smaller that standard size, we use that smaller size for the renderer to minimize rendering performance impact.
                    rendererWidth = width;
                    rendererHeight = height;
                }
                //renderer.resize will set his._pixiApp.screenWidth /screenHeight to the actual value and apply the resolution multiplier to the renderer.
                this._pixiApp.renderer.resize(rendererWidth, rendererHeight);
                //This scales the dom element to the full size of the container with css regardless of renderer size.
                this._pixiApp.view.style.width = width + "px";
                this._pixiApp.view.style.height = height + "px";
                this.resize();
                //The combined effect of renderer resize and the css is that we "cap" the renderer size to configured game size (1280, 720) * resolution.
                //Resolution in turn is already caped between 1 and 2 in init.
            });
            ViewPort_1.ViewPort.triggerResize();
        });
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.HALT, () => {
            ViewPort_1.ViewPort.shutDown();
            const tl = this.addBlur();
            tl.add(() => {
                GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.removeTicker(this.animate);
            });
            tl.add(() => {
                this._pixiApp.destroy();
            }, 1);
        });
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.PAUSE, () => this.onPause(true));
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.RESUME, () => this.onPause(false));
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.DESTROY_RENDERER, () => this.destroyRenderer());
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.RE_INIT_RENDERER, () => this.reInitRenderer());
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.DIALOG, (data) => this.onApiDialog(data));
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.FREEZE, (pauseTicker) => this.onFreeze(pauseTicker));
        NolimitApplication.apiPlugin.events.on(APIEventSystem_1.APIEvent.UNFREEZE, () => this.onUnFreeze());
    }
    onFreeze(pauseTicker = false) {
        this.addBlur(true);
        if (pauseTicker) {
            GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.pauseGlobalTimeline();
        }
    }
    onUnFreeze() {
        this.removeBlur();
        if (GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.isGlobalTimelinePaused()) {
            GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.resumeGlobalTimeline();
        }
    }
    onApiDialog(data) {
        if (data == "open") {
            this.addBlur(true);
        }
        else {
            this.removeBlur();
        }
    }
    addBlur(disableInteraction = false) {
        return NolimitApplication._instance._freezeBlur.freeze(0.22, disableInteraction);
    }
    removeBlur() {
        return NolimitApplication._instance._freezeBlur.unfreeze(0.22);
    }
    onPause(wantPause) {
        if (this._pauseTl && this._pauseTl.isActive()) {
            this._pauseTl.progress(1);
        }
        this._pauseTl = new gsap_1.TimelineLite();
        if (wantPause && !this._paused) {
            this._paused = true;
            if (!this._hasOpenDialog) {
                this._pauseTl.add(NolimitApplication._instance._freezeBlur.freeze());
            }
            this._pauseTl.add(() => {
                GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.pauseGlobalTimeline();
            }, "+=0.5");
        }
        else if (!wantPause && this._paused) {
            this._paused = false;
            GSAPCompatabilityWrapper_1.GSAPCompatabilityWrapper.resumeGlobalTimeline();
            if (!this._hasOpenDialog) {
                this._pauseTl.add(NolimitApplication._instance._freezeBlur.unfreeze());
            }
        }
    }
    orientationChanged() {
        for (let key in this._layers) {
            const layer = this._layers[key];
            if (layer.onOrientationChanged != undefined) {
                layer.onOrientationChanged();
            }
        }
    }
    resizeLayers() {
        for (let key in this._layers) {
            const layer = this._layers[key];
            if (layer.onResize != undefined) {
                layer.onResize();
            }
        }
    }
    /**
     * Recalculates all dimensions and trigger resize for all layers.
     */
    static resize() {
        NolimitApplication._instance.resize();
    }
    resize() {
        const targetSize = {
            width: this._pixiApp.renderer.screen.width,
            height: this._pixiApp.renderer.screen.height
        };
        const orientationChanged = this.setOrientation(targetSize.width >= targetSize.height);
        let scale = Math.min((targetSize.width / this.frame.width), targetSize.height / this.frame.height);
        let top = (targetSize.height - this.frame.height * scale) * this.placement.y;
        let left = (targetSize.width - this.frame.width * scale) * this.placement.x;
        NolimitApplication.screenBounds = {
            top: Math.round(-top / scale),
            left: Math.round(-left / scale),
            right: Math.round(left / scale) + this.frame.width,
            bottom: Math.round(top / scale) + this.frame.height,
            center: this.frame.width * 0.5,
            width: Math.round(targetSize.width / scale),
            height: Math.round(targetSize.height / scale),
            scale: scale
        };
        this._pixiApp.stage.scale.set(scale, scale);
        this._pixiApp.stage.position.set(Math.round(left), Math.round(top));
        if (orientationChanged) {
            this.orientationChanged();
        }
        this.resizeLayers();
        if (this._currentDialog != null && this._currentDialog.onResize) {
            this._currentDialog.onResize();
        }
        this._freezeBlur.onResize();
        if (orientationChanged) {
            this._freezeBlur.onOrientationChanged();
        }
        NolimitApplication.events.trigger(NolimitApplication.RESIZE);
    }
    setOrientation(isLandscape) {
        if (NolimitApplication.isLandscape != isLandscape) {
            NolimitApplication.isLandscape = isLandscape;
            return true;
        }
        return false;
    }
    static addLayerAt(name, layer, index = 0) {
        NolimitApplication._instance._layers[name] = layer;
        layer.name = name;
        NolimitApplication._instance.stage.addChildAt(layer, index);
        if (name == "Keypad") {
            NolimitApplication._instance._keypadLayer.addChildAt(layer, index);
        }
    }
    static addLayer(name, layer) {
        NolimitApplication._instance._layers[name] = layer;
        layer.name = name;
        NolimitApplication._instance.stage.addChild(layer);
        if (name == "Keypad") {
            NolimitApplication._instance._keypadLayer.addChild(layer);
        }
    }
    static removeLayer(name) {
        if (NolimitApplication._instance._layers[name]) {
            const layer = NolimitApplication._instance.stage.removeChild(NolimitApplication._instance._layers[name]);
            if (name == "Keypad") {
                NolimitApplication._instance._keypadLayer.removeChild(NolimitApplication._instance._layers[name]);
            }
            delete NolimitApplication._instance._layers[name];
            return layer;
        }
        return undefined;
    }
    static getLayerByName(name) {
        return NolimitApplication._instance._layers[name];
    }
    static addDialog(layer, blurGame = false) {
        NolimitApplication.apiPlugin.dialog.lock("PIXIDialog");
        if (NolimitApplication._instance._currentDialog == layer) {
            Logger_1.Logger.warn("Dialog: Doubel trigger dialog. May be due to performance slowdown.");
            return;
            //NolimitApplication.apiPlugin.error.trigger("Dialog error: There is already a dialog");
        }
        if (!NolimitApplication.apiPlugin.slotStates.checkState(SlotStateHandler_1.SlotState.READY)) {
            Logger_1.Logger.warn("Dialog error: game state is not READY");
            return;
            //NolimitApplication.apiPlugin.error.trigger("Dialog error: game state is not READY");
        }
        if (NolimitApplication._instance._currentDialog != null) {
            Logger_1.Logger.warn("Dialog error: There is already a screen");
            return;
            //NolimitApplication.apiPlugin.error.trigger("Dialog error: There is already a dialog");
        }
        NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.SCREEN, "open");
        if (blurGame) {
            NolimitApplication._instance._freezeBlur.freeze();
        }
        NolimitApplication._instance._currentDialog = layer;
        NolimitApplication.events.trigger(NolimitApplication.DIALOG_OPENED);
        NolimitApplication._instance._dialogLayer.addChild(layer);
        NolimitApplication._instance._hasOpenDialog = true;
    }
    static removeDialog(layer, removeBlur = true) {
        if (layer != NolimitApplication._instance._currentDialog) {
            NolimitApplication.apiPlugin.error.trigger("Dialog error: trying to remove dialog that is not current dialog");
        }
        const tl = new gsap_1.TimelineLite({
            onStart: () => {
                NolimitApplication.events.trigger(NolimitApplication.DIALOG_CLOSING);
            },
            onComplete: () => {
                NolimitApplication._instance._hasOpenDialog = false;
                NolimitApplication.apiPlugin.dialog.unlock("PIXIDialog");
                NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.SCREEN, "close");
                NolimitApplication.events.trigger(NolimitApplication.DIALOG_CLOSED);
            }
        });
        tl.add(() => {
            NolimitApplication._instance._currentDialog = null;
            NolimitApplication._instance._dialogLayer.removeChild(layer);
        });
        if (NolimitApplication._instance._freezeBlur.isFrozen && removeBlur) {
            tl.add(NolimitApplication._instance._freezeBlur.unfreeze(), 0);
        }
    }
    static minimizeDialog(layer) {
        if (layer != NolimitApplication._instance._currentDialog) {
            NolimitApplication.apiPlugin.error.trigger("Dialog error: trying to remove dialog that is not current dialog");
        }
        const tl = new gsap_1.TimelineLite({
            onStart: () => {
                NolimitApplication.events.trigger(NolimitApplication.DIALOG_MINIMIZING);
            },
            onComplete: () => {
                NolimitApplication._instance._hasOpenDialog = false;
                NolimitApplication.apiPlugin.dialog.unlock("PIXIDialog");
            }
        });
        tl.add(() => {
            NolimitApplication._instance._currentDialog = null;
            NolimitApplication._instance._dialogLayer.removeChild(layer);
        });
        if (NolimitApplication._instance._freezeBlur.isFrozen) {
            tl.add(NolimitApplication._instance._freezeBlur.unfreeze(), 0);
        }
    }
}
NolimitApplication.DIALOG_OPENED = "dialogOpened";
NolimitApplication.DIALOG_CLOSED = "dialogClosed";
NolimitApplication.DIALOG_CLOSING = "dialogClosing";
NolimitApplication.DIALOG_MINIMIZING = "dialogMinimizing";
NolimitApplication.RESIZE = "resize";
exports.NolimitApplication = NolimitApplication;
//# sourceMappingURL=NolimitApplication.js.map