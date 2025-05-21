"use strict";
/**
 * Created by Ning Jiang on 11/24/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenManager = void 0;
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
class ScreenManager {
    constructor() {
        this._screens = [];
        const factoryMethods = GameModuleConfig_1.GameModuleConfig.instance.SCREENS;
        if (factoryMethods) {
            for (let i = 0; i < factoryMethods.length; i++) {
                this._screens.push(factoryMethods[i]());
            }
        }
    }
    tryPlayScreen() {
        for (let i = 0; i < this._screens.length; i++) {
            if (this._screens[i].isTriggered) {
                this._screens[i].start();
                return true;
            }
        }
        return false;
    }
}
exports.ScreenManager = ScreenManager;
//# sourceMappingURL=ScreenManager.js.map