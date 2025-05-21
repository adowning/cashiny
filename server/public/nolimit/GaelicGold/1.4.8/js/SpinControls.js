"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinControls = void 0;
const PromoPanelTextLabel_1 = require("../../../PromoPanelTextLabel");
const PromoPanelTextStyles_1 = require("../../../../config/PromoPanelTextStyles");
const NolimitPromotionPlugin_1 = require("../../../../NolimitPromotionPlugin");
const PromoPanelAssetConfig_1 = require("../../../../config/PromoPanelAssetConfig");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PromoPanelButtonIDs_1 = require("../../../../enums/PromoPanelButtonIDs");
const PromoPanelConfig_1 = require("../../../../config/PromoPanelConfig");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
/**
 * Created by jonas on 2023-09-18.
 */
class SpinControls extends PIXI.Container {
    constructor(controller) {
        super();
        this._controller = controller;
        this._spinsLeft = new PromoPanelTextLabel_1.PromoPanelTextLabel("", PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_SPINS_LEFT_STYLE, {
            landscapeMaxWidth: 100, portraitMaxWidth: 100
        });
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff, 0xffffffff, 0xffffffff, 0x33ffffff);
        let onIcons1 = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_BTN_PLAY)));
        let offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_BTN_PAUSE)));
        this._playPauseBtn = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.PLAY_BTN, onIcons1, colors, offIcons);
        this._playPauseBtn.addClickCallback(() => {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.playKeypadEffect("click");
            this._controller.onPlayPauseBtnClick();
        });
        this._playPauseBtn.toggled = false;
        this._playPauseBtn.enable(true);
        this._playPauseBtn.pivot.x = this._playPauseBtn.width * 0.5;
        this._playPauseBtn.position.x = this._spinsLeft.position.x;
        this._playPauseBtn.position.y = this._spinsLeft.height * 0.5 + 10;
        const spinsLeftBg = new PIXI.Sprite(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_PLAYED_ROUNDS_BG));
        spinsLeftBg.anchor.set(0.5);
        const upButtonId = PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_COUNT_UP;
        const downButtonId = PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_COUNT_DOWN;
        const upIcon = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.BET_UP)));
        this._upButton = new IconToggleButton_1.IconToggleButton(upButtonId, upIcon, colors);
        this._upButton.addClickCallback(() => this.buttonClick(this._upButton));
        this._upButton.toggled = false;
        this._upButton.pivot.set(38, 35);
        this._upButton.scale.set(0.75, 0.75);
        const downIcon = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.BET_DOWN)));
        this._downButton = new IconToggleButton_1.IconToggleButton(downButtonId, downIcon, colors);
        this._downButton.addClickCallback(() => this.buttonClick(this._downButton));
        this._downButton.toggled = false;
        this._downButton.pivot.set(38, 35);
        this._downButton.scale.set(0.75, 0.75);
        this._divider = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._divider.width = 2;
        this._divider.height = 50;
        this._divider.position.set(0, -80);
        this._divider.alpha = 0.6;
        this._upButton.enable(true);
        this._downButton.enable(true);
        this.addChild(spinsLeftBg, this._spinsLeft, this._upButton, this._divider, this._downButton, this._playPauseBtn);
        this.resize();
    }
    resize() {
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._upButton.position.set(40, this._spinsLeft.position.y - 55);
            this._downButton.position.set(-40, this._spinsLeft.position.y - 55);
            this._divider.visible = this._upButton.visible;
        }
        else {
            this._upButton.position.set(75, this._spinsLeft.position.y);
            this._downButton.position.set(-75, this._spinsLeft.position.y);
            this._divider.visible = false;
        }
    }
    togglePlayButton() {
        this._playPauseBtn.toggled = !this._playPauseBtn.toggled;
        return this._playPauseBtn.toggled;
    }
    setPlayState(value) {
        this._playPauseBtn.toggled = value;
    }
    enablePlayPauseBtn(value) {
        this._playPauseBtn.enable(value);
        this._playPauseBtn.alpha = value ? PromoPanelConfig_1.PromoPanelConfig.ENABLE_BTN_ALPHA : PromoPanelConfig_1.PromoPanelConfig.DISABLE_BTN_ALPHA;
    }
    setSpinsLeft(value) {
        if (value <= 0) {
            this.enablePlayPauseBtn(false);
        }
        if (value >= 0) {
            this._spinsLeft.text = value.toString();
        }
        this.checkValidOptionForButtons(value);
    }
    checkValidOptionForButtons(spinsLeft) {
        if (this._downButton.visible) {
            if (spinsLeft <= this._controller.asController.spinCountList.getFirstValue()) {
                this._downButton.enable(false);
            }
            else {
                this._downButton.enable(true);
            }
        }
        if (this._upButton.visible) {
            if (spinsLeft >= this._controller.asController.spinCountList.getLastValue()) {
                this._upButton.enable(false);
            }
            else {
                this._upButton.enable(true);
            }
        }
    }
    enableRoundsButtons(value, spinsLeft) {
        this._divider.visible = value && NolimitApplication_1.NolimitApplication.isLandscape;
        this._upButton.visible = value;
        this._upButton.enable(value);
        this._downButton.visible = value;
        this._downButton.enable(value);
        this.checkValidOptionForButtons(spinsLeft);
    }
    buttonClick(button) {
        this._controller.asController.buttonClick(button);
    }
}
exports.SpinControls = SpinControls;
//# sourceMappingURL=SpinControls.js.map