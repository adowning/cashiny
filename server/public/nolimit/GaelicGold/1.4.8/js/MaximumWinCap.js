"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaximumWinCap = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
class MaximumWinCap {
    constructor(api) {
        api.events.on(APIEventSystem_1.APIEvent.INIT, (data) => {
            if (data.maxGambleExposure != undefined) {
                this._maxGambleExposure = api.currency.format(data.maxGambleExposure, MaximumWinCap.MAXIMUM_GAMBLE_EXPOSURE_FORMAT_OPTIONS);
            }
        });
        api.events.on("maximumWinCap", (cap) => {
            this._maximumWinCap = api.currency.format(cap, MaximumWinCap.MAXIMUM_WIN_CAP_FORMAT_OPTIONS);
        });
    }
    updateScreen(screen) {
        screen.find('.win-cap').forEach((wc) => wc.innerHTML = this._maximumWinCap);
        screen.find('.maxGambleExposure').forEach((wc) => wc.innerHTML = this._maxGambleExposure);
    }
}
MaximumWinCap.MAXIMUM_WIN_CAP_FORMAT_OPTIONS = { precision: 0, thousandSeparator: '&thinsp;' };
MaximumWinCap.MAXIMUM_GAMBLE_EXPOSURE_FORMAT_OPTIONS = { precision: 0, thousandSeparator: '&thinsp;' };
exports.MaximumWinCap = MaximumWinCap;
//# sourceMappingURL=MaximumWinCap.js.map