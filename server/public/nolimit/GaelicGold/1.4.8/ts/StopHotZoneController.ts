/**
 * Created by Jie Gao on 25/01/19.
 */
import {ReelStopPresentationController} from "@nolimitcity/slot-game/bin/core/reelstoppresentation/ReelStopPresentationController";
import {IReelStoppedData} from "@nolimitcity/slot-game/bin/core/reel/reel/ReelController";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";
import {LeprechaunGameModuleConfig} from "../LeprechaunGameModuleConfig";

export class StopHotZoneController extends ReelStopPresentationController {

    private _bonusFeatureTriggered:boolean = false;
    constructor(index:number) {
        super(index, "StopHotZoneController");
    }

    protected parseFeatureGameData(data:LeprechaunParsedGameData):void {
        this._bonusFeatureTriggered = data.bonusFeatureTriggered;
    }

    public onReelBounce(data:IReelStoppedData):void {
        if(!this.tryPlayBouncePresentation(data)) {
            this.dispatchCompleteEvent(data.reelId);
        }
    }

    private tryPlayBouncePresentation(data:IReelStoppedData):boolean {
        if(data.reelId === 1 && !this._bonusFeatureTriggered){
            LeprechaunGameModuleConfig.hotZone.hide(data.fastSpin || data.quickStop);
            this.dispatchCompleteEvent(data.reelId);
            return true;
        }
        return false;
    }
}
