/**
 * Created by Jie Gao on 2018-11-02.
 */

import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ScalableLayer} from "@nolimitcity/slot-game/bin/core/stage/ScalableLayer";
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {IWinRatioConfig} from "@nolimitcity/slot-game/bin/core/winpresentation/WinRatio";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {Timeline, TimelineLite, TweenLite} from "gsap";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";
import {CoinsFountain} from "../../particles/CoinsFountain";
import {LeprechaunBigWinCountUp} from "./LeprechaunBigWinCountUp";

export interface IbigWinTextConfig {
    text:string;
    style:any;
}

export class LeprechaunBigWinView extends BaseView {
    private TEXTS:IbigWinTextConfig[] = [
        {
            text : "Big Win",
            style : {
                fontFamily : 'Open Sans',
                fontSize : 80,
                fontWeight : 'bold',
                fill : ['#ffffff', '#00ccff'], // gradient
                dropShadow : true,
                dropShadowColor : '#000000',
                dropShadowBlur : 4,
                dropShadowAngle : Math.PI / 2,
                dropShadowDistance : 3,
                wordWrap : true,
                wordWrapWidth : 440
            }
        },
        {
            text : "Mega Win",
            style : {
                fontFamily : 'Open Sans',
                fontSize : 80,
                fontWeight : 'bold',
                fill : ['#ffffff', '#ffcc00'], // gradient
                dropShadow : true,
                dropShadowColor : '#000000',
                dropShadowBlur : 4,
                dropShadowAngle : Math.PI / 2,
                dropShadowDistance : 3,
                wordWrap : true,
                wordWrapWidth : 440
            }
        },
        {
            text : "Super Mega Win",
            style : {
                fontFamily : 'Open Sans',
                fontSize : 80,
                fontWeight : 'bold',
                fill : ['#ffffff', '#ff0099'], // gradient
                dropShadow : true,
                dropShadowColor : '#000000',
                dropShadowBlur : 4,
                dropShadowAngle : Math.PI / 2,
                dropShadowDistance : 3,
                wordWrap : false,
                wordWrapWidth : 440
            }
        }];
    private _isShowing:boolean = false;
    private _textContainer:PIXI.Sprite;
    private _dimmer:PIXI.Sprite;
    private _winStar:TimelineSprite;
    private _winTextStar:TimelineSprite;
    private _winSplash:TimelineSprite;
    private _texts:PIXI.Sprite[];
    private _textsEffect:TimelineSprite[];
    private _coinContainer:PIXI.Container = new PIXI.Container;
    private _coinsFountain:CoinsFountain;
    private _layer:ScalableLayer;

