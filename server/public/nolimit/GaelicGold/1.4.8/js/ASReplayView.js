"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASReplayView = void 0;
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PromoPanelEvents_1 = require("../../../events/PromoPanelEvents");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const PromoPanelButtonIDs_1 = require("../../../enums/PromoPanelButtonIDs");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelConfig_1 = require("../../../config/PromoPanelConfig");
const ASRoundInfoView_1 = require("./ASRoundInfoView");
const ASStopOnBonusRoundInfoView_1 = require("./ASStopOnBonusRoundInfoView");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const ActionSpinsController_1 = require("../ActionSpinsController");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const ActionSpinsGameFeedView_1 = require("./ActionSpinsGameFeedView");
const SpinControls_1 = require("./components/SpinControls");
const SoundButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/SoundButton");
class ASReplayView extends PIXI.Container {
    get isOpen() {
        return this._isOpen;
    }
    get isFSStart() {
        return this._isFSStart;
    }
    set isFSStart(value) {
        this._isFSStart = value;
    }
    constructor(controller) {
        super();
        this._replayRounds = [];
        this._isBlurred = false;
        this._roundCounts = 0;
        this._isOpen = false;
        this._isFSStart = false;
        this._controller = controller;
        this.addEventListeners();
        this.init();
    }
    addBlur() {
        const tl = new gsap_1.TimelineLite();
        if (!this._isBlurred) {
            this._isBlurred = true;
            if (this.filters == undefined) {
                this.filters = [];
            }
            this.filters.push(this._blur1, this._blur2);
            tl.add([
                new gsap_1.TweenLite(this._blur1, 0.2, { blurX: 16, blurY: 16 }),
                new gsap_1.TweenLite(this._blur2, 0.2, { blurX: 10, blurY: 10 }),
            ]);
        }
        return tl;
    }
    removeBlur() {
        if (this._isBlurred) {
            const tl = new gsap_1.TimelineLite({
                onComplete: () => {
                    for (let i = this.filters.length - 1; i >= 0; i--) {
                        const filter = this.filters[i];
                        if (filter == this._blur1 || filter == this._blur2) {
                            this.filters.splice(i, 1);
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
    reset() {
        this._gameFeed.removeAllItems();
        this._gameFeed.enableScroll(false);
        this._roundCounts = 0;
    }
    addRound(winData, actionReplayData) {
        Logger_1.Logger.logDev("addRound ", winData, actionReplayData);
        const replayData = actionReplayData || { gameRoundId: '', time: '' };
        const data = { winData: winData, replayData: replayData };
        let replayItem;
        const prevReplay = this._gameFeed.getLastRoundData();
        const tl = new gsap_1.TimelineLite();
        if (prevReplay && !prevReplay.isFS && prevReplay.winText.latestValue <= 0 && data.winData.totalWin <= 0) {
            replayItem = prevReplay;
            tl.add(replayItem.updateZeroWinRounds(data, this._roundCounts + 1));
        }
        else {
            replayItem = new ASRoundInfoView_1.ASRoundInfoView(this._controller, data, this._roundCounts, false);
            replayItem.winText.latestValue = winData.totalWin;
            this._controller.accumulatedWin += data.winData.totalWin;
            this._gameFeed.addRoundData(replayItem);
            tl.add(this._gameFeed.updateRoundPositions(!NolimitPromotionPlugin_1.NolimitPromotionPlugin.IS_MINIMIZED));
            tl.add(replayItem.start());
        }
        this._roundCounts++;
        const netPos = this._gameFeed._topInfoBar.getAccumulatedWin() - this._gameFeed._topInfoBar.getAccumulatedBet();
        this.setNetPosition(netPos);
        return tl;
    }
    addFSRound(winData, actionReplayData) {
        Logger_1.Logger.logDev("addFSRound ", winData, actionReplayData);
        const tl = new gsap_1.TimelineLite();
        const isNewRound = winData.freeSpinTriggeredThisSpin && !ActionSpinsController_1.ActionSpinsController.isPickMode(winData.mode);
        const isLastRound = winData.nextMode === PromoPanelConfig_1.Mode.NORMAL;
        Logger_1.Logger.logDev("addFSRound isNewRound ", isNewRound, " isLastRound : ", isLastRound);
        if (isNewRound) {
            const data = { winData: winData, replayData: { gameRoundId: '', time: '' } };
            const replayItem = new ASRoundInfoView_1.ASRoundInfoView(this._controller, data, this._roundCounts, true);
            replayItem.winText.latestValue = winData.totalWin;
            replayItem.timesBetDisplay.timesBetLabel.latestValue = winData.calculatedTotalWinTimesBet;
            this._gameFeed.addRoundData(replayItem);
            tl.add([
                replayItem.start(),
                this._gameFeed.updateRoundPositions()
            ]);
            this._roundCounts++;
        }
        else {
            const replayItem = this._gameFeed.getLastRoundData();
            replayItem.winText.latestValue = winData.totalWin;
            replayItem.timesBetDisplay.timesBetLabel.latestValue = winData.calculatedTotalWinTimesBet;
            const fsRoundHeight = 69;
            const fsRoundTopMargin = 8;
            const fsSummeryLineHeight = 10;
            const defaultFSContainerMargin = 130 + 15;
            let addFsRoundTime = tl.duration();
            if (replayItem.isFS) {
                if (NolimitPromotionPlugin_1.NolimitPromotionPlugin.IS_MINIMIZED) {
                    if (isLastRound) {
                        Logger_1.Logger.logDev("addFSRound lastRound : and minimized", winData);
                        replayItem.updateFSOutline(false, fsRoundHeight + fsRoundTopMargin + (replayItem.addedFSCount ? 0 : fsSummeryLineHeight), fsRoundHeight * (replayItem.addedFSCount + 1) + defaultFSContainerMargin);
                        replayItem.resetFSRoundYPosOnNewRoundAdded();
                        this._gameFeed.updateRoundPositions(false);
                    }
                }
                else {
                    tl.add([
                        replayItem.updateFSOutline(true, fsRoundHeight + fsRoundTopMargin + (replayItem.addedFSCount ? 0 : fsSummeryLineHeight), fsRoundHeight * (replayItem.addedFSCount + 1) + defaultFSContainerMargin),
                        replayItem.resetFSRoundYPosOnNewRoundAdded(),
                        this._gameFeed.updateRoundPositions(true)
                    ]);
                    addFsRoundTime = tl.duration();
                }
                tl.add(replayItem.addFSRound(winData).start(0), addFsRoundTime);
            }
            else {
                Logger_1.Logger.logDev("addFSRound winData", winData);
            }
            if (isLastRound) {
                const replayData = actionReplayData || { gameRoundId: '', time: '' };
                const data = { winData: winData, replayData: replayData };
                if (!(data.replayData.gameRoundId)) {
                    Logger_1.Logger.warn("Invalid gameRoundId");
                    debugger;
                }
                if (replayItem.isFS) {
                    data.winData.waitForAnimation = true;
                    addFsRoundTime = tl.duration();
                }
                tl.add(() => {
                    replayItem.onRoundComplete(data);
                }, addFsRoundTime);
                this._controller.accumulatedWin += winData.totalWin;
                const netPos = this._gameFeed._topInfoBar.getAccumulatedWin() - this._gameFeed._topInfoBar.getAccumulatedBet();
                this.setNetPosition(netPos);
            }
        }
        return tl;
    }
    onGameStopped(isNextSpinEligible) {
        this.enablePlayPauseBtn(isNextSpinEligible);
        this.setPlayState(true);
        this._spinControls.enableRoundsButtons(true, this._controller.asController.spinsLeft);
        this.setSpinsLeft(this._controller.asController.spinsLeft);
        this._gameFeed.enableInteraction(true);
        this.enableCloseBtn(true);
    }
    onResume() {
        this._spinControls.enableRoundsButtons(false, this._controller.asController.spinsLeft);
        this._gameFeed.enableInteraction(false);
    }
    show() {
        this._isOpen = true;
        this.onResize();
        this.visible = true;
        this.setPlayState(false);
        this.enablePlayPauseBtn(true);
        this.enableCloseBtn(false);
        this._spinControls.enableRoundsButtons(false, this._controller.asController.spinsLeft);
        this._gameFeed.enableInteraction(false);
        this.updateSoundButton();
    }
    maximized() {
        this.updateSoundButton();
    }
    hide() {
        this._soundButton.stopLoadingAnimation();
        this._isOpen = false;
        this.visible = false;
    }
    enableReplayButtons(value) {
        this._replayRounds.forEach((replayView) => {
            replayView.enableReplayBtn(value);
        });
        this._gameFeed.enableScroll(true);
    }
    /**
     * To prompt user either play fs in game or continue in action spin,
     * only if user selected stopOnBonusTriggered option.
     */
    createStopOnBonusRound(featureName, nextMode) {
        const replayItem = this._gameFeed.getLastRoundData();
        this._replayItemWithStopOnBonusView = replayItem;
        const stopOnBonusRoundInfoView = new ASStopOnBonusRoundInfoView_1.ASStopOnBonusRoundInfoView(this._controller, featureName, nextMode);
        stopOnBonusRoundInfoView.position.y = 0;
        stopOnBonusRoundInfoView.position.x = 22;
        this._replayItemWithStopOnBonusView.addStopOnBonusRoundInfo(stopOnBonusRoundInfoView);
        this._gameFeed.updateRoundPositions(true);
    }
    /**
     * To remove stopOnBonusRound info
     */
    removeStopOnBonusRound() {
        if (this._replayItemWithStopOnBonusView) {
            this._replayItemWithStopOnBonusView.removeStopOnBonusRoundInfo();
            this._gameFeed.updateRoundPositions();
        }
    }
    /**
     * To Expand and collapse rounds.
     */
    onExpandCollapse(roundInfo) {
        roundInfo.onExpandBtnClick();
        this._gameFeed.updateRoundPositions(false, this._gameFeed.currentlyVisible);
        this._gameFeed._scroll.updateContent();
    }
    onOrientationChanged() {
        this._gameFeed.orientationChanged();
    }
    onResize() {
        if (this._isOpen) {
            const bounds = NolimitApplication_1.NolimitApplication.screenBounds;
            this._bg.position.set(bounds.width * 0.5, bounds.height * 0.5);
            this._gameLogo.alpha = 1;
            const rightSideMargin = 80;
            if (NolimitApplication_1.NolimitApplication.isLandscape) {
                this._gameFeed.position.set(bounds.width - 840, 40);
                this._gameFeed.resize(664);
                const leftSideSpace = this._gameFeed.x + 16;
                this._gameLogo.position.set(leftSideSpace * 0.5, 26);
                this._gameLogo.scale.set(1, 1);
                if (this._gameLogo.width > leftSideSpace) {
                    this._gameLogo.width = leftSideSpace;
                    this._gameLogo.scale.y = this._gameLogo.scale.x;
                    if (this._gameLogo.scale.x < 0.5) {
                        this._gameLogo.visible = false;
                    }
                }
                else {
                    this._gameLogo.visible = true;
                }
                this._closeButton.position.set(bounds.width - rightSideMargin - (this._closeButton.width * 0.5), 36);
                this._closeBtnXmark.position.set(this._closeButton.x + this._closeButton.width * 0.5, this._closeButton.y + this._closeButton.height * 0.5 - 4);
                this._spinControls.position.set(bounds.width - rightSideMargin, 420);
                this._soundButton.position.set(20, bounds.height - this._soundButton.height - 60);
            }
            else {
                this._gameFeed.position.set(13, 210);
                this._gameLogo.position.set(bounds.width * 0.5, 26);
                this._gameLogo.scale.set(1, 1);
                this._gameLogo.visible = true;
                this._closeButton.position.set(bounds.width - this._closeButton.width - 5, 14);
                this._closeBtnXmark.position.set(this._closeButton.x + this._closeButton.width * 0.5, this._closeButton.y + this._closeButton.height * 0.5 - 4);
                this._spinControls.position.set(bounds.width * 0.5, Math.floor(bounds.height - this._spinControls.height - 10));
                this._soundButton.position.set(20, bounds.height - this._soundButton.height - 60);
                this._gameFeed.resize(this._spinControls.y - this._gameFeed.position.y - 15);
            }
            this._gameFeed._scroll.updateContent();
            this._spinControls.resize();
        }
    }
    enableCloseBtn(value) {
        this._closeButton.enable(value);
        if (value) {
            this._closeButton.alpha = PromoPanelConfig_1.PromoPanelConfig.ENABLE_BTN_ALPHA;
            this._closeBtnXmark.alpha = PromoPanelConfig_1.PromoPanelConfig.ENABLE_BTN_ALPHA;
        }
        else {
            this._closeButton.alpha = PromoPanelConfig_1.PromoPanelConfig.DISABLE_BTN_ALPHA;
            this._closeBtnXmark.alpha = PromoPanelConfig_1.PromoPanelConfig.DISABLE_BTN_ALPHA;
        }
    }
    togglePlayPauseBtn() {
        return this._spinControls.togglePlayButton();
    }
    setPlayState(value) {
        this._spinControls.setPlayState(value);
    }
    enablePlayPauseBtn(value) {
        this._spinControls.enablePlayPauseBtn(value);
    }
    setSpinsLeft(value) {
        this._spinControls.setSpinsLeft(value);
    }
    setPlacedBet(value) {
        this._gameFeed._topInfoBar.setPlacedBet(value);
    }
    setAccumulatedBet(value) {
        this._gameFeed._topInfoBar.setAccumulatedBet(value);
    }
    setAccumulatedWin(value) {
        this._gameFeed._topInfoBar.setAccumulatedWin(value);
    }
    setNetPosition(value) {
        // this._gameFeed._topInfoBar.netPosition.value = value;
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.WIN);
    }
    createBlurFilters() {
        this._blur1 = new PIXI.filters.BlurFilter(0, 6);
        this._blur1.autoFit = true;
        this._blur1.repeatEdgePixels = false;
        this._blur2 = new PIXI.filters.BlurFilter(0, 6);
        this._blur2.autoFit = true;
        this._blur2.repeatEdgePixels = false;
    }
    init() {
        var _a, _b;
        this._bg = new PIXI.Sprite(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(((_b = (_a = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData) === null || _a === void 0 ? void 0 : _a.graphics) === null || _b === void 0 ? void 0 : _b.backgroundTextureName) || "AS_REPLAY_BG"));
        this._bg.name = "AS_REPLAY_BG";
        this._bg.anchor.set(0.5, 0.5);
        this._bg.interactive = true;
        this._gameLogo = new PIXI.Sprite(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture("AS_GAME_LOGO"));
        this._gameLogo.name = "AS_GAME_LOGO";
        this._gameLogo.anchor.set(0.5, 0);
        this._gameFeed = new ActionSpinsGameFeedView_1.ActionSpinsGameFeedView();
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.CLOSE_BG_ICON)));
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xFFffffff);
        this._closeButton = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.CLOSE, onIcons, colors);
        this._closeButton.addClickCallback(() => this._controller.onReplayCloseButtonClick());
        this._closeButton.toggled = false;
        this._closeButton.enable(true);
        this._closeBtnXmark = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.CLOSE));
        this._closeBtnXmark.tint = 0x000000;
        this._closeBtnXmark.anchor.set(0.5, 0.5);
        this._closeBtnXmark.pivot.y = -3;
        this._spinControls = new SpinControls_1.SpinControls(this._controller);
        this._soundButton = new SoundButton_1.SoundButton("sound");
        this._soundButton.position.set(200, 200);
        this._soundButton.addClickCallback(() => {
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.toggleQuickMute();
            this.updateSoundButton();
        });
        this.updateSoundButton();
        this.addChild(this._bg, this._gameLogo, this._gameFeed, this._closeButton, this._closeBtnXmark, this._spinControls, this._soundButton);
        this.createBlurFilters();
        this.hide();
    }
    updateSoundButton() {
        const loaded = NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.isLoaded;
        const loading = NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.loading;
        const soundOn = !NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.isQuickMute();
        if (loading || (soundOn && !loaded)) {
            this._soundButton.toggled = false;
            this._soundButton.enable(false);
            this._soundButton.startLoadingAnimation(() => { this.updateSoundButton(); });
        }
        else {
            this._soundButton.stopLoadingAnimation();
            this._soundButton.toggled = soundOn;
            this._soundButton.enable(true);
        }
    }
    addEventListeners() {
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(PromoPanelEvents_1.PromoPanelEvents.AS_REPLAY_ADD_BLUR, () => this.addBlur());
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.on(PromoPanelEvents_1.PromoPanelEvents.AS_REPLAY_REMOVE_BLUR, () => this.removeBlur());
    }
}
exports.ASReplayView = ASReplayView;
//# sourceMappingURL=ASReplayView.js.map