/**
 * Created by Jonas Wålekvist on 2018-05-31.
 */


import {
    ISymbolStateConfig,
    ISymbolStates,
    StateReelSymbol,
    SymbolStateTransition
} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {Back, TimelineLite, TweenLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";

export interface ILeprechaunSymbolStates extends ISymbolStates {
    noWin:ISymbolStateConfig;
    nudge:ISymbolStateConfig;
    floating:ISymbolStateConfig;
    landing:ISymbolStateConfig;
}

export class LeprechaunReelSymbol extends StateReelSymbol {

    constructor(symName:string, reelId:number, state?:ISymbolStateConfig) {
        super(symName, reelId, state);
    }

    protected addNewStateAnimation(timeline:TimelineLite, newState:SymbolStateTransition, stateAnimation:TimelineSprite, delay:number):void {
        super.addNewStateAnimation(timeline, newState, stateAnimation, delay);

        if(newState.state.keyword == LeprechaunGameConfig.instance.SYMBOL_STATES.win.keyword && this.symName.indexOf("W") < 0) {
            timeline.add(new TweenLite(this.scale, 0.2, {x : 0.7, y : 0.7}));
            timeline.add(new TweenLite(this.scale, 0.5, {x : 1.05, y : 1.05, ease : Back.easeOut.config(1.7)}));
            timeline.add(new TweenLite(this.scale, 0.3, {x : 1, y : 1}))
        }
    }

}