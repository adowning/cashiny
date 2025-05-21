"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyUtils = void 0;
const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
/**
 * Created by jonas on 2023-09-14.
 */
class CurrencyUtils {
    constructor() {
    }
    static formatWithDecimalCutOff(value) {
        const minimumPrecision = (value < PromoPanelConfig_1.PromoPanelConfig.NO_DECIMALS_CUTOFF_POINT || value % 1 != 0) ? 2 : 0;
        return NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.currency.format(value, { minimumPrecision: minimumPrecision });
    }
    static format(value) {
        return NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.currency.format(value, { minimumPrecision: 2 });
    }
    static formatValueWithDecimalCutOff(value) {
        const minimumPrecision = (value < PromoPanelConfig_1.PromoPanelConfig.NO_DECIMALS_CUTOFF_POINT || value % 1 != 0) ? 2 : 0;
        return NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.currency.formatValue(value, { minimumPrecision: minimumPrecision });
    }
    /**
     * Trick to limit decimals but only if  necessary.
     * https://stackoverflow.com/questions/32229667/have-max-2-decimal-places
     * @param value
     * @param decimals
     */
    static toFixedIfNecessary(value, decimals) {
        return +parseFloat("" + value).toFixed(decimals) + "";
    }
}
exports.CurrencyUtils = CurrencyUtils;
//# sourceMappingURL=CurrencyUtils.js.map