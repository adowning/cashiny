/**
 * Created by Jie Gao on 2019-01-29.
 */
import {LeprechaunReelAreaView} from "./LeprechaunReelAreaView";
import {TimelineLite} from "gsap";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {LeprechaunReelAreaEvents} from "./events/LeprechaunReelAreaEvents";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {Reels} from "@nolimitcity/slot-game/bin/core/reel/reelarea/Reels";

export interface ISlowMotionStopConfig {
    reelId:number;
    startPos:number;
    bounceUpwards:boolean;
}

export interface ILiftReelConfig {
    reelId:number;
    bounceStartPos:number;
}

export class LeprechaunReels extends Reels {
    constructor() {
        super();
    }

    protected addEventListeners():void {
        super.addEventListeners();
        EventHandler.addEventListener(this, LeprechaunReelAreaEvents.LIFT_REEL, (event:GameEvent) => this.liftReels(event.params[0]));
        EventHandler.addEventListener(this, LeprechaunReelAreaEvents.SLOW_MOTION_STOP, (event:GameEvent) => this.onSlowMotionStop(event.params[0]));
    }

    public liftReels(liftReelConfig:ILiftReelConfig):void {
        (<LeprechaunReelAreaView>Reels._reelAreaView).liftReelUp(Reels._reels[liftReelConfig.reelId].view, liftReelConfig.bounceStartPos);
        EventHandler.dispatchEvent(new GameEvent(LeprechaunReelAreaEvents.SLOW_MOTION_STOPPING));
    }

    public onSlowMotionStop(slowMotionStopConfig:ISlowMotionStopConfig):TimelineLite {
        return (<LeprechaunReelAreaView>Reels._reelAreaView).onSlowMotionStop(Reels._reels[slowMotionStopConfig.reelId].view, slowMotionStopConfig.startPos, slowMotionStopConfig.bounceUpwards);
    }
}