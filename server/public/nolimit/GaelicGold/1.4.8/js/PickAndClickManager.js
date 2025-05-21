"use strict";
/**
 * Created by Ning Jiang on 1/28/2019.
 */
// TODO: This is very much duplicated with Screens, need to be refactored.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickAndClickManager = void 0;
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
class PickAndClickManager {
    constructor() {
        this._screens = [];
        const factoryMethods = GameModuleConfig_1.GameModuleConfig.instance.PICK_AND_CLICKS;
        if (factoryMethods) {
            for (let i = 0; i < factoryMethods.length; i++) {
                this._screens.push(factoryMethods[i]());
            }
        }
    }
    tryPlayPickAndClick() {
        for (let i = 0; i < this._screens.length; i++) {
            if (this._screens[i].isTriggered) {
                this._screens[i].start(false);
                return true;
            }
        }
        return false;
    }
    isNextPickAndClick() {
        for (let i = 0; i < this._screens.length; i++) {
            if (this._screens[i].isTriggered) {
                return true;
            }
        }
        return false;
    }
    tryRestoreSelectedPickAndClick() {
        for (let i = 0; i < this._screens.length; i++) {
            if (this._screens[i].isRestoreSelectedTriggered) {
                this._screens[i].start(true);
                return true;
            }
        }
        return false;
    }
}
exports.PickAndClickManager = PickAndClickManager;
//# sourceMappingURL=PickAndClickManager.js.map