"use strict";
/**
 * Created by Jonas Wålekvist on 2019-11-14.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotStateHandler = exports.SlotState = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const APIBetType_1 = require("../../interfaces/APIBetType");
const Logger_1 = require("../../utils/Logger");
var SlotState;
(function (SlotState) {
    //Spin flow
    SlotState["READY"] = "ready";
    SlotState["STARTING"] = "starting";
    SlotState["STOPPABLE"] = "stoppable";
    SlotState["STOPPING"] = "stopping";
    SlotState["SKIPPABLE"] = "skippable";
    SlotState["SKIPPED"] = "skipped";
    SlotState["DONE"] = "done";
    SlotState["GAMBLE"] = "gamble";
    SlotState["GAMBLING"] = "gambling";
    SlotState["GAMBLE_COLLECT"] = "gamblingCollect";
    SlotState["GAMBLE_DONE"] = "gambleDone";
    SlotState["FINISHING"] = "finishing";
    SlotState["FINISH"] = "finish";
    SlotState["RESTORE"] = "restore";
    SlotState["PAUSED"] = "paused";
    SlotState["DIALOG"] = "dialog";
    SlotState["DIALOG_CLOSED"] = "dialogClosed";
    SlotState["SCREEN"] = "screen";
    SlotState["SCREEN_CLOSED"] = "screenClosed";
    SlotState["STOP"] = "stop";
    SlotState["SKIP"] = "skip";
    SlotState["START_UP"] = "startUp";
})(SlotState = exports.SlotState || (exports.SlotState = {}));
const stoppablePossible = {
    gameServer: false,
    gameStarted: false,
    reset: function () {
        this.gameStarted = false;
        this.gameServer = false;
    },
    isStoppableAvailable: function () {
        return this.gameStarted && this.gameServer;
    }
};
class SlotStateHandler {
    constructor(api) {
        this.freeSpins = 0;
        this._state = SlotState.START_UP;
        this._isRestore = false;
        this._stateQueue = [];
        this._stateQueueBusy = false;
        //#414 TombOfAkhenaten
        //private _isBusy:boolean = true;
        this._isPaused = false;
        this._isActionSpinActive = false; //promo-panel #214
        this.hasEndedRound = true;
        this.logger = Logger_1.Logger.createNamedLogger("SlotStateHandler");
        this.logger.level = Logger_1.LogLevel.DEV;
        this._api = api;
        this.container = document.querySelector('.nolimit.container');
        this.addEventListeners();
        this.lockDialogs(true);
    }
    checkState(...states) {
        return states.some(state => this.container.classList.contains(state));
    }
    getState() {
        for (let state of Object.values(SlotState)) {
            if (this.container.classList.contains(state)) {
                return state;
            }
        }
        return "none";
    }
    setState(newState) {
        if (!this.isValidState(newState)) {
            this._api.error.trigger("State does not exist");
        }
        return this.executeState(newState);
        /*

                this._stateQueue.push(newState);
                if (!this._stateQueueBusy){
                    this.internalSetState()
                }
        */
    }
    executeState(newState) {
        return new Promise(resolve => {
            for (let state of Object.values(SlotState)) {
                if (this.container.classList.contains(state)) {
                    this.container.classList.remove(state);
                }
            }
            this.container.classList.add(newState);
            this._state = newState;
            if (newState != SlotState.READY) {
                //this.setIsBusy(true);
                //#414 TombOfAkhenaten
                this.setIsBusy();
            }
            if (!this._isActionSpinActive) {
                //promo-panel #214
                this._api.events.trigger(APIEventSystem_1.APIEvent.STATE, newState);
            }
            resolve(newState);
        });
    }
    isValidState(newState) {
        for (let state of Object.values(SlotState)) {
            if (newState == state) {
                return true;
            }
        }
        return false;
    }
    addEventListeners() {
        this._api.events.on(APIEventSystem_1.APIEvent.READY, () => {
            if (this._isRestore) {
                this.setState(SlotState.RESTORE);
            }
            else {
                this.setState(SlotState.READY);
            }
        });
        this._api.events.on(APIEventSystem_1.APIEvent.INIT, (data) => {
            if (data.isRestoreState === true) {
                this._isRestore = true;
                this.lockDialogs(true);
            }
        });
        this._api.events.on(APIEventSystem_1.APIEvent.START, (data) => {
            this.lockDialogs(this._isRestore);
            this._isRestore = false;
        });
        this._api.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_IS_ACTIVE, (isActive) => {
            this._isActionSpinActive = isActive;
        });
        this._api.events.on(APIEventSystem_1.APIEvent.ACTION_SPINS_BET, () => {
            this.hasEndedRound = false;
            this.lockDialogs(true);
            this.setState(SlotState.STARTING);
            this.lastBalance = this._api.balance.getAmount();
        });
        this._api.events.on(APIEventSystem_1.APIEvent.BET, (data) => {
            this.hasEndedRound = false;
            this.lockDialogs(true);
            if (data.type === APIBetType_1.APIBetType.GAMBLE_BET) {
                if (data.playerInteraction.gambleCollected == true) {
                    this.setState(SlotState.GAMBLE_COLLECT);
                }
                else {
                    this.setState(SlotState.GAMBLING);
                }
                return;
            }
            this.setState(SlotState.STARTING);
            this.lastBalance = this._api.balance.getAmount();
        });
        // bet result from game server
        this._api.events.on(APIEventSystem_1.APIEvent.GAME, () => {
            stoppablePossible.gameServer = true;
            this.tryGoToStoppable();
        });
        this._api.events.on(APIEventSystem_1.APIEvent.DIALOG, (data) => {
            if (data == "open") {
                this.dialogOpened();
            }
            else {
                this.dialogClosed();
            }
        });
        // special mode; some kind of presentation in-game
        this._api.events.on(APIEventSystem_1.APIEvent.SCREEN, (value) => {
            if (value == "open") {
                this.dialogOpened(true);
            }
            else {
                this.dialogClosed(true);
            }
        });
        // game has "spun up" a game round
        this._api.events.on(APIEventSystem_1.APIEvent.STARTED, () => {
            stoppablePossible.gameStarted = true;
            this.tryGoToStoppable();
        });
        // spinning done, go to stopping
        this._api.events.on(APIEventSystem_1.APIEvent.STOP, () => {
            if (this.checkState(SlotState.STOPPABLE)) {
                this.setState(SlotState.STOPPING);
            }
        });
        // game is running a skippable animation
        this._api.events.on(APIEventSystem_1.APIEvent.SKIPPABLE, () => {
            if (this.checkState(SlotState.STOPPING, SlotState.SKIPPED)) {
                this.setState(SlotState.SKIPPABLE);
            }
            else {
                this._api.warn("Requested Skippable in none compatible state:[" + this.getState() + "]. Ignoring request");
            }
        });
        // game is running a skippable animation
        this._api.events.on(APIEventSystem_1.APIEvent.SKIP, () => {
            this.setState(SlotState.SKIPPED);
        });
        // game round is done, show winnings or similar
        this._api.events.on(APIEventSystem_1.APIEvent.FINISHING, () => {
            this.setState(SlotState.FINISHING);
        });
        // game round is completely finished
        this._api.events.on(APIEventSystem_1.APIEvent.FINISH, () => {
            this.endGameRound();
        });
        // game is now done
        this._api.events.on(APIEventSystem_1.APIEvent.DONE, () => {
            this.setState(SlotState.DONE);
        });
        // game is now done - entering gamle mode
        this._api.events.on(APIEventSystem_1.APIEvent.GAMBLE, () => {
            this.setState(SlotState.GAMBLE);
        });
        this._api.events.on(APIEventSystem_1.APIEvent.GAMBLE_DONE, () => {
            this.setState(SlotState.GAMBLE_DONE);
        });
        this._api.events.on(APIEventSystem_1.APIEvent.PAUSE, () => this.onPause());
        this._api.events.on(APIEventSystem_1.APIEvent.RESUME, () => this.onResume());
        //Others
        this._api.events.on(APIEventSystem_1.APIEvent.REMAINING_FREE_SPINS, (noOfFreeSpins) => {
            this.freeSpins = parseInt(noOfFreeSpins);
        });
        this._api.events.on("operatorDialogOpened", () => this.onOperatorDialog(true));
        this._api.events.on("operatorDialogClosed", () => this.onOperatorDialog(false));
        this._api.events.on(SlotStateHandler.READY_STATE, () => {
            //Do nothing...
            //This eventlistener needs to be here because, the event system will save "unused" events, if there is no event listener.
            //That means that later on when we use this._api.events.once(SlotStateHandler.READY_STATE) to catch the next trigger, it
            //Will use one of the "saved" events and trigger it directly.
            //Why on earth it would save the events do this? I don't know. But it fucks up everything.
            //So this is here to prevent the event system from "saving" the stupid events.
        });
        // TODO: Some temp to debug new keypad events
        /*this._api.events.on(APIEvent.SETTING_CHANGE, (data:any) => {
            console.log("Slot Launcher :: " + APIEvent.SETTING_CHANGE);
            console.log(data);
        });
        this._api.events.on(APIEvent.SETTING_PAGE_CHANGE, (data:any) => {
            console.log("Slot Launcher :: " + APIEvent.SETTING_PAGE_CHANGE);
            console.log(data);
        });
        this._api.events.on(APIEvent.AUDIO_MASTER_MUTED, (data:any) => {
            console.log("Slot Launcher :: " + APIEvent.AUDIO_MASTER_MUTED);
            console.log(data);
        });*/
    }
    stateIsReady() {
        return new Promise((resolve, reject) => {
            const state = this._api.slotStates.getState();
            if (state == SlotState.READY) {
                resolve();
            }
            else {
                this._api.events.once(SlotStateHandler.READY_STATE, () => {
                    resolve();
                });
            }
        });
    }
    resetGameStartedAndGameServerFlag() {
        stoppablePossible.reset();
    }
    lockDialogs(lock) {
        if (lock) {
            this._api.dialog.lock("statehandler");
        }
        else {
            this._api.dialog.unlock("statehandler");
        }
    }
    //#414 TombOfAkhenaten
    /*private setIsBusy(wantBusy:boolean){
        if(!wantBusy && this._isBusy){
            this._isBusy = false;
            this._api.events.trigger(APIEvent.IDLE);
        }
        else if (wantBusy && !this._isBusy) {
            this._isBusy = true;
            this._api.events.trigger(APIEvent.BUSY);
        }
    }*/
    setIsBusy() {
        if (this._state !== SlotState.READY) {
            this._api.events.trigger(APIEventSystem_1.APIEvent.BUSY);
        }
        else {
            this._api.events.trigger(APIEventSystem_1.APIEvent.IDLE);
        }
    }
    endGameRound() {
        if (this.checkState(SlotState.DONE, SlotState.FINISHING, SlotState.GAMBLE_DONE)) {
            this.setState(SlotState.FINISH);
            // Hard reset on stop functionality
            stoppablePossible.reset();
            this.prepareForReady();
        }
        else {
            this._api.warn('State is not FINISHING, DONE or GAMBLE_DONE. Current state: ', this.getState());
        }
    }
    tryGoToStoppable() {
        if (stoppablePossible.isStoppableAvailable()) {
            //the set timeout is here to because we dont want to switch state before the stack is completely resolved,
            // this listener function is one of the first that gets excuted on the event  APIEvent.GAME.
            //We need to ensure that all other interested parties (who has added a listener on APIEvent.GAME) to
            // events gets resolved before we set a new state.
            //This is normally not an issue in slot-game < 2, and that's because that version doesn't really use this state handler.
            setTimeout(() => this.setState(SlotState.STOPPABLE));
            stoppablePossible.reset();
        }
    }
    dialogOpened(screen = false) {
        if (screen) {
            this.lockDialogs(true);
            this.setState(SlotState.SCREEN);
        }
        else {
            this.setState(SlotState.DIALOG);
        }
    }
    dialogClosed(screen = false) {
        if (screen) {
            this.setState(SlotState.SCREEN_CLOSED).then(value => {
                this.prepareForReady();
            });
        }
        else {
            this.setState(SlotState.DIALOG_CLOSED).then(value => {
                this.prepareForReady();
            });
        }
    }
    onOperatorDialog(open) {
        this.logger.log("onOperatorDialog, open: " + open);
        if (open) {
            if (!this.container.classList.contains('overlay')) {
                this.container.classList.add('overlay');
                this._api.events.trigger(APIEventSystem_1.APIEvent.FREEZE, false);
            }
        }
        else {
            if (this.container.classList.contains('overlay')) {
                this.container.classList.remove('overlay');
                if (this.hasEndedRound) {
                    this.logger.log("onOperatorDialog, hasEnded");
                    this._api.events.trigger(APIEventSystem_1.APIEvent.UNFREEZE, false);
                    this.dialogClosed();
                }
                else {
                    this.logger.log("onOperatorDialog, waitingForEnd");
                    this.container.classList.add("operatorDialogClosed");
                }
            }
        }
    }
    prepareForReady() {
        this.hasEndedRound = true;
        if (this.container.classList.contains("overlay")) {
            this.logger.log("prepareForReady, has overlay");
            this.dialogOpened();
            return;
        }
        if (this.container.classList.contains("operatorDialogClosed")) {
            this.logger.log("prepareForReady, operatorDialogClosed");
            this.container.classList.remove('operatorDialogClosed');
            this._api.events.trigger(APIEventSystem_1.APIEvent.UNFREEZE, false);
            this.dialogClosed();
            return;
        }
        this.logger.log("prepareForReady");
        this.lockDialogs(false); //This is in sync, so we can directly check for Dialog state.
        if (!this.checkState(SlotState.DIALOG, SlotState.SCREEN)) {
            this.setState(SlotState.READY);
            //this.setIsBusy(false); //This enables the external-api, is that async? If so how muchs time should we wait? Or can this be solved somehow?
            //#414 TombOfAkhenaten
            this.setIsBusy(); //This enables the external-api, is that async? If so how muchs time should we wait? Or can this be solved somehow?
            this._api.events.trigger(SlotStateHandler.READY_STATE);
        }
    }
    onPause() {
        this._isPaused = true;
    }
    onResume() {
        if (this._isPaused) {
            this._isPaused = false;
            this.prepareForReady();
        }
    }
}
SlotStateHandler.READY_STATE = "readyState";
exports.SlotStateHandler = SlotStateHandler;
//# sourceMappingURL=SlotStateHandler.js.map