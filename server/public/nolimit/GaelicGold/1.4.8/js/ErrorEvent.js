"use strict";
/**
 * Created by Ning Jiang on 4/1/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorEvent = void 0;
const GameEvent_1 = require("../../event/GameEvent");
class ErrorEvent extends GameEvent_1.GameEvent {
    get errorMessage() {
        return this._errorMessage;
    }
    get code() {
        return this._code;
    }
    constructor(type, errorMessage, code = 0) {
        super(type, errorMessage, code);
        this._errorMessage = errorMessage;
        this._code = code;
    }
}
ErrorEvent.WEB_GL_CONTEXT_LOST = -1005;
ErrorEvent.FONT_LOAD_ERROR = 0;
ErrorEvent.ASSET_LOAD_ERROR = 0;
ErrorEvent.ERROR = "errorEvent_error";
exports.ErrorEvent = ErrorEvent;
//# sourceMappingURL=ErrorEvent.js.map