"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiToggleButton = void 0;
/**
 * Class description
 *
 * Created: 2019-09-18
 * @author jonas
 */
const GuiButton_1 = require("./GuiButton");
const ToggleState_1 = require("./states/ToggleState");
class GuiToggleButton extends GuiButton_1.GuiButton {
    get toggled() {
        return this.toggleState === ToggleState_1.ToggleState.ON;
    }
    set toggled(value) {
        this.toggleState = value ? ToggleState_1.ToggleState.ON : ToggleState_1.ToggleState.OFF;
    }
    get toggleState() {
        return this._toggleState;
    }
    set toggleState(value) {
        this._toggleState = value;
        this._toggleCallback(this._toggleState);
    }
    constructor(name, onToggleCallback) {
        super(name);
        this._toggleCallback = onToggleCallback;
    }
}
exports.GuiToggleButton = GuiToggleButton;
//# sourceMappingURL=GuiToggleButton.js.map