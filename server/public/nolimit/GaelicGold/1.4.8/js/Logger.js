"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.NamedLogger = exports.LogLevel = void 0;
/**
 * Class description
 *
 * Created by jonas on 2016-11-02.
 * Refactored by Ning Jiang on 2016-11-30.
 */
const NolimitConfig_1 = require("../settings/NolimitConfig");
var LogLevel;
(function (LogLevel) {
    LogLevel["NONE"] = "NONE";
    LogLevel["DEV"] = "DEV";
    LogLevel["INFO"] = "INFO";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class NamedLogger {
    constructor(name, style) {
        this.level = LogLevel.DEV;
        this.name = name;
        this.style = style;
        this.stylePrefix = style != undefined ? "%c" : "";
    }
    log(message, ...optionalParams) {
        if (this.style) {
            optionalParams.unshift(this.style);
        }
        if (this.level == LogLevel.INFO) {
            Logger.log(`${this.stylePrefix}[${this.name}]: ${message}`, ...optionalParams);
        }
        else if (this.level == LogLevel.DEV) {
            Logger.logDev(`${this.stylePrefix}[${this.name}]: ${message}`, ...optionalParams);
        }
    }
    warn(message, ...optionalParams) {
        if (this.level != LogLevel.NONE) {
            Logger.warn(`[${this.name}]: ${message}`, ...optionalParams);
        }
    }
}
exports.NamedLogger = NamedLogger;
class Logger {
    static createNamedLogger(name) {
        const namedLogger = new NamedLogger(name);
        Logger.namedLoggers.push(namedLogger);
        return namedLogger;
    }
    static findNamedLogger(name) {
        Logger.namedLoggers.forEach((p1) => {
            if (p1.name == name) {
                return p1;
            }
        });
        return undefined;
    }
    static log(message, ...optionalParams) {
        console.log(message, ...optionalParams);
    }
    static logDev(message, ...optionalParams) {
        if (NolimitConfig_1.NolimitConfig.isDevMode) {
            console.log(message, ...optionalParams);
        }
    }
    static warn(message, ...optionalParams) {
        if (NolimitConfig_1.NolimitConfig.isDevMode) {
            console.warn(message, ...optionalParams);
        }
    }
    static deprecated(message, version) {
        if (NolimitConfig_1.NolimitConfig.isDevMode) {
            if (Logger.displayedDeprecationWarnings[message]) {
                return;
            }
            else {
                console.warn('SlotGame Deprecation Warning: ', (message + "\nDeprecated since v" + version));
                Logger.displayedDeprecationWarnings[message] = true;
            }
        }
    }
}
Logger.namedLoggers = [];
Logger.displayedDeprecationWarnings = {};
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map