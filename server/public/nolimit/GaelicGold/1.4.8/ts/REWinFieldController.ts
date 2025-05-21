import {WinFieldController} from "@nolimitcity/slot-game/bin/core/winpresentation/WinFieldController";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {LeprechaunGameModuleConfig} from "../LeprechaunGameModuleConfig";

export class REWinFieldController extends WinFieldController {
    public showWinField(to?:number, forceWin:boolean = false, forceTotalWin:boolean = false):void {
        if(this.shouldShow()) {
            to = to != null ? to : this._totalWin;

            if(!forceWin && (forceTotalWin || this._shouldShowTotalWin || this._shouldNextShowTotalWin)) {
                SlotGame.keypad.setWin(to, true, LeprechaunGameModuleConfig.featurePrice.isWinBelowStake());
                return;
            }
            SlotGame.keypad.setWin(to);
        }
    }
}