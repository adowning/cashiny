"use strict";
/**
 * Created by Jerker Nord on 2016-04-13.
 * Refactored by Ning Jiang on 2016-12-6.
 * Refactored by Ning Jiang on 2019-08. Adding avalanche.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelController = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const gsap_1 = require("gsap");
const BaseController_1 = require("../../base/BaseController");
const EventHandler_1 = require("../../event/EventHandler");
const GameEvent_1 = require("../../event/GameEvent");
const GameConfig_1 = require("../../gameconfig/GameConfig");
const GameModuleConfig_1 = require("../../gamemoduleconfig/GameModuleConfig");
const StateReelSymbol_1 = require("../../reelsymbol/StateReelSymbol");
const SymbolStack_1 = require("../../reelsymbol/SymbolStack");
const LoaderEvent_1 = require("../../resource/event/LoaderEvent");
const ResourcesGroupName_1 = require("../../resource/ResourcesGroupName");
const ServerEvent_1 = require("../../server/event/ServerEvent");
const ArrayHelper_1 = require("../../utils/ArrayHelper");
const ReelEvent_1 = require("../event/ReelEvent");
const ReelAnimationState_1 = require("./ReelAnimationState");
const ReelPartCreator_1 = require("./ReelPartCreator");
const ReelSymbolName_1 = require("../../reelsymbol/ReelSymbolName");
const MathHelper_1 = require("../../utils/MathHelper");
class ReelController extends BaseController_1.BaseController {
    get isNearWin() {
        return this._isNearWin;
    }
    get reelId() {
        return this._reelId;
    }
    get view() {
        return this._reelView;
    }
    get currentState() {
        return this._currentState;
    }
    get allSymbols() {
        return this._reelPartAnimator.symbolsToAnimate;
    }
    get symStep() {
        try {
            return this._reelPartAnimator.symStep;
        }
        catch (e) {
            return undefined;
        }
    }
    constructor(reelId) {
        super(!ReelController._configInitialized, `Reel${reelId}`);
        this._addedStopDelay = 0;
        this._initDataParsed = false;
        this._resourcesLoaded = false;
        this._reelInitialized = false;
        this._isNearWin = false; // TODO: check which game is using this value?
        this._reelId = reelId;
        this.initConfig();
        this.initValues();
        this._reelView = this.createReelView();
        this._reelPartAnimator = this.createReelPartAnimator();
        this._reelPartCreator = this.createReelPartCreator();
        this.addEventListeners();
    }
    initConfig() {
        if (ReelController._configInitialized) {
            return;
        }
        const startDelay = GameConfig_1.GameConfig.instance.REEL_START_DELAY ? GameConfig_1.GameConfig.instance.REEL_START_DELAY : 0;
        if ((0, MathHelper_1.isNumber)(startDelay)) {
            this.addTweakModuleSlider({
                text: "Reel Start Delay",
                minValue: 0,
                maxValue: 2.0,
                startValue: startDelay,
                onValueChangeCallback: (text, newValue) => ReelController.onReelStartDelayChanged(newValue)
            });
            ReelController._reelStartDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => startDelay);
        }
        else {
            ReelController._reelStartDelays = startDelay;
            if (ReelController._reelStartDelays.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelController.initConfig(): Invalid config REEL_START_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        const fastStartDelay = GameConfig_1.GameConfig.instance.REEL_FAST_SPIN_START_DELAY ? GameConfig_1.GameConfig.instance.REEL_FAST_SPIN_START_DELAY : 0;
        if ((0, MathHelper_1.isNumber)(fastStartDelay)) {
            this.addTweakModuleSlider({
                text: "Reel Fast Start Delay",
                minValue: 0,
                maxValue: 2.0,
                startValue: fastStartDelay,
                onValueChangeCallback: (text, newValue) => ReelController.onReelFastStartDelayChanged(newValue)
            });
            ReelController._reelFastStartDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => fastStartDelay);
        }
        else {
            ReelController._reelFastStartDelays = fastStartDelay;
            if (ReelController._reelFastStartDelays.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelController.initConfig(): Invalid config REEL_FAST_SPIN_START_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        const stopDelay = GameConfig_1.GameConfig.instance.REEL_STOP_DELAY;
        if ((0, MathHelper_1.isNumber)(stopDelay)) {
            this.addTweakModuleSlider({
                text: "Reel Stop Delay",
                minValue: 0.1,
                maxValue: 2.0,
                startValue: stopDelay,
                onValueChangeCallback: (text, newValue) => ReelController.onReelStopDelayChanged(newValue)
            });
            ReelController._reelStopDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => stopDelay);
        }
        else {
            ReelController._reelStopDelays = stopDelay;
            if (ReelController._reelStopDelays.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelController.initConfig(): Invalid config REEL_STOP_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        const quickStopDelay = GameConfig_1.GameConfig.instance.REEL_QUICK_STOP_DELAY;
        if ((0, MathHelper_1.isNumber)(quickStopDelay)) {
            this.addTweakModuleSlider({
                text: "Reel Quick Stop Delay",
                minValue: 0.1,
                maxValue: 2.0,
                startValue: quickStopDelay,
                onValueChangeCallback: (text, newValue) => ReelController.onReelQuickStopDelayChanged(newValue)
            });
            ReelController._reelQuickStopDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => quickStopDelay);
        }
        else {
            ReelController._reelQuickStopDelays = quickStopDelay;
            if (ReelController._reelQuickStopDelays.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelController.initConfig(): Invalid config REEL_QUICK_STOP_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        const nearWinStopDelay = GameConfig_1.GameConfig.instance.REEL_NEAR_WIN_STOP_DELAY;
        if ((0, MathHelper_1.isNumber)(nearWinStopDelay)) {
            this.addTweakModuleSlider({
                text: "Reel Near Win Stop Delay",
                minValue: 0.1,
                maxValue: 5.0,
                startValue: nearWinStopDelay,
                onValueChangeCallback: (text, newValue) => ReelController.onReelNearWinStopDelayChanged(newValue)
            });
            ReelController._reelNearWinStopDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => nearWinStopDelay);
        }
        else {
            ReelController._reelNearWinStopDelays = nearWinStopDelay;
            if (ReelController._reelNearWinStopDelays.length != GameConfig_1.GameConfig.instance.REELS_NUM) {
                debugger;
                throw new Error(`ReelController.initConfig(): Invalid config REEL_NEAR_WIN_STOP_DELAY, the length doesn't match the amount of reels!`);
            }
        }
        ReelController._configInitialized = true;
    }
    // Didn't add separate reel tweak yet.
    static onReelStartDelayChanged(newValue) {
        this._reelStartDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onReelFastStartDelayChanged(newValue) {
        this._reelFastStartDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onReelStopDelayChanged(newValue) {
        this._reelStopDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onReelQuickStopDelayChanged(newValue) {
        this._reelQuickStopDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    static onReelNearWinStopDelayChanged(newValue) {
        this._reelNearWinStopDelays = ArrayHelper_1.ArrayHelper.initArrayWithValues(GameConfig_1.GameConfig.instance.REELS_NUM, () => newValue);
    }
    initValues() {
        this._currentState = ReelAnimationState_1.ReelAnimationState.IDLE;
        this._symNumTotal = ArrayHelper_1.ArrayHelper.arraySum(GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL);
        this._isSpinning = false;
        this._isSpinBlurred = false;
        this._reelStopPresentationCompleted = false;
    }
    createReelView() {
        if (GameConfig_1.GameConfig.instance.REEL_DISPLAY_POSITIONS == null || GameConfig_1.GameConfig.instance.REEL_DISPLAY_POSITIONS[this._reelId] == null) {
            debugger;
            throw new Error(`Error: ReelController.init(): config REEL_DISPLAY_POSITIONS is missing or REEL_DISPLAY_POSITIONS[${this._reelId}] is missing!`);
        }
        return GameModuleConfig_1.GameModuleConfig.instance.REEL_VIEW ? GameModuleConfig_1.GameModuleConfig.instance.REEL_VIEW(this._reelId) : new PIXI.Sprite();
    }
    // TODO: need reelId?
    createReelPartCreator() {
        return GameModuleConfig_1.GameModuleConfig.instance.REEL_PART_CREATOR ? GameModuleConfig_1.GameModuleConfig.instance.REEL_PART_CREATOR() : new ReelPartCreator_1.ReelPartCreator();
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, LoaderEvent_1.LoaderEvent.RESOURCES_LOADED, (event) => this.onInitResourcesLoaded(event));
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED, (event) => this.onInitDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_PARSED, (event) => this.onGameDataParsed(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.REEL_STOP_PRESENTATIONS_COMPLETE, (event) => this.onReelStopPresentationsComplete(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.REEL_ADD_STOP_DELAY, (event) => this.addStopDelay(event.params[0]));
        EventHandler_1.EventHandler.addEventListener(this, ReelEvent_1.ReelEvent.REEL_REFRESH_STOP_DELAY, (event) => this.refreshStopDelay(event.params[0]));
    }
    onInitResourcesLoaded(event) {
        if (event.key != ResourcesGroupName_1.ResourcesGroupName.MAIN) {
            return;
        }
        this._resourcesLoaded = true;
        this.initReelStrip();
    }
    onInitDataParsed(data) {
        this.parseInitData(data);
        this.initAnimator();
        this.initReelStrip();
    }
    parseInitData(data) {
        this._gameMode = data.mode;
        this._nextGameMode = data.nextMode;
        this._stopReelSet = data.reels[this._reelId].concat();
        Logger_1.Logger.logDev(`init reel ${this._reelId} ${this._stopReelSet}`);
        const initSymsNumInData = GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[1] + GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[2] + GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[3];
        if (this._stopReelSet.length != initSymsNumInData) {
            debugger;
            throw new Error(`Error: ReelController.onInitDataParsed(): reelId = ${this._reelId}. There are ${initSymsNumInData} symbols in reel config while ${this._stopReelSet.length} in server data `);
        }
        this._initDataParsed = true;
    }
    onGameDataParsed(data) {
        this._gameMode = data.mode;
        this._nextGameMode = data.nextMode;
        this._stopReelSet = data.reels[this._reelId];
        Logger_1.Logger.logDev(`stop reel ${this._reelId} ${this._stopReelSet}`);
    }
    initAnimator() {
        this._reelPartAnimator.symWidth = GameConfig_1.GameConfig.instance.SYMBOL_WIDTH;
        this._reelPartAnimator.symHeight = GameConfig_1.GameConfig.instance.SYMBOL_HEIGHT;
        this._reelPartAnimator.symBottomPadding = GameConfig_1.GameConfig.instance.SYMBOL_BOTTOM_PADDING;
    }
    initReelStrip() {
        if (!this._resourcesLoaded || !this._initDataParsed) {
            return;
        }
        this._currentReelSet = this.makeUpStopReelSet(GameConfig_1.GameConfig.instance.SYMBOLS_NUM_IN_REEL[4], true);
        this._currentReelSetPosition = this._currentReelSet.length;
        const stopSymbols = [];
        for (let i = 0; i < this._symNumTotal; i++) {
            stopSymbols.unshift(this.createNextSymbol(i === 0 ? null : stopSymbols[0], true));
        }
        this._reelPartAnimator.initSymbols(stopSymbols.map(s => s));
        this._reelInitialized = true;
    }
    getRandomSymbolFromReelSet(reelSet) {
        let symbol;
        do {
            symbol = ArrayHelper_1.ArrayHelper.getRandomElementFromArray(reelSet);
        } while (this.isSpecialSymbol(symbol));
        return symbol;
    }
    // TODO: if we change the symbol config from state driven to symbol name dirven, then we can put this isSpecial info there.
    isSpecialSymbol(symbolName) {
        return StateReelSymbol_1.StateReelSymbol.parseStackedSymbolName(symbolName, this._reelId).isStacked ||
            symbolName === ReelSymbolName_1.ReelSymbolName.WILD ||
            symbolName === ReelSymbolName_1.ReelSymbolName.SCATTER ||
            symbolName === ReelSymbolName_1.ReelSymbolName.BONUS;
    }
    /**
     * Create and queue a symbol for reel animation
     */
    createNextSymbol(previousSymbol, init) {
        this.moveReelSetPosition();
        const symName = this._currentReelSet[this._currentReelSetPosition];
        if (symName == null || symName.length === 0) {
            debugger;
            throw new Error(`ReelController.createNextSymbol(): symbol name cannot be empty!`);
        }
        let newSymbol = this.addNewSymbol(symName);
        this.updateStackedSymbols(newSymbol, previousSymbol === undefined ? this._reelPartAnimator.symbolsToAnimate[0] : previousSymbol, -1, true);
        return newSymbol;
    }
    addNewSymbol(symName, state) {
        if (state == null) {
            state = this._isSpinBlurred ? GameConfig_1.GameConfig.instance.SYMBOL_STATES.spin : GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal;
        }
        const symbol = this._reelPartCreator.createNewSymbol(symName, this._reelId, state, {
            width: this._reelPartAnimator.symWidth,
            height: this._reelPartAnimator.symHeight,
            bottomPadding: this._reelPartAnimator.symBottomPadding
        });
        symbol.x = 0;
        symbol.y = -symbol.symHeight / 2 - GameConfig_1.GameConfig.instance.REEL_AREA_POS_Y - GameConfig_1.GameConfig.instance.REEL_DISPLAY_POSITIONS[this._reelId][1]; // this is just a temp position that's not visible. this position might be visible in portrait mode but it doesn't matter. the position will be updated when put the symbol to the animator.
        this._reelView.addChild(symbol);
        return symbol;
    }
    // This function fixes the stack in neighbor symbols and update their visibilities.
    // indexOffset = targetSymbol.stackedSymName!.index - compareSymbol.stackedSymName!.index
    updateStackedSymbols(targetSymbol, compareSymbol, indexOffset, isNewSymbol) {
        if (GameConfig_1.GameConfig.instance.STACKED_SYMBOLS == null) {
            return;
        }
        if (!targetSymbol.stackedSymName.isStacked) {
            return;
        }
        // Start a new stack.
        if (compareSymbol == null || !compareSymbol.stackedSymName.isStacked || compareSymbol.stackedSymName.symName != targetSymbol.stackedSymName.symName || ReelController.isNewStackedStackedSymbol(targetSymbol, compareSymbol, indexOffset, isNewSymbol)) {
            if (isNewSymbol) {
                targetSymbol.stack = new SymbolStack_1.SymbolStack(targetSymbol.stackedSymName.symName, targetSymbol.stackedSymName.totalNum);
            }
            targetSymbol.setVisibility(true);
            return;
        }
        // add target symbol to the same stack as compare symbol
        const actualOffset = targetSymbol.stackedSymName.index - compareSymbol.stackedSymName.index;
        if (actualOffset != indexOffset) {
            debugger;
            throw new Error(`ReelController.updateStackedSymbols():Stacked Symbol index error at reel ${this._reelId}! targetSymbol = ${targetSymbol.symName}, compareSymbol = ${compareSymbol.symName}`);
        }
        if (isNewSymbol) {
            targetSymbol.stack = compareSymbol.stack;
        }
        // The bottom one is always visible.
        if (indexOffset > 0) {
            // target is below
            compareSymbol.setVisibility(false);
        }
        else {
            // compare is below
            targetSymbol.setVisibility(false);
        }
    }
    static isNewStackedStackedSymbol(targetSymbol, compareSymbol, indexOffset, isNew) {
        // a continue stack.
        if (compareSymbol.stackedSymName.index + indexOffset === targetSymbol.stackedSymName.index) {
            return false;
        }
        // Start a new stack.
        return ArrayHelper_1.ArrayHelper.reviseIndexInLoopRange(compareSymbol.stackedSymName.totalNum, compareSymbol.stackedSymName.index + indexOffset) === targetSymbol.stackedSymName.index;
    }
    startSpin(data, previousDelay) {
        this.setStartSpinData(data);
        if (data.active) {
            this._stopReelSet = [];
            this._isSpinning = true;
            this._reelStopPresentationCompleted = false;
            return this.startSpinAnimation(data, previousDelay);
        }
        else {
            // If reel is not active we fake a spin started and send the complete event when receiving stop.
            this._currentState = ReelAnimationState_1.ReelAnimationState.INACTIVE;
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_SPIN_STARTED, this._reelId));
            return previousDelay;
        }
    }
    setStartSpinData(data) {
        this._gameMode = this._nextGameMode;
        this._reelPartAnimator.resetStartSpin(data.fastSpin);
    }
    removeSymbol(symbolToRemove) {
        this._reelView.removeChild(symbolToRemove);
        this._reelPartCreator.deleteSymbol(symbolToRemove);
    }
    clearStopDelay(quickStop = false) {
        // if some other feature required to delay the stop while the normal delay, delay it again.
        if (!quickStop && this._addedStopDelay > 0) {
            this._reelStopDelayTimer = gsap_1.TweenLite.to(this, this._addedStopDelay, { onComplete: () => this.clearStopDelay() });
            this._addedStopDelay = 0;
            return;
        }
        if (this._reelStopDelayTimer && this._reelStopDelayTimer.isActive()) {
            this._reelStopDelayTimer.pause();
            this._reelStopDelayTimer.kill();
        }
        this._reelStopDelayTimer = null;
        this._addedStopDelay = 0;
        this.onStopDelayDone();
    }
    onSpinStopStarted() {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_STOP_SPIN_STARTED, this._reelId));
    }
    onSpinStopAnimationCompleted() {
        // No need to change reelSet and position because that's what we just used to compose the stop reelSet.
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_STOP_SPIN_ANIMATION_COMPLETE, {
            reelId: this._reelId,
            fastSpin: this._reelPartAnimator.isFastSpin,
            quickStop: this._reelPartAnimator.isQuickStop,
            active: true
        }));
        this._isSpinning = false;
        this._isNearWin = false;
        this.tryCompleteSpin();
    }
    onReelStopPresentationsComplete(reelId) {
        if (this._reelId != reelId) {
            return;
        }
        this._reelStopPresentationCompleted = true;
        this.tryCompleteSpin();
    }
    tryCompleteSpin() {
        if (this._isSpinning) {
            return;
        }
        if (!this._reelStopPresentationCompleted) {
            return;
        }
        this._currentState = ReelAnimationState_1.ReelAnimationState.IDLE;
        this.completeSpin();
    }
    // Doesn't any game overriding this one? FifthElements.
    completeSpin() {
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ReelEvent_1.ReelEvent.REEL_STOP_SPIN_COMPLETE, this._reelId));
    }
    addStopDelay(data) {
        if (data.reelId > this._reelId) { // Add the same delay to all the reels after the required reel.
            return;
        }
        this._addedStopDelay += data.delay;
    }
    refreshStopDelay(data) {
        if (data.reelId !== this.reelId) {
            return;
        }
        if (this._reelStopDelayTimer == null || !this._reelStopDelayTimer.isActive()) {
            Logger_1.Logger.logDev(`ReelController.refreshStopDelay() reelId = ${data.reelId}, the reel stop delay timer is not active!`);
            return;
        }
        this._reelStopDelayTimer.pause();
        this._reelStopDelayTimer.kill();
        this._reelStopDelayTimer = gsap_1.TweenLite.to(this, data.delay, { onComplete: () => this.clearStopDelay() });
    }
    findSymbol(symId, onlyVisibleStackedSymbol = true) {
        const symbol = this.allSymbols[symId];
        if (symbol == null || !symbol.stackedSymName.isStacked) {
            return symbol;
        }
        if (!onlyVisibleStackedSymbol) {
            return symbol;
        }
        // return the most bottom visible symbol of a stacked symbol
        for (let i = symbol.stackedSymName.totalNum - 1; i >= 0; i--) {
            const testSymbol = symbol.stack.symbols[i];
            if (testSymbol != null && testSymbol.parent != null) {
                return symbol.stack.symbols[i];
            }
        }
        debugger;
        return symbol;
    }
    moveSymbolToTop(symId) {
        const symbol = this.findSymbol(symId);
        if (symbol == null) {
            return false;
        }
        this._reelView.addChild(symbol);
        return true;
    }
    addChildOnView(child) {
        this._reelView.addChild(child);
    }
    removedChildOnView(child) {
        this._reelView.removeChild(child);
    }
}
ReelController._configInitialized = false;
exports.ReelController = ReelController;
//# sourceMappingURL=ReelController.js.map