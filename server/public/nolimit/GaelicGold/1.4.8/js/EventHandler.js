"use strict";
/**
 * Created by Ning Jiang on 3/31/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHandler = void 0;
const EventDispatcher_1 = require("./EventDispatcher");
class EventHandler {
    static get enabled() {
        return this._enabled;
    }
    static set enabled(value) {
        this._enabled = value;
    }
    constructor() {
        if (EventHandler._instance) {
            debugger;
            throw new Error("Error: EventHandler.constructor() - Instantiation failed: Use EventHandler.instance instead of new.");
        }
    }
    static dispatchEvent(event) {
        if (EventHandler._enabled) {
            this._eventDispatcher.dispatchEvent(event);
        }
    }
    static addEventListener(source, type, callback, ...params) {
        this._eventDispatcher.addEventListener(source, type, callback, params);
    }
    static removeEventListener(source, type) {
        return this._eventDispatcher.removeEventListener(source, type);
    }
    // each type can have max one lastEventListener, the lastEventListener callback will be triggered after all the
    // other EventListeners are triggered.
    static addLastEventListener(source, type, callback, ...params) {
        this._eventDispatcher.addLastEventListener(source, type, callback, params);
    }
    static removeLastEventListener(source, type) {
        return this._eventDispatcher.removeLastEventListener(source, type);
    }
    static addFirstEventListener(source, type, callback, ...params) {
        this._eventDispatcher.addFirstEventListener(source, type, callback, params);
    }
    static removeFirstEventListener(source, type) {
        return this._eventDispatcher.removeFirstEventListener(source, type);
    }
}
EventHandler._instance = new EventHandler();
EventHandler._eventDispatcher = new EventDispatcher_1.EventDispatcher();
EventHandler._enabled = true;
exports.EventHandler = EventHandler;
//# sourceMappingURL=EventHandler.js.map