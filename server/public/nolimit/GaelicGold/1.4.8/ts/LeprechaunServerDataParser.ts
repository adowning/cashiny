/**
 * Created by Jie Gao on 3/20/2019.
 */

import {IBetWinData, IGameData} from "@nolimitcity/slot-game/bin/core/server/data/IServerData";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {ILeprechaunGameData} from "./ILeprechaunServerData";
import {SpinServerDataParser} from "@nolimitcity/slot-game/bin/game/reel/spinreel/SpinServerDataParser";
import {BetWinMode} from "@nolimitcity/slot-game/bin/core/gametype/BetWinMode";
import {ServerDataParser} from "@nolimitcity/slot-game/bin/core/server/ServerDataParser";
import {LeprechaunGameMode} from "../gamemode/LeprechaunGameMode";

export class LeprechaunServerDataParser extends SpinServerDataParser {

    constructor() {
        super();
    }

    public parseBetWins(rawData:IGameData):IBetWinData[] {
        switch(GameConfig.instance.BET_WIN_MODE) {
            case BetWinMode.BET_LINE:
                return this.parseBetLineData(rawData.betLineWins!);
            case BetWinMode.BET_WAY:
                return rawData.betWayWins!;
            default:
            debugger;
                throw new Error("ServerDataParser.parseBetWins(): Invalid BetWinMode from GameConfig!");
        }
    }

    private parseBetLineData(betLineWins:IBetWinData[]):IBetWinData[] {
        let temp:IBetWinData[] = [];
        betLineWins.forEach((betlineWin:IBetWinData) => {
            if(betlineWin.amount > 0) {
                temp.push(betlineWin);
            }
        });
        return temp;
    }

    public parseDoReelNudge(rawData:ILeprechaunGameData):boolean[] {
        return rawData.doReelNudge.concat();
    }

    public parseExtraSymbolsOnTop(rawData:ILeprechaunGameData, parsedSymbolNamesUnder:string[]):string[][] {
        if(rawData.mode === LeprechaunGameMode.FS_PICK){
            return rawData.extraSymbolsOnTop;
        }
        return ServerDataParser.parseStackedSymbolsInReels(rawData.extraSymbolsOnTop, parsedSymbolNamesUnder);

    }
}