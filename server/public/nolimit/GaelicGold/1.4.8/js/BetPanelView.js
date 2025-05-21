"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetPanelView = void 0;
/**
 * Created by Jonas Wålekvist on 2019-09-17.
 */
const SlotKeypad_1 = require("../../SlotKeypad");
const SpinButton_1 = require("./buttons/SpinButton");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const SlotKeypadViewSettings_1 = require("../SlotKeypadViewSettings");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const LabeledValue_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/LabeledValue");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const AutoplayButton_1 = require("./buttons/AutoplayButton");
const NolimitBrandLabel_1 = require("./betpanel/NolimitBrandLabel");
const FullscreenSpinButton_1 = require("./buttons/FullscreenSpinButton");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const ZeroBetCounter_1 = require("./betpanel/ZeroBetCounter");
const gsap_1 = require("gsap");
const APISettingsSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APISettingsSystem");
const WinLabel_1 = require("./betpanel/WinLabel");
const SpinSettingsGroup_1 = require("./betpanel/SpinSettingsGroup");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const BetLevelButton_1 = require("./betpanel/BetLevelButton");
const KeypadTextStyles_1 = require("../config/KeypadTextStyles");
const SkinLoader_1 = require("../../SkinLoader");
const SoundButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/SoundButton");
const LimitCapButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/LimitCapButton");
const NolimitBonusMenu_1 = require("./betpanel/NolimitBonusMenu");
const ConfirmBetPopUpView_1 = require("./betpanel/parts/ConfirmBetPopUpView");
class BetPanelView extends PIXI.Container {
    get interactionEnabled() {
        return this._interactionEnabled;
    }
    set interactionEnabled(value) {
        this._interactionEnabled = value;
    }
    get betFeatureConfirmPopUp() {
        return this._betFeatureConfirmPopUp;
    }
    get totalCost() {
        return this._totalCost;
    }
    get permanentContainer() {
        return this._permanentContainer;
    }
    get freeBetsTotalWin() {
        return this._freeBetsTotalWin;
    }
    get staticContainer() {
        return this._staticContainer;
    }
    get dynamicContainer() {
        return this._dynamicContainer;
    }
    get demoButton() {
        return this._demoButton;
    }
    get soundButton() {
        return this._soundButton;
    }
    get promoButton() {
        return this._promoButton;
    }
    get zeroBetCounter() {
        return this._zeroBetCounter;
    }
    get fullscreenSpinButton() {
        return this._fullscreenSpinButton;
    }
    get betLevelButton() {
        return this._betLevelButton;
    }
    /*    get nolimitBonusButton():IconToggleButton {
            return this._nolimitBonusMenu.nolimitBonusButton;
        }*/
    get nolimitBonusMenu() {
        return this._nolimitBonusMenu;
    }
    get limitCapButton() {
        return this._limitCapButton;
    }
    get menuButton() {
        return this._menuButton;
    }
    get spinButton() {
        return this._spinButton;
    }
    get spinSettingsGroup() {
        return this._spinSettingsGroup;
    }
    get fastSpinButton() {
        return this._fastSpinButton;
    }
    get autoplayButton() {
        return this._autoplayButton;
    }
    get bet() {
        return this._bet;
    }
    get balance() {
        return this._balance;
    }
    get win() {
        return this._win;
    }
    constructor(controller) {
        super();
        this.backgroundGradientMaxAlpha = 0.6;
        this.spinButtonCenter = new PIXI.Point();
        this._interactionEnabled = true;
        this._controller = controller;
        this.name = "SlotKeypadView";
        this.initAnimations();
        this.hideWin(0);
        SlotKeypad_1.SlotKeypad.apiPlugIn.settings.on(APISettingsSystem_1.APISetting.LEFT_HAND_MODE, () => this.onResize());
    }
    onResize() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        this._backgroundGradient.position.set(bounds.left, bounds.bottom);
        this._backgroundGradient.width = bounds.width;
        this._backgroundGradient.height = 40;
        this._fullscreenSpinButton.position.set(bounds.left, bounds.top);
        this._fullscreenSpinButton.width = bounds.width;
        this._fullscreenSpinButton.height = bounds.height;
        this._spinSettingsGroup.resize();
        const roundedCornerCompensation = SlotKeypad_1.SlotKeypad.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.DEVICE_HAS_ROUNDED_CORNERS) === true ? 50 : 0;
        const edgeMarginX = 10;
        const edgeMarginY = 10;
        const labelBottomEdgeMargin = edgeMarginY - 7;
        let spinCenter = new PIXI.Point(bounds.center, bounds.bottom - 234); //Portrait
        let spinGroupY = bounds.bottom - 124;
        const spinButtonWidth = 200;
        const spinButtonHeight = 180;
        let zeroBetCounterOffset = new PIXI.Point();
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            //Win / Balance
            this._win.position.set(bounds.center, bounds.bottom - labelBottomEdgeMargin);
            this._balance.position.set(bounds.right - edgeMarginX - roundedCornerCompensation, bounds.bottom - labelBottomEdgeMargin);
            this._bet.position.set(bounds.left + edgeMarginX + roundedCornerCompensation, bounds.bottom - labelBottomEdgeMargin);
            //Buttons
            this._soundButton.position.set(bounds.left + edgeMarginX, spinGroupY);
            this._betLevelButton.position.set(this._soundButton.x + this._soundButton.width + edgeMarginX * 2, spinGroupY);
            this._menuButton.position.set(bounds.left + edgeMarginX, this._soundButton.y - this._soundButton.height - edgeMarginY * 2);
            this._promoButton.position.set(bounds.left + edgeMarginX, this._menuButton.y - this._promoButton.height - edgeMarginY * 3);
            //Spin related
            spinCenter = new PIXI.Point(bounds.right - edgeMarginX - spinButtonWidth * 0.5, bounds.bottom - 234);
            this._spinSettingsGroup.position.set(Math.floor(spinCenter.x - this._spinSettingsGroup.getWidth() * 0.5), spinGroupY);
            if (SlotKeypad_1.SlotKeypad.apiPlugIn.settings.get(APISettingsSystem_1.APISetting.LEFT_HAND_MODE)) {
                spinCenter = new PIXI.Point(bounds.left + edgeMarginX + spinButtonWidth * 0.5, bounds.bottom - 238);
            }
            if (this._nolimitBonusMenu.parent != undefined) {
                this._limitCapButton.position.set(Math.floor(spinCenter.x - this._limitCapButton.width * 0.5), spinCenter.y - this._limitCapButton.height - 265);
            }
            else {
                this._limitCapButton.position.set(Math.floor(spinCenter.x - this._limitCapButton.width * 0.5), spinCenter.y - this._limitCapButton.height - 95);
            }
            //this._limitCapButton.position.set(this._spinSettingsGroup.x - this._limitCapButton.width - edgeMarginX*2, this._spinSettingsGroup.y - 20);
            zeroBetCounterOffset.set(43, 50);
        }
        else {
            const spinBottom = spinCenter.y - 1 + spinButtonHeight * 0.5;
            //Win / Balance
            this._bet.position.set(bounds.left + edgeMarginX + roundedCornerCompensation, bounds.bottom - labelBottomEdgeMargin);
            this._balance.position.set(bounds.right - edgeMarginX - roundedCornerCompensation, bounds.bottom - labelBottomEdgeMargin);
            this._rightSeparator.position.set(bounds.right - edgeMarginX, spinBottom);
            this._win.position.set(bounds.right - edgeMarginX, spinBottom - labelBottomEdgeMargin);
            //Buttons left
            this._spinSettingsGroup.position.set(Math.floor(bounds.center - this._spinSettingsGroup.getWidth() * 0.5), spinGroupY);
            this._soundButton.position.set(bounds.left + edgeMarginX, spinGroupY);
            this._betLevelButton.position.set(this._soundButton.x + this._soundButton.width + edgeMarginX * 2, spinGroupY);
            this._promoButton.position.set(bounds.left + edgeMarginX, this._betLevelButton.y - this._promoButton.height - edgeMarginY * 3);
            //Buttons right
            this._menuButton.position.set(bounds.right - this._menuButton.width - edgeMarginX, spinGroupY);
            this._nolimitBrandLabel.position.set(bounds.center, bounds.bottom - labelBottomEdgeMargin);
            this._limitCapButton.position.set(this._menuButton.x - this._limitCapButton.width - edgeMarginX, this._menuButton.y - 20);
            zeroBetCounterOffset.set(0, 50);
        }
        if (this._freeBetsTotalWin.visible) {
            this._freeBetsTotalWin.position.set(bounds.left + edgeMarginX + roundedCornerCompensation, this._bet.y - this._freeBetsTotalWin.height - labelBottomEdgeMargin);
            const buttonsToMove = [this._soundButton, this._betLevelButton, this._promoButton];
            if (NolimitApplication_1.NolimitApplication.isLandscape) {
                buttonsToMove.push(this._menuButton);
            }
            GuiLayout_1.GuiLayout.offset(buttonsToMove, 0, -this._freeBetsTotalWin.height);
        }
        if (this._totalCost.visible) {
            this._totalCost.position.set(bounds.left + edgeMarginX + roundedCornerCompensation, this._bet.y - this._totalCost.height - labelBottomEdgeMargin);
            const buttonsToMove = [this._soundButton, this._betLevelButton, this._promoButton];
            if (NolimitApplication_1.NolimitApplication.isLandscape) {
                buttonsToMove.push(this._menuButton);
            }
            GuiLayout_1.GuiLayout.offset(buttonsToMove, 0, -this._totalCost.height);
        }
        this._demoButton.position.set(bounds.right - this._demoButton.width - edgeMarginX, bounds.top + 40);
        this._spinButton.position.set(spinCenter.x - spinButtonWidth * 0.5, spinCenter.y - spinButtonHeight * 0.5);
        this._zeroBetCounter.position.set(spinCenter.x - this._zeroBetCounter.width * 0.5 + zeroBetCounterOffset.x, spinCenter.y - this._zeroBetCounter.height * 0.5 + zeroBetCounterOffset.y);
        this.spinButtonCenter = spinCenter.clone();
        this._nolimitBonusMenu.onResize();
        this._betFeatureConfirmPopUp.resize();
    }
    onOrientationChanged() {
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._bet.setAnchor(0, 1);
            this._freeBetsTotalWin.setAnchor(0, 1);
            this._totalCost.setAnchor(0, 1);
            this._win.setAnchor(0.5, 1);
            this._balance.setAnchor(1, 1);
            this._nolimitBrandLabel.pivot.set(this._nolimitBrandLabel.width * 0.5, this._nolimitBrandLabel.height);
            this._staticContainer.removeChild(this._rightSeparator);
            this._staticContainer.removeChild(this._nolimitBrandLabel);
        }
        else {
            this._bet.setAnchor(0, 1);
            this._freeBetsTotalWin.setAnchor(0, 1);
            this._totalCost.setAnchor(0, 1);
            this._win.setAnchor(1, 1);
            this._balance.setAnchor(1, 1);
            this._rightSeparator.lineStyle(1, 0xffffff, 0.6);
            this._rightSeparator.lineTo(-150, 0);
            this._staticContainer.addChild(this._rightSeparator);
            this._staticContainer.addChild(this._nolimitBrandLabel);
        }
        this._nolimitBonusMenu.onOrientationChanged();
    }
    createPermanentContainer() {
        const cont = new PIXI.Container();
        cont.name = "PermanentContainer";
        this._balance = new LabeledValue_1.LabeledValue(SlotKeypad_1.KeypadValueIDs.BALANCE, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("BALANCE"), -1, KeypadTextStyles_1.KeypadTextStyles.KEYPAD_STANDARD_LABEL, KeypadTextStyles_1.KeypadTextStyles.KEYPAD_STANDARD_VALUE);
        this._bet = new LabeledValue_1.LabeledValue(SlotKeypad_1.KeypadValueIDs.BET, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("BET"), -1, KeypadTextStyles_1.KeypadTextStyles.KEYPAD_STANDARD_LABEL, KeypadTextStyles_1.KeypadTextStyles.KEYPAD_STANDARD_VALUE);
        this._totalCost = new LabeledValue_1.LabeledValue(SlotKeypad_1.KeypadValueIDs.TOTAL_COST, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("TOTAL COST"), -1, KeypadTextStyles_1.KeypadTextStyles.TOTAL_COST_LABEL, KeypadTextStyles_1.KeypadTextStyles.TOTAL_COST_VALUE);
        this._totalCost.visible = false;
        this._betFeatureConfirmPopUp = new ConfirmBetPopUpView_1.ConfirmBetPopUpView();
        cont.addChild(this._betFeatureConfirmPopUp);
        cont.addChild(this._bet);
        cont.addChild(this._balance);
        cont.addChild(this._totalCost);
        return cont;
    }
    createStaticContainer() {
        const cont = new PIXI.Container();
        cont.name = "StaticContainer";
        this._rightSeparator = new PIXI.Graphics();
        this._rightSeparator.name = "_rightSeparator";
        this._nolimitBrandLabel = new NolimitBrandLabel_1.NolimitBrandLabel();
        this._win = new WinLabel_1.WinLabel(SlotKeypad_1.KeypadValueIDs.WIN, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("WIN"), -1, KeypadTextStyles_1.KeypadTextStyles.WIN_LABEL, KeypadTextStyles_1.KeypadTextStyles.WIN_VALUE);
        this._zeroBetCounter = new ZeroBetCounter_1.ZeroBetCounter();
        this._fullscreenSpinButton = new FullscreenSpinButton_1.FullscreenSpinButton(SlotKeypad_1.KeypadButtonIDs.FULLSCREEN_SPIN);
        this._fullscreenSpinButton.alpha = 0;
        this._fullscreenSpinButton.addClickCallback(() => this._controller.buttonClick(this._fullscreenSpinButton));
        this._soundButton = new SoundButton_1.SoundButton(SlotKeypad_1.KeypadButtonIDs.SOUND);
        this._soundButton.addClickCallback(() => this._controller.buttonClick(this._soundButton));
        this._soundButton.toggled = !SlotKeypad_1.SlotKeypad.sound.isQuickMute();
        this._freeBetsTotalWin = new LabeledValue_1.LabeledValue(SlotKeypad_1.KeypadValueIDs.FREE_BETS_TOTAL_WIN, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("TOTAL WIN"), -1, KeypadTextStyles_1.KeypadTextStyles.FREE_BETS_WIN_LABEL, KeypadTextStyles_1.KeypadTextStyles.FREE_BETS_WIN_VALUE);
        this._freeBetsTotalWin.visible = false;
        cont.addChild(this._freeBetsTotalWin);
        cont.addChild(this._win);
        cont.addChild(this._zeroBetCounter);
        cont.addChild(this._fullscreenSpinButton);
        cont.addChild(this._soundButton);
        return cont;
    }
    createDynamicContainer() {
        const cont = new PIXI.Container();
        cont.name = "DynamicContainer";
        this._spinButton = new SpinButton_1.SpinButton();
        this._spinButton.addClickCallback(() => this._controller.buttonClick(this._spinButton));
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let onIcons;
        let offIcons;
        this._nolimitBonusMenu = new NolimitBonusMenu_1.NolimitBonusMenu(this._controller, this._behindAllButtonsContainer);
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.BET_LEVELS_BUTTON)));
        this._betLevelButton = new BetLevelButton_1.BetLevelButton(SlotKeypad_1.KeypadButtonIDs.BET_LEVEL, onIcons, normalNonEmphasisColors);
        this._betLevelButton.addClickCallback(() => this._controller.buttonClick(this._betLevelButton));
        this._betLevelButton.toggled = false;
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.MENU_CLOSE)));
        offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.MENU)));
        this._menuButton = new IconToggleButton_1.IconToggleButton(SlotKeypad_1.KeypadButtonIDs.MENU, onIcons, normalNonEmphasisColors, offIcons);
        this._menuButton.addClickCallback(() => this._controller.buttonClick(this._menuButton));
        this._menuButton.toggled = false;
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.PROMO_BUTTON)));
        offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.PROMO_BUTTON)));
        this._promoButton = new IconToggleButton_1.IconToggleButton(SlotKeypad_1.KeypadButtonIDs.PROMO_BUTTON, onIcons, normalNonEmphasisColors, offIcons);
        this._promoButton.pivot.x = 60;
        this._promoButton.addClickCallback(() => this._controller.buttonClick(this._promoButton));
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.DEMO_ICON)));
        offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.DEMO_ICON)));
        this._demoButton = new IconToggleButton_1.IconToggleButton(SlotKeypad_1.KeypadButtonIDs.DEMO, onIcons, normalNonEmphasisColors, offIcons);
        this._demoButton.addClickCallback(() => this._controller.buttonClick(this._demoButton));
        this._limitCapButton = new LimitCapButton_1.LimitCapButton(SlotKeypad_1.KeypadButtonIDs.LIMIT_CAP);
        this._limitCapButton.addClickCallback(() => this._controller.buttonClick(this._limitCapButton));
        cont.addChild(this._spinButton);
        cont.addChild(this._betLevelButton);
        cont.addChild(this._menuButton);
        cont.addChild(this._promoButton);
        cont.addChild(this._demoButton);
        cont.addChild(this._nolimitBonusMenu);
        cont.addChild(this._limitCapButton);
        return cont;
    }
    createSpinSettingsGroup() {
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.activePointerStateColors.clone();
        let onIcons;
        let offIcons;
        //onIcons = new PointerStateIconSet(new Icon(SvgLoader.getSvgTexture(KeypadAssetConfig.FAST_SPIN)));
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.FAST_SPIN)));
        this._fastSpinButton = new IconToggleButton_1.IconToggleButton(SlotKeypad_1.KeypadButtonIDs.FAST_SPIN, onIcons, activeColors, undefined, normalNonEmphasisColors);
        this._fastSpinButton.addClickCallback(() => this._controller.buttonClick(this._fastSpinButton));
        this._fastSpinButton.toggled = false;
        onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.AUTO_PLAY_ON)));
        offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.AUTO_PLAY_OFF)));
        this._autoplayButton = new AutoplayButton_1.AutoplayButton(SlotKeypad_1.KeypadButtonIDs.AUTO_PLAY, onIcons, activeColors, offIcons, normalNonEmphasisColors);
        this._autoplayButton.addClickCallback(() => this._controller.buttonClick(this._autoplayButton));
        this._autoplayButton.toggled = false;
        return new SpinSettingsGroup_1.SpinSettingsGroup(this._fastSpinButton, this._autoplayButton);
    }
    initAnimations() {
        this._behindAllButtonsContainer = new PIXI.Container();
        const gradientImgData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAEACAYAAACOKzdSAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGRJREFUeNrs2bsNACAMQ0GD2H9mNoAuIuJSW+HFpuAzkowcauZS648OIN9ZAkMjBmNykqCxYPJBFnz4dQqQIDEIC4MNgwEkSGdaNxQ+yIKgocALJyfbjYmhjMFP8TuQBR22AAMAFikEyMCk4fEAAAAASUVORK5CYII=";
        const base = PIXI.BaseTexture.from(gradientImgData);
        this._backgroundGradient = new PIXI.Sprite(new PIXI.Texture(base));
        this._backgroundGradient.anchor.set(0, 1);
        this._backgroundGradient.name = "BackgroundGradient";
        this._backgroundGradient.alpha = this.backgroundGradientMaxAlpha;
        this._behindAllButtonsContainer.addChild(this._backgroundGradient);
        this._permanentContainer = this.createPermanentContainer();
        this._staticContainer = this.createStaticContainer();
        this._dynamicContainer = this.createDynamicContainer();
        this._spinSettingsGroup = this.createSpinSettingsGroup();
        //this.betLevelButton.addButtonSlave(this.bet);
        this.addChild(this._behindAllButtonsContainer);
        this.addChild(this._staticContainer);
        this.addChild(this._dynamicContainer);
        this.addChild(this._spinSettingsGroup);
        this.addChild(this._permanentContainer);
    }
    tempHideWin() {
        this.win.visible = false;
        this._rightSeparator.visible = false;
    }
    releaseTempHideWin() {
        this.win.visible = true;
        this._rightSeparator.visible = true;
    }
    hideWin(duration = 0.5) {
        const tl = new gsap_1.TimelineLite();
        tl.add([
            new gsap_1.TweenLite(this._win, duration, { alpha: 0 }),
            new gsap_1.TweenLite(this._rightSeparator, duration, { alpha: 0 })
        ], 0.1);
        return tl;
    }
    showWin(duration = 0.1) {
        const tl = new gsap_1.TimelineLite();
        tl.add([
            () => { this.releaseTempHideWin(); },
            new gsap_1.TweenLite(this._win, duration, { alpha: 1 }),
            new gsap_1.TweenLite(this._rightSeparator, duration, { alpha: 1 })
        ]);
        return tl;
    }
}
exports.BetPanelView = BetPanelView;
//# sourceMappingURL=BetPanelView.js.map