"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceIdHandler = void 0;
const APIEventSystem_1 = require("../../../interfaces/APIEventSystem");
const APISettingsSystem_1 = require("../../../interfaces/APISettingsSystem");
/**
 * Created by Jonas Wålekvist on 2022-11-08.
 */
class BalanceIdHandler {
    get balanceId() {
        return this._balanceId;
    }
    set balanceId(value) {
        this._balanceId = value;
        if (this._balanceId != undefined) {
            this.api.settings.set(APISettingsSystem_1.APISetting.BALANCE_ID, this._balanceId);
            if (!this.hasAddedInjectCallback) {
                this.hasAddedInjectCallback = true;
                this.api.betHandler.addBetDataInjectCallback((data) => this.injectBalanceIdCallback(data));
            }
        }
        else {
            this.api.settings.remove(APISettingsSystem_1.APISetting.BALANCE_ID);
        }
    }
    constructor(api) {
        this.hasAddedInjectCallback = false;
        this.api = api;
        this.api.settings.remove(APISettingsSystem_1.APISetting.BALANCE_ID);
        api.events.on(APIEventSystem_1.APIEvent.SET_BALANCE_ID, (value) => {
            this.balanceId = value;
        });
    }
    injectBalanceIdCallback(betData) {
        if (this.balanceId == undefined) {
            return betData;
        }
        if (betData.data) {
            betData.data.balanceId = this.balanceId;
        }
        else {
            betData.data = {
                balanceId: this.balanceId
            };
        }
        return betData;
    }
}
exports.BalanceIdHandler = BalanceIdHandler;
//# sourceMappingURL=BalanceIdHandler.js.map