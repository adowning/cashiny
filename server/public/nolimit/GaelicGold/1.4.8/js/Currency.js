"use strict";
/**
 * Created by Ning Jiang on 6/23/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Currency = void 0;
const EventHandler_1 = require("../event/EventHandler");
const BalanceEvent_1 = require("./event/BalanceEvent");
class Currency {
    constructor(apiAdapter) {
        if (Currency._instance) {
            debugger;
            throw new Error("Error: Currency.constructor() - Instantiation failed: Singleton.");
        }
        Currency._instance = this;
        Currency._instance._apiAdapter = apiAdapter;
        Currency._instance._playerCurrency = {
            before: true,
            symbol: "",
            code: ""
        };
        EventHandler_1.EventHandler.addEventListener(this, BalanceEvent_1.BalanceEvent.CURRENCY, (event) => Currency.onCurrency(event.params[0]));
    }
    static onCurrency(playerCurrency) {
        if (playerCurrency.before !== null) {
            Currency._instance._playerCurrency.before = playerCurrency.before;
        }
        if (playerCurrency.symbol !== null) {
            if (Currency._instance._apiAdapter.hideCurrency) {
                Currency._instance._playerCurrency.symbol = "";
            }
            else {
                Currency._instance._playerCurrency.symbol = playerCurrency.symbol;
            }
        }
        if (playerCurrency.code !== null) {
            if (Currency._instance._apiAdapter.hideCurrency) {
                Currency._instance._playerCurrency.code = "";
            }
            else {
                Currency._instance._playerCurrency.code = playerCurrency.code;
            }
        }
    }
    // format the amount with currency sign.
    static format(amount, options) {
        return Currency._instance._apiAdapter.formatCurrency(amount, options);
    }
    // format only the number with out currency sign.
    static formatValue(amount, options) {
        return Currency._instance._apiAdapter.formatCurrencyValue(amount, options);
    }
    static getPlayerCurrency() {
        return Currency._instance._playerCurrency;
    }
}
exports.Currency = Currency;
//# sourceMappingURL=Currency.js.map