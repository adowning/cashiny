/**
 * Created by Ning Jiang on 10/10/2018.
 */

import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {BitmapTextStyleOptions} from "@nolimitcity/slot-game/bin/core/text/BitmapTextStyleOptions";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {BitmapWinCountUp} from "@nolimitcity/slot-game/bin/game/winpresentation/countup/BitmapWinCountUp";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {Elastic, Power3, Timeline, TimelineLite, TweenLite} from "gsap";
import {LeprechaunGameModuleConfig} from "../../LeprechaunGameModuleConfig";

export class LeprechaunInitialWinCountUp extends BitmapWinCountUp {

    private _isCountUpSoundPlaying:boolean = false;
    private _hasCountUpEndSoundPlayed:boolean = false;
    private _starAnimation:TimelineSprite;

    constructor(bitmapStyle:BitmapTextStyleOptions) {
        super(bitmapStyle);
    }

    protected initAnimations():void {
        this._starAnimation = new TimelineSprite(GameResources.getTextures("winStar"));
        this._starAnimation.anchor.set(0.5, 0.5);
        this._starAnimation.position.set(0, 0);
        this._starAnimation.hide();
        this._starAnimation.blendMode = PIXI.BLEND_MODES.ADD;
        this.addChild(this._starAnimation);
        super.initAnimations();
    }

    private getScale(multiplier:number):number {
        return 1 + (multiplier - 1) * 0.1;
    }

    public getCountUpAnimation(from:number, to:number, duration:number, multiplier:number):Timeline {
        const oriNumber:number = MathHelper.floorToDecimals(to / multiplier, 2);
        const timeline:TimelineLite = new TimelineLite();
        timeline.add([
            () => {
                this._countUp.maxTextWidth = GameConfig.instance.REEL_AREA_WIDTH * 0.9 / this.getScale(multiplier);
                this._countUp.alpha = 1;
                this._countUp.visible = true;
                this._countUpContainer.scale.set(1, 1);
                if(duration > 0.01) {
                    this._isCountUpSoundPlaying = true;
                }
            },
            this._starAnimation.getAnimationAutoShowHide(true, true),
            this._countUp.getCountUpAnimation(from, oriNumber, {duration : duration, ease : Power3.easeInOut})
        ]);
        if(multiplier > 1) {
            const m:number = multiplier;
            const showNumber:number = oriNumber * m;
            const scale:number = this.getScale(m);
            timeline.add([
                () => {LeprechaunGameModuleConfig.logo.playMultiplierAnimation();},
                this._countUp.getCountUpAnimation(showNumber, showNumber, {duration : 0.01}),
                this._starAnimation.getAnimationAutoShowHide(true, true),
                TweenLite.to(this._countUpContainer.scale, 0.3,
                    {
                        x : scale,
                        y : scale,
                        ease : Elastic.easeOut.config(2, 1)
                    }),
            ]);

        }

        return timeline;
    }

    public abort(endValue:number, isAborted:boolean, multiplier:number, isBigWin:boolean):Timeline | null {
        if(isBigWin) {
            return null;
        }
        this._starAnimation.hide();
        return super.abort(endValue, isAborted, multiplier);
    }

    protected getAbortAnimation(endValue:number, multiplier:number):Timeline {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add([
            () => {
                this._countUp.maxTextWidth = GameConfig.instance.REEL_AREA_WIDTH * 0.9 / this.getScale(multiplier);
                this._countUp.alpha = 1;
                this._countUp.visible = true;
                this._countUpContainer.scale.set(1, 1);
            },
            this._countUp.getCountUpAnimation(endValue, endValue, {duration : 0.01})
        ]);
        if(multiplier > 1) {
            const scale:number = this.getScale(multiplier);
            timeline.add(TweenLite.to(this._countUpContainer.scale, 0.2, {
                x : scale,
                y : scale,
                ease : Elastic.easeOut.config(2, 1)
            }), 0)
        }
        return timeline;
    }

    public getEndingAnimation():Timeline {
        const timeline:TimelineLite = new TimelineLite({
            onComplete : () => {
                this._isCountUpSoundPlaying = false;
                this._hasCountUpEndSoundPlayed = false;
            }
        });
        timeline.add(TweenLite.to(this._countUp, 0.8, {alpha : 0}), 0); // stay a while after count up.

        return timeline;
    }
}