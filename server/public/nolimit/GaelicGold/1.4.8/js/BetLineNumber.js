"use strict";
/**
 * Created by Ning Jiang on 6/20/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLineNumber = void 0;
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const UserAgent_1 = require("../useragent/UserAgent");
const BetLineEvent_1 = require("./event/BetLineEvent");
class BetLineNumber extends PIXI.Container {
    get index() {
        return this._index;
    }
    constructor(index, config) {
        super();
        this._isPlayingWin = false;
        this._index = index;
        this.draw(config);
        this.initButtonMode();
        this.addEventListeners();
    }
    initButtonMode() {
        this.setEnabled(true);
        this.on('mouseover', this.onMouseOver);
        this.on('mouseout', this.onMouseOut);
    }
    onMouseOver() {
        if (this._isPlayingWin) {
            return;
        }
        if (UserAgent_1.UserAgent.isMobile) {
            return;
        }
        this.showMouseOver();
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.SHOW_STATIC_BET_LINE, this.index));
    }
    onMouseOut() {
        if (this._isPlayingWin) {
            return;
        }
        this.showMouseOut();
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(BetLineEvent_1.BetLineEvent.HIDE_STATIC_BET_LINE, this.index));
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.SHOW_WIN_BET_LINE, (event) => this.onShowWinBetLine(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.HIDE_WIN_BET_LINE, (event) => this.onHideWinBetLine(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.HIDE_ALL_BET_LINES, (event) => this.onHideAllBetLines());
        EventHandler_1.EventHandler.addEventListener(this, BetLineEvent_1.BetLineEvent.SET_ENABLED, (event) => this.setEnabled(event.params[0]));
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
        this.showNormal();
    }
    setEnabled(value) {
        this.interactive = value;
        this.onHideAllBetLines();
    }
}
exports.BetLineNumber = BetLineNumber;
//# sourceMappingURL=BetLineNumber.js.map