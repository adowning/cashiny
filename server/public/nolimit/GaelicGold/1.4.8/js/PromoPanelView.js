"use strict";
/**
 * Created by Jonas Wålekvist on 2019-12-05.
 * Code added by Pankaj.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoPanelView = void 0;
const ScreenBounds_1 = require("@nolimitcity/slot-launcher/bin/display/ScreenBounds");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const NolimitPromotionPlugin_1 = require("./NolimitPromotionPlugin");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const gsap_1 = require("gsap");
const NavigationPanelView_1 = require("./buttonpanel/NavigationPanelView");
const PromoPanelAssetConfig_1 = require("./config/PromoPanelAssetConfig");
const PromoPanelEvents_1 = require("./events/PromoPanelEvents");
const PromoPanelLabelIDs_1 = require("./enums/PromoPanelLabelIDs");
const PromoPanelTextStyles_1 = require("./config/PromoPanelTextStyles");
const PromoPanelButtonIDs_1 = require("./enums/PromoPanelButtonIDs");
const PromoPanelConfig_1 = require("./config/PromoPanelConfig");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const ConfirmBetPopUpView_1 = require("./feature/generic/ConfirmBetPopUpView");
class PromoPanelView extends PIXI.Container {
    get popUpView() {
        return this._popUpView;
    }
    constructor(controller) {
        super();
        this._backgroundColor = PIXI.utils.string2hex("#ee2552");
        this._isBlurred = false;
        this._isLandscape = NolimitApplication_1.NolimitApplication.isLandscape;
        this.name = "PromoPanelView";
        this._controller = controller;
        this.addEventListener();
    }
    drawBackground() {
        this._background.tint = this.backgroundColor;
        this._background.width = NolimitApplication_1.NolimitApplication.screenBounds.width;
        this._background.height = NolimitApplication_1.NolimitApplication.screenBounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight();
    }
    close(isFreeBetTriggered = false) {
        if (this._isOpen) {
            NolimitApplication_1.NolimitApplication.removeDialog(this, !isFreeBetTriggered);
            this._isOpen = false;
            this.interactive = false;
            this.interactiveChildren = false;
            NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.TOGGLE_BUTTONS_ON_LIGHTING_SPINS, true);
            NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(PromoPanelEvents_1.PromoPanelEvents.PROMO_PANEL_CLOSED);
        }
    }
    open() {
        if (!this._init) {
            this.init();
            this._init = true;
        }
        this._isOpen = true;
        this.interactive = true;
        this.interactiveChildren = true;
        this.onResize();
        this.show();
        NolimitApplication_1.NolimitApplication.addDialog(this, true);
    }
    shouldResize() {
        return (this._init && this._isOpen);
    }
    onResize() {
        if (this.shouldResize()) {
            if (this.popUpView.isOpen) {
                this.popUpView.resize();
            }
            const bounds = (0, ScreenBounds_1.cloneScreenBounds)(NolimitApplication_1.NolimitApplication.screenBounds);
            this.position.set(bounds.left, bounds.top);
            bounds.height -= NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight();
            this.drawBackground();
            const topBarMid = 59;
            this._closeButton.position.set(bounds.width - this._closeButton.width - 5, topBarMid - this._closeButton.height / 2);
            this._closeBtnXmark.position.set(this._closeButton.x + this._closeButton.width * 0.5, this._closeButton.y + this._closeButton.height * 0.5 - 4);
            this._logo.position.set(bounds.width / 2 - 230, topBarMid);
            this._label.position.set(bounds.width / 2 - 10, topBarMid);
            this._promoLabel.position.set(bounds.width / 2 - 8, topBarMid);
            let midX = bounds.width * 0.5;
            const totalWidth = this._label.width + this._promoLabel.width + this._logo.width + 14;
            this._logo.position.set(midX - totalWidth * 0.5, topBarMid + 3);
            this._label.position.set(this._logo.x + this._logo.width + 14, topBarMid);
            this._promoLabel.position.set(this._label.x + this._label.width, topBarMid);
            this._topBar.position.set(bounds.width / 2, -5);
            this._navigationPanel.onResize();
            this._closeButton.alpha = 1;
            if (NolimitApplication_1.NolimitApplication.isLandscape) {
                this._topBar.visible = false;
                this._logo.visible = false;
                this._label.visible = false;
                this._content.visible = false;
                this._closeBtnXmark.visible = true;
                const closeBtnGap = (45 + this._closeBtnXmark.height * 0.5) - 6;
                this._closeBtnXmark.position.set(bounds.width - closeBtnGap - 28, closeBtnGap + 21);
                this._closeButton.position.set(this._closeBtnXmark.x - this._closeButton.width * 0.5, this._closeBtnXmark.y - this._closeButton.height * 0.5 + 5);
                this._hBottomLine.visible = true;
                this._hBottomLine.position.set(0, bounds.height - 1);
            }
            else {
                this._hBottomLine.visible = false;
                this._closeButton.alpha = 0;
                this._topBar.visible = true;
                this._logo.visible = true;
                this._label.visible = true;
                this._content.visible = true;
            }
            if (this._popupDarkOverlay.visible) {
                this.drawPopupDarkOverlay();
            }
        }
        NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.ON_RESIZE);
        if (this._isLandscape != NolimitApplication_1.NolimitApplication.isLandscape) {
            this.onOrientationChanged();
            this._isLandscape = NolimitApplication_1.NolimitApplication.isLandscape;
        }
    }
    addBlur() {
        this._isBlurred = true;
        if (this._featureContainer.filters == undefined) {
            this._featureContainer.filters = [];
        }
        this._featureContainer.filters.push(this._blur1, this._blur2);
        const tl = new gsap_1.TimelineLite();
        tl.add([
            new gsap_1.TweenLite(this._blur1, 0.2, { blurX: 16, blurY: 16 }),
            new gsap_1.TweenLite(this._blur2, 0.2, { blurX: 10, blurY: 10 }),
        ]);
        return tl;
    }
    removeBlur() {
        if (this._isBlurred) {
            const tl = new gsap_1.TimelineLite({
                onComplete: () => {
                    for (let i = this._featureContainer.filters.length - 1; i >= 0; i--) {
                        const filter = this._featureContainer.filters[i];
                        if (filter == this._blur1 || filter == this._blur2) {
                            this._featureContainer.filters.splice(i, 1);
                        }
                    }
                    this._isBlurred = false;
                }
            });
            tl.add([
                new gsap_1.TweenLite(this._blur1, 0.2, { blurX: 0, blurY: 0 }),
                new gsap_1.TweenLite(this._blur2, 0.2, { blurX: 0, blurY: 0 }),
            ]);
            return tl;
        }
    }
    onOrientationChanged() {
        NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.ON_ORIENTATION_CHANGED);
        /*        if (this.shouldResize()) {
                    //Do stuff maybe
                }*/
    }
    show(duration) {
        const tl = new gsap_1.TimelineLite();
        if (duration) {
            this.visible = true;
            tl.add(new gsap_1.TweenLite(this, duration, { alpha: 1, ease: gsap_1.Linear.easeNone }));
            tl.add(() => {
                this.alpha = 1;
            });
        }
        else {
            tl.add(() => {
                this.alpha = 1;
                this.visible = true;
            });
        }
        return tl;
    }
    hide(duration) {
        const tl = new gsap_1.TimelineLite();
        if (duration) {
            tl.add(new gsap_1.TweenLite(this, duration, { alpha: 0, ease: gsap_1.Linear.easeNone }));
            tl.add(() => {
                this.visible = false;
            });
        }
        else {
            tl.add(() => {
                this.alpha = 0;
                this.visible = false;
            });
        }
        return tl;
    }
    createFeatureBtnPanel() {
        this._navigationPanel = new NavigationPanelView_1.NavigationPanelView(this._controller);
        this._promoContainer.addChild(this._navigationPanel);
    }
    createPopUpView() {
        this._popUpView = new ConfirmBetPopUpView_1.ConfirmBetPopUpView();
        this.addChild(this._popUpView);
    }
    createBottomWhiteLine() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        this._hBottomLine = new PIXI.Graphics();
        this._hBottomLine.name = "H_BOTTOM_LINE";
        this._hBottomLine.lineStyle(2, 0xffffff)
            .moveTo(0, 0)
            .lineTo(Math.max(bounds.width, bounds.height), 0);
        this._promoContainer.addChild(this._hBottomLine);
    }
    addEventListener() {
        //NolimitApplication.events.on(PromoPanelEvents.BLUR_BACKGROUND, (shouldBlur: boolean) => this.setBGBlur(shouldBlur));
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.SHOW_HIDE_CLOSE_BUTTON, (isShow) => this.showHideCloseBtn(isShow));
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.ON_POPUP_OPEN, () => this.onPopUpOpen());
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.ON_POPUP_CLOSE, () => this.onPopUpClose());
        NolimitApplication_1.NolimitApplication.events.on(PromoPanelEvents_1.PromoPanelEvents.TOGGLE_BUTTONS_ON_LIGHTING_SPINS, (toggle) => this._closeButton.enable(toggle));
    }
    showHideCloseBtn(isShow) {
        this._closeBtnXmark.visible = isShow;
        this._closeButton.visible = isShow;
    }
    onPopUpOpen() {
        this.drawPopupDarkOverlay();
        this.addBlur();
        this._featureContainer.interactive = false;
        this._featureContainer.interactiveChildren = false;
        this._navigationPanel.interactive = false;
        this._navigationPanel.interactiveChildren = false;
    }
    removePopupDarkOverlay() {
        this._popupDarkOverlay.clear();
        this._popupDarkOverlay.visible = false;
        this._featureContainer.interactive = true;
        this._featureContainer.interactiveChildren = true;
        this._navigationPanel.interactive = true;
        this._navigationPanel.interactiveChildren = true;
    }
    onPopUpClose() {
        this.removeBlur();
        if (this._popupDarkOverlay.visible) {
            this.removePopupDarkOverlay();
        }
    }
    init() {
        this._promoContainer = new PIXI.Container();
        this._promoContainer.name = "PROMO_CONTAINER";
        this.addChild(this._promoContainer);
        this.createBlurFilters();
        this._background = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._background.name = "PROMO_BACKGROUND";
        this._content = new PIXI.Container();
        this._content.name = "PROMO_PANEL_VIEW_HEADING";
        this._featureContainer = new PIXI.Container();
        this._featureContainer.name = "MASTER_FEATURE_CONTAINER";
        this._label = new Label_1.Label(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.PROMO_PANEL_HEADING + PromoPanelConfig_1.PromoPanelConfig.SINGLE_BLANK_SPACE), PromoPanelTextStyles_1.PromoPanelTextStyles.PROMO_PANEL_HEADING);
        this._label.anchor.set(0, 0.5);
        this._promoLabel = new Label_1.Label(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.PROMO_PANEL_PROMOTIONS_HEADING), PromoPanelTextStyles_1.PromoPanelTextStyles.PROMO_PANEL_PROMOTIONS_HEADING);
        this._promoLabel.anchor.set(0, 0.5);
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.CLOSE_BG_ICON)));
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xFFffffff);
        this._closeButton = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.CLOSE, onIcons, colors);
        this._closeButton.addClickCallback(() => this._controller.buttonClick(this._closeButton));
        this._closeButton.toggled = false;
        this._closeButton.enable(true);
        this._closeBtnXmark = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.CLOSE));
        this._closeBtnXmark.tint = 0x000000;
        this._closeBtnXmark.anchor.set(0.5, 0.5);
        this._closeBtnXmark.pivot.y = -3;
        this._logo = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NOLIMIT_PROMOTIONS_LOGO));
        this._logo.anchor.set(0, 0.5);
        this._logo.pivot.y = 4;
        this._topBar = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.TOP_BAR));
        this._topBar.width = 720;
        this._topBar.anchor.set(0.5, 0);
        this._content.addChild(this._topBar, this._logo, this._promoLabel, this._label);
        this._promoContainer.addChild(this._background);
        this._popupDarkOverlay = new PIXI.Graphics();
        this._popupDarkOverlay.visible = false;
        this._popupDarkOverlay.alpha = 0.4;
        this._promoContainer.addChild(this._featureContainer);
        this._promoContainer.addChild(this._popupDarkOverlay);
        this._promoContainer.addChild(this._content);
        this._promoContainer.addChild(this._closeButton, this._closeBtnXmark);
        this.createBottomWhiteLine();
        this.createFeatureBtnPanel();
        this.createPopUpView();
    }
    drawPopupDarkOverlay() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        this._popupDarkOverlay.clear();
        this._popupDarkOverlay.beginFill(0x000000);
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._popupDarkOverlay.drawRect(0, 0, bounds.width, bounds.height); //PROMO_PANEL_BTN_PANEL_HEIGHT will be width in landscape mode
        }
        else {
            this._popupDarkOverlay.drawRect(0, 0, bounds.width, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight());
        }
        this._popupDarkOverlay.endFill();
        this._popupDarkOverlay.visible = true;
    }
    createBlurFilters() {
        this._blur1 = new PIXI.filters.BlurFilter(0, 6);
        this._blur1.autoFit = true;
        this._blur1.repeatEdgePixels = false;
        this._blur2 = new PIXI.filters.BlurFilter(0, 6);
        this._blur2.autoFit = true;
        this._blur2.repeatEdgePixels = false;
    }
    get backgroundColor() {
        return this._backgroundColor;
    }
    set backgroundColor(value) {
        this._backgroundColor = value;
        this.drawBackground();
    }
    get featureContainer() {
        return this._featureContainer;
    }
    set featureContainer(value) {
        this._featureContainer = value;
    }
    get isOpen() {
        return this._isOpen;
    }
}
exports.PromoPanelView = PromoPanelView;
//# sourceMappingURL=PromoPanelView.js.map