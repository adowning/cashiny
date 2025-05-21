/**
 * Created by Jie Gao on 2018-11-06.
 */
import {ITextBetLineNumberConfig} from "@nolimitcity/slot-game/bin/game/betline/number/TextBetLineNumber";
import {StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {LeprechaunBetlineEvent} from "./LeprechaunBetlineEvent";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {TweenLite, Elastic} from "gsap";
import {BetLineNumber} from "@nolimitcity/slot-game/bin/core/betline/BetLineNumber";
import {LeprechaunHelper} from "../../utils/LeprechaunHelper";

export class LeprechaunBetlineNumber extends BetLineNumber {
    private readonly _config:ITextBetLineNumberConfig;
    private _normalText:PIXI.Sprite;
    private _winText:PIXI.Sprite;
    private _normalTextAlphaTween:TweenLite;
    private _normalTextScaleTween:TweenLite;
    private _winTextAlphaTween:TweenLite;
    private _winTextScaleTween:TweenLite;
    private _showRainbowNumbers:boolean = false;

    constructor(index:number, config:ITextBetLineNumberConfig) {
        super(index, config);
        this._config = config;
        this.addMultiplierEventListeners();
    }

    private addMultiplierEventListeners():void {
        EventHandler.addEventListener(this, LeprechaunBetlineEvent.SHOW_WIN_BET_LINE_WINS, (event:GameEvent) => this.onShowWinBetLineWin(event.params[0]));
        EventHandler.addEventListener(this, LeprechaunBetlineEvent.HIDE_RAINBOW_NUMBER, (event:GameEvent) => this.onHideRainbowNumbers());
    }

    protected draw(config:ITextBetLineNumberConfig):void {
        const side:string = this.index > 5 ? "" : "Left";
        this._normalText = new PIXI.Sprite(GameResources.getTextures(`betlineNumber${this.index}${side}`)[0]);
        this._normalText.anchor.set(0.5, 0.5);
        this._normalText.alpha = 0;
        this.addChild(this._normalText);

        this._winText = new PIXI.Sprite(GameResources.getTextures(`betlineNumber${this.index}${side}Win`)[0]);
        this._winText.anchor.set(0.5, 0.5);
        this._winText.alpha = 0;
        this.addChild(this._winText);
        StageManager.getLayer(config.layer).addChild(this);
    }

    private onShowWinBetLineWin(index:number):void {
        if(index !== this.index) {
            return;
        }

        this.showWin();
    }

    public animateShow():void {
        this._showRainbowNumbers = true;
        this.killAllTweens();
        this._normalTextAlphaTween = TweenLite.to(this._normalText, 0.1, {alpha : 1});
        this._normalTextScaleTween = TweenLite.fromTo(this._normalText.scale, 1, {x : 0, y : 0}, {
            x : 1,
            y : 1,
            ease : Elastic.easeOut
        });
    }

    protected showMouseOver():void {
        if(!this._showRainbowNumbers && (this.index > 5)) {
            return;
        }
        this.killAllTweens();
        this._normalTextAlphaTween = TweenLite.to(this._normalText, 0.1, {alpha : 0});
        this._winTextAlphaTween = TweenLite.to(this._winText, 0.1, {alpha : 1});
    }

    protected showMouseOut():void {
        if(!this._showRainbowNumbers && (this.index > 5)) {
            return;
        }
        this.killAllTweens();
        this._normalTextAlphaTween = TweenLite.to(this._normalText, 0.1, {alpha : 1});
        this._winTextAlphaTween = TweenLite.to(this._winText, 0.1, {alpha : 0});
    }

    protected showWin():void {
        this.killAllTweens();
        this._normalTextAlphaTween = TweenLite.to(this._normalText, 0.1, {alpha : 0});
        this._winTextAlphaTween = TweenLite.to(this._winText, 0.1, {alpha : 1});
        this._normalTextScaleTween = TweenLite.to(this._normalText.scale, 0.17, {
            x : this._config.textWinScale,
            y : this._config.textWinScale
        });
        this._winTextScaleTween = TweenLite.to(this._winText.scale, 0.17, {
            x : this._config.textWinScale,
            y : this._config.textWinScale
        });
    }

    protected showNormal():void {
        if(!this._showRainbowNumbers && (this.index > 5)) {
            return;
        }
        this.killAllTweens();
        this._normalTextAlphaTween = TweenLite.to(this._normalText, 0.33, {alpha : 1});
        this._winTextAlphaTween = TweenLite.to(this._winText, 0.33, {alpha : 0});
        this._normalTextScaleTween = TweenLite.to(this._normalText.scale, 0.33, {x : 1, y : 1});
        this._winTextScaleTween = TweenLite.to(this._winText.scale, 0.33, {x : 1, y : 1});
    }

    private killAllTweens():void {
        if(this._normalTextAlphaTween && this._normalTextAlphaTween.isActive()) {
            this._normalTextAlphaTween.pause();
            this._normalTextAlphaTween.kill();
        }

        if(this._normalTextScaleTween && this._normalTextScaleTween.isActive()) {
            this._normalTextScaleTween.pause();
            this._normalTextScaleTween.kill();
        }

        if(this._winTextAlphaTween && this._winTextAlphaTween.isActive()) {
            this._winTextAlphaTween.pause();
            this._winTextAlphaTween.kill();
        }

        if(this._winTextScaleTween && this._winTextScaleTween.isActive()) {
            this._winTextScaleTween.pause();
            this._winTextScaleTween.kill();
        }
    }

    private onHideRainbowNumbers():void {
        if(this.index < 6) {
            return;
        }
        this._showRainbowNumbers = false;
        this.killAllTweens();
        this._normalText.alpha = 0;
        this._winText.alpha = 0;
    }

    public setPosition(betLinesNum:number, positionIndex:number):number[] {
        const numLineInOneSide:number = betLinesNum / 2;
        const side:number = Math.floor(positionIndex / numLineInOneSide);
        this._normalText.anchor.set(side === 0 ? 1 : 0, 0.5);
        this._winText.anchor.set(side === 0 ? 1 : 0, 0.5);
        const sideName:string = this.index > 5 ? "" : (side === 0 ? "Left" : "Right");
        this._normalText.texture = GameResources.getTextures(`betlineNumber${this.index}${sideName}`)[0];
        this._winText.texture = GameResources.getTextures(`betlineNumber${this.index}${sideName}Win`)[0];

        const x:number = LeprechaunHelper.getBetlineNumerPos(this.index, side)[0];
        const y:number = LeprechaunHelper.getBetlineNumerPos(this.index, side)[1];
        this.x = x;
        this.y = y;

        return [x, y, side];
    }
}