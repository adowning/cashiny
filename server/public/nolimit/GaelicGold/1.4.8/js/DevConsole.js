"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevConsole = void 0;
const NolimitConfig_1 = require("../settings/NolimitConfig");
/**
 * Created by Jonas Wålekvist on 2019-09-09
 *
 * Exposing functions globally so they can be called directly from browser console if game is run in Dev mode.
 *
 * Usage:
 *
 * DevConsole.addCommand("myCommand", ()=> myFunction());
 *
 * Make sure that the correct JavaScript context is selected in the browser. Usually "Nolimit-1"
 * In the browser this function is now exposed like this:
 * DevConsole.myCommand()
 *
 * By typing only DevConsole [return] you can se what commands are currently available.
 *
 *
 */
class DevConsole {
    static get instance() {
        if (this._instance == undefined) {
            this._instance = new DevConsole();
        }
        return this._instance;
    }
    constructor() { }
    static addCommand(command, callback) {
        this.instance[command] = () => {
            if (NolimitConfig_1.NolimitConfig.isDevMode) {
                callback();
            }
        };
        this.commandNames.push(command);
        this.commandNames.sort((a, b) => a.localeCompare(b));
    }
}
DevConsole.commandNames = [];
exports.DevConsole = DevConsole;
document.DevConsole = DevConsole.instance;
//# sourceMappingURL=DevConsole.js.map