"use strict";
/**
 * Created by Jerker Nord on 2016-04-18.
 * Refactored by Ning Jiang on 2017-08-04.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = exports.ButtonState = void 0;
const TimelineSprite_1 = require("../animation/TimelineSprite");
var ButtonState;
(function (ButtonState) {
    ButtonState[ButtonState["disabled"] = 0] = "disabled";
    ButtonState[ButtonState["loading"] = 1] = "loading";
    ButtonState[ButtonState["idle"] = 2] = "idle";
    ButtonState[ButtonState["over"] = 3] = "over";
    ButtonState[ButtonState["down"] = 4] = "down";
})(ButtonState = exports.ButtonState || (exports.ButtonState = {}));
class Button extends PIXI.Sprite {
    set enabled(value) {
        if (this._enabled != value) {
            this._enabled = value;
            this.setState(this._enabled ? ButtonState.idle : ButtonState.disabled);
        }
    }
    get enabled() {
        return this._enabled;
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get width() {
        return this._currentState.width;
    }
    constructor(textures, onClickedCallback, sourceFPS = 30) {
        super();
        this._idleState = this.createState(textures.idle, sourceFPS);
        this._overState = this.createState(textures.over, sourceFPS);
        this._downState = this.createState(textures.disabled, sourceFPS);
        this._disabledState = this.createState(textures.disabled, sourceFPS);
        this._onClickedCallback = onClickedCallback;
        this.init();
    }
    createState(textureConfig, sourceFPS) {
        let state;
        if (Array.isArray(textureConfig)) {
            state = new TimelineSprite_1.TimelineSprite(textureConfig, sourceFPS);
        }
        else {
            state = new TimelineSprite_1.TimelineSprite([textureConfig], sourceFPS);
        }
        this.addChild(state);
        state.visible = false;
        state.anchor.set(0.5, 0.5);
        return state;
    }
    setState(state, autoPlay = true) {
        this._idleState.hide();
        this._idleState.stopLoop();
        this._overState.hide();
        this._overState.stopLoop();
        this._downState.hide();
        this._downState.stopLoop();
        this._disabledState.hide();
        this._disabledState.stopLoop();
        // it doesn't stop the playing animation.
        switch (state) {
            case ButtonState.disabled:
                this._currentState = this._disabledState;
                break;
            case ButtonState.idle:
                this._currentState = this._idleState;
                break;
            case ButtonState.over:
                this._currentState = this._overState;
                break;
            case ButtonState.down:
                this._currentState = this._downState;
                break;
            default:
                debugger;
                throw new Error(`Button.setState(): Illegal button state ${state}`);
        }
        if (autoPlay) {
            this._currentState.playLoop();
        }
        else {
            this._currentState.getAnimation([0, 0]);
        }
        this._currentState.show();
    }
    init() {
        this._enabled = true;
        this.interactive = true;
        this.buttonMode = true;
        this.anchor.set(0.5, 0.5);
        this.on('pointerdown', this.onDown);
        this.on('pointerout', this.onIdle);
        this.on('pointerover', this.onOver);
        this.on('pointertap', this.onUp);
        this.setState(ButtonState.idle);
    }
    onIdle() {
        if (!this._enabled) {
            return;
        }
        this.setState(ButtonState.idle);
    }
    onOver() {
        if (!this._enabled) {
            return;
        }
        this.setState(ButtonState.over);
    }
    onDown() {
        if (!this._enabled) {
            return;
        }
        this.setState(ButtonState.down);
    }
    onUp() {
        if (!this._enabled) {
            return;
        }
        if (this._currentState != this._downState) {
            this.setState(ButtonState.down);
        }
        this._onClickedCallback();
    }
    click() {
        this.onUp();
    }
}
exports.Button = Button;
//# sourceMappingURL=Button.js.map