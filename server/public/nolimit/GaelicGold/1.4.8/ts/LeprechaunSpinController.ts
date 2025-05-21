/**
 * Created by Jie Gao on 2018-11-14.
 */
import {SpinController} from "@nolimitcity/slot-game/bin/core/spin/SpinController";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";

export class LeprechaunSpinController extends SpinController {
    private _nearWinReels:boolean[] = [false, false, false];

    constructor() {
        super();
    }

    protected parseGameData(data:LeprechaunParsedGameData):void {
        this._nearWinReels = [false, false, false];
        if(data.nearWinReels){
            this._nearWinReels = data.nearWinReels;
        }
    }

    protected getSpinTime():number {
        if(this._nearWinReels[0]) {
            return Math.max(0.1, SpinController.MIN_SPIN_TIME);
        } else {
            return super.getSpinTime();
        }
    }
}