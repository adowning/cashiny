"use strict";
/**
 * Created by Ning Jiang on 6/17/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLine = void 0;
const EventHandler_1 = require("../event/EventHandler");
const BetLineEvent_1 = require("./event/BetLineEvent");
class BetLine extends PIXI.Container {
    get index() {
        return this._index;
    }
    constructor(index, numberPosition, betLineData, config) {
        super();
        this._isPlayingWin = false;
        this._index = index;
        this.draw(numberPosition, betLineData, config);
        this.addEventListeners();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.SHOW_STATIC_BET_LINE, (event) => this.onShowStaticBetLine(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.HIDE_STATIC_BET_LINE, (event) => this.onHideStaticBetLine(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.SHOW_WIN_BET_LINE, (event) => this.onShowWinBetLine(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.HIDE_WIN_BET_LINE, (event) => this.onHideWinBetLine(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.HIDE_ALL_BET_LINES, (event) => this.onHideAllBetLines());
    }
    onShowStaticBetLine(index) {
        if (index !== this._index) {
            return;
        }
        if (this._isPlayingWin) {
            return;
        }
        this.showStatic();
    }
    onHideStaticBetLine(index) {
        if (index !== this._index) {
            return;
        }
        if (this._isPlayingWin) {
            return;
        }
        this.hideAll();
    }
    onShowWinBetLine(index) {
        if (index !== this._index) {
            return;
        }
        this._isPlayingWin = true;
        this.showWin();
    }
    onHideWinBetLine(index) {
        if (index !== this._index) {
            return;
        }
        this.onHideAllBetLines();
    }
    onHideAllBetLines() {
        this._isPlayingWin = false;
        this.hideAll();
    }
}
exports.BetLine = BetLine;
//# sourceMappingURL=BetLine.js.map