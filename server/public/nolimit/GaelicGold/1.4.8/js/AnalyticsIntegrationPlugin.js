"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsIntegrationPlugin = void 0;
const NolimitLauncher_1 = require("../../NolimitLauncher");
const ApiPlugin_1 = require("../ApiPlugin");
const AutoPlayPlugin_1 = require("../AutoPlayPlugin");
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const APISettingsSystem_1 = require("../../interfaces/APISettingsSystem");
class AnalyticsIntegrationPlugin {
    constructor() {
        this.name = "AnalyticsIntegration";
    }
    init() {
        return new Promise((resolve, reject) => {
            for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
                if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                    this._api = plugin;
                }
                if ((0, AutoPlayPlugin_1.isAutoPlayPlugin)(plugin)) {
                    this._autoplay = plugin;
                }
            }
            this.addEventListeners();
            resolve(this);
        });
    }
    getReady() {
        return new Promise((resolve, reject) => {
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
    addEventListeners() {
        this._api.settings.any((name, value) => {
            this._api.analytics.event('settings', name, value);
        });
        this._api.events.on(APIEventSystem_1.APIEvent.AUTO_PLAY, () => {
            const rawData = this._autoplay.getRawData();
            const settingsData = this._autoplay.settings;
            for (let key in rawData) {
                this._api.analytics.event(APIEventSystem_1.APIEvent.AUTO_PLAY, key, rawData[key]);
            }
            for (let key in settingsData) {
                this._api.analytics.event(APIEventSystem_1.APIEvent.AUTO_PLAY, key, rawData[key]);
            }
        });
        this._api.events.on(APIEventSystem_1.APIEvent.BET, () => {
            this._api.analytics.event(APISettingsSystem_1.APISetting.FAST_SPIN, this._api.settings.get(APISettingsSystem_1.APISetting.FAST_SPIN));
        });
        this._api.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_BET, () => {
            this._api.analytics.event(APISettingsSystem_1.APISetting.FAST_SPIN, this._api.settings.get(APISettingsSystem_1.APISetting.FAST_SPIN));
        });
    }
}
exports.AnalyticsIntegrationPlugin = AnalyticsIntegrationPlugin;
//# sourceMappingURL=AnalyticsIntegrationPlugin.js.map