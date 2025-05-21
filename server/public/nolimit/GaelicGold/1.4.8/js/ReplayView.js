"use strict";
/**
 * Created by Pankaj on 2019-12-12.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayView = void 0;
const FeatureBasePanel_1 = require("../FeatureBasePanel");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PromoPanelAssetConfig_1 = require("../../config/PromoPanelAssetConfig");
const PromoPanelLabelIDs_1 = require("../../enums/PromoPanelLabelIDs");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PromoPanelButtonIDs_1 = require("../../enums/PromoPanelButtonIDs");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const PromoPanelTextStyles_1 = require("../../config/PromoPanelTextStyles");
const NolimitPromotionPlugin_1 = require("../../NolimitPromotionPlugin");
const RoundInfoView_1 = require("./RoundInfoView");
const PromoPanelConfig_1 = require("../../config/PromoPanelConfig");
const Helper_1 = require("../../utils/Helper");
const PromoPanelTextLabel_1 = require("../PromoPanelTextLabel");
const PromoPanelLabelButton_1 = require("../PromoPanelLabelButton");
const gsap_1 = require("gsap");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
class ReplayView extends FeatureBasePanel_1.FeatureBasePanel {
    constructor(controller, scroll) {
        super(PromoPanelAssetConfig_1.PromoPanelAssetConfig.NOLIMIT_WINNERS_ICON, NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_FEATURE_TITLE), PromoPanelTextStyles_1.PromoPanelTextStyles.FEATURE_BASE_REPLAY_TITLE);
        this._controller = controller;
        this._scroll = scroll;
    }
    init() {
        super.init();
        this.createButtons();
        this.createMiddleBarWithText();
        this.createFilters();
        this._roundInfoContainer = new PIXI.Container();
        this._roundInfoContainer.name = "ROUND_INFO_CONTAINER";
        this.addChild(this._roundInfoContainer);
        this.createLoadingAnimation();
    }
    toggleButtons() {
        this._currentGameBtn.toggled = this._controller.isCurrentGame;
        this._allGamesBtn.toggled = !this._controller.isCurrentGame;
        this._xBetFilterLabelBtn.toggled = this._controller.isXBet;
        this._xWinFilterLabelBtn.toggled = !this._controller.isXBet;
        this._singlePlayer.toggled = this._controller.isSinglePlayer;
        this._allPlayer.toggled = !this._controller.isSinglePlayer;
        this.updateButtonStyle();
        this.updateMiddleBarText(this._singlePlayer.toggled);
    }
    clearRoundInfoData() {
        this._roundInfoContainer.removeChildren();
    }
    update(responseData) {
        // #124
        this.stopLoadingAnimation();
        this.clearRoundInfoData();
        responseData.forEach((roundData, index) => {
            this._roundInfoContainer.addChild(new RoundInfoView_1.RoundInfoView(this._controller, roundData, index));
        });
        this._roundInfoContainer.children.forEach((roundInfoView, index) => {
            roundInfoView.updateButtonStyle(this._xBetFilterLabelBtn.toggled);
        });
        this._scroll.scrollEnabled = true;
        this.updateScroll();
        this._scroll.reAddMouseHoverListener();
        this._scroll.updateContent();
    }
    disableButtons() {
    }
    onResize() {
        if (this._isOpen) {
            const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
            const isLandscape = NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(bounds);
            let availableWidth = bounds.width;
            this._scroll.position.set(0, 105);
            let gap = 10;
            let roundInfoBGWidth = RoundInfoView_1.RoundInfoView.INFO_BG_WIDTH_PORTRAIT;
            if (isLandscape) {
                roundInfoBGWidth = RoundInfoView_1.RoundInfoView.INFO_BG_WIDTH_LANDSCAPE;
                gap = 25;
                availableWidth = bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT;
                this._separator.position.set(Helper_1.Helper.floorPos(availableWidth / 2), 213);
                this._scroll.resize(bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - 1);
                this._scroll.position.set(PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, 0);
            }
            else if (NolimitApplication_1.NolimitApplication.isLandscape && !Helper_1.Helper.isDefaultScreenRatio(bounds)) {
                availableWidth = bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT;
                this._separator.position.set(Helper_1.Helper.floorPos(availableWidth / 2), 213);
                this._scroll.position.set(PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, 0);
                this._scroll.resize(bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - 1);
            }
            else {
                this._separator.position.set(Helper_1.Helper.floorPos(availableWidth / 2), 203);
                const topBarHeight = ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.TOP_BAR).height - 10;
                this._scroll.position.set(0, topBarHeight);
                this._scroll.resize(availableWidth, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - topBarHeight - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT);
            }
            // #124
            this._loadingCircle.position.set(Math.floor(availableWidth / 2), 360);
            this._currentGameBtn.position.set(Helper_1.Helper.floorPos(availableWidth / 2 - this._currentGameBtn.width * 0.5 - 38), this._separator.y);
            this._allGamesBtn.position.set(Helper_1.Helper.floorPos(availableWidth / 2 + this._currentGameBtn.width * 0.5 + 38), this._separator.y);
            this._currentGameText.position.set(this._currentGameBtn.x, this._currentGameBtn.y);
            this._allGameText.position.set(this._allGamesBtn.x, this._allGamesBtn.y);
            this._singlePlayer.position.set(Helper_1.Helper.floorPos(availableWidth / 2 - this._singlePlayer.width * 0.5 - 16), 338);
            this._allPlayer.position.set(Helper_1.Helper.floorPos(availableWidth / 2 + this._singlePlayer.width * 0.5 + 16), 338);
            this._middleBar.clear();
            this._middleBar.beginFill(0xFF4978BA, 1);
            this._middleBar.drawRect(0, 407, availableWidth, 45);
            this._middleBarText.position.set(Helper_1.Helper.floorPos(availableWidth / 2), 432);
            this._xBetFilterLabelBtn.position.set(Helper_1.Helper.floorPos(availableWidth / 2), 506);
            this._xWinFilterLabelBtn.position.set(Helper_1.Helper.floorPos(availableWidth / 2 + roundInfoBGWidth * 0.5 - this._xWinFilterLabelBtn.pivot.x - gap), 506);
            this._roundInfoContainer.position.set(0, 518);
            this.position.set(0, 0);
            this._roundInfoContainer.children.forEach((roundInfoView, index) => {
                roundInfoView.onResize();
            });
            this._xBetFilterLabelBtn.resize(PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE.padding);
            this._xWinFilterLabelBtn.resize(PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE.padding);
            super.onResize();
            this.resizeTextLabel();
            this._scroll.scrollEnabled = true;
            this._scroll.updateContent();
        }
    }
    // #124
    playLoadingAnimation() {
        this._loadingCircle.visible = true;
        this._loadingAnimation.play();
    }
    show() {
        this._scroll.visible = true;
        super.show();
        this._scroll.scrollEnabled = true;
        this._scroll.updateContent();
    }
    hide() {
        super.hide();
        this._scroll.visible = false;
    }
    updateScroll() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        const isLandscape = NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(bounds);
        this._scroll.position.set(0, 105);
        if (isLandscape) {
            this._scroll.resize(bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - 1);
            this._scroll.position.set(PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, 0);
        }
        else if (NolimitApplication_1.NolimitApplication.isLandscape && !Helper_1.Helper.isDefaultScreenRatio(bounds)) {
            this._separator.position.set(Helper_1.Helper.floorPos(bounds.width / 2), 213);
            this._scroll.position.set(PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, 0);
            this._scroll.resize(bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - 1);
        }
        else {
            const topBarHeight = ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.TOP_BAR).height - 10;
            this._scroll.position.set(0, topBarHeight);
            this._scroll.resize(bounds.width, bounds.height - NolimitPromotionPlugin_1.NolimitPromotionPlugin.keypadPlugin.getBalanceBarHeight() - topBarHeight - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT);
        }
    }
    createButtons() {
        this._buttonContainer = new PIXI.Container();
        this.addChild(this._buttonContainer);
        this._currentGameBtn = this.createToggleButton(this._buttonContainer, PromoPanelButtonIDs_1.PromoPanelButtonIDs.CURRENT_GAME_BTN, PromoPanelAssetConfig_1.PromoPanelAssetConfig.GAME_TYPE_ACTIVE, PromoPanelAssetConfig_1.PromoPanelAssetConfig.GAME_TYPE_INACTIVE, 0xFF1E4387, 0xFF1E4387);
        this._separator = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._separator.anchor.set(0.5, 0.5);
        this._separator.tint = 0xFF1E4387;
        this._separator.height = 90;
        this._separator.width = 2;
        this._allGamesBtn = this.createToggleButton(this._buttonContainer, PromoPanelButtonIDs_1.PromoPanelButtonIDs.ALL_GAME_BTN, PromoPanelAssetConfig_1.PromoPanelAssetConfig.GAME_TYPE_ACTIVE, PromoPanelAssetConfig_1.PromoPanelAssetConfig.GAME_TYPE_INACTIVE, 0xFF1E4387, 0xFF1E4387);
        this._singlePlayer = this.createToggleButton(this._buttonContainer, PromoPanelButtonIDs_1.PromoPanelButtonIDs.SINGLE_PLAYER_BTN, PromoPanelAssetConfig_1.PromoPanelAssetConfig.PLAYER_ACTIVE, PromoPanelAssetConfig_1.PromoPanelAssetConfig.PLAYER_INACTIVE);
        this._allPlayer = this.createToggleButton(this._buttonContainer, PromoPanelButtonIDs_1.PromoPanelButtonIDs.ALL_PLAYER_BTN, PromoPanelAssetConfig_1.PromoPanelAssetConfig.ALL_PLAYER_ACTIVE, PromoPanelAssetConfig_1.PromoPanelAssetConfig.ALL_PLAYER_INACTIVE);
        this._currentGameText = new PromoPanelTextLabel_1.PromoPanelTextLabel(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_CURRENT_GAME), PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_GAME_BTN_ACTIVE, {
            portraitMaxWidth: this._currentGameBtn.width - 15,
            landscapeMaxWidth: this._currentGameBtn.width - 15
        });
        this._allGameText = new PromoPanelTextLabel_1.PromoPanelTextLabel(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_ALL_GAMES), PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_GAME_BTN_INACTIVE, {
            portraitMaxWidth: this._allGamesBtn.width - 15,
            landscapeMaxWidth: this._allGamesBtn.width - 15
        });
        this._currentGameText.anchor.set(0.5, 0.5);
        this._allGameText.anchor.set(0.5, 0.5);
        this._buttonContainer.addChild(this._currentGameText, this._separator, this._allGameText);
    }
    createToggleButton(parent, id, onIcon, offIcon, color = 0xffffffff, offColor) {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(color);
        let onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(onIcon)));
        let offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(offIcon)));
        const btn = new IconToggleButton_1.IconToggleButton(id, onIcons, colors, offIcons);
        btn.addClickCallback(() => this._controller.buttonClick(btn));
        btn.toggled = false;
        btn.enable(true);
        if (parent) {
            parent.addChild(btn);
            btn.pivot.set(btn.width * 0.5, btn.height * 0.5);
        }
        return btn;
    }
    updateButtonStyle() {
        this._currentGameText.setStyle(this._currentGameBtn.toggled ? PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_GAME_BTN_ACTIVE : PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_GAME_BTN_INACTIVE);
        this._allGameText.setStyle(this._allGamesBtn.toggled ? PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_GAME_BTN_ACTIVE : PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_GAME_BTN_INACTIVE);
        this._xBetFilterLabelBtn.label.setColor(this._xBetFilterLabelBtn.toggled ? PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_ACTIVE_FILL_COLOR : PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE_FILL_COLOR);
        this._xWinFilterLabelBtn.label.setColor(this._xWinFilterLabelBtn.toggled ? PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_ACTIVE_FILL_COLOR : PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE_FILL_COLOR);
    }
    updateMiddleBarText(isSinglePlayer) {
        this._middleBarText.text = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(isSinglePlayer ? PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_MY_TOP_WINS_HEADING : PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_TOP_WINS_HEADING);
    }
    createMiddleBarWithText() {
        this._middleBar = new PIXI.Graphics();
        this._middleBarText = new Label_1.Label(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_TOP_WINS_HEADING), PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_MIDDLE_BAR_TEXT);
        this._middleBarText.anchor.set(0.5, 0.5);
        this.addChild(this._middleBar, this._middleBarText);
    }
    createFilters() {
        this._filterContainer = new PIXI.Container();
        this._filterContainer.name = "FILTER_CONTAINER";
        this.addChild(this._filterContainer);
        this._xBetFilterLabelBtn = this.createFilterButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.X_BET_FILTER_BTN, PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_X_BET, PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE);
        this._xWinFilterLabelBtn = this.createFilterButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.X_WIN_FILTER_BTN, PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_X_WIN, PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE);
        this._xBetFilterLabelBtn.label.text = "x" + PromoPanelConfig_1.PromoPanelConfig.SINGLE_BLANK_SPACE + this._xBetFilterLabelBtn.label.text;
        this._filterContainer.addChild(this._xBetFilterLabelBtn, this._xWinFilterLabelBtn);
        const btnHeight = NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.REPLAY_WIN_BUTTON_ACTIVE).height;
        this._xBetFilterLabelBtn.setSize(this._xBetFilterLabelBtn.label.width + PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE.padding, btnHeight);
        this._xWinFilterLabelBtn.setSize(this._xWinFilterLabelBtn.label.width + PromoPanelTextStyles_1.PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE.padding, btnHeight);
        this._xBetFilterLabelBtn.toggled = true;
        this._xWinFilterLabelBtn.toggled = false;
    }
    createFilterButton(id, text, textStyle) {
        const backPlate = new PIXI.NineSlicePlane(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.REPLAY_WIN_BUTTON_ACTIVE), 20, 20, 20, 20);
        const backPlateOff = new PIXI.NineSlicePlane(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.REPLAY_WIN_BUTTON), 20, 20, 20, 20);
        const filterBtn = new PromoPanelLabelButton_1.PromoPanelLabelButton(id, NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(text), undefined, undefined, textStyle, backPlate, undefined, backPlateOff);
        filterBtn.addClickCallback(() => this._controller.buttonClick(filterBtn));
        filterBtn.enable(true);
        return filterBtn;
    }
    // #124
    createLoadingAnimation() {
        this._loadingCircle = new PIXI.Sprite(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.LOADING_CIRCLE));
        this._loadingCircle.anchor.set(0.5);
        this._loadingAnimation = gsap_1.TweenMax.to(this._loadingCircle, 30, {
            rotation: "360",
            ease: gsap_1.Linear.easeNone,
            repeat: -1
        });
        this.stopLoadingAnimation();
        this.addChild(this._loadingCircle);
    }
    // #124
    stopLoadingAnimation() {
        this._loadingCircle.visible = false;
        this._loadingAnimation.pause();
    }
    resizeTextLabel() {
        this._currentGameText.onResize();
        this._allGameText.onResize();
    }
}
exports.ReplayView = ReplayView;
//# sourceMappingURL=ReplayView.js.map