    constructor() {
        super();
        this._layer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.BIG_WIN.name);
        this._dimmer = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._dimmer.anchor.set(0.5, 0.5);
        this._dimmer.position.set(360, 360);
        this._dimmer.tint = 0X000000;
        this._dimmer.alpha = 0;
        this._layer.addChild(this._dimmer);
        this._coinsFountain = new CoinsFountain(this._layer);
    }

    protected initAnimations():void {
        this._winSplash = new TimelineSprite(GameResources.getTextures("winSplash"));
        this._winSplash.blendMode = PIXI.BLEND_MODES.ADD;
        this._winSplash.hide();
        this._winSplash.scale.set(4, 4);
        this._winSplash.anchor.set(0.5, 0.5);

        this._winStar = new TimelineSprite(GameResources.getTextures("winStar"));
        this._winStar.blendMode = PIXI.BLEND_MODES.ADD;
        this._winStar.hide();
        this._winStar.scale.set(3, 3);
        this._winStar.anchor.set(0.5, 0.5);
        this._layer.addChild(this._winStar);

        this._textContainer = new PIXI.Sprite();
        this._textContainer.anchor.set(0.5, 0.5);
        this._textContainer.position.set(Helper.getSymbolPositions(1, 0)[0], Helper.getSymbolPositions(1, 0)[1] - 30);
        this._layer.addChild(this._textContainer);

        this._texts = ArrayHelper.initArrayWithValues(this.TEXTS.length, (i:number) => {
            const text:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("bigWinText" + i)[0]);
            text.y = -text.height / 2;
            text.x = -text.width / 2;
            text.alpha = 0;
            this._textContainer.addChild(text);
            return text;
        });

        this._textsEffect = ArrayHelper.initArrayWithValues(this.TEXTS.length, (i:number) => {
            const text:TimelineSprite = new TimelineSprite(GameResources.getTextures("bigWinTextEffect" + i));
            text.scale.set(2, 2);
            text.y = -text.height / 2;
            text.x = -text.width / 2;
            text.blendMode = PIXI.BLEND_MODES.ADD;
            text.hide();
            this._textContainer.addChild(text);
            return text;
        });

        this._winTextStar = new TimelineSprite(GameResources.getTextures("bigWinTextStar"));
        this._winTextStar.scale.set(2, 2);
        this._winTextStar.y = -this._winTextStar.height / 2;
        this._winTextStar.x = -this._winTextStar.width / 2;
        this._winTextStar.blendMode = PIXI.BLEND_MODES.ADD;
        this._winTextStar.hide();
        this._textContainer.addChild(this._winTextStar);
    }

    protected onResize(resizeData:IResizeData):void {
        this._isResizeDirty = false;
        this._dimmer.width = resizeData.width + 100;
        this._dimmer.height = resizeData.height + 100;
        this._winStar.x = 360;
        this._winStar.y = 360;
        this._winSplash.x = 360;
        this._winSplash.y = 360;
        this._coinContainer.y = 0 - (resizeData.height - 720) * 0.5;
    }

    public getBigWinLevelAnimation(level:number, winRatioConfig:IWinRatioConfig):Timeline {
        this._layer.addChild(this._winSplash);
        const timeline:TimelineLite = new TimelineLite();
        const fs:number = 0.033;
        this._textsEffect.forEach((text:TimelineSprite, i:number) => {
            text.hide();
        });
        timeline.add([
            () => {
                this._winTextStar.hide();
                this._winTextStar.stopLoop();
                this._isShowing = true;
                this._coinsFountain.startFountain(level);
            },
            this.updateBigWinLevelAnimation(level),
            this._textsEffect[level].getAnimationAutoShowHide(true, true),
            TweenLite.to(this._dimmer, 0.1, {alpha : 0.6}),
            TweenLite.to(this, winRatioConfig.duration, {alpha : 1})
        ], 0);
        timeline.add(() => {
            this._winTextStar.show();
            this._winTextStar.playLoop();
        }, 20 * fs);
        if(level < 1) {
            this._winStar.alpha = 1;
            timeline.add(this._winStar.getAnimationAutoShowHide(true, true), 0);
        }
        return timeline;
    }

    private updateBigWinLevelAnimation(level:number):TimelineLite {
        const timeline:TimelineLite = new TimelineLite();
        this._texts.forEach((text:PIXI.Sprite, i:number) => {
            text.alpha = (i === level) ? 1 : 0;
        });

        timeline.add([
            () => {
                this._layer.addChild(this._textContainer);
                this._winSplash.alpha = 1;
            },
            TweenLite.fromTo(this._textContainer, 7 * 0.033, {alpha : 0}, {alpha : 1}),
            this._winSplash.getAnimationAutoShowHide(true, true),
            TweenLite.fromTo(this._textContainer.scale, 7 * 0.033, {x : 2, y : 2}, {x : 1, y : 1})
        ], 0);

        this._isShowing = true;
        return timeline;
    }

    public playEndingAnimation(level:number, winCountUp:LeprechaunBigWinCountUp, endValue:number):TimelineLite {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add([
            () => {
                this._texts.forEach((text:PIXI.Sprite, i:number) => {
                    text.alpha = (i === level) ? 1 : 0;
                });
                this._coinsFountain.stopFountain();
                this._winTextStar.hide();
                this._winTextStar.stopLoop();
            },
            TweenLite.to(this._winSplash, 0.2, {alpha : 0}),
            TweenLite.to(this._winStar, 0.2, {alpha : 0}),
            TweenLite.to(this._dimmer, 1, {alpha : 0.6}),
            TweenLite.to(this._texts[level], 1, {alpha : 0})
        ], 0);
        [0, 0.122, 0.244].forEach((levelCountupTiming:number) => {
            timeline.add(() => {
                winCountUp.getCountUpEndAnimation(endValue)
            }, levelCountupTiming);
        });
        timeline.add(TweenLite.to(this._dimmer, 1, {alpha : 0}));
        timeline.add(() => {
            this._isShowing = false;
            this.reset();
        });

        return timeline;
    }

    public playAbortedEndingAnimation(level:number):void {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add([
            () => {
                this._texts.forEach((text:PIXI.Sprite, i:number) => {
                    text.alpha = (i === level) ? 1 : 0;
                });
                this._textsEffect.forEach((text:TimelineSprite) => {
                    text.hide();
                });
                this._coinsFountain.stopFountain();
                this._winTextStar.hide();
                this._winTextStar.stopLoop();
            },
            TweenLite.to(this._winSplash, 0.2, {alpha : 0}),
            TweenLite.to(this._winStar, 0.2, {alpha : 0}),
            TweenLite.to(this._dimmer, 1, {alpha : 0}),
            TweenLite.to(this._texts[level], 1, {alpha : 0})
        ]);
        timeline.add(() => {
            this._isShowing = false;
            this.reset();
        });
    }

    private reset():void {
        this._textContainer.scale.set(1, 1);
        this._winSplash.hide();
        this._winStar.hide();
        this._textsEffect.forEach((text:TimelineSprite) => {
            text.hide();
        });
        this._texts.forEach((text:PIXI.Sprite) => {
            text.alpha = 0;
        });
    }
}