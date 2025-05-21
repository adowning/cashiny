/**
 * Created by Jie Gao on 2018-11-08.
 */
import {TimelineLite} from "gsap";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";

export interface ButtonLike {
    enabled:boolean;
    click:() => void;
}

export enum ButtonState {
    disabled = 0,
    deactive,
    idle,
    over,
    down
}

export class LeprechaunButton extends PIXI.Sprite implements ButtonLike {

    private _glow:PIXI.Sprite;
    private _deactiveState:PIXI.Sprite;
    private _idleState:PIXI.Sprite;
    private _disabledState:PIXI.Sprite;
    private _currentState:PIXI.Sprite;
    private _overState:PIXI.Sprite;
    private _downState:PIXI.Sprite;
    private _onClickedCallback:() => void;
    protected _enabled:boolean;

    public set enabled(value:boolean) {
        if(this._enabled != value) {
            this._enabled = value;
            this.setState(this._enabled ? ButtonState.idle : ButtonState.disabled);
        }
    }

    public get enabled():boolean {
        return this._enabled;
    }

    // @ts-ignore
    public get width():number {
        return this._currentState.width;
    }

    constructor(texture:PIXI.Texture, onClickedCallback:() => void, sourceFPS:number = 30) {
        super();
        this._glow = new PIXI.Sprite(GameResources.getTextures("pncStoneGlow")[0]);
        this._glow.anchor.set(0.5, 0.5);
        this._glow.position.set(0, 0);
        this._glow.blendMode = PIXI.BLEND_MODES.ADD;
        this._glow.visible = false;
        this.addChild(this._glow);
        this._idleState = this.createState(texture);
        this._disabledState = this.createState(texture);
        this._deactiveState = this.createState(texture);
        this._overState = this.createState(texture);
        this._downState = this.createState(texture);
        this._onClickedCallback = onClickedCallback;
        this.init();
    }

    private createState(texture:PIXI.Texture):PIXI.Sprite {
        let state:PIXI.Sprite = new PIXI.Sprite(texture);
        this.addChild(state);
        state.visible = false;
        state.anchor.set(0.5, 0.5);
        return state;
    }

    public setState(state:ButtonState, autoPlay:boolean = true):void {
        this._glow.visible = (state === ButtonState.over);
        this._idleState.visible = false;
        this._disabledState.visible = false;
        this._deactiveState.visible = false;
        switch(state) {
            case ButtonState.disabled:
                this._currentState = this._disabledState;
                break;
            case ButtonState.idle:
                this._currentState = this._idleState;
                break;
            case ButtonState.deactive:
                this._currentState = this._deactiveState;
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

        this._currentState.visible = true;
    }

    protected init():void {
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

    protected onIdle():void {
        if(!this._enabled) {
            return;
        }
        this.setState(ButtonState.idle);
    }

    protected onOver():void {
        if(!this._enabled) {
            return;
        }
        CustomWiggle.create("wiggle", {wiggles : 10, type : "easeInOut"});
        new TimelineLite().add(new TimelineLite().to(this, 2, {rotation : Math.PI / 6, ease : "wiggle"}));
        this.setState(ButtonState.over);
    }

    protected onDown():void {
        if(!this._enabled) {
            return;
        }
        this.setState(ButtonState.down);
    }

    protected onUp():void {
        if(!this._enabled) {
            return;
        }
        this._onClickedCallback();
        this._enabled = false;
    }

    public click():void {
        this.onUp();
    }
}