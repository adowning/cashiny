/**
 * Created by Jie Gao on 2018-11-02.
 */

import {BitmapWinCountUp} from "@nolimitcity/slot-game/bin/game/winpresentation/countup/BitmapWinCountUp";
import {Power2, Power3, Timeline, TimelineLite, TweenLite, Elastic} from "gsap";

export class LeprechaunBigWinCountUp extends BitmapWinCountUp {

    constructor() {
        super({
        font : {
            name : "NumbersWinCountUp",
                size : 38
        },
        tint : parseInt(("#ffffff").replace(/^#/, ''), 16)
    });
    }

    protected initAnimations():void {
        super.initAnimations();
    }

    public getCountUpAnimation(from:number, to:number, duration:number):Timeline {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add([
            () => {
                this._countUp.alpha = 1;
                this._countUp.visible = true;
            },
            this._countUp.getCountUpAnimation(from, to, {
                duration : duration,
                ease : from == 0 ? Power3.easeInOut : Power2.easeOut
            }),
            TweenLite.fromTo(this._countUpContainer.scale, 1,
                {x : 0.5, y : 0.5},
                {
                    x : 1,
                    y : 1,
                    ease : Elastic.easeOut.config(2, 1)
                })
        ]);

        return timeline;
    }

    public getCountUpEndAnimation(endVale:number):void {
    }

    protected getAbortAnimation(endValue:number):Timeline {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add([
            () => {
                this._countUp.alpha = 1;
                this._countUp.visible = true;
            },
            TweenLite.fromTo(this._countUpContainer.scale, 0.2,
                {x : 0.5, y : 0.5},
                {
                    x : 1,
                    y : 1,
                    ease : Elastic.easeOut.config(2, 1)
                }),
            this._countUp.getCountUpAnimation(endValue, endValue, {duration : 0.01})
        ]);
        return timeline;
    }

    public getEndingAnimation():Timeline {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add(TweenLite.to(this._countUp, 0.2, {alpha : 0}), `+=0.8`); // stay a while after count up.
        return timeline;
    }
}