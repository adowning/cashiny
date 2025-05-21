"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinSettingsGroup = void 0;
/**
 * Class description
 *
 * Created: 2019-09-27
 * @author jonas
 */
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
class SpinSettingsGroup extends PIXI.Container {
    get autoPlayButton() {
        return this._autoPlayButton;
    }
    get fastSpinButton() {
        return this._fastSpinButton;
    }
    getWidth() {
        const aBefore = this._autoPlayButton.visible;
        const fBefore = this._fastSpinButton.visible;
        this._autoPlayButton.visible = true;
        this._fastSpinButton.visible = true;
        const width = this.width;
        this._autoPlayButton.visible = aBefore;
        this._fastSpinButton.visible = fBefore;
        return width;
    }
    constructor(fastSpinButton, autoPlayButton) {
        super();
        this._autoPlayButton = autoPlayButton;
        this._fastSpinButton = fastSpinButton;
        this.addChild(this._autoPlayButton);
        this.addChild(this._fastSpinButton);
        this.resize();
    }
    resize() {
        GuiLayout_1.GuiLayout.align(this.children, 40);
    }
}
exports.SpinSettingsGroup = SpinSettingsGroup;
//# sourceMappingURL=SpinSettingsGroup.js.map