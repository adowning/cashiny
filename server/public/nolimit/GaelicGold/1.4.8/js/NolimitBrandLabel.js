"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitBrandLabel = void 0;
/**
 * Class description
 *
 * Created: 2019-11-04
 * @author jonas
 */
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const KeypadTextStyles_1 = require("../../config/KeypadTextStyles");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
class NolimitBrandLabel extends PIXI.Container {
    constructor() {
        super();
        const labels = [];
        //labels.push(new Label("A ", KeypadTextStyles.BRAND_TEXT_THIN));
        labels.push(new Label_1.Label("NOLIMIT CITY", KeypadTextStyles_1.KeypadTextStyles.BRAND_TEXT_THICK));
        // labels.push(new Label(" GAME", KeypadTextStyles.BRAND_TEXT_THIN));
        GuiLayout_1.GuiLayout.align(labels);
        for (let label of labels) {
            label.alpha = 0.3;
            this.addChild(label);
        }
    }
}
exports.NolimitBrandLabel = NolimitBrandLabel;
//# sourceMappingURL=NolimitBrandLabel.js.map