"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureBasePanel = void 0;
/**
 * Created by Pankaj on 2019-12-11.
 */
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const PromoPanelTextStyles_1 = require("../config/PromoPanelTextStyles");
const PromoPanelEvents_1 = require("../events/PromoPanelEvents");
const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
class FeatureBasePanel extends PIXI.Container {
    constructor(logoName, title, titleTextStyle) {
        super();
        this._init = false;
        this._isOpen = false;
        this._logoName = logoName;
        this._titleStr = title;
        this._titleTextStyle = titleTextStyle || PromoPanelTextStyles_1.PromoPanelTextStyles.FEATURE_BASE_PANEL_TITLE;
    }
    init() {
        this.createLogo();
        this.createTitle();
        this.addEventListeners();
        this._init = true;
    }
    addEventListeners() {
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.ON_RESIZE, () => this.onResize());
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.ON_ORIENTATION_CHANGED, () => this.onOrientationChanged());
    }
    /**
     * To create generic logo for every feature view
     */
    createLogo() {
        this._logo = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(this._logoName));
        this._logo.anchor.set(0, 0.5);
        this._logo.pivot.y = -2;
        this.addChild(this._logo);
    }
    /**
     * To create generic title for every feature view
     */
    createTitle() {
        this._title = new Label_1.Label(this._titleStr, this._titleTextStyle);
        this._title.anchor.set(0, 0.5);
        this.addChild(this._title);
    }
    onOrientationChanged() {
    }
    /**
     * To open a feature view
     */
    open() {
        if (!this._init) {
            this.init();
        }
        this._isOpen = true;
        this.interactive = true;
        this.interactiveChildren = true;
        this.onResize();
        this.show();
    }
    close() {
        this.hide();
        this._isOpen = false;
    }
    show() {
        this.visible = true;
    }
    ;
    hide() {
        this.visible = false;
    }
    onResize() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        //const isLandscape: boolean = NolimitApplication.isLandscape && Helper.isDefaultScreenRatio(bounds);
        let midX = bounds.width * 0.5;
        let marginTop = 40;
        const totalWidth = this._title.width + this._logo.width + 24;
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            marginTop = 45;
            midX = (bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT) * 0.5; //height will be width in landscape
        }
        this._logo.position.set(midX - totalWidth * 0.5 - 3, 32.5 + marginTop);
        this._title.position.set(this._logo.x + this._logo.width + 24, 32.5 + marginTop);
    }
    get logo() {
        return this._logo;
    }
}
exports.FeatureBasePanel = FeatureBasePanel;
//# sourceMappingURL=FeatureBasePanel.js.map