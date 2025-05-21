"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiButton = void 0;
const PointerState_1 = require("./states/PointerState");
const Logger_1 = require("../../utils/Logger");
/**
 * Class description
 *
 * Created: 2019-09-17
 * @author jonas
 */
class GuiButton extends PIXI.Container {
    get pointerState() {
        return this._pointerState;
    }
    constructor(name, clickCallback) {
        super();
        this._boundEvents = false;
        this.debug = false;
        this.onPointerTap = (event) => {
            event.stopPropagation();
            this.onClick(event);
        };
        this.onPointerDown = (event) => {
            event.stopPropagation();
            this.setPointerState(PointerState_1.PointerState.DOWN);
        };
        this.onPointerOver = (event) => {
            this.setPointerState(PointerState_1.PointerState.OVER);
        };
        this.onPointerUp = (event) => {
            this.setPointerState(PointerState_1.PointerState.IDLE);
        };
        this.onPointerUpOutside = (event) => {
            this.setPointerState(PointerState_1.PointerState.IDLE);
        };
        this.onPointerOut = (event) => {
            this.setPointerState(PointerState_1.PointerState.IDLE);
        };
        this.name = name;
        this._clickCallbacks = [];
        if (clickCallback != null) {
            this.addClickCallback(clickCallback);
        }
        this._callbackSets = [];
    }
    bindEvents() {
        this.on('pointertap', this.onPointerTap);
        this.on('pointerdown', this.onPointerDown);
        this.on('pointerover', this.onPointerOver);
        this.on('pointerup', this.onPointerUp);
        this.on('pointerupoutside', this.onPointerUpOutside);
        this.on('pointerout', this.onPointerOut);
    }
    enable(enable) {
        if (!this._boundEvents) {
            this.bindEvents();
            this._boundEvents = true;
        }
        this.interactive = enable;
        this.buttonMode = enable;
        this.setPointerState(enable ? PointerState_1.PointerState.IDLE : PointerState_1.PointerState.DISABLED);
    }
    addClickCallback(callback) {
        this._clickCallbacks.push(callback);
    }
    addCallbackSet(set) {
        this._callbackSets.push(set);
    }
    setPointerState(state) {
        if (this._pointerState === state) {
            return;
        }
        this._pointerState = state;
        this.onPointerStateUpdate(state);
        for (let set of this._callbackSets) {
            if (set[state] != undefined) {
                set[state]();
            }
        }
        if (this.debug) {
            Logger_1.Logger.logDev(`[${this.name}].pointerState: ${PointerState_1.PointerState[this.pointerState]}`);
        }
    }
    onClick(event) {
        if (!this.interactive || this.parent == undefined) {
            return;
        }
        for (let callback of this._clickCallbacks) {
            callback();
        }
        if (this.debug) {
            Logger_1.Logger.logDev(`[${this.name}].onClick`);
        }
        if (event) {
            event.stopPropagation();
        }
    }
    onPointerStateUpdate(state) { }
    ;
}
exports.GuiButton = GuiButton;
//# sourceMappingURL=GuiButton.js.map