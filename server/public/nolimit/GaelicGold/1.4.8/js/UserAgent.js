"use strict";
/**
 * Created by Ning Jiang on 11/23/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAgent = exports.isIDeviceDependentConfig = exports.isIOrientationDependentConfig = void 0;
const GameConfig_1 = require("../gameconfig/GameConfig");
const NolimitConfig_1 = require("../gameconfig/NolimitConfig");
const StageManager_1 = require("../stage/StageManager");
const APIOptions_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIOptions");
function isIOrientationDependentConfig(value) {
    return value.landscape !== undefined;
}
exports.isIOrientationDependentConfig = isIOrientationDependentConfig;
function isIDeviceDependentConfig(value) {
    return value.desktop !== undefined;
}
exports.isIDeviceDependentConfig = isIDeviceDependentConfig;
class UserAgent {
    constructor(apiAdapter) {
        if (UserAgent._instance) {
            debugger;
            throw new Error("Error: UserAgent.constructor() - Instantiation failed: Singleton.");
        }
        this._apiAdapter = apiAdapter;
        this._deviceName = this._apiAdapter.getDevice();
        UserAgent._instance = this;
    }
    static get deviceName() {
        return UserAgent._instance._deviceName ? UserAgent._instance._deviceName : UserAgent.defaultDeviceName;
    }
    static get defaultDeviceName() {
        return GameConfig_1.GameConfig.instance.DEFAULT_DEVICE_NAME != undefined ? GameConfig_1.GameConfig.instance.DEFAULT_DEVICE_NAME : APIOptions_1.Device.DESKTOP;
    }
    static get isMobile() {
        return UserAgent.deviceName === APIOptions_1.Device.MOBILE;
    }
    static get forceCanvas() {
        // if(navigator.appVersion.indexOf('Edge/') > -1) {
        //     return true;
        // }
        const gameForceCanvas = GameConfig_1.GameConfig.instance.FORCE_CANVAS != undefined ? GameConfig_1.GameConfig.instance.FORCE_CANVAS : false;
        const runTimeForceCanvas = NolimitConfig_1.NolimitConfig.forceCanvas;
        return gameForceCanvas || runTimeForceCanvas;
    }
    static getDeviceDependentValue(value) {
        const orientationConfig = value[UserAgent.deviceName] != null ? value[UserAgent.deviceName] : value.desktop;
        return UserAgent.getOrientationDependentValue(orientationConfig);
    }
    static getOrientationDependentValue(value) {
        return value[StageManager_1.StageManager.orientation] != null ? value[StageManager_1.StageManager.orientation] : value.landscape;
    }
}
exports.UserAgent = UserAgent;
//# sourceMappingURL=UserAgent.js.map