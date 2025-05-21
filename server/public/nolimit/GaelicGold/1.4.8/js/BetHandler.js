"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetHandler = void 0;
const APIEventSystem_1 = require("../../../interfaces/APIEventSystem");
const APIBetType_1 = require("../../../interfaces/APIBetType");
const APIErrorSystem_1 = require("../../../interfaces/APIErrorSystem");
const SlotStateHandler_1 = require("../SlotStateHandler");
const ElapsedTimeCheck_1 = require("../../../utils/ElapsedTimeCheck");
const insufficientFunds = require('@nolimitcity/game-api/src/insufficient-funds');
class BetHandler {
    //TODO -remove once Action Spins is updated to use new bonus.
    get betBoost() {
        const activeFeature = this._api.betFeatureController.getActiveBetFeature();
        if (activeFeature == undefined) {
            return undefined;
        }
        return {
            featureName: activeFeature.name,
            playerInteraction: {},
            calculatedPrice: activeFeature.getTotalCost(),
            originalPrice: activeFeature.price
        };
    }
    set normalBetPlayerInteraction(data) {
        this._normalBetPlayerInteraction = data;
    }
    get normalBetPlayerInteraction() {
        return this._normalBetPlayerInteraction;
    }
    constructor(api) {
        this._requestDataInjectionCallbacks = [];
        this._cancelBetAfterCollect = false;
        this._isHalt = false;
        this._paused = false;
        this._hold = false;
        this._api = api;
        this._timeChecker = new ElapsedTimeCheck_1.ElapsedTimeCheck(500, () => {
            this._api.error.trigger("Bet error", APIErrorSystem_1.APIErrorCode.JAVASCRIPT);
        });
        this.addEventListeners();
    }
    addEventListeners() {
        this._api.events.on(APIEventSystem_1.APIEvent.INIT, (data) => this.onData(data));
        this._api.events.on(APIEventSystem_1.APIEvent.GAME, (data) => this.onData(data));
        this._api.events.on(APIEventSystem_1.APIEvent.HALT, () => this.onHalt());
        this._api.events.on(APIEventSystem_1.APIEvent.HOLD, () => this.onHold());
        this._api.events.on(APIEventSystem_1.APIEvent.PAUSE, () => this.onPause());
        this._api.events.on(APIEventSystem_1.APIEvent.RESUME, () => this.onResume());
        this._api.events.on(APIEventSystem_1.APIEvent.CURRENT_BET, () => this.onBetLevelChange());
    }
    onHalt() {
        this._isHalt = true;
    }
    onPause() {
        this._paused = true;
    }
    onHold() {
        this._hold = true;
    }
    onResume() {
        this._paused = false;
        this._hold = false;
    }
    onBetLevelChange() {
        this.triggerBetBoostEvent();
    }
    triggerBetBoostEvent() {
        const activeFeature = this._api.betFeatureController.getActiveBetFeature();
        if (activeFeature != undefined) {
            this._api.events.trigger(APIEventSystem_1.APIEvent.BET_BOOST, { calculatedPrice: activeFeature.getTotalCost() });
        }
        else {
            this._api.events.trigger(APIEventSystem_1.APIEvent.BET_BOOST, undefined);
        }
    }
    onData(data) {
        this._mode = data.mode;
        this._nextMode = data.nextMode;
    }
    runDesignatedFunction(type, betLevel, playerInteraction) {
        const warningMessage = `Bet was called with a non NORMAL bet type: ${type}. `;
        let replacementFunction = "Please use designated function for this bet type: ";
        switch (type) {
            case APIBetType_1.APIBetType.FREE_BET:
                this.freeBet(playerInteraction);
                replacementFunction = "";
                break;
            case APIBetType_1.APIBetType.ZERO_BET:
                this.zeroBet(playerInteraction);
                replacementFunction += "betHandler.zeroBet(playerInteraction?:any):void";
                this._api.warn(`${warningMessage}${replacementFunction}`);
                break;
            case APIBetType_1.APIBetType.FEATURE_BET:
                replacementFunction += "betHandler.buyFeatureBet(featureName:string, playerInteraction:any = {}):void";
                this._api.error.trigger(`${warningMessage}${replacementFunction}`);
                break;
            case APIBetType_1.APIBetType.PICK_AND_CLICK_BET:
                replacementFunction += "betHandler.pickAndClickBet(selectedIndex:number, blockBetTrigger:boolean = false):void";
                this._api.error.trigger(`${warningMessage}${replacementFunction}`);
                break;
            case APIBetType_1.APIBetType.GAMBLE_BET:
                replacementFunction += "betHandler.gambleBet(gambleCollected:boolean, gambleOption?:string, gambleSelection?:string):void";
                this._api.error.trigger(`${warningMessage}${replacementFunction}`);
                break;
            default:
                replacementFunction = "";
                break;
        }
    }
    cancelNextAutoBetAfterCollect() {
        this._cancelBetAfterCollect = true;
    }
    shouldAbortBetAfterCollect(didCollect) {
        let abort = false;
        if (didCollect && this._cancelBetAfterCollect) {
            abort = true;
        }
        this._cancelBetAfterCollect = false;
        return abort;
    }
    bet(type = APIBetType_1.APIBetType.NORMAL_BET, betLevel, playerInteraction) {
        if (type != APIBetType_1.APIBetType.NORMAL_BET) {
            this.runDesignatedFunction(type, betLevel, playerInteraction);
            return;
        }
        this.collectWin().then((didCollect) => {
            if (this.shouldAbortBetAfterCollect(didCollect)) {
                return;
            }
            if (!this._api.slotStates.checkState(SlotStateHandler_1.SlotState.READY)) {
                this._api.error.trigger("Trying to bet in non ready state", APIErrorSystem_1.APIErrorCode.JAVASCRIPT);
                return;
            }
            const activeBetFeature = this._api.betFeatureController.getActiveBetFeature();
            if (activeBetFeature != undefined) {
                this.buyFeatureBet(activeBetFeature.name, activeBetFeature.getTotalCost(), playerInteraction);
            }
            else {
                if (this._api.freeBets.hasFreeBets()) {
                    this.freeBet(playerInteraction);
                }
                else {
                    this.normalBet(type, betLevel, playerInteraction);
                }
            }
        }).catch(reason => {
            this._api.error.trigger("Bet error:" + reason, APIErrorSystem_1.APIErrorCode.JAVASCRIPT);
        });
    }
    //---- MAIN BET TYPES
    normalBet(type = APIBetType_1.APIBetType.NORMAL_BET, betLevel = this._api.betLevel.getLevel(), playerInteraction) {
        if (this.checkBalance(betLevel)) {
            const betData = {
                type: type,
                bet: betLevel,
                playerInteraction: this.assignNormalBetPlayerInteraction(playerInteraction)
            };
            this.sendRequest(betData);
        }
    }
    actionSpinsNormalBet(type = APIBetType_1.APIBetType.NORMAL_BET, betLevel = this._api.betLevel.getLevel(), playerInteraction) {
        if (type === APIBetType_1.APIBetType.ZERO_BET || this.checkBalance(betLevel)) {
            const betData = {
                type: type,
                bet: betLevel,
                playerInteraction: { actionSpin: true }
            };
            this.sendRequestForLightningSpins(betData);
        }
    }
    actionSpinsPickAndClickBet(selectedIndex, blockBetTrigger = true) {
        const playerInteraction = {
            actionSpin: true,
            selectedIndex: selectedIndex.toString(),
        };
        const betData = {
            type: APIBetType_1.APIBetType.ZERO_BET,
            bet: "0.00",
            playerInteraction: playerInteraction
        };
        this.sendRequestForLightningSpins(betData, !blockBetTrigger);
    }
    lightningSpinsBet(type = APIBetType_1.APIBetType.NORMAL_BET, betLevel = this._api.betLevel.getLevel(), playerInteraction) {
        this.collectWin().then((didCollect) => {
            if (this.shouldAbortBetAfterCollect(didCollect)) {
                return;
            }
            const activeBetFeature = this._api.betFeatureController.getActiveBetFeature();
            if (type === APIBetType_1.APIBetType.ZERO_BET) {
                this.actionSpinsNormalBet(type, betLevel, playerInteraction);
            }
            else if (activeBetFeature != undefined) {
                this.actionSpinsBoostedBet(activeBetFeature);
            }
            else {
                if (this._api.freeBets.hasFreeBets()) {
                    this.freeBet(playerInteraction);
                }
                else {
                    this.actionSpinsNormalBet(type, betLevel, playerInteraction);
                }
            }
        }).catch(reason => {
            this._api.error.trigger("Bet error:" + reason, APIErrorSystem_1.APIErrorCode.JAVASCRIPT);
        });
    }
    lightningSpinsFeatureBet(featureName, playerInteraction = {}) {
        if (playerInteraction.featureName == undefined) {
            playerInteraction.featureName = featureName;
            playerInteraction.actionSpin = true;
        }
        const betData = {
            type: APIBetType_1.APIBetType.FEATURE_BET,
            bet: this._api.betLevel.getLevel(),
            featureName: featureName,
            playerInteraction: playerInteraction
        };
        this.sendRequestForLightningSpins(betData);
    }
    sendRequestForLightningSpins(data, triggerBetEvent = true) {
        if (!this.allowedToSendBet()) {
            return;
        }
        //Promo panel : #276 removed timeChecker threshold, causing issue betError for frequent request.
        // if (data.type == APIBetType.NORMAL_BET || data.type == APIBetType.FREE_BET || data.type == APIBetType.FEATURE_BET) {
        //     this._timeChecker.checkTime();
        // }
        data = this.injectData(data);
        if (triggerBetEvent) {
            this._api.events.trigger(APIEventSystem_1.APIEvent.ACTION_SPINS_BET, data);
        }
        this._api.communication.send("normal", data);
    }
    freeBet(playerInteraction) {
        const betData = {
            type: APIBetType_1.APIBetType.FREE_BET,
            bet: this._api.freeBets.getBet(),
            playerInteraction: this.assignNormalBetPlayerInteraction(playerInteraction)
        };
        this.sendRequest(betData);
    }
    assignNormalBetPlayerInteraction(playerInteraction) {
        if (playerInteraction != undefined) {
            playerInteraction.assign(this._normalBetPlayerInteraction);
        }
        else {
            playerInteraction = this._normalBetPlayerInteraction;
        }
        return playerInteraction;
    }
    zeroBet(playerInteraction) {
        const betData = {
            type: APIBetType_1.APIBetType.ZERO_BET,
            bet: "0.00",
            playerInteraction: playerInteraction
        };
        this.sendRequest(betData);
    }
    buyFeatureBet(featureName, totalCost, playerInteraction = {}) {
        if (!this.checkBalance(totalCost)) {
            return;
        }
        this._api.slotStates.stateIsReady().then(() => {
            if (playerInteraction.featureName == undefined) {
                playerInteraction.featureName = featureName;
            }
            const betData = {
                type: APIBetType_1.APIBetType.FEATURE_BET,
                bet: this._api.betLevel.getLevel(),
                featureName: featureName,
                playerInteraction: playerInteraction
            };
            this.sendRequest(betData);
        });
    }
    freeFeatureBet(freeFeatureData, playerInteraction = {}) {
        if (freeFeatureData) {
            this._api.slotStates.stateIsReady().then(() => {
                if (playerInteraction.featureName == undefined) {
                    playerInteraction.featureName = freeFeatureData.featureName;
                }
                const betData = {
                    type: APIBetType_1.APIBetType.FEATURE_BET,
                    bet: freeFeatureData.bet.toString(),
                    featureName: freeFeatureData.featureName,
                    playerInteraction: playerInteraction,
                    data: {
                        "isPromotional": true
                    }
                };
                this.sendRequest(betData);
            });
        }
    }
    gambleBet(gambleCollected, gambleOption, gambleSelection, isActionSpins = false) {
        const playerInteraction = {};
        if (gambleOption != undefined) {
            playerInteraction.gambleOption = gambleOption;
        }
        if (gambleSelection != undefined) {
            playerInteraction.gambleSelection = gambleSelection;
        }
        playerInteraction.gambleCollected = gambleCollected;
        const betData = {
            type: APIBetType_1.APIBetType.GAMBLE_BET,
            bet: "0.00",
            playerInteraction: playerInteraction
        };
        if (isActionSpins) {
            betData.playerInteraction.actionSpin = true;
            this.sendRequestForLightningSpins(betData);
        }
        else {
            this.sendRequest(betData);
        }
    }
    boostedBet(betBoost) {
        if (this.checkBalance(betBoost.calculatedPrice)) {
            //If feature has precalcualted price (already based on betlevel like locked reels), then balance will be subtracted by 1 * bet by default.
            //In order to compensate for that, the difference beween 1*bet and precalculated bet is subtracted here first, so the the final stored balance is correct.
            //This is bit of a hack, but time restraints....
            //TODO - Fix more nicely.
            if (betBoost.originalPrice == 1) {
                const bet = this._api.betLevel.getLevel();
                const diff = betBoost.calculatedPrice - parseFloat(bet);
                this._api.balance.subtract(diff);
            }
            this.buyFeatureBet(betBoost.featureName, betBoost.playerInteraction);
        }
    }
    actionSpinsBoostedBet(activeBetFeature) {
        if (this.checkBalance(activeBetFeature.getTotalCost())) {
            this.lightningSpinsFeatureBet(activeBetFeature.name);
        }
    }
    /**
     * Adds a bet boost that is queued to be sent when you press spin.
     *
     * @param betBoostData boost data or undefined to clear.
     */
    setBoost(betBoostData) {
        this._api.betFeatureController.setActiveBetFeature(betBoostData === null || betBoostData === void 0 ? void 0 : betBoostData.featureName);
        this.triggerBetBoostEvent();
    }
    // ---- SUB TYPES
    pickAndClickBet(selectedIndex, blockBetTrigger = true) {
        const playerInteraction = {
            selectedIndex: selectedIndex.toString()
        };
        const betData = {
            type: APIBetType_1.APIBetType.ZERO_BET,
            bet: "0.00",
            playerInteraction: playerInteraction
        };
        this.sendRequest(betData, !blockBetTrigger);
    }
    // --- UTIL Functions
    checkBalance(betLevel) {
        const bet = (typeof betLevel === 'string') ? parseFloat(betLevel) : betLevel;
        const balance = this._api.balance.getAmount();
        if (bet > balance && !this._api.isReplay) {
            this._api.events.trigger(APIEventSystem_1.APIEvent.BROKE);
            insufficientFunds.show(this._api);
            return false;
        }
        return true;
    }
    collectWin() {
        if (this._nextMode !== "GAMBLE") {
            return Promise.resolve(false);
        }
        this.gambleBet(true);
        return this._api.slotStates.stateIsReady().then(() => {
            return Promise.resolve(true);
        });
    }
    sendRequest(data, triggerBetEvent = true) {
        if (!this.allowedToSendBet()) {
            return;
        }
        if (data.type == APIBetType_1.APIBetType.NORMAL_BET || data.type == APIBetType_1.APIBetType.FREE_BET || data.type == APIBetType_1.APIBetType.FEATURE_BET) {
            this._timeChecker.checkTime();
        }
        data = this.injectData(data);
        if (triggerBetEvent) {
            this._api.events.trigger(APIEventSystem_1.APIEvent.BET, data);
        }
        this._api.communication.send("normal", data);
    }
    injectData(data) {
        for (let cb of this._requestDataInjectionCallbacks) {
            data = cb(data);
        }
        return data;
    }
    addBetDataInjectCallback(cb) {
        this._requestDataInjectionCallbacks.push(cb);
    }
    removeBetDataInjectCallback(cb) {
        for (let i = this._requestDataInjectionCallbacks.length - 1; i >= 0; i--) {
            if (this._requestDataInjectionCallbacks[i] == cb) {
                this._requestDataInjectionCallbacks.splice(i, 1);
                return;
            }
        }
    }
    allowedToSendBet() {
        if (this._isHalt) {
            this._api.log("Trying to send bet request in halt state");
            return false;
        }
        if (this._paused) {
            this._api.log("Trying to send bet request in paused state");
            return false;
        }
        if (this._hold) {
            this._api.log("Trying to send bet request in hold state");
            return false;
        }
        return true;
    }
}
exports.BetHandler = BetHandler;
//# sourceMappingURL=BetHandler.js.map