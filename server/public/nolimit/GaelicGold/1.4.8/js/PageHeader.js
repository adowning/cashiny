"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageHeader = void 0;
const KeypadTextStyles_1 = require("../../config/KeypadTextStyles");
const SlotKeypadViewSettings_1 = require("../../SlotKeypadViewSettings");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
/**
 * Created by Jonas Wålekvist on 2020-02-17.
 */
class PageHeader extends PIXI.Container {
    constructor(whiteLabelText, yellowLabelText) {
        super();
        this._headerWhite = new Label_1.Label(whiteLabelText, KeypadTextStyles_1.KeypadTextStyles.DEFAULT_DIALOG_HEADER);
        this._headerYellow = new Label_1.Label(yellowLabelText, KeypadTextStyles_1.KeypadTextStyles.DEFAULT_DIALOG_HEADER);
        this._headerYellow.setColor(SlotKeypadViewSettings_1.SlotKeypadViewSettings.AUTOPLAY_COLOR);
        this._separator = new PIXI.Graphics();
        this._textContainer = new PIXI.Container();
        this._textContainer.addChild(this._headerWhite, this._headerYellow);
        GuiLayout_1.GuiLayout.align([this._headerWhite, this._headerYellow], 10, GuiLayout_1.Align.TOP, GuiLayout_1.Direction.HORIZONTAL);
        this.addChild(this._textContainer, this._separator);
    }
    resize(width) {
        this._separator.clear();
        this._separator.lineStyle(1, 0xFFFFFF, 0.5);
        this._separator.moveTo(0, 0);
        this._separator.lineTo(width - 11, 0);
        this._separator.position.set(0, 89);
        //Alternative fix to this issue: https://github.com/nolimitcity/nolimit-slot-launcher/issues/305
        //In 1.8.x this was moved here. From BasePage.adjustHeaderFont
        if (this._textContainer.width > (width - 80)) {
            this._textContainer.scale.set((width - 80) / this._textContainer.width);
        }
    }
}
exports.PageHeader = PageHeader;
//# sourceMappingURL=PageHeader.js.map