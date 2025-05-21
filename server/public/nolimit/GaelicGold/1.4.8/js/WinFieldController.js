"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinFieldController = void 0;
const EventHandler_1 = require("../event/EventHandler");
const ScreenEvent_1 = require("../screen/event/ScreenEvent");
const ServerEvent_1 = require("../server/event/ServerEvent");
const SlotGame_1 = require("../SlotGame");
/**
 * Class description
 *
 * Created: 2019-08-06
 * @author jonas
 */
class WinFieldController {
    constructor() {
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, ScreenEvent_1.ScreenEvent.GAME_RESTORE, (event) => this.onRestore());
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED, (event) => this.onInitDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
    }
    onRestore() {
        EventHandler_1.EventHandler.removeEventListener(this, ScreenEvent_1.ScreenEvent.GAME_RESTORE);
        this.showWinField();
    }
    onInitDataParsed(data) {
        EventHandler_1.EventHandler.removeEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED);
        this.onGameDataParsed(data);
    }
    onGameDataParsed(data) {
        this._data = data;
        this._shouldShowTotalWin = data.isTotalWin;
        this._shouldNextShowTotalWin = data.isNextTotalWin;
        this._totalWin = data.totalWin;
    }
    shouldShow() {
        return this._totalWin > 0;
    }
    showWinField(to, forceWin = false, forceTotalWin = false) {
        if (this.shouldShow()) {
            to = to != null ? to : this._totalWin;
            if (!forceWin && (forceTotalWin || this._shouldShowTotalWin || this._shouldNextShowTotalWin)) {
                SlotGame_1.SlotGame.keypad.setWin(to, true);
                return;
            }
            SlotGame_1.SlotGame.keypad.setWin(to);
        }
    }
}
exports.WinFieldController = WinFieldController;
//# sourceMappingURL=WinFieldController.js.map