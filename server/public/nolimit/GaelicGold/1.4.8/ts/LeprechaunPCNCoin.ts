/**
 * Created by Jie Gao on 2020-01-27.
 */
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";
import {TimelineLite, TweenLite} from "gsap";

export interface ICoin {
    coin:PIXI.Sprite;
    coinIcon:PIXI.Sprite;
    coinValue:PIXI.Text;
    setStoneState:(value:string, picked:boolean, initial:boolean) => void;
}

export class LeprechaunPCNCoin extends PIXI.Sprite implements ICoin {
    private _coin:PIXI.Sprite;
    private _coinIcon:PIXI.Sprite;
    private _coinValue:PIXI.Text;
    private _glow:TimelineSprite;
    private _highlight:PIXI.Sprite;

    public get coin():PIXI.Sprite {
        return this._coin;
    }

    public get coinIcon():PIXI.Sprite {
        return this._coinIcon;
    }

    public get coinValue():PIXI.Text {
        return this._coinValue;
    }

    public get isHighVale():boolean {
        const coinValue:string = this._coinValue.text;
        const collectValue:number = Number(coinValue.substring(1));
        return (((coinValue.indexOf("+") > -1) && collectValue > 3) || ((coinValue.indexOf("x") > -1) && collectValue > 2));
    }

    constructor(index:number) {
        super();
        const textStyleCoinName:any = {
            fontFamily : "Open Sans",
            fontSize : 90,
            fontWeight : FontWeight.EXTRA_BOLD,
            wordWrap : true,
            align : "center",
            wordWrapWidth : 300,
            dropShadow : true,
            dropShadowAngle : 89.4,
            dropShadowColor : "#6a3c40",
            dropShadowDistance : 5,
            fill : "#e7e2d5",
            stroke : "#6a3c40",
            strokeThickness : 8,
            lineJoin : "round"
        };
        const wrapper:PIXI.Sprite = new PIXI.Sprite();
        const highlight:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("highCoinGlow")[0]);
        highlight.anchor.set(0.5, 0.5);
        highlight.position.set(0, 0);
        highlight.blendMode = PIXI.BLEND_MODES.ADD;
        highlight.alpha = 0;

        const glow:TimelineSprite = new TimelineSprite(GameResources.getTextures("winStar"));
        glow.anchor.set(0.5, 0.5);
        glow.position.set(0, 0);
        glow.scale.set(0.8, 0.8);
        glow.blendMode = PIXI.BLEND_MODES.ADD;
        glow.hide();

        const clickedButton:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("pncCircleCollected")[0]);
        clickedButton.anchor.set(0.5, 0.5);
        clickedButton.scale.set(0.3, 0.3);
        wrapper.addChild(highlight);
        wrapper.addChild(glow);
        wrapper.addChild(clickedButton);

        const coinIcon:PIXI.Sprite = new PIXI.Sprite();
        coinIcon.anchor.set(0.5, 1);
        coinIcon.position.set(0, 0);
        coinIcon.visible = false;
        clickedButton.addChild(coinIcon);

        const coinValue:PIXI.Text = new PIXI.Text("", textStyleCoinName);
        coinValue.anchor.set(0.5, 0.5);
        coinValue.position.set(0, 0);
        clickedButton.addChild(coinValue);

        this._coin = wrapper;
        this._glow = glow;
        this._highlight = highlight;
        this._coinValue = coinValue;
        this._coinIcon = coinIcon;
    }

    public getIconTexture(value:string):void {
        const isSpins:boolean = value.indexOf("+") > -1;
        const hasSign:boolean = (isSpins || (value.length < 2));
        if(!hasSign) {
            this._coinIcon.visible = false;
            return;
        }
        this._coinIcon.visible = true;
        this._coinIcon.texture = GameResources.getTextures(isSpins ? "pncSpinsIcon" : "pncRainbowIcon")[0];
    }

    public setStoneState(coinValue:string, picked:boolean, initial:boolean):void {
        if(!picked) {
            this.coinIcon.visible = false;
            this.coinValue.position.set(0, 0);
            return;
        }
        this.coin.alpha = 1;
        this._highlight.alpha = 0;
        this._glow.hide();
        this.coinValue.text = coinValue;
        const hasSign:boolean = ((coinValue.indexOf("+") > -1) || (coinValue.length < 2));
        this.coinValue.style.fontSize = (coinValue.length > 4) ? 80 : 140;
        this.getIconTexture(coinValue);
        this.coinValue.position.set(0, hasSign ? 62 : 0);
        this.coin.visible = true;

        if(this.isHighVale) {
            if(initial) {
                const tl:TimelineLite = new TimelineLite();
                tl.add([
                    this._glow.getAnimationAutoShowHide(true, true),
                    TweenLite.to(this._highlight, 0.2, {alpha : 1})
                ]);
                tl.add(this._glow.getAnimationAutoShowHide(true, true));
                tl.add([
                    this._glow.getAnimationAutoShowHide(true, true),
                    TweenLite.to(this._highlight, 0.5, {alpha : 0})
                ]);
            } else {
                TweenLite.fromTo(this._highlight, 0.2, {alpha : 0}, {alpha : 1});
            }
        }
    }

    public reset():void {

    }
}