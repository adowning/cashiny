"use strict";
/**
 * Created by Pankaj on 2019-12-26.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Communication = void 0;
// const ReplayURLConfig_1 = require("../config/ReplayURLConfig");
// const RequestMethod_1 = require("../enums/RequestMethod");
// const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
// const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
// const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
class Communication {
    constructor(api) {
        this._replayBaseUrl = ReplayURLConfig_1.ReplayURLConfig.BASE_URL_DEFAULT;
        api.events.once(APIEventSystem_1.APIEvent.REPLAY_BASE_URL, (value) => {
            this._replayBaseUrl = value;
        });
    }
    getTopXBetData(operator) {
        return this.connect(this.getBaseURL() + ReplayURLConfig_1.ReplayURLConfig.TOP_X_BET_URL + this.getOperatorURL(operator));
    }
    getTopMonetaryData(operator) {
        return this.connect(this.getBaseURL() + ReplayURLConfig_1.ReplayURLConfig.TOP_MONETARY_URL + this.getOperatorURL(operator));
    }
    getXBetGameSpecificData(gameName, operator) {
        return this.connect(this.getBaseURL() + ReplayURLConfig_1.ReplayURLConfig.TOP_X_BET_URL + this.getOperatorURL(operator) + ReplayURLConfig_1.ReplayURLConfig.GAME_SPECIFIC_URL + gameName);
    }
    getMonetaryGameSpecificData(gameName, operator) {
        return this.connect(this.getBaseURL() + ReplayURLConfig_1.ReplayURLConfig.TOP_MONETARY_URL + this.getOperatorURL(operator) + ReplayURLConfig_1.ReplayURLConfig.GAME_SPECIFIC_URL + gameName);
    }
    getTopListAnyGame(type) {
        return NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.communication.history.topListAnyGame(type);
    }
    getTopListCurrentGame(type) {
        return NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.communication.history.topListCurrentGame(type);
    }
    createXMLHttpRequest(url) {
        const request = new XMLHttpRequest();
        request.open(RequestMethod_1.RequestMethod.GET, url, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.setRequestHeader('Accept', 'application/json');
        return request;
    }
    connect(url) {
        return new Promise((resolve, reject) => {
            const request = this.createXMLHttpRequest(url);
            request.onload = () => {
                const response = JSON.parse(request.responseText);
                if (response.error) {
                    reject(response.error);
                }
                else if (Object.keys(response).length) {
                    resolve(response);
                }
                else {
                    reject(request.responseText);
                }
            };
            request.send();
        });
    }
    getOperatorURL(operator) {
        return operator ? ReplayURLConfig_1.ReplayURLConfig.OPERATOR_SPECIFIC_URL + operator : PromoPanelConfig_1.PromoPanelConfig.EMPTY_STRING;
    }
    getBaseURL() {
        return this._replayBaseUrl + ReplayURLConfig_1.ReplayURLConfig.BASE_PATH;
    }
}
exports.Communication = Communication;
//# sourceMappingURL=Communication.js.map