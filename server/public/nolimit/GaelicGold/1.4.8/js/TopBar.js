"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopBar = void 0;
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../../../../config/PromoPanelAssetConfig");
const SignLabel_1 = require("../SignLabel");
/**
 * Created by jonas on 2023-05-10.
 */
class TopBar extends PIXI.Container {
    constructor() {
        super();
        this.name = "TOP_BAR";
        this.bg = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_INFO_BG));
        this._placedBet = new SignLabel_1.SignLabel("placedBet", PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_MENU_BET);
        this._accumulatedBet = new SignLabel_1.SignLabel("accumulatedBet", PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_TOTAL_BET);
        this._accumulatedWin = new SignLabel_1.SignLabel("accumulatedWin", PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_WIN);
        this._placedBet.align(SignLabel_1.SignLabelAlign.LEFT);
        this._accumulatedBet.align(SignLabel_1.SignLabelAlign.LEFT);
        this._accumulatedWin.align(SignLabel_1.SignLabelAlign.RIGHT);
        this._accumulatedWin.useDecimalCutoff = false;
        this.addChild(this.bg);
        this.addChild(this._placedBet, this._accumulatedBet, this._accumulatedWin);
        this.resize();
    }
    resize() {
        this._placedBet.onResize();
        this._accumulatedBet.onResize();
        this._accumulatedWin.onResize();
        this.reAlign();
    }
    setPlacedBet(value) {
        this._placedBet.value = value;
        this.reAlign();
    }
    setAccumulatedBet(value) {
        this._accumulatedBet.value = value;
        this.reAlign();
    }
    setAccumulatedWin(value) {
        this._accumulatedWin.value = value;
        this.reAlign();
    }
    getAccumulatedWin() {
        return this._accumulatedWin.value;
    }
    getAccumulatedBet() {
        return this._accumulatedBet.value;
    }
    reAlign() {
        this._placedBet.position.set(26, 36);
        this._accumulatedBet.position.set(this._placedBet.x + this._placedBet.width + 10, 36);
        this._accumulatedWin.position.set(this.bg.width - 26, 36);
    }
}
exports.TopBar = TopBar;
//# sourceMappingURL=TopBar.js.map