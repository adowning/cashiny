/**
 * Created by Jie Gao on 2019-11-19.
 */
import {SymbolIdleAnimationController} from "@nolimitcity/slot-game/bin/game/idleanimation/symbolidleanimation/SymbolIdleAnimationController";
import {LeprechaunGameModuleConfig} from "../LeprechaunGameModuleConfig";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {IdleAnimationConfig} from "@nolimitcity/slot-game/bin/game/idleanimation/IdleAnimationController";

export class LeprechaunSymbolIdleAnimation extends SymbolIdleAnimationController{

    constructor(config?:IdleAnimationConfig) {
        super(config);

    }

    protected playIdleAnimation():void {
        if(!this._hasSymbolIdle) {
            return;
        }

        const reelId:number = MathHelper.randomNumberInRange(0, GameConfig.instance.REELS_NUM - 1);
        const symId:number = MathHelper.randomNumberInRange(0, GameConfig.instance.SYMBOLS_NUM_IN_REEL[2] - 1);
        LeprechaunGameModuleConfig.symbolWinAnimation.playIdleAnimation(reelId,symId, false);
    }
}