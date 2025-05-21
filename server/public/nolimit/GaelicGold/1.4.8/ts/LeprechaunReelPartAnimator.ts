/**
 * Created by Jie Gao on 2018-11-13.
 */

import {Ease, Elastic, Linear} from "gsap";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {NudgeSpinReelPartAnimator} from "@nolimitcity/slot-game/bin/game/reel/nudgereel/NudgeSpinReelPartAnimator";

export class LeprechaunReelPartAnimator extends NudgeSpinReelPartAnimator {
    private _bonusFeatureTriggered:boolean = false;

    constructor(reelId:number) {
        super(reelId);
        this.addEventListeners();
    }

    private addEventListeners():void {
        EventHandler.addEventListener(this, ServerEvent.GAME_DATA_PARSED, (event:GameEvent) => this.parsedGameData(event.params[0]));
    }

    private parsedGameData(data:LeprechaunParsedGameData):void {
        this._bonusFeatureTriggered = data.bonusFeatureTriggered;
    }

    protected getSpinStopEase():Ease {
        const config:[number, number] = LeprechaunGameConfig.instance.REEL_SPIN_STOP_ELASTIC_CONFIG;
        return this._bonusFeatureTriggered ? Linear.easeNone : Elastic.easeOut.config(config[0], config[1]);
    }

    protected getSpinQuickStopEase():Ease {
        const configQuick:[number, number] = GameConfig.instance.REEL_SPIN_QUICK_STOP_ELASTIC_CONFIG;
        return this._bonusFeatureTriggered ? Linear.easeNone : Elastic.easeOut.config(configQuick[0], configQuick[1])
    }

    protected calculationStopSpinSpeed():number {
        if(this._bonusFeatureTriggered) {
            return <number>GameConfig.instance.REEL_NEAR_WIN_SPIN_SPEED;
        }
        return super.calculationStopSpinSpeed();
    }
}