"use strict";
/**
 * Created by jonas on 2020-06-12.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardInput = void 0;
const APISettingsSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APISettingsSystem");
const SlotKeypad_1 = require("../../SlotKeypad");
class KeyboardInput {
    constructor(api, keypad) {
        this._boundEvents = false;
        this.onKeyUp = (event) => {
            var _a;
            if (event.key === " ") {
                if (SlotKeypad_1.SlotKeypad.autoplay.isAutoplayRound || ((_a = SlotKeypad_1.SlotKeypad.promoPlugin) === null || _a === void 0 ? void 0 : _a.isActionSpinRound)) {
                    return;
                }
                this._keypad.clickSpin();
            }
        };
        this._api = api;
        this._keypad = keypad;
        this._api.settings.default(APISettingsSystem_1.APISetting.USE_SPACE_TO_SPIN, true);
        this._api.settings.on(APISettingsSystem_1.APISetting.USE_SPACE_TO_SPIN, () => this.update());
        this.update();
    }
    update() {
        const enabled = this._api.settings.get(APISettingsSystem_1.APISetting.USE_SPACE_TO_SPIN);
        if (enabled && !this._boundEvents) {
            this.bindEvents();
        }
        if (!enabled && this._boundEvents) {
            this.unbindEvents();
        }
    }
    bindEvents() {
        window.addEventListener('keyup', this.onKeyUp);
        this._boundEvents = true;
    }
    unbindEvents() {
        window.removeEventListener('keyup', this.onKeyUp);
        this._boundEvents = false;
    }
}
exports.KeyboardInput = KeyboardInput;
//# sourceMappingURL=KeyboardInput.js.map