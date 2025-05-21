"use strict";
/**
 * Created by Ning Jiang on 3/21/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotApiAdapter = void 0;
const SlotApiEventManager_1 = require("./SlotApiEventManager");
const APISettingsSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APISettingsSystem");
const SlotGame_1 = require("../SlotGame");
class SlotApiAdapter {
    constructor(api) {
        if (SlotApiAdapter._instance) {
            debugger;
            throw new Error("Error: SlotApiAdapter.constructor() - Instantiation failed: Singleton.");
        }
        SlotApiAdapter._instance = this;
        this._slotApi = api;
        this._eventManager = new SlotApiEventManager_1.SlotApiEventManager(this._slotApi);
    }
    getReady() {
        this._eventManager.addPluginEventListener();
    }
    translate(text) {
        return this._slotApi.translations.translate(text);
    }
    formatCurrency(amount, options) {
        return this._slotApi.currency.format(amount, options);
    }
    formatCurrencyValue(amount, options) {
        return this._slotApi.currency.formatValue(amount, options);
    }
    get hideCurrency() {
        return this._slotApi.options.hideCurrency;
    }
    isFastSpin() {
        return this.getSettings(APISettingsSystem_1.APISetting.FAST_SPIN);
    }
    isSoundLoopOn() {
        return this.getSettings(APISettingsSystem_1.APISetting.MUSIC);
    }
    isSoundEffectsOn() {
        return this.getSettings(APISettingsSystem_1.APISetting.SFX);
    }
    getSettings(name) {
        return this._slotApi.settings.get(name);
    }
    getDevice() {
        return this._slotApi.options.device;
    }
    getQuality() {
        return this._slotApi.options.quality;
    }
    getSmartLoading() {
        return this._slotApi.options.smartLoading === true;
    }
    getReplayMode() {
        return this._slotApi.options.replay != undefined;
    }
    isLeftHanded() {
        return this.getSettings(APISettingsSystem_1.APISetting.LEFT_HAND_MODE);
    }
    isAutoplayRound() {
        return SlotGame_1.SlotGame.autoPlay.isAutoplayRound;
    }
    isNextAutoplayRound() {
        return SlotGame_1.SlotGame.autoPlay.isAutoplayRound && SlotGame_1.SlotGame.autoPlay.rounds > 0;
    }
}
exports.SlotApiAdapter = SlotApiAdapter;
//# sourceMappingURL=SlotApiAdapter.js.map