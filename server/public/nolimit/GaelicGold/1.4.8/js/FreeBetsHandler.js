"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeBetsHandler = void 0;
const APIEventSystem_1 = require("../../../interfaces/APIEventSystem");
const SlotStateHandler_1 = require("../SlotStateHandler");
const FreeBetsTemplate_1 = require("./FreeBetsTemplate");
const APIBetType_1 = require("../../../interfaces/APIBetType");
const eventSystem = require('@nolimitcity/core/api/event-system');
class FreeBetsHandler {
    constructor(api) {
        this._started = false;
        this.FREE_BETS_START = "freeBetsStart";
        this.FREE_BETS_UPDATE = "freeBetsUpdate";
        this.FREE_BETS_END = "freeBetsEnd";
        this.FREE_BETS_START_FROM_ACTION_SPINS = "freeBetsStartFromActionSpins";
        this.isExternalFreeBetActive = false;
        this._api = api;
        this.events = eventSystem.create();
        api.events.on(APIEventSystem_1.APIEvent.IS_OPEN_GAME_ROUND, (value) => this.onOpenGameRound(value));
        api.events.on(APIEventSystem_1.APIEvent.FREE_BETS, (freeBets) => this.onFreeBets(freeBets));
        api.events.on(APIEventSystem_1.APIEvent.BET, (data) => this.onBet(data));
        api.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_BET, (data) => this.onLightningSpinsBet(data));
        api.events.on(APIEventSystem_1.APIEvent.STATE, (data) => this.onState(data));
        api.events.on(APIEventSystem_1.APIEvent.SOFT_RESET, () => this.onSoftReset());
        api.events.on('operatorFreeBetMessages', (operatorFreeBetMessages) => {
            let messages = JSON.parse(operatorFreeBetMessages);
            messages = Array.isArray(messages) ? messages : [messages];
            this._operatorFreeBetMessages = messages;
        });
        api.events.on('extFreeRound', (data) => {
            let wasInitData = false;
            if (this._currentData == undefined) {
                if (data.bet == undefined || data.rounds == undefined) {
                    return;
                }
                this._currentData = {
                    amount: "" + data.bet,
                    count: data.rounds || 0,
                    messages: {},
                    promoName: "",
                    rounds: data.rounds || 0,
                    used: 0,
                    winnings: ""
                };
                wasInitData = true;
            }
            if (data.rounds) {
                this._currentData.count = data.rounds;
            }
            if (data.bet) {
                this._currentData.amount = "" + data.bet;
            }
            if (data.winnings) {
                this._currentData.winnings = "" + data.winnings;
            }
            if (wasInitData) {
                this.isExternalFreeBetActive = true;
                api.betHandler.addBetDataInjectCallback((data) => this.injectExternalFreeBetCallback(data));
                if (this._betLevelBeforeEvoFreeBets == undefined) {
                    this._betLevelBeforeEvoFreeBets = api.betLevel.getLevel();
                }
                this.checkFreeBets();
            }
        });
        api.events.on('extFreeRoundsEnded', () => {
            this.isExternalFreeBetActive = false;
            this._currentData = undefined;
            if (this._betLevelBeforeEvoFreeBets != undefined) {
                api.betLevel.setLevel(this._betLevelBeforeEvoFreeBets);
                this._betLevelBeforeEvoFreeBets = undefined;
            }
            this.endFreeBets();
        });
    }
    injectExternalFreeBetCallback(betData) {
        if (betData.type === APIBetType_1.APIBetType.FREE_BET && this.isExternalFreeBetActive) {
            betData.type = APIBetType_1.APIBetType.NORMAL_BET;
            betData.replayAndFeatureBuy = true; //Sort of a hack, this parameter is checked in balance.js. If true, it will skip balance - bet check. And allow "normal" bets to be done without checking that you can afford to make the bet.
        }
        return betData;
    }
    onOpenGameRound(value) {
        this._isRestoreState = value;
    }
    onLightningSpinsBet(data) {
        if (data.type !== APIBetType_1.APIBetType.FREE_BET) {
            return;
        }
        if (this._currentData) {
            this._currentData.count = Math.max(this._currentData.count - 1, 0);
            this.events.trigger(this.FREE_BETS_UPDATE);
        }
    }
    hasFreeBets() {
        if (!this._currentData) {
            return false;
        }
        if (this.isExternalFreeBetActive) {
            return true;
        }
        if (this._currentData.count > 0) {
            return true;
        }
        if (this._currentData.rounds > 0 && this._currentData.rounds === this._currentData.used) {
            return true;
        }
        return false;
    }
    getFormattedWin() {
        return this._currentData && parseFloat(this._currentData.winnings) > 0 ? this._api.currency.format(parseFloat(this._currentData.winnings)) : undefined;
    }
    getCurrentWinnings() {
        return this._currentData && parseFloat(this._currentData.winnings) > 0 ? parseFloat(this._currentData.winnings) : undefined;
    }
    getBetHeader() {
        if (this._currentData == undefined) {
            return this._api.translations.translate("BET");
        }
        const header = this._currentData.count === 1 ? 'FREE BET' : 'FREE BETS';
        const translated = this._api.translations.translate(header);
        const text = this._currentData.count + " " + translated;
        return text;
    }
    getBet() {
        return this._currentData ? this._currentData.amount : this._api.currency.formatValue(0);
    }
    getRemainingRounds() {
        return this._currentData ? this._currentData.count : 0;
    }
    onFreeBets(data) {
        var _a;
        if (!this._started) {
            this._isDataAvailable = data;
            return;
        }
        if (this._api.isReplay) {
            return;
        }
        if (Array.isArray(data)) {
            data = data[0];
        }
        if (data.previous) {
            if (((_a = this._currentData) === null || _a === void 0 ? void 0 : _a.hasShownStartDialog) === true) {
                //If we have not shown the start dialog, this is left from previous session.
                this.showEndDialog(data.previous);
                this._currentData = undefined;
            }
            delete data.previous;
        }
        //Update current data object with info from server
        if (this._currentData != undefined) {
            this._currentData = Object.assign(this._currentData, data);
        }
        else {
            this._currentData = data;
        }
        if (!this.hasFreeBets()) {
            this._currentData = undefined;
        }
        if (this._currentData && this._currentData.hasShownStartDialog !== true && this._currentData.hasQueuedStartDialog !== true) {
            this._currentData.hasQueuedStartDialog = true;
            if (!this._isRestoreState) {
                this.showStartDialog(this._currentData);
            }
            else {
                if (this._isRestoreState && ((this._currentData.count - 1) > 0)) {
                    const dialogData = Object.assign({}, this._currentData);
                    dialogData.count--;
                    dialogData.used++;
                    this.showStartDialog(dialogData);
                }
            }
        }
    }
    /**
     * Adding the start dialog to the dialog queue
     * @param data
     */
    showStartDialog(data) {
        this._api.betHandler.cancelNextAutoBetAfterCollect();
        let spinsToGoText = this._api.translations.translate("#spinstogo out of #spinsleft spins to go");
        spinsToGoText = spinsToGoText.replace("#spinstogo", "" + data.count);
        spinsToGoText = spinsToGoText.replace("#spinsleft", "" + (data.count + data.used));
        const defaultStartMessages = {
            header: this._api.translations.translate('Congratulations!'),
            message: this._api.translations.translate('You have free bets!'),
            count: data.count,
            total: data.count + data.used,
            value: this._api.currency.format(data.rounds * parseFloat(data.amount)),
            spinsToGo: spinsToGoText,
            operatorFreeBetMessages: this._operatorFreeBetMessages
        };
        const dialogData = Object.assign(defaultStartMessages, data.messages);
        const html = this._api.translations.render(FreeBetsTemplate_1.FreeBetsTemplate.START_TEMPLATE, dialogData);
        this._api.dialog.open(html, {
            alwaysShow: true,
            closeable: false,
            onShowCB: () => {
                this._api.betFeatureController.setActiveBetFeature();
            },
            onClose: () => {
                data.hasShownStartDialog = true;
            }
        });
    }
    /**
     * Adding the end dialog to the dialog queue
     * @param data
     */
    showEndDialog(data) {
        this._api.betHandler.cancelNextAutoBetAfterCollect();
        const defaultEndMessage = {
            winnings: data.winnings,
            aWinnerIsYou: parseFloat(data.winnings) > 0
        };
        const dialogData = defaultEndMessage;
        const html = this._api.translations.render(FreeBetsTemplate_1.FreeBetsTemplate.END_TEMPLATE, dialogData);
        this._api.dialog.open(html, {
            alwaysShow: true,
            closeable: false,
            onClose: () => {
                this.endFreeBets();
                this.checkFreeBets();
            }
        });
    }
    start() {
        this._started = true;
        if (this._isDataAvailable) {
            this.onFreeBets(this._isDataAvailable);
            this._isDataAvailable = null;
        }
        if (this._currentData && this._isRestoreState) {
            this._currentData.hasShownStartDialog = true;
            this._currentData.count = Math.max(this._currentData.count - 1, 0);
            this.events.trigger(this.FREE_BETS_UPDATE);
        }
        this.checkFreeBets();
    }
    onState(state) {
        if (state == SlotStateHandler_1.SlotState.READY) {
            this.checkFreeBets();
        }
    }
    checkFreeBets() {
        if (this._currentData == undefined) {
            return;
        }
        if (!this._started || !this._api.slotStates.checkState(SlotStateHandler_1.SlotState.READY)) {
            return;
        }
        if (this.getRemainingRounds() > 0) {
            this.startFreeBets();
        }
    }
    onBet(data) {
        this._isRestoreState = false;
        const evoFreeBet = this.isExternalFreeBetActive && data.type === APIBetType_1.APIBetType.NORMAL_BET;
        if (evoFreeBet) {
            this._api.betHandler.cancelNextAutoBetAfterCollect();
        }
        if (data.type === APIBetType_1.APIBetType.FREE_BET || evoFreeBet) {
            if (this._currentData) {
                this._currentData.count = Math.max(this._currentData.count - 1, 0);
                this.events.trigger(this.FREE_BETS_UPDATE);
            }
        }
    }
    onSoftReset() {
        if (this._currentData) {
            this._currentData.count = Math.max(this._currentData.count + 1, 0);
            this.events.trigger(this.FREE_BETS_UPDATE);
        }
    }
    startFreeBets() {
        this.events.trigger(this.FREE_BETS_START);
    }
    endFreeBets() {
        this.events.trigger(this.FREE_BETS_END);
    }
}
exports.FreeBetsHandler = FreeBetsHandler;
//# sourceMappingURL=FreeBetsHandler.js.map