"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSettingsModel = void 0;
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const ASEnums_1 = require("../../../enums/ASEnums");
/**
 * Created by jonas on 2023-06-14.
 */
class ASSettingsModel {
    constructor() {
        this.STOP_ON_BONUS = "stopOnBonus";
        this.callbacks = {};
        this._stopOnBonus = true;
        this._stopOnBonus = NolimitPromotionPlugin_1.NolimitPromotionPlugin.getFromLocalStorage(ASEnums_1.LocalStorageSettingsKey.AS_STOP_ON_BONUS, this._stopOnBonus);
    }
    addCallback(key, cb) {
        this.callbacks[key] = this.callbacks[key] || [];
        this.callbacks[key].push(cb);
    }
    triggerCallback(key, value) {
        if (this.callbacks[key]) {
            for (let cb of this.callbacks[key]) {
                cb(value);
            }
        }
    }
    get stopOnBonus() {
        return this._stopOnBonus;
    }
    set stopOnBonus(value) {
        this._stopOnBonus = value;
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.saveToLocalStorage(ASEnums_1.LocalStorageSettingsKey.AS_STOP_ON_BONUS, value);
        this.triggerCallback(this.STOP_ON_BONUS, value);
    }
}
exports.ASSettingsModel = ASSettingsModel;
//# sourceMappingURL=ASSettingsModel.js.map