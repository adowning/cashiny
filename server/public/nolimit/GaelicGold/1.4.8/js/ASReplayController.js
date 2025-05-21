"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASReplayController = void 0;
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const ASReplayView_1 = require("./ASReplayView");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PromoPanelEvents_1 = require("../../../events/PromoPanelEvents");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
class ASReplayController {
    get asController() {
        return this._asController;
    }
    get isPlaying() {
        return this._isPlaying;
    }
    set isPlaying(value) {
        this._isPlaying = value;
    }
    set fsCount(value) {
        this._fsCount = value;
    }
    get accumulatedBet() {
        return this._accumulatedBet;
    }
    set accumulatedBet(value) {
        this._accumulatedBet = value;
        this._view.setAccumulatedBet(value);
        this._view.setNetPosition(this._accumulatedWin - this._accumulatedBet);
    }
    get accumulatedWin() {
        return this._accumulatedWin;
    }
    set accumulatedWin(value) {
        this._accumulatedWin = value;
        this._view.setAccumulatedWin(value);
    }
    get placedBet() {
        return this._placedBet;
    }
    set placedBet(value) {
        this._placedBet = value;
        this._view.setPlacedBet(value);
    }
    get view() {
        return this._view;
    }
    constructor(controller) {
        this._isPlaying = true;
        this._fsCount = 0;
        this._accumulatedBet = 0;
        this._accumulatedWin = 0;
        this._placedBet = 0;
        this._asController = controller;
        const communication = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.communication.getParameters();
        this._communicationDataKey = communication.key;
        this._communicationReplayUrl = communication.url.replace("gs", "");
        this.createView();
    }
    playBonusInGame() {
        this.onClickPlayBonusInGamePlayFunc && this.onClickPlayBonusInGamePlayFunc();
    }
    playContinueBonusInReplay() {
        this.onClickContinuePlayBonusInReplayFunc && this.onClickContinuePlayBonusInReplayFunc();
    }
    updateRawData(winData, replayData) {
        Logger_1.Logger.logDev("updateRawData ", winData, replayData);
        const tl = new gsap_1.TimelineLite();
        if (winData.freeSpinTriggeredThisSpin) {
            this._view.isFSStart = true;
        }
        if (this._view.isFSStart) {
            tl.add(this._view.addFSRound(winData, replayData));
            if (winData.nextMode === "NORMAL") {
                this._view.isFSStart = false;
            }
        }
        else {
            tl.add(this._view.addRound(winData, replayData));
        }
        return tl;
    }
    openReplay(gameRoundId) {
        Logger_1.Logger.logDev("Action Spin : PlayReplay btn clicked gameRoundId : ", gameRoundId);
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.openReplay(parseInt(gameRoundId));
    }
    onExpandBtnClick(roundInfo) {
        if (!this._isPlaying) {
            this._view.onExpandCollapse(roundInfo);
        }
    }
    onPlayPauseBtnClick() {
        const isToggled = this._view.togglePlayPauseBtn();
        if (isToggled) {
            this.isPlaying = false;
            this._view.enablePlayPauseBtn(false);
        }
        else {
            this.isPlaying = true;
            this._view.onResume();
        }
        this._view.enableCloseBtn(false);
        this._asController.pauseGame(isToggled, !isToggled);
    }
    onGameStopped(isNextSpinEligible = false) {
        this.isPlaying = false;
        this._view.onGameStopped(isNextSpinEligible);
    }
    onReplayCloseButtonClick() {
        NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.playKeypadEffect("click");
        this._asController.onReplayCloseButtonClick();
    }
    open() {
        this._isOpen = true;
        NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.ACTION_SPINS_IS_ACTIVE, true);
        NolimitApplication_1.NolimitApplication.events.trigger(PromoPanelEvents_1.PromoPanelEvents.SHOW_HIDE_CLOSE_BUTTON, false); //#277 hide promo-panel close button
        this.accumulatedBet = 0;
        this.accumulatedWin = 0;
        this.fsCount = 0;
        this.isPlaying = true;
        this._view.reset();
        this._view.setNetPosition(0);
        this._view.show();
    }
    close() {
        if (this._isOpen) {
            this._isOpen = false;
            NolimitApplication_1.NolimitApplication.apiPlugin.events.trigger(APIEventSystem_1.APIEvent.ACTION_SPINS_IS_ACTIVE, false);
            NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.SCREEN, "open");
            this._view.hide();
            this._view.reset();
        }
    }
    createView() {
        if (this._view == undefined) {
            this._view = new ASReplayView_1.ASReplayView(this);
            this._asController.promotionPlugin.view.addChild(this._view);
        }
    }
    updateSpinsLeft(value) {
        this._view.setSpinsLeft(value);
    }
}
exports.ASReplayController = ASReplayController;
//# sourceMappingURL=ASReplayController.js.map