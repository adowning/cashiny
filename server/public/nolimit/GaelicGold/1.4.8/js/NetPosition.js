"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetPosition = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const APIBetType_1 = require("../../interfaces/APIBetType");
/**
 * Created by Jerker Nord on 2022-02-23.
 */
class NetPosition {
    constructor(api) {
        this._isFeatureBuy = false;
        this._api = api;
        api.events.on(APIEventSystem_1.APIEvent.INIT, () => this.init());
    }
    init() {
        //Disable Net Position container
        this._netPosition = document.querySelector('#net-position');
        if (this._netPosition) {
            this._netPosition.style.display = "none";
        }
        if (this._api.gameClientConfiguration.showNetPosition == true && this._api.isReplay == false) {
            this._api.events.on(APIEventSystem_1.APIEvent.START, () => this.addVisuals());
        }
    }
    addVisuals() {
        this._api.events.on(APIEventSystem_1.APIEvent.BALANCE, (balance) => this.onBalanceUpdate(balance));
        this._api.events.on(APIEventSystem_1.APIEvent.BET, (data) => this.onBet(data));
        this._api.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_BET, (data) => this.onBet(data));
        this._api.events.on(APIEventSystem_1.APIEvent.WIN, (win) => this.onWin(win));
        this._netPosition = document.querySelector('#net-position');
        this._netPositionTranslated = this._api.translations.translate("Net position");
        //Enable Net Position container
        if (this._netPosition) {
            this._netPosition.style.display = "block";
        }
        this.setNetPosition();
    }
    onBet(data) {
        if (data.type == APIBetType_1.APIBetType.FEATURE_BET && data.featureName.indexOf("BOOSTED_BET") == -1) {
            this._isFeatureBuy = true;
        }
        else {
            if (data.type !== APIBetType_1.APIBetType.ZERO_BET && data.type !== APIBetType_1.APIBetType.GAMBLE_BET) {
                this.setNetPosition();
            }
        }
    }
    onWin(win) {
        this.setNetPosition();
    }
    onBalanceUpdate(balance) {
        if (this._isFeatureBuy == true) {
            this._isFeatureBuy = false;
            this.setNetPosition();
        }
    }
    setNetPosition() {
        if (this._netPosition) {
            this._netPosition.innerHTML = this._netPositionTranslated + " " + this._api.currency.format(this._api.realityCheck.getTotalWins() - this._api.realityCheck.getTotalBets());
        }
    }
}
exports.NetPosition = NetPosition;
//# sourceMappingURL=NetPosition.js.map