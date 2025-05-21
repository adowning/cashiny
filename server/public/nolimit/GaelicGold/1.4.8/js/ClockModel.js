"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockModel = void 0;
/**
 * Created by Jonas Wålekvist on 2019-10-25.
 */
const APISettingsSystem_1 = require("../../interfaces/APISettingsSystem");
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const eventSystem = require('@nolimitcity/core/api/event-system');
class ClockModel {
    constructor(api) {
        this.UPDATE = "update";
        this.SETTING_UPDATE = "settingUpdate";
        this._useSessionTime = false;
        this._lastTick = {
            deltaHours: 0,
            deltaMinutes: 0,
            deltaSeconds: 0,
            hours: '00',
            minutes: '00',
            seconds: '00'
        };
        this._api = api;
        this._events = eventSystem.create();
        if (!this._api.options.clock) {
            this._api.settings.set(APISettingsSystem_1.APISetting.CLOCK, false);
        }
        else {
            this._api.settings.set(APISettingsSystem_1.APISetting.CLOCK, true);
        }
        this._api.events.on(APIEventSystem_1.APIEvent.TICK, (data) => this.onApiTick(data));
        this._api.settings.on(APISettingsSystem_1.APISetting.CLOCK, () => this.onClockSettingChanged());
    }
    set useSessionTime(value) {
        this._useSessionTime = value;
    }
    get events() {
        return this._events;
    }
    get shouldShow() {
        return this._api.settings.get(APISettingsSystem_1.APISetting.CLOCK, true) && this._api.options.replay == undefined;
    }
    get sessionTime() {
        return this._lastTick.hours + ':' + this._lastTick.minutes + ':' + this._lastTick.seconds;
    }
    get normalTime() {
        const now = new Date();
        return this.padToTwo(now.getHours()) + ':' + this.padToTwo(now.getMinutes());
    }
    get useSessionTime() {
        return this._useSessionTime;
    }
    get formattedTime() {
        if (this._useSessionTime) {
            return this.sessionTime;
        }
        return this._api.gameClientConfiguration.clockSettings.showSessionTimeUnder ? `${this.normalTime} \n${this.sessionTime}` : `${this.normalTime}`;
    }
    onGameClientConfigurationApplied() {
        this._useSessionTime = this._api.gameClientConfiguration.clockSettings.useSessionTime;
    }
    onApiTick(data) {
        this._lastTick = data;
        this.events.trigger(this.UPDATE);
    }
    padToTwo(num) {
        return ('0' + num).slice(-2);
    }
    onClockSettingChanged() {
        this.events.trigger(this.SETTING_UPDATE);
    }
}
exports.ClockModel = ClockModel;
//# sourceMappingURL=ClockModel.js.map