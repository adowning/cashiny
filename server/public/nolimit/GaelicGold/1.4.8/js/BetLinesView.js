"use strict";
/**
 * Created by Ning Jiang on 6/17/2016.
 * Refactored by Ning Jiang on 01/02/2017
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLinesView = void 0;
const BaseView_1 = require("../base/BaseView");
const EventHandler_1 = require("../event/EventHandler");
const ServerEvent_1 = require("../server/event/ServerEvent");
class BetLinesView extends BaseView_1.BaseView {
    constructor(config, numberFactoryMethod, lineFactoryMethod) {
        super();
        this._betLines = [];
        this._betLineNumbers = [];
        this._resourcesLoaded = false;
        this._dataInitialized = false;
        this._numberFactoryMethod = numberFactoryMethod;
        this._lineFactoryMethod = lineFactoryMethod;
        this._config = config;
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED, (event) => this.onInitDataParsed(event.params[0]));
    }
    initAnimations() {
        this._resourcesLoaded = true;
        this.draw();
    }
    onInitDataParsed(data) {
        this._betLinesData = data.betLines;
        if (this._betLinesData.length != this._config.map.length) {
            debugger;
            throw new Error(`Error: There are only ${this._config.map.length} betLines in the config order while the server sends ${this._betLinesData.length} lines.`);
        }
        this._dataInitialized = true;
        this.draw();
    }
    draw() {
        if (!this._resourcesLoaded || !this._dataInitialized) {
            return;
        }
        const map = this._config.map;
        for (let i = 0; i < map.length; i++) {
            const betLineNumber = this._numberFactoryMethod(map[i]);
            const betLineNumberPosition = betLineNumber.setPosition(this._betLinesData.length, i);
            this._betLineNumbers.push(betLineNumber);
            const betLine = this._lineFactoryMethod(map[i], betLineNumberPosition, this._betLinesData[map[i] - 1]);
            this._betLines.push(betLine);
        }
        this._betLines.sort((a, b) => {
            return a.index - b.index;
        });
        this._betLineNumbers.sort((a, b) => {
            return a.index - b.index;
        });
    }
}
exports.BetLinesView = BetLinesView;
//# sourceMappingURL=BetLinesView.js.map