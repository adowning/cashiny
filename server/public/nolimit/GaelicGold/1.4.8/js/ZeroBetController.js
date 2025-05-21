"use strict";
/**
 * Created by Ning Jiang on 11/24/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroBetController = void 0;
const BalanceEvent_1 = require("../balance/event/BalanceEvent");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const ServerEvent_1 = require("../server/event/ServerEvent");
class ZeroBetController {
    get isTriggered() {
        return this._isTriggered;
    }
    constructor() {
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
    }
    onGameDataParsed(data) {
        this._isTriggered = this.calculateIsTriggered(data);
        this._zeroBetNumberLeft = this.getZeroBetNumberLeft(data);
    }
    handleZeroBetCounter() {
        if (!this.shouldShowZeroBetCounter()) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.ZERO_BET, -1));
            return;
        }
        if (this.shouldSubtractZeroBetCounter()) {
            this._zeroBetNumberLeft--;
        }
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BalanceEvent_1.BalanceEvent.ZERO_BET, this._zeroBetNumberLeft));
    }
}
exports.ZeroBetController = ZeroBetController;
//# sourceMappingURL=ZeroBetController.js.map