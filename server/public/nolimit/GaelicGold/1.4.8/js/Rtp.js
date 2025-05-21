"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rtp = exports.isRtpEventData = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const NolimitApplication_1 = require("../../NolimitApplication");
const Logger_1 = require("../../utils/Logger");
function isRtpEventData(value) {
    return (value.single !== undefined || value.min !== undefined || value.max !== undefined || value.fractionDigits !== undefined || value.features !== undefined);
}
exports.isRtpEventData = isRtpEventData;
class Rtp {
    addSimpleFormatter(data, language) {
        return {
            target: 'span.rtp',
            value: Rtp.formatRTP(data, language)
        };
    }
    addFormatters(data, language, targetSuffix) {
        const suffix = targetSuffix != undefined ? ("-" + targetSuffix) : "";
        const result = [];
        if (data.single) {
            result.push({
                target: 'span.rtp' + suffix,
                value: Rtp.formatRTP(data.single, language, data.fractionDigits)
            });
        }
        if (data.min) {
            result.push({
                target: 'span.min-rtp' + suffix,
                value: Rtp.formatRTP(data.min, language, data.fractionDigits)
            });
        }
        if (data.max) {
            result.push({
                target: 'span.max-rtp' + suffix,
                value: Rtp.formatRTP(data.max, language, data.fractionDigits)
            });
        }
        return result;
    }
    addFormattersForMode(data, language) {
        const result = [];
        result.push(...this.addFormatters(data, language));
        if (data.features) {
            for (let key in data.features) {
                result.push(...this.addFormatters(data.features[key], language, key));
            }
        }
        return result;
    }
    constructor(api) {
        this._gameModeRtp = new Map();
        this._api = api;
        api.events.on(APIEventSystem_1.APIEvent.RTP, (data) => this.onRtp(data));
    }
    onRtp(data) {
        const type = typeof data;
        if (type === 'string' || type === 'number') {
            const formatter = [];
            formatter.push(this.addSimpleFormatter(data, this._api.options.language));
            this._gameModeRtp.set("NORMAL", {
                rtpData: {
                    single: data
                },
                formatters: formatter
            });
        }
        else if (type === 'object') {
            if (isRtpEventData(data)) {
                const formatter = [];
                formatter.push(...this.addFormattersForMode(data, this._api.options.language));
                this._gameModeRtp.set("NORMAL", {
                    rtpData: data,
                    formatters: formatter
                });
            }
            else {
                const modeData = data;
                for (let modeKey in modeData) {
                    const modeType = typeof modeData[modeKey];
                    if (modeType === 'string' || modeType === 'number') {
                        const formatter = [];
                        formatter.push(this.addSimpleFormatter(modeData[modeKey], this._api.options.language));
                        this._gameModeRtp.set(modeKey, {
                            rtpData: {
                                single: modeData[modeKey]
                            },
                            formatters: formatter
                        });
                    }
                    else if (isRtpEventData(modeData[modeKey])) {
                        const formatter = [];
                        formatter.push(...this.addFormattersForMode(modeData[modeKey], this._api.options.language));
                        this._gameModeRtp.set(modeKey, {
                            rtpData: modeData[modeKey],
                            formatters: formatter,
                        });
                    }
                }
            }
        }
        this._api.gameInfo.updateValues();
    }
    getFormattedRtp() {
        const mode = this._api.betLevel.getSelectedBetLevelModeName();
        const modeData = this._gameModeRtp.get(mode);
        if (modeData) {
            if (modeData.rtpData.single != undefined) {
                return Rtp.formatRTP(modeData.rtpData.single, this._api.options.language, modeData.rtpData.fractionDigits);
            }
            else if (modeData.rtpData.min != undefined && modeData.rtpData.max != undefined) {
                return Rtp.formatRTP(modeData.rtpData.min, this._api.options.language, modeData.rtpData.fractionDigits) + " - " + Rtp.formatRTP(modeData.rtpData.max, this._api.options.language, modeData.rtpData.fractionDigits);
            }
        }
        Logger_1.Logger.warn("No valid RTP values found");
        return "";
    }
    static formatRTP(value, language, fractionDigits = 2) {
        try {
            return value.toLocaleString(language, {
                style: 'percent',
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits
            });
        }
        catch (error) {
            return value.toLocaleString("en", {
                style: 'percent',
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits
            });
        }
    }
    updateScreen(screen) {
        const mode = this._api.betLevel.getSelectedBetLevelModeName();
        const modeData = this._gameModeRtp.get(mode);
        if (modeData) {
            for (let formatter of modeData.formatters) {
                const result = screen.find(formatter.target);
                for (let element of result) {
                    element.textContent = formatter.value;
                }
            }
        }
        const allModes = NolimitApplication_1.NolimitApplication.apiPlugin.betLevel.getAllowedModeNames();
        for (let modeName of allModes) {
            if (modeName == mode) {
                screen.find('.' + modeName).forEach((c) => c.style.display = "");
            }
            else {
                screen.find('.' + modeName).forEach((c) => c.style.display = 'none');
            }
        }
        const hasLimitToggle = NolimitApplication_1.NolimitApplication.apiPlugin.betLevel.hasCapWinLimitToggle();
        if (!hasLimitToggle) {
            screen.find('.capWinToggle').forEach((c) => c.style.display = "none");
        }
    }
}
exports.Rtp = Rtp;
//# sourceMappingURL=Rtp.js.map