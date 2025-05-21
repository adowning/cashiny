"use strict";
/**
 * Created by Jonas Wålekvist on 2019-11-15.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIErrorCode = void 0;
var APIErrorCode;
(function (APIErrorCode) {
    APIErrorCode[APIErrorCode["UNKNOWN"] = 0] = "UNKNOWN";
    //Client
    APIErrorCode[APIErrorCode["JAVASCRIPT"] = -1001] = "JAVASCRIPT";
    APIErrorCode[APIErrorCode["PROMISE"] = -1002] = "PROMISE";
    APIErrorCode[APIErrorCode["COMMUNICATION"] = -1003] = "COMMUNICATION";
    APIErrorCode[APIErrorCode["REPLAY"] = -1004] = "REPLAY";
    APIErrorCode[APIErrorCode["GRAPHICS"] = -1005] = "GRAPHICS";
    APIErrorCode[APIErrorCode["PLUGIN_LAUNCH"] = -1007] = "PLUGIN_LAUNCH";
    APIErrorCode[APIErrorCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    APIErrorCode[APIErrorCode["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    APIErrorCode[APIErrorCode["SESSION_TIMEOUT"] = 1007] = "SESSION_TIMEOUT";
    APIErrorCode[APIErrorCode["INSUFFICIENT_FUNDS"] = 1025] = "INSUFFICIENT_FUNDS";
    APIErrorCode[APIErrorCode["RESPONSIBLE_GAMING_EXCEEDED"] = 1026] = "RESPONSIBLE_GAMING_EXCEEDED";
    APIErrorCode[APIErrorCode["RESPONSIBLE_GAMING_BLOCK"] = 1030] = "RESPONSIBLE_GAMING_BLOCK";
    APIErrorCode[APIErrorCode["OPERATOR_ERROR"] = 1050] = "OPERATOR_ERROR";
    APIErrorCode[APIErrorCode["OPERATOR_ERROR_NON_FATAL"] = 1051] = "OPERATOR_ERROR_NON_FATAL";
    APIErrorCode[APIErrorCode["FRONT_CLIENT_NOT_VALID"] = 13004] = "FRONT_CLIENT_NOT_VALID";
    APIErrorCode[APIErrorCode["FRONT_CLIENT_NOT_ACTIVE"] = 13005] = "FRONT_CLIENT_NOT_ACTIVE";
    APIErrorCode[APIErrorCode["COUNTRY_BLOCKED"] = 13043] = "COUNTRY_BLOCKED";
})(APIErrorCode = exports.APIErrorCode || (exports.APIErrorCode = {}));
//# sourceMappingURL=APIErrorSystem.js.map