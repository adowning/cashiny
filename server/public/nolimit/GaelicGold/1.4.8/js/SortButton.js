"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortButton = void 0;
/**
 * Created by jonas on 2023-11-10.
 */
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../../../../config/PromoPanelAssetConfig");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const PromoPanelTextStyles_1 = require("../../../../config/PromoPanelTextStyles");
class SortButton extends IconToggleButton_1.IconToggleButton {
    constructor(name, labelString) {
        const onColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFC00, 0xFFFFFC00, 0xFFFFFC00, 0x33FFFC00);
        const offColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        const offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_SORT_ARROW_RIGHT)));
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_SORT_ARROW_DOWN)));
        super(name, onIcons, onColors, offIcons, offColors);
        if (labelString != undefined) {
            this.label = new Label_1.Label(labelString, PromoPanelTextStyles_1.PromoPanelTextStyles.SORT_BUTTON);
            this.label.anchor.set(0, 0.5);
            this.addSubComponent(this.label, { x: 1, y: 0.5 }, { x: 5, y: 0 });
        }
    }
    enable(enable) {
        super.enable(enable);
        if (this.label) {
            this.label.tint = this._icon.tint;
            this.label.alpha = this._icon.alpha;
        }
    }
}
exports.SortButton = SortButton;
//# sourceMappingURL=SortButton.js.map