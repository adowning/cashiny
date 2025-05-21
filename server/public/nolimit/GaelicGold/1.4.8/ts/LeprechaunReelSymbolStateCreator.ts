/**
 * Created by Jie Gao on 2018-11-12.
 */

import {ReelSymbolStateCreator} from "@nolimitcity/slot-game/bin/core/reelsymbol/ReelSymbolStateCreator";
import {ISymbolStateConfig, StateReelSymbol} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";

export class LeprechaunReelSymbolStateCreator extends ReelSymbolStateCreator {

    constructor() {
        super();
    }

    protected getBasicStateAnimation(symbol:StateReelSymbol, stateKey:string, stateConfig:ISymbolStateConfig):TimelineSprite | null {
        const sprite:TimelineSprite | null = super.getBasicStateAnimation(symbol, stateKey, stateConfig);
        if(symbol.symName !== "B") {
            return sprite;
        }
        if(stateKey === "floating") {
            sprite!.playLoop();
        }

        if(stateKey === "landing") {
            sprite!.getAnimationAutoShowHide(true, false);
        }
        return sprite;
    }

    protected noWinStateCreator(symbol:StateReelSymbol, stateKey:string, stateConfig:ISymbolStateConfig):TimelineSprite | null {
        const stateAnimation:TimelineSprite | null = this.getBasicStateAnimation(symbol, stateKey, stateConfig);
        if(stateAnimation) {
            stateAnimation.tint = 0x555555;
        }
        return stateAnimation;
    }
}