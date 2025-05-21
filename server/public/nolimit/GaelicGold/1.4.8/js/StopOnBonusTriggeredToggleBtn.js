"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopOnBonusTriggeredToggleBtn = void 0;
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const ActionSpinsController_1 = require("../ActionSpinsController");
const PromoPanelTextLabel_1 = require("../../PromoPanelTextLabel");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
class StopOnBonusTriggeredToggleBtn extends IconToggleButton_1.IconToggleButton {
    constructor(name, labelString) {
        const onColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFC00, 0xFFFFFC00, 0xFFFFFC00, 0x66FFFC00);
        const offColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x66FFFFFF);
        const flippedTexture = NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_GAME_CHECK_BOX_ACTIVE).clone();
        const offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_GAME_CHECK_BOX_INACTIVE)));
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(flippedTexture.clone()));
        super(name, onIcons, onColors, offIcons, offColors);
        this._label = new PromoPanelTextLabel_1.PromoPanelTextLabel(labelString, PromoPanelTextStyles_1.PromoPanelTextStyles.ACTION_SPINS_STOP_ON_BONUS_LABEL, {
            landscapeMaxWidth: 300,
            portraitMaxWidth: 300,
        });
        this._label.anchor.set(0.5, 0);
        this.addSubComponent(this._label, { x: 0.5, y: 0 }, { x: 0, y: -35 });
        this.toggleState = 0;
        this.enable(true);
        this.addClickCallback(() => this.changeBtnState());
    }
    enable(enable) {
        super.enable(enable);
        this._label.alpha = enable ? 1 : 0.4;
    }
    changeBtnState() {
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.playKeypadEffect("click");
        this.toggleState = Number(!this.toggled);
        ActionSpinsController_1.ActionSpinsController.settings.stopOnBonus = this.toggled;
    }
}
exports.StopOnBonusTriggeredToggleBtn = StopOnBonusTriggeredToggleBtn;
//# sourceMappingURL=StopOnBonusTriggeredToggleBtn.js.map