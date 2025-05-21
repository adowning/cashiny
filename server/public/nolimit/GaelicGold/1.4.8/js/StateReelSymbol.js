"use strict";
/**
 * Created by Ning Jiang on 12/7/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateReelSymbol = exports.SymbolStateTransition = void 0;
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const GameConfig_1 = require("../gameconfig/GameConfig");
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
const MathHelper_1 = require("../utils/MathHelper");
const ReelSymbolStateCreator_1 = require("./ReelSymbolStateCreator");
const SymbolStack_1 = require("./SymbolStack");
const gsap_1 = require("gsap");
class SymbolStateTransition {
    constructor(newConfig, oldConfig) {
        this.state = newConfig.state;
        this.frames = newConfig.frames != undefined ? newConfig.frames : [0];
        this.alpha = newConfig.alpha != undefined ? newConfig.alpha : 1;
        this.autoPlay = newConfig.autoPlay != undefined ? newConfig.autoPlay : true;
        this.replay = newConfig.replay != undefined ? newConfig.replay : true;
        this.prioCheck = newConfig.prioCheck != undefined ? newConfig.prioCheck : false;
        this.fadeInDuration = newConfig.fadeInDuration != undefined ? newConfig.fadeInDuration : 0;
        this.fadeInDelay = newConfig.fadeInDelay != undefined ? newConfig.fadeInDelay : 0;
        this.fadeInEase = newConfig.fadeInEase != undefined ? newConfig.fadeInEase : gsap_1.Linear.ease;
        this.onUpdateCallback = newConfig.onUpdateCallback;
        this.onCompleteCallback = newConfig.onCompleteCallback;
        this.fadeOutDuration = oldConfig && oldConfig.fadeOutDuration != undefined ? oldConfig.fadeOutDuration : this.fadeInDuration;
        this.fadeOutDelay = oldConfig && oldConfig.fadeOutDelay != undefined ? oldConfig.fadeOutDelay : this.fadeInDelay;
        this.fadeOutEase = oldConfig && oldConfig.fadeOutEase != undefined ? oldConfig.fadeOutEase : gsap_1.Linear.ease;
    }
}
exports.SymbolStateTransition = SymbolStateTransition;
class StateReelSymbol extends PIXI.Container {
    get symName() {
        return this._symName;
    }
    get reelId() {
        return this._reelId;
    }
    set reelId(value) {
        this._reelId = value;
    }
    get stackedSymName() {
        return this._stackedSymName;
    }
    get stack() {
        return this._stack;
    }
    set stack(value) {
        if (this._stack || value == null) {
            debugger;
            throw new Error("StateReelSymbol.set stack():Cannot change stack!");
        }
        this._stack = value;
        this._stack.addSymbol(this);
    }
    get symWidth() {
        if (this._symWidth == null) {
            return GameConfig_1.GameConfig.instance.SYMBOL_WIDTH;
        }
        return this._symWidth;
    }
    set symWidth(value) {
        this._symWidth = value;
    }
    get symHeight() {
        if (this._symHeight == null) {
            return GameConfig_1.GameConfig.instance.SYMBOL_HEIGHT;
        }
        return this._symHeight;
    }
    set symHeight(value) {
        if (value === this._symHeight) {
            return;
        }
        this._symHeight = value;
        for (let stateName in this._stateAnimations) {
            const state = this._stateAnimations[stateName];
            if (state != null) {
                StateReelSymbol.setStackedSymbolStateAnchor(this, state);
                // This seems not really run when creating new symbol, because the symbol state is created by a timeline so it's actually created after the height set.
            }
        }
    }
    get bottomPadding() {
        if (this._bottomPadding == null) {
            return GameConfig_1.GameConfig.instance.SYMBOL_BOTTOM_PADDING;
        }
        return this._bottomPadding;
    }
    set bottomPadding(value) {
        if (value === this._bottomPadding) {
            return;
        }
        this._bottomPadding = value;
        for (let stateName in this._stateAnimations) {
            const state = this._stateAnimations[stateName];
            if (state != null) {
                StateReelSymbol.setStackedSymbolStateAnchor(this, state);
            }
        }
    }
    get currentState() {
        return this._currentState;
    }
    get currentStateAnimation() {
        return this._currentStateAnimation;
    }
    get currentTimeline() {
        return this._currentTimeline;
    }
    constructor(symName, reelId, state, size) {
        super();
        this._stateCreator = GameModuleConfig_1.GameModuleConfig.instance.SYMBOL_STATE_CREATOR ? GameModuleConfig_1.GameModuleConfig.instance.SYMBOL_STATE_CREATOR() : new ReelSymbolStateCreator_1.ReelSymbolStateCreator();
        this.replaceWith(symName, reelId, state, size);
    }
    setVisibility(value) {
        if (this.visible === value) {
            return;
        }
        this.visible = value;
    }
    // Should remove this. to use create new symbol and replace it in the reel.allSymbols.
    replaceWith(newName, reelId, state, size) {
        this._reelId = reelId;
        const newStackedName = StateReelSymbol.parseStackedSymbolName(newName, reelId);
        // stacked replace with stacked
        if (this.stackedSymName != null && this.stackedSymName.isStacked && newStackedName.isStacked) {
            return this.stackedReplaceWithStacked(newStackedName, state);
        }
        return this.simpleReplaceWith(newName, state, size);
    }
    simpleReplaceWith(newName, state, size) {
        this.reset(false);
        this._symName = newName;
        this._stackedSymName = StateReelSymbol.parseStackedSymbolName(newName, this._reelId);
        if (this.initAnimations) {
            this.initAnimations();
        }
        if (size) {
            if (size.width) {
                this.symWidth = size.width;
            }
            if (size.height) {
                this.symHeight = size.height;
            }
            if (size.bottomPadding) {
                this.bottomPadding = size.bottomPadding;
            }
        }
        state = state != undefined ? state : GameConfig_1.GameConfig.instance.SYMBOL_STATES.normal;
        this._currentState = state; // For accessing the currentState just after creating the symbol.
        return this.changeState({ state: state, replay: true }); //Replay true because of line above. The state change has not yet been played
    }
    stackedReplaceWithStacked(newStackedName, state) {
        Logger_1.Logger.logDev("WARNING: this should not be used any more. should create new symbol and replace in reelAnimation.symbolsToBeAnimated");
        if (this.stackedSymName.totalNum != newStackedName.totalNum) {
            debugger;
            throw new Error("StateReelSymbol.stackedReplaceWithStacked(): Doesn't support replace stacked symbol with another stacked symbol with different length. Please talk to Ning if you need this feature!");
        }
        const timeline = new gsap_1.TimelineLite();
        const stackSymbols = this.stack.symbols;
        const newStack = new SymbolStack_1.SymbolStack(newStackedName.symName, newStackedName.totalNum);
        stackSymbols.forEach((symbol) => {
            if (symbol != null) {
                const symbolTimeline = new gsap_1.TimelineLite();
                symbolTimeline.add(symbol.simpleReplaceWith(`${newStackedName.symName}*${symbol.stackedSymName.index}`, state));
                symbolTimeline.add(() => { symbol.stack = newStack; });
                timeline.add(symbolTimeline, 0);
            }
        });
        timeline.add(() => {
            let foundVisible = false;
            for (let i = newStack.symbols.length - 1; i >= 0; i--) {
                const symbol = newStack.symbols[i];
                if (symbol != null) {
                    if (foundVisible) {
                        symbol.setVisibility(false);
                    }
                    else {
                        if (symbol.parent != null) {
                            symbol.setVisibility(true);
                            foundVisible = true;
                        }
                    }
                }
            }
        });
        return timeline;
    }
    reset(remove) {
        this._currentState = null;
        this._currentStateAnimation = null;
        if (this._stack != null) {
            this._stack.removeSymbol(this);
            this._stack = null;
        }
        this._stackedSymName = null;
        // TODO: shall we reuse something for the performance?
        if (this._stateAnimations) {
            for (let key in this._stateAnimations) {
                if (this._stateAnimations[key]) {
                    this.removeChild(this._stateAnimations[key]);
                    this._stateAnimations[key].destroy({ children: true });
                }
            }
        }
        this._stateAnimations = {};
        this.setVisibility(true);
        this.alpha = 1;
        this._symWidth = null;
        this._symHeight = null;
        this._bottomPadding = null;
    }
    initState(stateConfig) {
        if (this._stateAnimations.hasOwnProperty(stateConfig.keyword)) {
            return false;
        }
        this._stateAnimations[stateConfig.keyword] = this._stateCreator.createStateAnimation(this, stateConfig);
        if (this._stateAnimations[stateConfig.keyword]) {
            this._stateAnimations[stateConfig.keyword].alpha = 0;
            this.addChild(this._stateAnimations[stateConfig.keyword]); // TODO: z index?
            return true;
        }
        return false;
    }
    changeState(newStateConfig, oldStateConfig) {
        const timeline = new gsap_1.TimelineLite();
        const transitionConfig = new SymbolStateTransition(newStateConfig, oldStateConfig);
        timeline.add(this.getStateChangingAnimation(transitionConfig), 0);
        if (newStateConfig.setStack && this.stack && this.stackedSymName.isStacked) {
            newStateConfig.setStack = false;
            this.stack.symbols.forEach((symbol, index) => {
                if (index != this.stackedSymName.index && symbol != null) {
                    timeline.add(symbol.changeState(newStateConfig, oldStateConfig), 0);
                }
            });
        }
        return timeline;
    }
    checkReplay(timeline, transitionConfig) {
        if (!transitionConfig.replay && this._currentState && transitionConfig.state.keyword === this._currentState.keyword) {
            //Logger.logDev(`checkReplay: Same State, killing new state animation ${this._currentState.keyword}`);
            timeline.kill();
        }
    }
    /**
     * Sets the new state to current state and does a prio check if configured.
     *
     * @param {TimelineLite} timeline
     * @param {SymbolStateTransition} transitionConfig
     */
    setCurrentState(timeline, transitionConfig) {
        if (this._currentTimeline != null) {
            if (transitionConfig.prioCheck) {
                //Logger.logDev(`prioCheck:\nCurrent state: ${this._currentState!.keyword}, ${this._currentState!.prio}\nNew state: ${ transitionConfig.state.keyword}, ${ transitionConfig.state.prio}`);
                if (transitionConfig.state.prio < this._currentState.prio) {
                    //Logger.logDev("prioCheck: Keeping old state");
                    timeline.kill();
                    return;
                }
                //Logger.logDev("prioCheck: Setting new state");
            }
            if (this._currentTimeline.isActive()) {
                this._currentTimeline.kill();
            }
        }
        this._currentTimeline = timeline;
        this._currentState = transitionConfig.state;
        this._currentStateAnimation = this._stateAnimations[transitionConfig.state.keyword];
    }
    getStateChangingAnimation(transitionConfig) {
        this.initState(transitionConfig.state);
        let timeline = new gsap_1.TimelineLite({ paused: !transitionConfig.autoPlay });
        timeline.addLabel(transitionConfig.state.keyword, 0); //Used to easier identify timeline during debug.
        timeline.add(() => this.checkReplay(timeline, transitionConfig));
        timeline.add(() => this.setCurrentState(timeline, transitionConfig));
        for (let key in this._stateAnimations) {
            if (this._stateAnimations[key] == null) {
                continue;
            }
            if (key === transitionConfig.state.keyword) {
                this.addNewStateAnimation(timeline, transitionConfig, this._stateAnimations[key], transitionConfig.fadeInDelay);
            }
            else {
                this.addOldStateAnimation(timeline, transitionConfig, this._stateAnimations[key], transitionConfig.fadeOutDelay);
            }
        }
        return timeline;
    }
    addNewStateAnimation(timeline, transition, stateAnimation, delay) {
        // Fade in new state
        let tween;
        if (transition.fadeInDuration > 0) {
            tween = new gsap_1.TweenLite(stateAnimation, transition.fadeInDuration, {
                alpha: transition.alpha,
                ease: transition.fadeInEase,
            });
        }
        else {
            tween = () => stateAnimation.alpha = transition.alpha;
        }
        timeline.add(tween, delay);
        // Add new state animation
        timeline.add(stateAnimation.getAnimation(transition.frames, transition.onUpdateCallback, transition.onCompleteCallback), delay);
    }
    addOldStateAnimation(timeline, transition, stateAnimation, delay) {
        // Fade out old state
        let tween;
        if (transition.fadeOutDuration > 0) {
            tween = new gsap_1.TweenLite(stateAnimation, transition.fadeOutDuration, {
                alpha: 0,
                ease: transition.fadeOutEase,
            });
        }
        else {
            tween = () => stateAnimation.alpha = 0;
        }
        timeline.add(tween, delay);
    }
    onRemove() {
        this.reset(true);
        this.destroy({ children: true }); // TODO? does this help with performance?
    }
    static parseStackedSymbolName(symName, reelId) {
        if (symName == null) {
            debugger;
            throw new Error(`StackedReelSymbol.parseStackedSymbol(): symName cannot be null!`);
        }
        if (GameConfig_1.GameConfig.instance.STACKED_SYMBOLS == null) {
            return {
                isStacked: false,
                symName: symName,
                totalNum: 1,
                index: 0
            };
        }
        const names = symName.split("*");
        let isStacked = GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[names[0]] != null;
        return {
            isStacked: isStacked,
            symName: names[0],
            totalNum: isStacked ? ((0, MathHelper_1.isNumber)(GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[names[0]].totalNum) ? GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[names[0]].totalNum : GameConfig_1.GameConfig.instance.STACKED_SYMBOLS[names[0]].totalNum[reelId]) : 1,
            index: isStacked ? parseInt(names[1]) : 0
        };
    }
    static filterStackedSymbolsReelSet(reelSet, reelId) {
        const result = [];
        let currentSymbol = "";
        let currentIndex = -1;
        let currentTotalNum = 0;
        for (let symbol of reelSet) {
            const stackedName = StateReelSymbol.parseStackedSymbolName(symbol, reelId);
            // Not a stacked symbol
            if (!stackedName.isStacked) {
                result.push(symbol);
                // Check previous stacked symbol complete.
                if (currentIndex != (currentTotalNum - 1)) {
                    debugger;
                    throw new Error("StateReelSymbol.filterStackedSymbolsReelSet():Broken stacked symbol error_1!");
                }
                currentSymbol = "";
                currentIndex = -1;
                currentTotalNum = 0;
                continue;
            }
            // A stacked symbol
            // Start a new stacked symbol.
            if (currentSymbol === "" || stackedName.symName != currentSymbol) {
                // Check previous stacked symbol complete.
                if (currentIndex != (currentTotalNum - 1)) {
                    debugger;
                    throw new Error("StateReelSymbol.filterStackedSymbolsReelSet():Broken stacked symbol error_2!");
                }
                currentSymbol = symbol;
                currentIndex = -1;
                currentTotalNum = stackedName.totalNum;
            }
            currentIndex++;
            result.push(`${symbol}*${currentIndex.toString()}`);
        }
        return result;
    }
    static setStackedSymbolStateAnchor(symbol, state) {
        if (symbol.stackedSymName.isStacked) {
            state.anchor.set(0.5, MathHelper_1.MathHelper.roundToDecimals((state.height * 0.5
                - symbol.stackedSymName.totalNum * symbol.symHeight * 0.5
                - (symbol.stackedSymName.totalNum - 1) * symbol.bottomPadding * 0.5
                + (symbol.stackedSymName.index + 0.5) * symbol.symHeight
                + symbol.stackedSymName.index * symbol.bottomPadding) / state.height, 4));
        }
        else {
            state.anchor.set(0.5, 0.5);
        }
    }
}
exports.StateReelSymbol = StateReelSymbol;
//# sourceMappingURL=StateReelSymbol.js.map