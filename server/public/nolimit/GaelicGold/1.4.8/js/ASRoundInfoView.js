"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASRoundInfoView = void 0;
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const Helper_1 = require("../../../utils/Helper");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const PromoPanelButtonIDs_1 = require("../../../enums/PromoPanelButtonIDs");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const ASFreeSpinRoundInfoView_1 = require("./ASFreeSpinRoundInfoView");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const PromoPanelTextLabel_1 = require("../../PromoPanelTextLabel");
const PromoPanelConfig_1 = require("../../../config/PromoPanelConfig");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const TimelineSprite_1 = require("../../../utils/TimelineSprite");
const TimesBetDisplay_1 = require("./TimesBetDisplay");
const BigWin_1 = require("./BigWin");
const ASInterfaces_1 = require("../../../interfaces/ASInterfaces");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const AnimationHelper_1 = require("../../../utils/AnimationHelper");
const CurrencyUtils_1 = require("../../../utils/CurrencyUtils");
const IdAndDateBox_1 = require("./components/IdAndDateBox");
const ActionSpinsController_1 = require("../ActionSpinsController");
class ASRoundInfoView extends PIXI.Container {
    get roundNo() {
        return this._roundNo;
    }
    get timesBetDisplay() {
        return this._timesBetDisplay;
    }
    get winText() {
        return this._winText;
    }
    get isFS() {
        return this._isFS;
    }
    get addedFSCount() {
        return this._fsRoundContainer.children.length;
    }
    get data() {
        return this._data;
    }
    get targetHeight() {
        return this._targetHeight ? this._targetHeight : this.height;
    }
    set targetHeight(value) {
        this._targetHeight = value;
    }
    constructor(controller, data, index, isFS = false) {
        super();
        this._isFS = false;
        this._isFSTriggeredRound = false;
        this._isEnabled = false;
        this._data = data;
        this._controller = controller;
        this._roundNo = index;
        this._isFS = isFS;
        this._isFSTriggeredRound = data.winData.freeSpinTriggeredThisSpin;
        this.alpha = 0;
        this.init();
    }
    enableInteraction(value) {
        this._isEnabled = value;
        if (value) {
            if (this._isFS) {
                this.enableReplayBtn(true);
                this._balance.position.y = Helper_1.Helper.floorPos(65 + this._balance.height * 0.5);
                this.updateFSOutline();
            }
            else {
                this.enableReplayBtn(this._data.winData.totalWin > 0);
            }
        }
        else {
            this.enableReplayBtn(false);
        }
    }
    start() {
        const tl = new gsap_1.TimelineLite();
        if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.IS_MINIMIZED) {
            this.alpha = 1;
            if (this.isFS) {
                this.updateFSOutline(false, 15);
                this._bonusSummaryContainer.alpha = 1;
            }
            return tl;
        }
        tl.add(() => {
            this.alpha = 1;
        });
        if (!this.isFS) {
            if (this._data.winData.isBigWin) {
                tl.add(() => {
                    this._idAndDate.alpha = 0;
                });
                tl.add(this.getBigWinAnimation());
                tl.add(() => {
                    gsap_1.TweenLite.to(this._idAndDate, tl.totalDuration(), { alpha: 1 });
                }, 0.1);
            }
            else {
                tl.add(() => {
                    this._balance.alpha = 0;
                    this._timesBetDisplay.alpha = 0;
                    this._winText.alpha = 0;
                    this._border.scale.x = 0;
                    this._idAndDate.alpha = 0;
                });
                tl.add(gsap_1.TweenLite.to(this._border.scale, 0.4, { ease: gsap_1.Power1.easeOut, x: 1 }), 0);
                tl.add(gsap_1.TweenLite.to(this._winText, 0.15, { alpha: 1 }), 0.1);
                tl.add(gsap_1.TweenLite.to(this._timesBetDisplay, 0.18, { alpha: 1 }), 0.15);
                tl.add(gsap_1.TweenLite.to(this._balance, 0.12, { alpha: 1 }), 0.28);
                tl.add(gsap_1.TweenLite.to(this._idAndDate, 0.12, { alpha: 1 }), 0.28);
                tl.add(this.getWinAnimation(this._data.winData.totalWin > 0), 0);
            }
        }
        else {
            tl.add(() => {
                if (!this._stopOnBonusRoundInfoView) {
                    this.updateFSOutline(false);
                }
            });
            tl.add(gsap_1.TweenLite.to(this._bonusSummaryContainer, 0.2, { alpha: 1 }), 0.1);
        }
        return tl;
    }
    updateZeroWinRounds(data, roundNo) {
        Logger_1.Logger.logDev("AS : updateZeroWinRounds : ", data, roundNo, this._data);
        this.updateBalance(data);
        this._idAndDate.updateDate(data.replayData.time);
        this._idAndDate.updateId(roundNo);
        this.updateTopline();
        if (this._data.winData.totalWin > 0) {
            console.warn("invalid zero win rounds");
            debugger;
        }
        return this.getWinAnimation(false);
    }
    addStopOnBonusRoundInfo(stopOnBonusRoundInfoView) {
        this._stopOnBonusRoundInfoView = stopOnBonusRoundInfoView;
        this.addChild(this._stopOnBonusRoundInfoView);
        this._winText.visible = false;
        this._bonusSummaryContainer.visible = false;
        this.updateFSOutline(false, 15);
        this.updateTransform();
    }
    removeStopOnBonusRoundInfo() {
        this._winText.visible = true;
        this._bonusSummaryContainer.visible = true;
        if (this._stopOnBonusRoundInfoView) {
            this.removeChild(this._stopOnBonusRoundInfoView);
            this._stopOnBonusRoundInfoView = undefined;
            this.updateFSOutline(false, 15);
        }
    }
    onExpandBtnClick() {
        this._expandButton.toggled = !this._expandButton.toggled;
        if (this._expandButton.toggled) {
            this._fsRoundContainer.visible = false;
            this._bonusSummaryContainer && (this._bonusSummaryContainer.visible = false);
            this._expandButton.angle = -90;
        }
        else {
            this._expandButton.angle = 0;
            this._fsRoundContainer.visible = true;
            this._bonusSummaryContainer && (this._bonusSummaryContainer.visible = true);
        }
        this.updateFSOutline();
    }
    collapseRound() {
        this._expandButton.toggled = true;
        if (this._expandButton.toggled) {
            this._fsRoundContainer.visible = false;
            this._bonusSummaryContainer && (this._bonusSummaryContainer.visible = false);
            this._expandButton.angle = -90;
        }
        this.updateFSOutline();
    }
    updateFSOutline(animated = false, bufferAtBottom = 0, roundHeight = 0) {
        const tl = new gsap_1.TimelineLite();
        if (!this.isFS) {
            return tl;
        }
        if (this._border instanceof PIXI.NineSlicePlane) {
            this._border.visible = false;
            const height = roundHeight || Math.max(this.height + bufferAtBottom, 60) - 5;
            this._border.visible = true;
            if (animated) {
                tl.add([
                    gsap_1.TweenLite.to(this._border, 0.2, { height: height }),
                ]);
            }
            else {
                this._border.height = height;
            }
            this.targetHeight = height - this.pivot.y;
        }
        return tl;
    }
    enableReplayBtn(value) {
        if (value) {
            if (this.isFS || +this._data.winData.totalWin > 0) {
                this._replayBtn.enable(value);
            }
        }
        else {
            this._replayBtn.enable(value);
        }
    }
    onRoundComplete(data) {
        this.setPlayBtnName(data.replayData.gameRoundId);
        if (this.isFS) {
            this._expandButton.visible = true;
            this._controller.view.onExpandCollapse(this);
            this._idAndDate.updateDate(data.replayData.time);
            this.updateBalance(data);
        }
    }
    updateTopline() {
        if (this._topLine) {
            this._topLine.position.set(this._idAndDate.width + 8, 0);
            this._topLine.width = 500 - this._topLine.position.x;
        }
    }
    init() {
        var _a;
        this._border = this.createInitialBorder();
        this._border.name = "border";
        this.addChild(this._border);
        this._idAndDate = new IdAndDateBox_1.IdAndDateBox((this._roundNo + 1) + "", (_a = this._data.replayData) === null || _a === void 0 ? void 0 : _a.time);
        this._idAndDate.name = "idAndDate";
        this._idAndDate.position.set(50, -10);
        this.addChild(this._idAndDate);
        this.updateTopline();
        this.createInfo();
        this.createBtn();
        if (!this.isFS) {
            this.setPlayBtnName(this._data.replayData.gameRoundId);
        }
        this.onResize();
        this.pivot.y = -10;
        this.targetHeight = this.height;
    }
    addFSRound(winData) {
        const index = this._fsRoundContainer.children.length;
        const fsRoundInfoView = new ASFreeSpinRoundInfoView_1.ASFreeSpinRoundInfoView(this._controller, winData, index, this);
        fsRoundInfoView.position.y = 8;
        this.updateFsRoundHeader(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(winData.featureName || ""));
        this._fsRoundContainer.addChild(fsRoundInfoView);
        if (winData.nextMode === PromoPanelConfig_1.Mode.NORMAL) { //last round
            const separator = new PIXI.Graphics().lineStyle(0, 0x000000)
                .moveTo(360, 1)
                .lineTo(400, 1);
            this._fsRoundContainer.addChild(separator);
            separator.position.y = this._fsRoundContainer.height + 8;
        }
        this._bonusSummaryContainer && (this._bonusSummaryContainer.visible = true);
        return fsRoundInfoView;
    }
    updateFsRoundHeader(newHeader) {
        if (this._featureName.text != newHeader) {
            this._featureName.text = newHeader;
            if (this._featureName.width >= 330) {
                const scale = 330 / this._featureName.width;
                const style = this._featureName.getStyleClone();
                style.fontSize = Number(style.fontSize) * scale;
                this._featureName.setStyle(style);
            }
        }
    }
    resetFSRoundYPosOnNewRoundAdded() {
        const tl = new gsap_1.TimelineLite();
        let yPos = 8;
        for (let index = this._fsRoundContainer.children.length - 1; index >= 0; index--) {
            const fsView = this._fsRoundContainer.children[index];
            //yPos += fsView.height + 8;
            yPos += 61 + 8;
            tl.to(fsView, 0.2, { y: yPos }, 0);
        }
        return tl;
    }
    createInitialBorder() {
        let border = new PIXI.Container();
        if (this.isFS) {
            border = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.BONUS_ROUND_OUTLINE), 140, 23, 23, 23);
            border.position.set(25, 0);
            border.width = 608;
            border.height = 44;
        }
        else {
            const lineWidth = 500;
            const topLine = new PIXI.Sprite(PIXI.Texture.WHITE);
            topLine.position.set(108, 0);
            topLine.width = lineWidth - 108;
            topLine.tint = 0;
            topLine.height = 1;
            this._topLine = topLine;
            const bottomLine = new PIXI.Sprite(PIXI.Texture.WHITE);
            bottomLine.tint = 0;
            bottomLine.width = lineWidth;
            bottomLine.height = 1;
            bottomLine.position.set(0, 60);
            border.addChild(topLine, bottomLine);
            border.pivot.set(lineWidth, 30);
            border.position.set(ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN + lineWidth, 30);
        }
        return border;
    }
    updateFSTotalBetAndWin() {
        this._timesBetDisplay.updateTimesBet(this._timesBetDisplay.timesBetLabel.latestValue);
        this.updateWin(this.winText.latestValue);
        this.setTimesBetDisplayPos();
    }
    createInfo() {
        this._balance = new PromoPanelTextLabel_1.PromoPanelTextLabel("", PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_X_BET_STYLE, {
            landscapeMaxWidth: 165,
            portraitMaxWidth: 165
        });
        this._balance.name = "balance";
        this._balance.anchor.set(0, 0.5);
        this._balance.position.set(ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN, 30);
        this._timesBetDisplay = new TimesBetDisplay_1.TimesBetDisplay(this._data.winData.calculatedTotalWinTimesBet, 150);
        this._winText = new PromoPanelTextLabel_1.TextLabelAdvanced("", PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_WIN_STYLE, {
            landscapeMaxWidth: 145,
            portraitMaxWidth: 145
        });
        this._winText.name = "wintext";
        this._winText.anchor.set(1, 0.5);
        this.addChild(this._balance, this._timesBetDisplay, this._winText);
        this.updateWin(this._data.winData.totalWin);
        this.updateBalance(this._data);
        if (this.isFS) {
            const featureName = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(this._data.winData.featureName || "");
            this._featureName = new Label_1.Label("", PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_RE_SPIN_STYLE);
            this._featureName.name = "featureNameLabel";
            this._featureName.anchor.set(0, 0.5);
            this.updateFsRoundHeader(featureName);
            this._fsRoundContainer = new PIXI.Container();
            this._fsRoundContainer.name = "subRoundContainer";
            this._fsRoundContainer.position.y = 102;
            this.addChild(this._featureName, this._fsRoundContainer);
            if (this._isFSTriggeredRound) {
                this._bonusSummaryContainer = new PIXI.Container();
                this._bonusSummaryContainer.name = "BonusSummeryContainer";
                this._blueBG = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.GAME_FEED_BONUS_INFO_BG));
                this._blueBG.width = 608;
                this._blueBG.position.set(ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN * 0.5, 60);
                this._balance.position.y = this._blueBG.position.y + this._blueBG.height * 0.5;
                this._winText.position.y = this._blueBG.position.y + this._blueBG.height * 0.5;
                this._bonusSummaryContainer.addChild(this._blueBG, this._balance, this._timesBetDisplay);
                this.addChildAt(this._bonusSummaryContainer, 0);
                this._bonusSummaryContainer.alpha = 0;
            }
        }
    }
    updateWin(winValue) {
        const color = winValue > 0 ? "#fbc217" : "#000000";
        const style = this._winText.getStyleClone();
        style.fill = PIXI.utils.string2hex(color);
        style.dropShadow = (winValue > 0);
        this._winText.setStyle(style);
        this._winText.text = CurrencyUtils_1.CurrencyUtils.format(winValue);
        this._winText.onResize();
    }
    onResize() {
        var _a;
        this._winText.onResize();
        this.setTimesBetDisplayPos();
        if (this._isFS) {
            //this._winText.position.set(568, 30);
            this._winText.position.set(548, 30);
            this._balance.position.y = this._blueBG.position.y + this._blueBG.height * 0.5;
        }
        else {
            this._winText.position.set(548, 30);
        }
        if (this._isFS) {
            this._expandButton.position.set(50, 30);
            (_a = this._featureName) === null || _a === void 0 ? void 0 : _a.position.set(70, 30);
            //this._replayBtn.position.x = Helper.floorPos(ASRoundInfoView.BONUS_ROUND_LEFT_MARGIN + 610 - this._replayBtn.pivot.x - 4);
            this._replayBtn.position.x = Helper_1.Helper.floorPos(ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN + 500 + this._replayBtn.pivot.x + 10);
            this._replayBtn.position.y = 60 / 2;
        }
        else {
            this._replayBtn.position.x = Helper_1.Helper.floorPos(ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN + this._border.width + this._replayBtn.pivot.x + 10);
            this._replayBtn.position.y = 60 / 2;
        }
    }
    setTimesBetDisplayPos() {
        this._timesBetDisplay.position.set(374, 30);
        if (this.isFS) {
            this._timesBetDisplay.position.y = this._blueBG.position.y + this._blueBG.height * 0.5;
        }
        this._timesBetDisplay.pivot.x = this._timesBetDisplay.width;
    }
    getWinAnimation(win) {
        const tl = new gsap_1.TimelineLite();
        if (!this._data.winData.isWinBelowStake) {
            const animName = win ? "winCoins" : "noWin";
            const winAnim = new TimelineSprite_1.TimelineSprite(AnimationHelper_1.AnimationHelper.getAnimationTextures(animName));
            winAnim.visible = false;
            winAnim.anchor.set(0.5);
            winAnim.position.set(this._winText.x - this._winText.width * 0.5, this._winText.y);
            tl.add(() => {
                if (win) {
                    ActionSpinsController_1.ActionSpinsController.triggerSound(ASInterfaces_1.ActionSpinSound.WIN);
                }
                this.addChild(winAnim);
            });
            tl.add(winAnim.getAnimationAutoShowHide());
            tl.add(() => { this.removeChild(winAnim); });
        }
        return tl;
    }
    getBigWinAnimation() {
        const bigWinView = new BigWin_1.BigWin();
        bigWinView.position.set(ASRoundInfoView.INFO_BG_WIDTH_LANDSCAPE / 2 + 4, this.height * 0.5 - 4);
        this.addChild(bigWinView);
        const tl = new gsap_1.TimelineLite();
        tl.add(() => {
            ActionSpinsController_1.ActionSpinsController.triggerSound(ASInterfaces_1.ActionSpinSound.BIG_WIN);
        });
        tl.add(bigWinView.start());
        return tl;
    }
    updateBalance(data) {
        if (data.winData.balance) {
            this._balance.value = CurrencyUtils_1.CurrencyUtils.format(+data.winData.balance);
        }
    }
    setPlayBtnName(gameRoundId) {
        this._replayBtn.name = gameRoundId;
    }
    createToggleButton(id, onIcon, offIcon, color = 0xffffffff) {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(color);
        let onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(onIcon)));
        let offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(offIcon)));
        const btn = new IconToggleButton_1.IconToggleButton(id, onIcons, colors, offIcons);
        btn.toggled = false;
        btn.enable(true);
        btn.pivot.set(btn.width * 0.5, btn.height * 0.5);
        return btn;
    }
    /**
     * To create replay button to open an url in new window.
     */
    createBtn() {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        let onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_REPLAY_BTN)), undefined, undefined, new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_REPLAY_DISABLED_BTN)));
        const playBtn = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.PLAY_BTN, onIcons, colors);
        playBtn.addClickCallback(() => this._controller.openReplay(playBtn.name));
        playBtn.toggled = false;
        playBtn.enable(false);
        this.addChild(playBtn);
        playBtn.pivot.set(playBtn.width / 2, playBtn.height / 2);
        this._replayBtn = playBtn;
        if (this.isFS) {
            const expandButton = this.createToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_REPLAY_EXPAND_BUTTON, PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_EXPAND, PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_EXPAND);
            expandButton.addClickCallback(() => {
                this._controller.onExpandBtnClick(this);
            });
            expandButton.toggled = false;
            expandButton.enable(true);
            expandButton.name = "PLUS_MINUS";
            expandButton.visible = false;
            expandButton.pivot.set(expandButton.width * 0.5, expandButton.height * 0.5);
            this._expandButton = expandButton;
            this.addChild(this._expandButton);
        }
    }
}
ASRoundInfoView.INFO_BG_WIDTH_LANDSCAPE = 590; // 525;
ASRoundInfoView.NORMAL_ROUND_LEFT_MARGIN = 50;
ASRoundInfoView.BONUS_ROUND_LEFT_MARGIN = 25;
exports.ASRoundInfoView = ASRoundInfoView;
//# sourceMappingURL=ASRoundInfoView.js.map