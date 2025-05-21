"use strict";
/**
 * Created by Jerker Nord on 2016-04-11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageManager = void 0;
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameConfig_1 = require("../gameconfig/GameConfig");
const GameSetting_1 = require("../setting/GameSetting");
const MathHelper_1 = require("../utils/MathHelper");
const StageEvent_1 = require("./event/StageEvent");
const LayerScaleOption_1 = require("./LayerScaleOption");
const Orientation_1 = require("./Orientation");
const ScalableLayer_1 = require("./ScalableLayer");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const SlotGame_1 = require("../SlotGame");
class StageManager extends PIXI.Container {
    static get stage() {
        return StageManager._stage;
    }
    static set renderer(renderer) {
        this._renderer = renderer;
    }
    static get renderer() {
        return this._renderer;
    }
    static get devicePixelRatio() {
        return StageManager.renderer.resolution;
    }
    static get orientation() {
        return this._orientation;
    }
    static get resizeData() {
        return StageManager._prevResizeData;
    }
    constructor() {
        super();
        StageManager.renderer = NolimitApplication_1.NolimitApplication.pixiApp.renderer;
        this.createStage();
    }
    createStage() {
        StageManager._stage = this;
        StageManager._layers = {};
        const layersConfig = GameConfig_1.GameConfig.instance.LAYERS;
        for (let layerKey in layersConfig) {
            const layer = new ScalableLayer_1.ScalableLayer(layersConfig[layerKey]);
            StageManager._stage.addChild(layer);
            StageManager._layers[layersConfig[layerKey].name] = layer;
        }
        NolimitApplication_1.NolimitApplication.addLayer("StageManager", StageManager._stage);
    }
    addEventListeners() {
        //EventHandler.addFirstEventListener(this, StageEvent.CONTAINER_RESIZED, (event:GameEvent) => this.onResizeInternal(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, StageEvent_1.StageEvent.ADD_TO_RENDER_LOOP, (event) => this.onAddToRenderLoop(event.params[0]));
        EventHandler_1.EventHandler.addFirstEventListener(this, StageEvent_1.StageEvent.LEFT_HANDED_SETTING, (event) => this.onLeftHandedSetting(event.params[0]));
    }
    isResizeDataEqual(a, b) {
        if (!a || !b) {
            return false;
        }
        if (a.orientation != b.orientation) {
            return false;
        }
        if (a.width != b.width) {
            return false;
        }
        if (a.height != b.height) {
            return false;
        }
        if (a.top != b.top) {
            return false;
        }
        if (a.bottom != b.bottom) {
            return false;
        }
        if (a.left != b.left) {
            return false;
        }
        if (a.right != b.right) {
            return false;
        }
        return true;
    }
    onResize() {
        let legacyKeypadHeight = NolimitApplication_1.NolimitApplication.isLandscape ? 100 : 238;
        legacyKeypadHeight = SlotGame_1.SlotGame.keypad.showing ? legacyKeypadHeight : 0;
        const data = {
            top: 0,
            bottom: NolimitApplication_1.NolimitApplication.screenBounds.height - legacyKeypadHeight,
            left: 0,
            right: NolimitApplication_1.NolimitApplication.screenBounds.width,
            width: NolimitApplication_1.NolimitApplication.screenBounds.width,
            height: NolimitApplication_1.NolimitApplication.screenBounds.height,
            orientation: NolimitApplication_1.NolimitApplication.isLandscape ? Orientation_1.Orientation.LANDSCAPE : Orientation_1.Orientation.PORTRAIT,
            isLeftHanded: GameSetting_1.GameSetting.isLeftHanded
        };
        this.onResizeInternal(data);
    }
    onResizeInternal(data) {
        if (this.isResizeDataEqual(StageManager._prevResizeData, data)) {
            return;
        }
        Logger_1.Logger.logDev(`StageManager.onResize():ratio = ${window.devicePixelRatio}, l = ${data.left}, r = ${data.right}, t = ${data.top}, b = ${data.bottom}, w = ${data.width}, h = ${data.height}, o = ${data.orientation}.`);
        StageManager._prevResizeData = data;
        StageManager._orientation = data.orientation;
        if (StageManager.legacyScaling) {
            StageManager._stage.position.set(NolimitApplication_1.NolimitApplication.screenBounds.left, NolimitApplication_1.NolimitApplication.screenBounds.top);
            StageManager.scaleLayers(data);
        }
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.STAGE_RESIZED, data));
    }
    onLeftHandedSetting(setting) {
        if (StageManager._prevResizeData) {
            StageManager._prevResizeData.isLeftHanded = setting;
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(StageEvent_1.StageEvent.STAGE_RESIZED, StageManager._prevResizeData));
        }
    }
    /**
     * Scale/relocate each layer.
     * @param {IResizeData} data
     */
    static scaleLayers(data) {
        const scaleDecimals = 4;
        for (let name in StageManager._layers) {
            const layer = StageManager.getLayer(name);
            if (layer.method == LayerScaleOption_1.ScaleMethod.NONE || layer.target == LayerScaleOption_1.ScaleTarget.NONE) {
                continue;
            }
            let scale = 1;
            let targetSize;
            if (layer.target == LayerScaleOption_1.ScaleTarget.STAGE) {
                targetSize = new PIXI.Rectangle(data.left, data.top, (data.right - data.left), (data.bottom - data.top));
            }
            else {
                targetSize = new PIXI.Rectangle(data.left, data.top, data.width, data.height);
            }
            if (layer.method == LayerScaleOption_1.ScaleMethod.FILL) {
                scale = MathHelper_1.MathHelper.ceilToDecimals(Math.max((targetSize.width / layer.frame.width), targetSize.height / layer.frame.height), scaleDecimals);
            }
            else {
                scale = MathHelper_1.MathHelper.floorToDecimals(Math.min((targetSize.width / layer.frame.width), targetSize.height / layer.frame.height), scaleDecimals);
            }
            let left = Math.floor((targetSize.width - layer.frame.width * scale) * layer.placement.x - layer.frame.x * scale) + data.left;
            let top = Math.floor((targetSize.height - layer.frame.height * scale) * layer.placement.y - layer.frame.y * scale) + data.top;
            layer.scale.set(scale, scale);
            layer.position.set(left, top);
        }
    }
    onAddToRenderLoop(callback) {
        this._renderCallbacks.push(callback);
    }
    animate() {
        for (let i = 0; i < this._renderCallbacks.length; i++) {
            this._renderCallbacks[i]();
        }
        if (StageManager.skipFrame() == false) {
            StageManager.renderer.render(StageManager._stage);
        }
    }
    static getLayer(name) {
        return StageManager._layers[name];
    }
}
StageManager._orientation = Orientation_1.Orientation.NONE;
StageManager.skipFrame = () => { return false; };
StageManager._prevResizeData = null;
StageManager.legacyScaling = false;
exports.StageManager = StageManager;
//# sourceMappingURL=StageManager.js.map