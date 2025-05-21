"use strict";
/**
 * Created by Ning Jiang on 3/31/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
const DevConsole_1 = require("@nolimitcity/slot-launcher/bin/devtools/DevConsole");
class EventDispatcher {
    constructor() {
        this._listeners = {};
        this._lastListeners = {};
        this._firstListeners = {};
        DevConsole_1.DevConsole.addCommand("printEventListeners", () => {
            console.log(this._firstListeners);
            console.log(this._listeners);
            console.log(this._lastListeners);
        });
    }
    hasEventHandler(source, type) {
        if (!this._listeners[type]) {
            return false;
        }
        return this._listeners[type].some((element, index, array) => {
            return element.source === source;
        });
    }
    addEventListener(source, type, callback, params) {
        if (this.hasEventHandler(source, type)) {
            return;
        }
        this._listeners[type] = this._listeners[type] || [];
        this._listeners[type].push({ source: source, type: type, callback: callback, params: params });
    }
    addLastEventListener(source, type, callback, params) {
        if (this._lastListeners[type]) {
            debugger;
            throw new Error("Error: EventDispatcher.addLastEventListener(): Can only add one LastEventHandler on type " + type);
        }
        this._lastListeners[type] = { source: source, type: type, callback: callback, params: params };
    }
    removeLastEventListener(source, type) {
        if (!this._lastListeners[type]) {
            return false;
        }
        if (this._lastListeners[type].source === source) {
            delete this._lastListeners[type];
            return true;
        }
        return false;
    }
    addFirstEventListener(source, type, callback, params) {
        if (this._firstListeners[type]) {
            debugger;
            throw new Error("Error: EventDispatcher.addFirstEventListener(): Can only add one FirstEventHandler on type " + type);
        }
        this._firstListeners[type] = { source: source, type: type, callback: callback, params: params };
    }
    removeFirstEventListener(source, type) {
        if (!this._firstListeners[type]) {
            return false;
        }
        if (this._firstListeners[type].source === source) {
            delete this._firstListeners[type];
            return true;
        }
        return false;
    }
    removeEventListener(source, type) {
        if (this._listeners[type]) {
            let listeners = this._listeners[type];
            for (let i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i].source === source) {
                    listeners.splice(i, 1);
                    if (listeners.length === 0) {
                        delete this._listeners[type];
                    }
                    return true;
                }
            }
        }
        return false;
    }
    dispatchEvent(event) {
        let firstListener = this._firstListeners[event.type];
        if (firstListener) {
            firstListener.callback.call(this, event, firstListener.params);
        }
        if (this._listeners[event.type]) {
            for (let i = this._listeners[event.type].length - 1; i >= 0; i--) {
                const listener = this._listeners[event.type][i];
                listener.callback.call(this, event, listener.params);
            }
        }
        let lastListener = this._lastListeners[event.type];
        if (lastListener) {
            lastListener.callback.call(this, event, lastListener.params);
        }
    }
}
exports.EventDispatcher = EventDispatcher;
//# sourceMappingURL=EventDispatcher.js.map