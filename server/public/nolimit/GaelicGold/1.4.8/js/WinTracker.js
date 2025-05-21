"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinTracker = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const APIBetType_1 = require("../../interfaces/APIBetType");
const BonusFeatures_1 = require("./BonusFeatures");
/**
 * Created by jonas on 2020-01-12.
 */
class WinTracker {
    constructor(api) {
        this._pendingWin = false;
        this._previousTotalWins = 0;
        this._winnings = 0;
        this._api = api;
        api.events.on(APIEventSystem_1.APIEvent.PENDING_WIN, () => {
            this._pendingWin = true;
        });
        api.events.on(APIEventSystem_1.APIEvent.BET, (data) => {
            if (data.type === APIBetType_1.APIBetType.NORMAL_BET) {
                this._lastBalance -= parseFloat(data.bet);
            }
            // _lastBalance value fix in case of boosted Bet
            if (data.featureName === BonusFeatures_1.GameFeatureCategory.BOOSTED_BET) {
                this._lastBalance -= parseFloat((+data.bet * 1.1).toFixed(2));
            }
        });
        api.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_BET, (data) => {
            if (data.type === APIBetType_1.APIBetType.NORMAL_BET) {
                this._lastBalance -= parseFloat(data.bet);
            }
        });
        api.events.on(APIEventSystem_1.APIEvent.BALANCE, (balance) => {
            balance = parseFloat(balance);
            if (this._lastBalance && balance > this._lastBalance) {
                this._winnings += balance - this._lastBalance;
            }
            this._lastBalance = balance;
        });
        api.events.on(APIEventSystem_1.APIEvent.DONE, () => {
            this._pendingWin = false;
        });
        api.events.on(APIEventSystem_1.APIEvent.GAMBLE_DONE, () => {
            this._pendingWin = false;
        });
        api.events.on(APIEventSystem_1.APIEvent.FINISH, () => this.triggerWinEvent());
    }
    triggerWinEvent() {
        if (this._api.realityCheck.getTotalWins() > this._previousTotalWins && !this._pendingWin) {
            let win = this._api.realityCheck.getTotalWins() - this._previousTotalWins;
            let lastWin = win.toFixed(2);
            const winningsString = win.toString();
            if (winningsString.indexOf(".") > -1) {
                if ((winningsString.length - winningsString.indexOf(".")) > 3) {
                    lastWin = win.toFixed(4);
                }
            }
            this._previousTotalWins = this._api.realityCheck.getTotalWins();
            this._api.events.trigger(APIEventSystem_1.APIEvent.WIN, parseFloat(lastWin));
        }
    }
    getTotalWinnings() {
        return this._winnings;
    }
}
exports.WinTracker = WinTracker;
//# sourceMappingURL=WinTracker.js.map