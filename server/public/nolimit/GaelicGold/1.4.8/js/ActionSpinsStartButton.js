"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionSpinsStartButton = void 0;
const PromoPanelTextLabel_1 = require("../../PromoPanelTextLabel");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PromoPanelButtonIDs_1 = require("../../../enums/PromoPanelButtonIDs");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelLabelIDs_1 = require("../../../enums/PromoPanelLabelIDs");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const PromoPanelConfig_1 = require("../../../config/PromoPanelConfig");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
class ActionSpinsStartButton extends PIXI.Container {
    constructor(controller) {
        super();
        this._controller = controller;
        this.initAnimation();
    }
    enableStartBtn(value) {
        this._spinBtn.alpha = value ? PromoPanelConfig_1.PromoPanelConfig.ENABLE_BTN_ALPHA : PromoPanelConfig_1.PromoPanelConfig.DISABLE_BTN_ALPHA;
        this._spinBtn.enable(value);
    }
    initAnimation() {
        this._startLabel = this.createLabel();
        this._spinBtn = this.createButton();
        this._spinBtn.position.set(-this._spinBtn.width * 0.5, -this._spinBtn.height * 0.5);
        this._startLabel.position.set(0, -7);
        this.addChild(this._spinBtn, this._startLabel);
    }
    createButton() {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        let onIcons1 = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_BUY_BTN)));
        const spinBtn = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_SPIN_BUTTON, onIcons1, colors);
        spinBtn.enable(true);
        spinBtn.addClickCallback(() => {
            this._controller.buttonClick(spinBtn);
        });
        spinBtn.toggled = false;
        spinBtn.scale.set(1.25);
        return spinBtn;
    }
    createLabel() {
        const label = new PromoPanelTextLabel_1.PromoPanelTextLabel(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.START), PromoPanelTextStyles_1.PromoPanelTextStyles.GAME_FEATURE_BUY_TEXT, {
            landscapeMaxWidth: 292,
            portraitMaxWidth: 274
        });
        label.anchor.set(0.5);
        return label;
    }
}
exports.ActionSpinsStartButton = ActionSpinsStartButton;
//# sourceMappingURL=ActionSpinsStartButton.js.map