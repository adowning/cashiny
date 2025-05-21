"use strict";
/**
 * Created by Ning Jiang on 3/31/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEvent = void 0;
class GameEvent {
    get type() {
        return this._type;
    }
    get params() {
        return this._params;
    }
    constructor(type, ...params) {
        this._type = type;
        this._params = params;
    }
}
exports.GameEvent = GameEvent;
//# sourceMappingURL=GameEvent.js.map