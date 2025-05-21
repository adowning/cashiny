/**
 * Created by Jie Gao on 2020-02-17.
 */
import {NoWinSymbolsWinPresentationController} from "@nolimitcity/slot-game/bin/game/winpresentation/nowinsymbols/NoWinSymbolsWinPresentationController";
import {LeprechaunParsedGameData} from "../../server/data/LeprechaunParsedGameData";

export class LeprechaunNoWinPresentationController extends NoWinSymbolsWinPresentationController {

    constructor(indexes:[number, number]) {
        super(indexes, {noWinStateFadeInDuration : 0});
    }

    protected parseFeatureGameData(data:LeprechaunParsedGameData):void {
        super.parseFeatureGameData(data);

        if(data.bonusWin && this._symbolWinStates) {
            this._symbolWinStates[1][1] = true;
        }
    }

}