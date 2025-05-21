/**
 * Created by Ning Jiang on 3/20/2017.
 */

import {LeprechaunServerDataParser} from "../LeprechaunServerDataParser";
import {LeprechaunGameMode} from "../../gamemode/LeprechaunGameMode";
import {INudgeParsedGameData} from "@nolimitcity/slot-game/bin/game/reel/nudgereel/NudgeParsedGameData";
import {IServerData} from "@nolimitcity/slot-game/bin/core/server/data/IServerData";
import {SpinParsedGameData} from "@nolimitcity/slot-game/bin/game/reel/spinreel/SpinParsedServerData";
import {ILeprechaunParsedServerData} from "./ILeprechaunParsedServerData";
import {ILeprechaunGameData} from "../ILeprechaunServerData";
import {ICollectMeterConfig} from "../../picknclick/intro/LeprechaunPickNClick";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";

export class LeprechaunParsedGameData extends SpinParsedGameData implements ILeprechaunParsedServerData, INudgeParsedGameData {

    private readonly _bonusFeatureTriggered:boolean;
    private readonly _bonusWin:boolean;
    private readonly _playerSelection:number;
    private readonly _freespinMultiplier:number;
    private readonly _doReelNudge:boolean[];
    private readonly _pickedIndexesAfter:boolean[];
    private readonly _pickedIndexesBefore:boolean[];
    private readonly _extraSymbolsOnTop:string[][];
    private readonly _revealedBefore:string[];
    private readonly _possibleReveals:string[];
    private readonly _thisRevealedPicked:string;
    private readonly _pickedExtraLines:number;
    private readonly _pickedExtraMultiplier:number;
    private readonly _pickedExtraSpins:number;
    private readonly _addedLines:number[];
    private readonly _addedMultiplier:number[];
    private readonly _addedNumberOfFreespins:number[];
    private readonly _multiplierOnReel:number[];
    private readonly _pickedData:ICollectMeterConfig;

    private readonly _accumulatedRoundWin:string;
    public get accumulatedRoundWin():string {
        return this._accumulatedRoundWin;
    }

    constructor(rawData:ILeprechaunGameData, dataParser:LeprechaunServerDataParser) {
        super(rawData, dataParser);
        this._doReelNudge = dataParser.parseDoReelNudge(rawData);
        this._extraSymbolsOnTop = dataParser.parseExtraSymbolsOnTop(rawData, ArrayHelper.initArrayWithValues(GameConfig.instance.REELS_NUM, index => this.reels[index][0]));
        this._bonusWin = rawData.bonusFeatureTriggered;
        this._bonusFeatureTriggered = rawData.reels[1].indexOf("B") > 1 && rawData.reels[1].indexOf("B") < 5;
        this._playerSelection = rawData.playerSelection;
        this._pickedIndexesAfter = rawData.pickedIndexesAfter;
        this._pickedIndexesBefore = rawData.pickedIndexesBefore;
        this._revealedBefore = rawData.revealedBefore;
        this._possibleReveals = rawData.possibleReveals;
        this._thisRevealedPicked = rawData.thisRevealedPicked;
        this._pickedExtraLines = rawData.pickedExtraLines;
        this._pickedExtraMultiplier = rawData.pickedExtraMultiplier;
        this._pickedExtraSpins = rawData.pickedExtraSpins;
        this._addedLines = rawData.addedLines;
        this._addedMultiplier = rawData.addedMultiplier;
        this._freespinMultiplier = rawData.freespinMultiplier;
        this._addedNumberOfFreespins = rawData.addedNumberOfFreespins;
        this._multiplierOnReel = rawData.multiplierOnReel;
        this._pickedData = {
            "EXTRA_LINES" : {value : rawData.addedLines, pickedNumber : rawData.pickedExtraLines},
            "EXTRA_MULTIPLIER" : {value : rawData.addedMultiplier, pickedNumber : rawData.pickedExtraMultiplier},
            "EXTRA_SPINS" : {value : rawData.addedNumberOfFreespins, pickedNumber : rawData.pickedExtraSpins}
        }
        this._accumulatedRoundWin = rawData.accumulatedRoundWin;
    }

    public get pickedData():ICollectMeterConfig {
        return this._pickedData
    }

    public get freespinMultiplier():number {
        return this._freespinMultiplier;
    }

    public get pickedExtraLines():number {
        return this._pickedExtraLines;
    }

    public get pickedExtraMultiplier():number {
        return this._pickedExtraMultiplier;
    }

    public get pickedExtraSpins():number {
        return this._pickedExtraSpins;
    }

    public get possibleReveals():string[] {
        return this._possibleReveals;
    }

    public get pickedIndexesAfter():boolean[] {
        return this._pickedIndexesAfter;
    }

    public get thisRevealedPicked():string {
        return this._thisRevealedPicked;
    }

    public get pickedIndexesBefore():boolean[] {
        return this._pickedIndexesBefore;
    }

    public get extraSymbolsOnTop():string[][] {
        return this._extraSymbolsOnTop;
    }

    public get bonusFeatureTriggered():boolean {
        return this._bonusFeatureTriggered;
    }

    public get doReelNudge():boolean[] {
        return this._doReelNudge;
    }

    public get bonusWin():boolean {
        return this._bonusWin;
    }

    public get playerSelection():number {
        return this._playerSelection;
    }

    public get multiplierOnReel():number[] {
        return this._multiplierOnReel;
    }

    protected isFeatureTotalWin(rawData:IServerData):boolean {
        return this.mode === LeprechaunGameMode.FS_PICK;
    }

    protected isNextFeatureTotalWin(rawData:IServerData):boolean {
        return this.nextMode === LeprechaunGameMode.FS_PICK;
    }

}