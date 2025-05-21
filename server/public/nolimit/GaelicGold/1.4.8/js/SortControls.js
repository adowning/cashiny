"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortControls = void 0;
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
const PointerState_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/PointerState");
const NolimitPromotionPlugin_1 = require("../../../../NolimitPromotionPlugin");
const Helper_1 = require("../../../../utils/Helper");
const SortButton_1 = require("./SortButton");
class SortControls extends PIXI.Container {
    constructor(sortCallback) {
        super();
        this.sortCallback = sortCallback;
        const light = PIXI.utils.string2hex("#fbc217");
        const dark = PIXI.utils.string2hex("#f57f20");
        const white = PIXI.utils.string2hex("#ffffff");
        const black = PIXI.utils.string2hex("#000000");
        const onColors = new PointerStateColorSet_1.PointerStateColorSet(GuiUtils_1.GuiUtils.getARGB(white, 1));
        onColors[PointerState_1.PointerState.DISABLED] = GuiUtils_1.GuiUtils.getARGB(white, 0.5);
        const offColors = new PointerStateColorSet_1.PointerStateColorSet(GuiUtils_1.GuiUtils.getARGB(black, 1));
        offColors[PointerState_1.PointerState.DISABLED] = GuiUtils_1.GuiUtils.getARGB(black, 0.5);
        this.roundButton = new SortButton_1.SortButton("RoundId", Helper_1.Helper.translate("TIME"));
        //his.roundButton.backplate.tint = white;
        this.winButton = new SortButton_1.SortButton("WinId", Helper_1.Helper.translate("WIN"));
        // this.winButton.backplate.tint = white;
        this.winButton.position.set(415, 0);
        const xMargin = 15;
        const yMargin = 5;
        /*      this.roundButton.resizeButtonToLabelWithMargin(yMargin,xMargin,yMargin,xMargin);
              this.winButton.resizeButtonToLabelWithMargin(yMargin,xMargin,yMargin,xMargin);*/
        this.roundButton.addClickCallback(() => this.click(this.roundButton));
        this.winButton.addClickCallback(() => this.click(this.winButton));
        this.roundButton.enable(false);
        this.winButton.enable(false);
        this.roundButton.toggled = true;
        this.winButton.toggled = false;
        this.addChild(this.roundButton, this.winButton);
    }
    enable(enable) {
        this.roundButton.enable(enable);
        this.winButton.enable(enable);
    }
    update(sortedByWin) {
        this.roundButton.toggled = !sortedByWin;
        this.winButton.toggled = sortedByWin;
    }
    click(btn) {
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.playKeypadEffect("click");
        this.sortCallback(btn == this.winButton);
    }
}
exports.SortControls = SortControls;
//# sourceMappingURL=SortControls.js.map