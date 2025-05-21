"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitAutoPlayPlugin = void 0;
const ApiPlugin_1 = require("../ApiPlugin");
const NolimitLauncher_1 = require("../../NolimitLauncher");
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const SlotStateHandler_1 = require("../apiplugin/SlotStateHandler");
const APIErrorSystem_1 = require("../../interfaces/APIErrorSystem");
/**
 * Created by Jonas Wålekvist on 2019-11-08.
 */
class NolimitAutoPlayPlugin {
    get rounds() {
        return this._autoPlayData.rounds;
    }
    get isAutoplayRound() {
        return this._isAutoplayRound;
    }
    get settings() {
        const balance = NolimitAutoPlayPlugin.apiPlugIn.balance.getAmount();
        return {
            minBalancePercent: this._autoPlaySettingsData.minBalancePercent,
            maxBalancePercent: this._autoPlaySettingsData.maxBalancePercent,
            minBalancePercentText: this._autoPlaySettingsData.minBalancePercent != undefined ? NolimitAutoPlayPlugin.apiPlugIn.currency.format(this._autoPlaySettingsData.minBalancePercent * balance) : undefined,
            maxBalancePercentText: this._autoPlaySettingsData.maxBalancePercent != undefined ? NolimitAutoPlayPlugin.apiPlugIn.currency.format(this._autoPlaySettingsData.maxBalancePercent * balance) : undefined,
            maxSingleWin: this._autoPlaySettingsData.maxSingleWin
        };
    }
    getRawData() {
        return this._autoPlayData;
    }
    constructor() {
        this.name = "AutoPlay";
        this._autoPlayDelay = 100;
        this._isAutoplayRound = false;
        this._autoPlaySettingsData = {};
        this.clearData();
    }
    updateData(data) {
        this._autoPlaySettingsData = data;
        const balance = NolimitAutoPlayPlugin.apiPlugIn.balance.getAmount();
        const betLevel = NolimitAutoPlayPlugin.apiPlugIn.betLevel.getLevel();
        const minBalance = data.minBalancePercent ? data.minBalancePercent * balance : undefined;
        const maxBalance = data.maxBalancePercent ? data.maxBalancePercent * balance : undefined;
        const hasFreeBets = NolimitAutoPlayPlugin.apiPlugIn.freeBets.hasFreeBets();
        const hasFreeFeatureBet = NolimitAutoPlayPlugin.apiPlugIn.freeFeatureBet.hasFreeFeatureBet();
        const maxSingleWin = data.maxSingleWin || Number.MAX_VALUE;
        this._autoPlaySettingsData.autoCollectGamble = this._autoPlaySettingsData.autoCollectGamble != undefined ? this._autoPlaySettingsData.autoCollectGamble : true;
        this._autoPlayData = {
            rounds: data.rounds || 0,
            minBalance: minBalance,
            maxBalance: maxBalance,
            betLevel: parseFloat(betLevel),
            freeBets: hasFreeBets,
            freeFeatureBet: hasFreeFeatureBet,
            maxSingleWin: maxSingleWin,
            autoCollectGamble: this._autoPlaySettingsData.autoCollectGamble
        };
    }
    playFreeRoundsAutoplay() {
        this.clearData();
        const hasFreeBets = NolimitAutoPlayPlugin.apiPlugIn.freeBets.hasFreeBets();
        const hasFreeFeatureBet = NolimitAutoPlayPlugin.apiPlugIn.freeFeatureBet.hasFreeFeatureBet();
        const rounds = NolimitAutoPlayPlugin.apiPlugIn.freeBets.getRemainingRounds();
        this._autoPlayData.freeBets = hasFreeBets;
        this._autoPlayData.freeFeatureBet = hasFreeFeatureBet;
        this._autoPlayData.rounds = rounds;
        this._autoPlayData.autoCollectGamble = true;
        if (NolimitAutoPlayPlugin.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.READY)) {
            this.runAutoPlay();
        }
    }
    cancelAutoPlay() {
        this.clearData();
        this._isAutoplayRound = false;
        NolimitAutoPlayPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.AUTO_PLAY);
    }
    //-- INIT and SETUP
    clearData() {
        this._autoPlayData = {
            rounds: 0,
            betLevel: 0,
            freeBets: false,
            freeFeatureBet: false,
            maxSingleWin: undefined,
            minBalance: undefined,
            maxBalance: undefined,
            minBalanceText: undefined,
            maxBalanceText: undefined,
            lastWin: undefined,
            autoCollectGamble: undefined
        };
    }
    addEventListeners() {
        NolimitAutoPlayPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.WIN, (win) => {
            this._autoPlayData.lastWin = win;
        });
        NolimitAutoPlayPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.MESSAGES, (messages) => {
            if (messages.count > 0) {
                this.cancelAutoPlay();
            }
        });
        NolimitAutoPlayPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.STATE, (state) => {
            if (state == SlotStateHandler_1.SlotState.READY) {
                this.runAutoPlay();
            }
            if (state == SlotStateHandler_1.SlotState.GAMBLE) {
                if (this._autoPlayData.autoCollectGamble == true && this._autoPlayData.rounds != 0) {
                    NolimitAutoPlayPlugin.apiPlugIn.betHandler.gambleBet(true);
                }
            }
        });
        NolimitAutoPlayPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.PAUSE, () => {
            this.pause();
        });
        NolimitAutoPlayPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.RESUME, () => {
            this.unPause();
        });
        NolimitAutoPlayPlugin.apiPlugIn.events.on(APIEventSystem_1.APIEvent.DIALOG, (data) => {
            if (data == "open") {
                this.pause();
            }
            else {
                this.unPause();
            }
        });
    }
    pause() {
        this._paused = true;
    }
    unPause() {
        this._paused = false;
    }
    //NolimitPlugin implementations
    init() {
        return new Promise((resolve, reject) => {
            for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
                if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                    NolimitAutoPlayPlugin.apiPlugIn = plugin;
                }
            }
            if (NolimitAutoPlayPlugin.apiPlugIn == undefined) {
                reject({ message: "Autoplay plugin can't find apiPlugin", code: APIErrorSystem_1.APIErrorCode.PLUGIN_LAUNCH });
            }
            this._autoPlayDelay = NolimitAutoPlayPlugin.apiPlugIn.options.autoplayDelay != undefined ? NolimitAutoPlayPlugin.apiPlugIn.options.autoplayDelay : this._autoPlayDelay;
            this.addEventListeners();
            resolve(this);
        });
    }
    /**
     *  This is specific for games on a jurisdiction that requires autoplay to be turned of when having triggered a bonus
     */
    turnOffAutoplayOnBonus() {
        if (NolimitAutoPlayPlugin.apiPlugIn.gameClientConfiguration.autoPlaySettings.turnOffAutoplayOnBonus) {
            this.cancelAutoPlay();
        }
    }
    getReady() {
        return Promise.resolve(this);
    }
    getReadyToStart() {
        return Promise.resolve(this);
    }
    start() {
        return Promise.resolve(this);
    }
    //RUNNING
    runAutoPlay() {
        //The delay is here to give dialog.js and external sources time to pause or change slotstate before autoplay does a bet.
        //This is not ideal, but it's lots of stuff going on in ready, and it needs to happen in order.
        if (!this.shouldPlay()) {
            this.cancelAutoPlay();
        }
        else if (this._activeTimeout == undefined) {
            this._activeTimeout = setTimeout(() => this.runAutoplayAfterDelay(), this._autoPlayDelay);
        }
    }
    runAutoplayAfterDelay() {
        if (!this._paused && this._autoPlayData.rounds > 0) {
            this._autoPlayData.rounds = this._autoPlayData.rounds - 1;
            this._isAutoplayRound = this._autoPlayData.rounds > 0;
            NolimitAutoPlayPlugin.apiPlugIn.events.trigger(APIEventSystem_1.APIEvent.AUTO_PLAY);
            NolimitAutoPlayPlugin.apiPlugIn.betHandler.bet();
        }
        this._activeTimeout = undefined;
    }
    shouldPlay() {
        const balance = NolimitAutoPlayPlugin.apiPlugIn.balance.getAmount();
        let bet = this._autoPlayData.betLevel;
        const activeFeature = NolimitAutoPlayPlugin.apiPlugIn.betFeatureController.getActiveBetFeature();
        if (activeFeature != undefined) {
            bet = activeFeature.getTotalCost();
        }
        const nextBalance = balance - bet;
        this._isAutoplayRound = this._autoPlayData.rounds > 0;
        const isFreeBetsAutoplay = NolimitAutoPlayPlugin.apiPlugIn.freeBets.hasFreeBets() && this._autoPlayData.freeBets;
        const isFreeFeatureBetAutoplay = NolimitAutoPlayPlugin.apiPlugIn.freeFeatureBet.hasFreeFeatureBet() && this._autoPlayData.freeFeatureBet;
        if (!this._isAutoplayRound) {
            return false;
        }
        if (nextBalance < 0 && !isFreeBetsAutoplay) {
            return false;
        }
        if (nextBalance < 0 && !isFreeFeatureBetAutoplay) {
            return false;
        }
        if (NolimitAutoPlayPlugin.apiPlugIn.freeBets.hasFreeBets() !== this._autoPlayData.freeBets) {
            NolimitAutoPlayPlugin.apiPlugIn.log('Autoplay:', 'Free bets status has changed to:', NolimitAutoPlayPlugin.apiPlugIn.freeBets.hasFreeBets(), 'from', this._autoPlayData.freeBets);
            return false;
        }
        if (NolimitAutoPlayPlugin.apiPlugIn.freeFeatureBet.hasFreeFeatureBet() !== this._autoPlayData.freeFeatureBet) {
            NolimitAutoPlayPlugin.apiPlugIn.log('Autoplay:', 'Free Feature bet status has changed to:', NolimitAutoPlayPlugin.apiPlugIn.freeFeatureBet.hasFreeFeatureBet(), 'from', this._autoPlayData.freeFeatureBet);
            return false;
        }
        if (this._autoPlayData.lastWin !== undefined && this._autoPlayData.maxSingleWin !== undefined && this._autoPlayData.lastWin > this._autoPlayData.maxSingleWin) {
            NolimitAutoPlayPlugin.apiPlugIn.log('Autoplay:', 'Win has exceeded maxBalancePercent win of:', this._autoPlayData.maxSingleWin.toFixed(2));
            return false;
        }
        if (this._autoPlayData.maxBalance !== undefined && balance >= this._autoPlayData.maxBalance) {
            NolimitAutoPlayPlugin.apiPlugIn.log('Autoplay:', 'Balance has reached maximum:', this._autoPlayData.maxBalance.toFixed(2));
            return false;
        }
        if (this._autoPlayData.minBalance !== undefined && nextBalance < this._autoPlayData.minBalance) {
            NolimitAutoPlayPlugin.apiPlugIn.log('Autoplay:', 'Balance has reached minimum:', this._autoPlayData.minBalance.toFixed(2));
            return false;
        }
        return true;
    }
}
exports.NolimitAutoPlayPlugin = NolimitAutoPlayPlugin;
//# sourceMappingURL=NolimitAutoPlayPlugin.js.map