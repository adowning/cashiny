"use strict";
/**
 * Created by Pankaj on 2019-12-18.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelButton = void 0;
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const PromoPanelAssetConfig_1 = require("../config/PromoPanelAssetConfig");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PromoPanelEvents_1 = require("../events/PromoPanelEvents");
const PromoPanelButtonIDs_1 = require("../enums/PromoPanelButtonIDs");
const PromoPanelConfig_1 = require("../config/PromoPanelConfig");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
class PanelButton extends PIXI.Container {
    constructor(buttonConfig, controller, childIndex) {
        super();
        this._active = false;
        this.INACTIVE_COLOUR = 0xffffff;
        this._controller = controller;
        this._index = childIndex;
        this._buttonConfig = buttonConfig;
        this._btnId = buttonConfig.id;
        this.name = this._btnId + "_CONTAINER";
        this.init();
        this.addEventListener();
    }
    addEventListener() {
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.DISABLE_ALL_NAV_BUTTON, () => this.setInActive());
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.NAV_BUTTON_PRESSED, (btnId) => this.setActive(btnId));
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.DISABLE_NAV_BUTTON, (btnId) => this.disable(btnId));
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.ENABLE_NAV_BUTTON, (btnId) => this.enable(btnId));
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.HIDE_NAV_BUTTON, (btnId) => this.hide(btnId));
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.SHOW_NAV_BUTTON, (btnId) => this.show(btnId));
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.TOGGLE_BUTTONS_ON_LIGHTING_SPINS, (toggle) => this.toggleButton(toggle));
    }
    toggleButton(toggle) {
        this._btn.enable(this._buttonConfig.isDisabled ? false : toggle);
    }
    hide(btnId) {
        if (btnId == this._btnId) {
            this.alpha = 0;
        }
    }
    show(btnId) {
        if (btnId == this._btnId) {
            this.alpha = 1;
        }
    }
    setInActive() {
        this.active = false;
    }
    setActive(btnId) {
        this.active = this._btnId == btnId;
    }
    disable(btnId) {
        if (btnId) {
            btnId == this._btnId && this.disable();
        }
        else {
            this._btn.enable(false);
            this._btn.alpha = PromoPanelConfig_1.PromoPanelConfig.DISABLE_BTN_ALPHA;
        }
    }
    enable(btnId) {
        if (btnId) {
            btnId == this._btnId && this.enable();
        }
        else {
            this._btn.enable(true);
            this._btn.alpha = PromoPanelConfig_1.PromoPanelConfig.ENABLE_BTN_ALPHA;
        }
    }
    enableButton(btnId) {
        this.active = this._btnId == btnId;
    }
    createButton() {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        let onIcons;
        switch (this._btnId) {
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_BONUS:
                onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_NOLIMIT_BONUS)));
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_WINNERS:
                onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_NOLIMIT_WINNERS)), undefined, undefined, new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_NOLIMIT_WINNERS_DISABLED)));
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS:
                onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_ACTION_SPINS)));
                break;
            case PromoPanelButtonIDs_1.PromoPanelButtonIDs.VOUCHER:
                onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_VOUCHER_DISABLED)));
                break;
            default:
                onIcons = new PointerStateIconSet_1.PointerStateIconSet();
                Logger_1.Logger.warn("Btn id not available");
        }
        this._btn = new IconToggleButton_1.IconToggleButton(this._btnId, onIcons, colors);
        this._btn.addClickCallback(() => this._controller.buttonClick(this._btn));
        this._buttonConfig.isDisabled ? this.disable() : this.enable();
        this._buttonConfig.shouldHide && this.hide(this._btnId);
        this.addChild(this._btn);
        this.position.set(this.width / 2, this.height / 2);
        this.pivot.set(this.width / 2, this.height / 2);
    }
    createHighlightLine() {
        this._activeHighlightLine = new PIXI.Sprite(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_ACTIVE));
        this._activeHighlightLine.tint = this.INACTIVE_COLOUR;
        this._activeHighlightLine.anchor.set(0.5, 0.5);
        this.addChild(this._activeHighlightLine);
        this._activeHighlightLine.position.set(this.x, this.y);
    }
    init() {
        this.createButton();
        this.createHighlightLine();
        this.pivot.set(this.width / 2, this.height / 2);
    }
    onResize(pos) {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        const width = ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NAV_NOLIMIT_BONUS).width;
        let gap = (bounds.width - (width * 4)) * 0.20;
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            //this.rotation = -FeatureBtnPanelView.ROTATION_IN_LANDSCAPE;
            gap = ((bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight()) - (width * 4)) * 0.20;
            this.position.set(pos.x, (gap + width / 2) * (this._index + 1) + width / 2 * (this._index));
        }
        else {
            this.rotation = 0;
            this.position.set((gap + width / 2) * (this._index + 1) + width / 2 * (this._index), pos.y + 20);
        }
    }
    get active() {
        return this._active;
    }
    set active(value) {
        this._activeHighlightLine.tint = value ? this._buttonConfig.viewBackgroundColor : this.INACTIVE_COLOUR;
        this._activeHighlightLine.visible = value;
        this._active = value;
    }
}
exports.PanelButton = PanelButton;
//# sourceMappingURL=PanelButton.js.map