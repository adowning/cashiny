"use strict";
/**
 * Created by Ning Jiang on 5/4/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalableLayer = void 0;
const GameConfig_1 = require("../gameconfig/GameConfig");
const UserAgent_1 = require("../useragent/UserAgent");
const LayerScaleOption_1 = require("./LayerScaleOption");
class ScalableLayer extends PIXI.Container {
    get method() {
        return UserAgent_1.UserAgent.getDeviceDependentValue(this._method);
    }
    get target() {
        return UserAgent_1.UserAgent.getDeviceDependentValue(this._target);
    }
    get frame() {
        return UserAgent_1.UserAgent.getDeviceDependentValue(this._frame);
    }
    get placement() {
        return UserAgent_1.UserAgent.getDeviceDependentValue(this._placement);
    }
    set customOptions(options) {
        this.processCustomOptions(options);
    }
    constructor(config) {
        super();
        this.name = config.name;
        const scaleOptionConfig = config.scaleOption || (GameConfig_1.GameConfig.instance.DEFAULT_LAYER_SCALE_OPTION || LayerScaleOption_1.LayerScaleOption.FIT_WINDOW);
        this._scaleOption = this.processOptions(scaleOptionConfig);
        this.processCustomOptions(config.customOptions);
    }
    processOptions(option) {
        option = (0, UserAgent_1.isIDeviceDependentConfig)(option) ? option : { desktop: { landscape: option } };
        this.setDeviceDependentPreset(option);
        return option;
    }
    setDeviceDependentPreset(scaleOptions) {
        this._method = { desktop: { landscape: ScalableLayer.getMethodFromPreset() } };
        this._target = { desktop: { landscape: ScalableLayer.getTargetFromPreset() } };
        this._frame = { desktop: { landscape: ScalableLayer.getFrameFromPreset() } };
        this._placement = { desktop: { landscape: ScalableLayer.getPlacementFromPreset() } };
        for (let deviceName in scaleOptions) {
            const device = scaleOptions[deviceName];
            this._method[deviceName] = this._method[deviceName] || {};
            this._target[deviceName] = this._target[deviceName] || {};
            this._frame[deviceName] = this._frame[deviceName] || {};
            this._placement[deviceName] = this._placement[deviceName] || {};
            for (let orientationName in device) {
                if (device.hasOwnProperty(orientationName)) {
                    const option = device[orientationName];
                    this._method[deviceName][orientationName] = ScalableLayer.getMethodFromPreset(option);
                    this._target[deviceName][orientationName] = ScalableLayer.getTargetFromPreset(option);
                    this._frame[deviceName][orientationName] = ScalableLayer.getFrameFromPreset(option);
                    this._placement[deviceName][orientationName] = ScalableLayer.getPlacementFromPreset(option);
                }
            }
        }
    }
    processCustomOptions(customOptions) {
        if (customOptions == undefined) {
            return;
        }
        if (customOptions.method != undefined) {
            this._method = (0, UserAgent_1.isIDeviceDependentConfig)(customOptions.method) ? customOptions.method : { desktop: { landscape: customOptions.method } };
        }
        if (customOptions.target != undefined) {
            this._target = (0, UserAgent_1.isIDeviceDependentConfig)(customOptions.target) ? customOptions.target : { desktop: { landscape: customOptions.target } };
        }
        if (customOptions.frame != undefined) {
            this._frame = (0, UserAgent_1.isIDeviceDependentConfig)(customOptions.frame) ? customOptions.frame : { desktop: { landscape: customOptions.frame } };
        }
        if (customOptions.placement != undefined) {
            this._placement = (0, UserAgent_1.isIDeviceDependentConfig)(customOptions.placement) ? customOptions.placement : { desktop: { landscape: customOptions.placement } };
        }
    }
    static getMethodFromPreset(option) {
        if (option == LayerScaleOption_1.LayerScaleOption.NONE) {
            return LayerScaleOption_1.ScaleMethod.NONE;
        }
        if (option == LayerScaleOption_1.LayerScaleOption.FILL_WINDOW || option == LayerScaleOption_1.LayerScaleOption.FILL_STAGE) {
            return LayerScaleOption_1.ScaleMethod.FILL;
        }
        return LayerScaleOption_1.ScaleMethod.FIT;
    }
    static getTargetFromPreset(option) {
        if (option == LayerScaleOption_1.LayerScaleOption.NONE) {
            return LayerScaleOption_1.ScaleTarget.NONE;
        }
        if (option == LayerScaleOption_1.LayerScaleOption.FILL_STAGE || option == LayerScaleOption_1.LayerScaleOption.FIT_STAGE || option == LayerScaleOption_1.LayerScaleOption.REELS_FIT_STAGE) {
            return LayerScaleOption_1.ScaleTarget.STAGE;
        }
        return LayerScaleOption_1.ScaleTarget.WINDOW;
    }
    static getFrameFromPreset(option) {
        if (option == LayerScaleOption_1.LayerScaleOption.REELS_FIT_STAGE || option == LayerScaleOption_1.LayerScaleOption.REELS_FIT_WINDOW) {
            return ScalableLayer.getReelAreaFrame();
        }
        return ScalableLayer.getGameFrame();
    }
    static getPlacementFromPreset(option) {
        return new PIXI.Point(0.5, 0.5);
    }
    static getGameFrame() {
        return {
            x: 0,
            y: 0,
            width: GameConfig_1.GameConfig.instance.GAME_WIDTH,
            height: GameConfig_1.GameConfig.instance.GAME_HEIGHT
        };
    }
    static getReelAreaFrame() {
        return {
            x: GameConfig_1.GameConfig.instance.REEL_AREA_POS_X,
            y: GameConfig_1.GameConfig.instance.REEL_AREA_POS_Y,
            width: GameConfig_1.GameConfig.instance.REEL_AREA_WIDTH,
            height: GameConfig_1.GameConfig.instance.REEL_AREA_HEIGHT
        };
    }
}
exports.ScalableLayer = ScalableLayer;
//# sourceMappingURL=ScalableLayer.js.map