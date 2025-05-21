"use strict";
/**
 * Created by Pankaj on 2019-12-11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationPanelView = void 0;
const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PanelButton_1 = require("./PanelButton");
const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
const PromoPanelAssetConfig_1 = require("../config/PromoPanelAssetConfig");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
class NavigationPanelView extends PIXI.Container {
    constructor(controller) {
        super();
        this._buttons = [];
        this._panelButton = [];
        this._controller = controller;
        this._buttons = PromoPanelConfig_1.PromoPanelConfig.FEATURE_BTN_CONFIG;
        this.initAnimations();
    }
    initAnimations() {
        this._bgLandscape = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_BG_LANDSCAPE));
        this._bgLandscape.height = 684;
        this._bgPortrait = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_BG_PORTRAIT));
        this._bgPortrait.width = 720;
        this._bgLandscape.anchor.set(0.5);
        this._bgPortrait.anchor.set(0.5);
        this.addChild(this._bgLandscape);
        this.addChild(this._bgPortrait);
        this._buttons.forEach((buttonConfig, index) => {
            const panelButton = new PanelButton_1.PanelButton(buttonConfig, this._controller, index);
            this.addChild(panelButton);
            this._panelButton.push(panelButton);
        });
    }
    onResize() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        const containerLocalBounds = this.getLocalBounds();
        //this.pivot.set(containerLocalBounds.width * 0.5, containerLocalBounds.height * 0.5);
        this._bgLandscape.visible = false;
        this._bgPortrait.visible = false;
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._bgLandscape.visible = true;
            this._bgLandscape.position.set(Math.floor(this._bgLandscape.width * 0.5), Math.floor(this._bgLandscape.height * 0.5));
            this._panelButton.forEach((panelButton) => panelButton.onResize(this._bgLandscape.position));
        }
        else {
            this._bgPortrait.position.set(bounds.width * 0.5, bounds.height - (this._bgPortrait.height * 0.5) - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight());
            this._bgPortrait.visible = true;
            this.rotation = 0;
            this._panelButton.forEach((panelButton) => panelButton.onResize(this._bgPortrait.position));
        }
    }
    show() {
        this.visible = true;
    }
    hide() {
        this.visible = false;
    }
}
exports.NavigationPanelView = NavigationPanelView;
//# sourceMappingURL=NavigationPanelView.js.map