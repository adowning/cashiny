"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeFeatureBetHandler = void 0;
const APIEventSystem_1 = require("../../../interfaces/APIEventSystem");
const SlotStateHandler_1 = require("../SlotStateHandler");
const FreeFeatureBetTemplate_1 = require("./FreeFeatureBetTemplate");
const APIBetType_1 = require("../../../interfaces/APIBetType");
const FreeFeatureBetPopUpStart_1 = require("./FreeFeatureBetPopUpStart");
const NolimitApplication_1 = require("../../../NolimitApplication");
const ImgLoader_1 = require("../../../loader/ImgLoader");
/**
 * Created by Jerker Nord on 2022-02-09.
 */
const eventSystem = require('@nolimitcity/core/api/event-system');
class FreeFeatureBetHandler {
    constructor(api) {
        this._started = false;
        this._hasShownStartDialog = false;
        this._freeFeatureBetSent = false;
        this._freeFeatureBetStarted = false;
        this._totalWin = "-1";
        this.FREE_FEATURE_BET_START = "freeFeatureBetStart";
        this.FREE_FEATURE_BET_UPDATE = "freeFeatureBetUpdate";
        this.FREE_FEATURE_BET_END = "freeFeatureBetEnd";
        this._api = api;
        this.events = eventSystem.create();
        api.events.on(APIEventSystem_1.APIEvent.FREE_FEATURE_BETS, (freeFeatureBets) => this.onFreeFeatureBets(freeFeatureBets));
        api.events.on(APIEventSystem_1.APIEvent.BET, (data) => this.onBet(data));
        api.events.on(APIEventSystem_1.APIEvent.STATE, (data) => this.onState(data));
        api.events.on(APIEventSystem_1.APIEvent.GAME, (data) => this.onGameData(data));
        api.events.on('operatorFreeFeatureBetMessages', (operatorFreeBetMessages) => {
            let messages = JSON.parse(operatorFreeBetMessages);
            messages = Array.isArray(messages) ? messages : [messages];
            this._operatorFreeFeatureBetMessages = messages;
        });
    }
    onBet(data) {
        if (data.type !== APIBetType_1.APIBetType.FEATURE_BET) {
            return;
        }
        else {
            if (this.hasFreeFeatureBet() == true) {
                this._freeFeatureBetSent = true;
            }
        }
    }
    start() {
        this._started = true;
        this.checkFreeFeatureBet();
    }
    getBet() {
        var _a;
        if (this._currentData) {
            return (_a = this._currentData) === null || _a === void 0 ? void 0 : _a.bet.toString();
        }
        else {
            return "-1";
        }
    }
    onGameData(data) {
        this.setTotalWin(data.accumulatedRoundWin);
    }
    onState(state) {
        if (this._currentData == undefined) {
            return;
        }
        //Don't show start pop-up if restore into free feature bet
        if (state == SlotStateHandler_1.SlotState.RESTORE && this._currentData !== undefined) {
            this._hasShownStartDialog = true;
            this._freeFeatureBetSent = true;
        }
        if (state == SlotStateHandler_1.SlotState.READY || state == SlotStateHandler_1.SlotState.DIALOG) {
            if (this._freeFeatureBetStarted == false) {
                this.checkFreeFeatureBet();
            }
            if (this._freeFeatureBetSent == true) {
                this._freeFeatureBetSent = false;
                this.showEndDialog();
            }
        }
    }
    /**
     * Adding the end dialog to the dialog queue
     * @param data
     */
    showEndDialog() {
        this._api.betHandler.cancelNextAutoBetAfterCollect();
        const winAmount = +this._totalWin;
        const defaultEndMessage = {
            winnings: this._api.currency.formatValue(winAmount),
            aWinnerIsYou: winAmount > 0
        };
        const dialogData = defaultEndMessage;
        const html = this._api.translations.render(FreeFeatureBetTemplate_1.FreeFeatureBetTemplate.END_TEMPLATE, dialogData);
        this._api.dialog.open(html, {
            alwaysShow: true,
            closeable: false,
            onClose: () => {
                this.endFreeFeatureBet();
            }
        });
    }
    checkFreeFeatureBet() {
        if (this._currentData == undefined) {
            return;
        }
        if (!this._started || (!this._api.slotStates.checkState(SlotStateHandler_1.SlotState.READY) && !this._api.slotStates.checkState(SlotStateHandler_1.SlotState.DIALOG))) {
            return;
        }
        if (PIXI.utils.TextureCache[this._currentData.featureName]) {
            this.startFreeFeatureBet();
        }
        else {
            const imgLoader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath + "/nolimit/promo-panel/");
            if (this._currentData) {
                imgLoader.add(this._currentData.featureName, this._currentData.featureName + ".png");
            }
            const promise = Promise.all([imgLoader.load()]);
            return promise.then(() => this.startFreeFeatureBet());
        }
    }
    startFreeFeatureBet() {
        this._api.betHandler.cancelNextAutoBetAfterCollect();
        this._api.betFeatureController.setActiveBetFeature();
        this._popupView = new FreeFeatureBetPopUpStart_1.FreeFeatureBetPopUpStart(() => this.onPopUpOkClicked());
        if (this._freeFeatureBetStarted == false) {
            this._freeFeatureBetStarted = true;
            if (this._hasShownStartDialog == false && this._currentData !== undefined) {
                this._popupView.createPopUpView(this._currentData);
                NolimitApplication_1.NolimitApplication.addDialog(this._popupView, true);
            }
            //Tells the keypad to do it's stuff
            this.events.trigger(this.FREE_FEATURE_BET_START);
        }
    }
    onPopUpOkClicked() {
        this._hasShownStartDialog = true;
        this._api.betHandler.freeFeatureBet(this._currentData, {});
    }
    endFreeFeatureBet() {
        this._totalWin = "-1";
        this._freeFeatureBetStarted = false;
        this._currentData = undefined;
        this._hasShownStartDialog = false;
        this.events.trigger(this.FREE_FEATURE_BET_END);
    }
    onFreeFeatureBets(data) {
        if (this._api.isReplay) {
            return;
        }
        if (data == undefined || data.featureName == undefined) {
            //At the end an empty object arrives, this checks for that and skips setting currentData in that case. Fixes https://github.com/nolimitcity/nolimit-slot-launcher/issues/417
            return;
        }
        this._currentData = data;
    }
    getBetHeader() {
        const header = 'FREE BET';
        const translated = this._api.translations.translate(header);
        const text = "1 " + translated;
        return text;
    }
    getFormattedWin() {
        return "";
    }
    hasFreeFeatureBet() {
        if (this._currentData == undefined) {
            return false;
        }
        return true;
    }
    setTotalWin(totalWin) {
        this._totalWin = totalWin;
    }
}
exports.FreeFeatureBetHandler = FreeFeatureBetHandler;
//# sourceMappingURL=FreeFeatureBetHandler.js.map