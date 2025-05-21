/**
 * Created by Jie Gao on 2018-11-14.
 */
import {IReelStopSpinData} from "@nolimitcity/slot-game/bin/core/reel/reel/ReelController";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";
import {NudgeSpinReelController} from "@nolimitcity/slot-game/bin/game/reel/nudgereel/NudgeSpinReelController";
import {SpinReelEvent} from "@nolimitcity/slot-game/bin/game/reel/spinreel/SpinReelEvent";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {Logger} from "@nolimitcity/slot-launcher/bin/utils/Logger";
export class LeprechaunReelController extends NudgeSpinReelController {
    private _spinStartedTime:number;
    private _bonusFeatureTriggered:boolean = false;
    private _gameDataParsed:boolean = false;
    private _spinStarted:boolean = false;

    constructor(reelId:number) {
        super(reelId);
        this._nearWinReels = [false, false, false];
    }

    public onGameDataParsed(data:LeprechaunParsedGameData):void {
        this._nearWinReels = [false, false, false];
        super.onGameDataParsed(data);
        this._bonusFeatureTriggered = data.bonusFeatureTriggered;
        if(this._bonusFeatureTriggered) {
            this._nearWinReels[1] = true;
        }
        this._gameDataParsed = true;
        this.tryStartNearWin();
    }

    protected onSpinStartedCompleted():void {
        super.onSpinStartedCompleted();
        this._spinStartedTime = Date.now();
        this._spinStarted = true;
        this.tryStartNearWin();
    }

    private tryStartNearWin() {
        if(this.reelId != 0 || !this._spinStarted || !this._gameDataParsed) {
            return;
        }
        if(this._nearWinReels[0]) {
            Logger.logDev(`reel0 starts near win!`);
            EventHandler.dispatchEvent(new GameEvent(SpinReelEvent.REEL_TRY_NEAR_WIN, 0));
        }
    }

    public stopSpin(data:IReelStopSpinData, delay:number):number {
        if(this._nearWinReels[0] && this.reelId === 0) {
            const timePassed:number = (Date.now() - this._spinStartedTime) / 1000;
            delay = Math.max(0, delay - timePassed + (this.reelId>0?1:0));
        }
        this.resetNearWinState();
        return super.stopSpin(data, delay);
    }

    private resetNearWinState():void {
        this._spinStarted = false;
        this._gameDataParsed = false;
    }
}