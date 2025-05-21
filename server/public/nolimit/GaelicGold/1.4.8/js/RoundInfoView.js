"use strict";
/**
 * Created by Pankaj on 2019-12-26.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundInfoView = void 0;
const NolimitPromotionPlugin_1 = require("../../NolimitPromotionPlugin");
const PromoPanelAssetConfig_1 = require("../../config/PromoPanelAssetConfig");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PromoPanelButtonIDs_1 = require("../../enums/PromoPanelButtonIDs");
const PromoPanelTextStyles_1 = require("../../config/PromoPanelTextStyles");
const TrophyTypes_1 = require("../../enums/TrophyTypes");
const Helper_1 = require("../../utils/Helper");
const PromoPanelConfig_1 = require("../../config/PromoPanelConfig");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const PromoPanelTextLabel_1 = require("../PromoPanelTextLabel");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
class RoundInfoView extends PIXI.Container {
    constructor(controller, data, index) {
        super();
        this._data = data;
        this._controller = controller;
        this._index = index;
        this.init();
    }
    updateButtonStyle(isXBetFilterToggled) {
        this._bet.setStyle(isXBetFilterToggled ? PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_BET_TEXT_ACTIVE : PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_BET_TEXT_INACTIVE);
        this._currency.setStyle(isXBetFilterToggled ? PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_BET_TEXT_INACTIVE : PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_BET_TEXT_ACTIVE);
        this._win.setStyle(isXBetFilterToggled ? PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_BET_TEXT_INACTIVE : PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_BET_TEXT_ACTIVE);
    }
    onResize() {
        const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
        const isLandscape = NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(bounds);
        let marginTop = 15;
        let gap1 = 20;
        let gap2 = 1;
        let availableWidth = bounds.width - PromoPanelConfig_1.PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT;
        let infoBgWidth = RoundInfoView.INFO_BG_WIDTH_PORTRAIT;
        if (isLandscape) {
            gap1 = 30;
            gap2 = 1;
            infoBgWidth = RoundInfoView.INFO_BG_WIDTH_LANDSCAPE;
        }
        else if (NolimitApplication_1.NolimitApplication.isLandscape && !Helper_1.Helper.isDefaultScreenRatio(bounds)) {
        }
        else {
            availableWidth = bounds.width;
        }
        this.resizeTextLabel();
        this._infoBg.position.set(Helper_1.Helper.floorPos(availableWidth / 2), Helper_1.Helper.floorPos(this._infoBg.height / 2));
        this._infoBg.width = infoBgWidth;
        this._infoBg.pivot.x = Helper_1.Helper.floorPos(infoBgWidth * 0.5);
        this._trophy.position.set(Helper_1.Helper.floorPos(this._infoBg.x - this._infoBg.width / 2 - 50), this._infoBg.y);
        //this._bonusBuyIcon && this._bonusBuyIcon.position.set(Helper.floorPos(this._infoBg.x - this._infoBg.width / 2 - 16), this._infoBg.y - 7);
        this._date.position.set(Helper_1.Helper.floorPos(this._infoBg.x - this._infoBg.width * 0.5 + gap1), this._infoBg.y - gap2);
        this._featureIcons.position.set(this._date.position.x + this._date.width + 5, this._date.position.y);
        this._gameName.position.set(this._date.x, this._infoBg.y + gap2);
        this._bet.position.set(this._infoBg.x, this._infoBg.y);
        this._win.position.set(Helper_1.Helper.floorPos(this._infoBg.x + this._infoBg.width * 0.5 - gap1), this._infoBg.y);
        this._currency.position.set(Helper_1.Helper.floorPos(this._win.x - this._win.width - 5), this._infoBg.y);
        this._playBtn.position.set(Helper_1.Helper.floorPos(this._infoBg.width / 2 + this._infoBg.x + 10), this._infoBg.y);
        this.y = Helper_1.Helper.floorPos(this._index * (this.height + marginTop) + this.height * 0.5);
    }
    init() {
        this.createTrophy();
        this.createInfo();
        this._featureIcons = this.createFeatureIcons();
        this.addChild(this._featureIcons);
        this.createPlayBtn();
        this.onResize();
    }
    /**
     * To create trophy based on ranking.
     */
    createTrophy() {
        let trophy;
        switch (this._index) {
            case TrophyTypes_1.TrophyTypes.TROPHY_GOLD:
                trophy = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.TROPHY_GOLD));
                break;
            case TrophyTypes_1.TrophyTypes.TROPHY_SILVER:
                trophy = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.TROPHY_SILVER));
                break;
            case TrophyTypes_1.TrophyTypes.TROPHY_BRONZE:
                trophy = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.TROPHY_BRONZE));
                break;
            default:
                trophy = new Label_1.Label(this._index + 1 + "", PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_TROPHY_TEXT);
        }
        (trophy instanceof PIXI.Sprite) && trophy.pivot.set(-4, -4);
        trophy.anchor.set(0.5, 0.5);
        this.addChild(trophy);
        this._trophy = trophy;
    }
    /**
     * To create replay button to open a url in new window.
     */
    createPlayBtn() {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        let onIcons1 = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.REPLAY_BUTTON)));
        const playBtn = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.PLAY_BTN, onIcons1, colors);
        playBtn.addClickCallback(() => this._controller.openReplay(this._data.url));
        playBtn.toggled = false;
        playBtn.enable(true);
        this.addChild(playBtn);
        playBtn.pivot.set(0, playBtn.height / 2);
        this._playBtn = playBtn;
    }
    /**
     * To create game info for a game round
     */
    createInfo() {
        const infoBg = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.INFO_BG), 26, 26, 26, 26);
        //infoBg.anchor.set(0.5, 0.5);
        infoBg.pivot.set(infoBg.width * 0.5, infoBg.height * 0.5);
        this.addChild(infoBg);
        this._infoBg = infoBg;
        const date = new Label_1.Label(this.getDateFormat(this._data.time), PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_DATE_TEXT);
        date.anchor.set(0, 1);
        const gameName = new Label_1.Label(this.getGameNameFormat(this._data.game), PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_GAME_NAME_TEXT);
        gameName.anchor.set(0, 0);
        const bet = new PromoPanelTextLabel_1.PromoPanelTextLabel(this._data.winMultiplication + " x", PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_BET_TEXT_ACTIVE, {
            landscapeMaxWidth: 150,
            portraitMaxWidth: 110
        });
        bet.anchor.set(0.5, 0.5);
        const currency = new Label_1.Label(this._data.currency, PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_CURRENCY_TEXT);
        currency.anchor.set(1, 0.5);
        currency.visible = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.options.hideCurrency ? false : true; //#108
        const minimumPrecision = (this._data.win < PromoPanelConfig_1.PromoPanelConfig.NO_DECIMALS_CUTOFF_POINT || this._data.win % 1 != 0) ? 2 : 0;
        const formatted = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.currency.formatValue(this._data.win, { minimumPrecision: minimumPrecision });
        const win = new PromoPanelTextLabel_1.PromoPanelTextLabel(formatted + "", PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_WIN_TEXT, {
            landscapeMaxWidth: 180,
            portraitMaxWidth: 130
        });
        win.anchor.set(1, 0.5);
        this._date = date;
        this._gameName = gameName;
        this._bet = bet;
        this._currency = currency;
        this._win = win;
        this.addChild(this._date, this._gameName, this._bet, this._currency, this._win);
    }
    /**
     * To convert date in dd-mm-yyyy format
     * @param dateStr
     */
    getDateFormat(dateStr) {
        try {
            const date = new Date(dateStr);
            return Helper_1.Helper.padZero(date.getFullYear()) + PromoPanelConfig_1.PromoPanelConfig.DATE_SEPARATOR + Helper_1.Helper.padZero((+date.getMonth() + 1)) + PromoPanelConfig_1.PromoPanelConfig.DATE_SEPARATOR + Helper_1.Helper.padZero(date.getDate());
        }
        catch (e) {
            Logger_1.Logger.warn("Invalid date format : ", dateStr);
            return dateStr;
        }
    }
    /**
     * To add dot dot in game name if game name exceed max length
     * @param gameName
     */
    getGameNameFormat(gameName) {
        const maxLength = 16;
        if (gameName.length > maxLength) {
            gameName = gameName.slice(0, maxLength - 2) + "..";
        }
        return gameName;
    }
    resizeTextLabel() {
        this._bet.onResize();
        this._win.onResize();
    }
    createFeatureIcons() {
        const featureIcons = new PIXI.Container();
        if (this._data.actionSpin) {
            const asIcon = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ROUND_INFO_ACTION_SPINS_ICON));
            asIcon.anchor.set(0, 1);
            featureIcons.addChild(asIcon);
        }
        if (this._data.bonusBuy) {
            const bonusBuyIcon = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ROUND_INFO_BONUS_BUY_ICON));
            bonusBuyIcon.anchor.set(0, 1);
            featureIcons.addChild(bonusBuyIcon);
        }
        GuiLayout_1.GuiLayout.align(featureIcons.children, 3, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.HORIZONTAL);
        return featureIcons;
    }
}
RoundInfoView.INFO_BG_WIDTH_LANDSCAPE = 745;
RoundInfoView.INFO_BG_WIDTH_PORTRAIT = 525;
exports.RoundInfoView = RoundInfoView;
//# sourceMappingURL=RoundInfoView.js.map