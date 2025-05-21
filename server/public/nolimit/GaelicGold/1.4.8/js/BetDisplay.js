"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetDisplay = void 0;
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const PromoPanelTextStyles_1 = require("../config/PromoPanelTextStyles");
const PromoPanelTextLabel_1 = require("../feature/PromoPanelTextLabel");
/**
 * Created by jonas on 2023-05-05.
 *
 * Small component to display bet in BetPanelView etc.
 *
 * Consists of two "Labels" the first normal font, and the other in a heavier font, and a bigger number underneath.
 *
 */
class BetDisplay extends PIXI.Container {
    constructor(firstLabelString, secondLabelString, value = "") {
        super();
        const labels = new PIXI.Container();
        const firstLabel = new Label_1.Label(firstLabelString, PromoPanelTextStyles_1.PromoPanelTextStyles.BET_PANEL_BET_LABEL);
        labels.addChild(firstLabel);
        if (secondLabelString && secondLabelString != "") {
            const secondLabel = new Label_1.Label(secondLabelString, PromoPanelTextStyles_1.PromoPanelTextStyles.BET_PANEL_CURRENCY_LABEL);
            secondLabel.position.set(firstLabel.width, 0);
            labels.addChild(secondLabel);
        }
        labels.pivot.set(labels.width * 0.5, 0);
        this._valueLabel = new PromoPanelTextLabel_1.PromoPanelTextLabel(value, PromoPanelTextStyles_1.PromoPanelTextStyles.BET_PANEL_BET_STYLE, {
            landscapeMaxWidth: 268,
            portraitMaxWidth: 268
        });
        this._valueLabel.anchor.set(0.5, 0);
        this._valueLabel.position.set(0, firstLabel.height);
        this.addChild(labels);
        this.addChild(this._valueLabel);
    }
    setValue(value) {
        this._valueLabel.value = value;
    }
    resize() {
        this._valueLabel.onResize();
    }
}
exports.BetDisplay = BetDisplay;
//# sourceMappingURL=BetDisplay.js.map