"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeypadView = void 0;
const SlotKeypad_1 = require("../../SlotKeypad");
const BetPanelView_1 = require("./BetPanelView");
const gsap_1 = require("gsap");
const AnimationUtils_1 = require("../utils/AnimationUtils");
const SlotStateHandler_1 = require("@nolimitcity/slot-launcher/bin/plugins/apiplugin/SlotStateHandler");
const HtmlTopLabel_1 = require("./htmlelements/HtmlTopLabel");
/**
 * Created by Jonas Wålekvist on 2019-11-05.
 */
class KeypadView extends PIXI.Container {
    get betPanel() {
        return this._betPanel;
    }
    constructor(controller) {
        super();
        this._controller = controller;
        this.initAnimations();
        SlotKeypad_1.SlotKeypad.apiPlugIn.clock.events.on(SlotKeypad_1.SlotKeypad.apiPlugIn.clock.UPDATE, () => this.onClockHandler(SlotKeypad_1.SlotKeypad.apiPlugIn.clock.UPDATE));
        SlotKeypad_1.SlotKeypad.apiPlugIn.clock.events.on(SlotKeypad_1.SlotKeypad.apiPlugIn.clock.SETTING_UPDATE, () => this.onClockHandler(SlotKeypad_1.SlotKeypad.apiPlugIn.clock.SETTING_UPDATE));
        this.onClockHandler(SlotKeypad_1.SlotKeypad.apiPlugIn.clock.SETTING_UPDATE);
    }
    onResize() {
        this._betPanel.onResize();
    }
    onOrientationChanged() {
        this._betPanel.onOrientationChanged();
    }
    initAnimations() {
        this.setupTopBar();
        this._betPanel = new BetPanelView_1.BetPanelView(this._controller);
        this.addChild(this._betPanel);
    }
    hide(duration) {
        return this.setStateVisibility(duration, true);
    }
    show(duration) {
        return this.setStateVisibility(duration);
    }
    halt() {
        this.createStateVisibilityAnimation(0.1, false, false, false);
    }
    //Fixme: Explicit show should only be used when we are closing menus. This is a bit hacky. But there is no time to fix this properly.
    //It should only be used when we know for sure that the next state will be ready. Like when a dialog is closing.
    setStateVisibility(duration = 0.2, explicitHide = false, explicitShow = false) {
        //const state =  SlotKeypad.apiPlugIn.slotStates.getState();
        //const gamble:boolean = SlotKeypad.apiPlugIn.slotStates.checkState(SlotState.GAMBLE);
        const readyFinish = SlotKeypad_1.SlotKeypad.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.READY, SlotStateHandler_1.SlotState.FINISH, SlotStateHandler_1.SlotState.GAMBLE) && !SlotKeypad_1.SlotKeypad.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.PAUSED);
        const dialogScreen = SlotKeypad_1.SlotKeypad.apiPlugIn.slotStates.checkState(SlotStateHandler_1.SlotState.DIALOG, SlotStateHandler_1.SlotState.SCREEN, SlotStateHandler_1.SlotState.PAUSED);
        let showDynamic = readyFinish && !SlotKeypad_1.SlotKeypad.autoplay.isAutoplayRound && !SlotKeypad_1.SlotKeypad.apiPlugIn.isReplay;
        let showAutoplay = (readyFinish || SlotKeypad_1.SlotKeypad.autoplay.isAutoplayRound) && !SlotKeypad_1.SlotKeypad.apiPlugIn.isReplay && !explicitHide;
        let showStatic = !dialogScreen && !explicitHide;
        if (dialogScreen && explicitShow) {
            showDynamic = true;
            showAutoplay = true;
            showStatic = true;
        }
        if (showDynamic == false && this.betPanel.nolimitBonusMenu.isOpen) {
            this._controller.closeNolimitBonusMenu();
        }
        return this.createStateVisibilityAnimation(duration, showStatic, showDynamic, showAutoplay);
    }
    createStateVisibilityAnimation(duration, showStatic, showDynamic, showAutoplay) {
        if (this._stateVisibilityAnimation != undefined) {
            this._stateVisibilityAnimation.kill();
            this._stateVisibilityAnimation = undefined;
        }
        this._stateVisibilityAnimation = new gsap_1.TimelineLite();
        this._stateVisibilityAnimation.add([
            AnimationUtils_1.AnimationUtils.elementVisibilityAnimation(this.betPanel.staticContainer, duration, showStatic),
            AnimationUtils_1.AnimationUtils.elementVisibilityAnimation(this.betPanel.fastSpinButton, duration, showStatic),
            AnimationUtils_1.AnimationUtils.elementVisibilityAnimation(this.betPanel.dynamicContainer, duration, showDynamic),
            AnimationUtils_1.AnimationUtils.elementVisibilityAnimation(this.betPanel.autoplayButton, duration, showAutoplay)
        ]);
        this.betPanel.permanentContainer.interactiveChildren = showDynamic; //This enabled /disables interactivity on bet level label.
        return this._stateVisibilityAnimation;
    }
    onClockHandler(event) {
        if (event == SlotKeypad_1.SlotKeypad.apiPlugIn.clock.UPDATE) {
            this._clock.update(SlotKeypad_1.SlotKeypad.apiPlugIn.clock.formattedTime);
        }
        if (event == SlotKeypad_1.SlotKeypad.apiPlugIn.clock.SETTING_UPDATE) {
            if (SlotKeypad_1.SlotKeypad.apiPlugIn.clock.shouldShow) {
                this._clock.update(SlotKeypad_1.SlotKeypad.apiPlugIn.clock.formattedTime);
                this._clock.show();
            }
            else {
                this._clock.hide();
            }
        }
    }
    setupTopBar() {
        const nolimitContainer = document.querySelector(".nolimit.container");
        const topBarLeft = document.createElement("div");
        topBarLeft.classList.add("top-bar-left");
        const topBarRight = document.createElement("div");
        topBarRight.classList.add("top-bar-right");
        this._clock = new HtmlTopLabel_1.HtmlTopLabel("clock", true);
        this._playForFun = new HtmlTopLabel_1.HtmlTopLabel('.nolimit.container .fun');
        this._gameName = new HtmlTopLabel_1.HtmlTopLabel('.nolimit.container #game-name-version');
        this._netPosition = new HtmlTopLabel_1.HtmlTopLabel('.nolimit.container #net-position');
        topBarLeft.append(this._clock.element);
        topBarLeft.append(this._playForFun.element);
        topBarRight.append(this._gameName.element);
        topBarRight.append(this._netPosition.element);
        nolimitContainer.append(topBarLeft);
        nolimitContainer.append(topBarRight);
    }
}
exports.KeypadView = KeypadView;
//# sourceMappingURL=KeypadView.js.map