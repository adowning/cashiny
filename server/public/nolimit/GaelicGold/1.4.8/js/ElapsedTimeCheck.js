"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElapsedTimeCheck = void 0;
/**
 * Created by jonas on 2020-09-29.
 * Checks if elapsed time between checkTime() is less then a threshold and then calls back.
 */
class ElapsedTimeCheck {
    constructor(threshold, callback) {
        this._lastTime = 0;
        this.threshold = threshold;
        this._callback = callback;
    }
    checkTime() {
        const now = Date.now();
        const timeSinceLastCheck = now - this._lastTime;
        this._lastTime = now;
        if (timeSinceLastCheck < this.threshold) {
            this._callback();
        }
    }
}
exports.ElapsedTimeCheck = ElapsedTimeCheck;
//# sourceMappingURL=ElapsedTimeCheck.js.map