/**
 * Created by Ning Jiang on 3/20/2017.
 */

import {ParsedInitData} from "@nolimitcity/slot-game/bin/core/server/data/ParsedInitData";
import {LeprechaunServerDataParser} from "../LeprechaunServerDataParser";
import {ILeprechaunInitData} from "../ILeprechaunServerData";
import {IServerData} from "@nolimitcity/slot-game/bin/core/server/data/IServerData";
import {LeprechaunGameMode} from "../../gamemode/LeprechaunGameMode";
import {ILeprechaunParsedServerData} from "./ILeprechaunParsedServerData";
import {ICollectMeterConfig} from "../../picknclick/intro/LeprechaunPickNClick";
import {FeatureBuyTimesBetValue} from "@nolimitcity/slot-launcher/bin/plugins/apiplugin/bethandler/BetFeatureController";

export class LeprechaunParsedInitData extends ParsedInitData implements ILeprechaunParsedServerData {
    private readonly _accumulatedRoundWin:string;
    public get accumulatedRoundWin():string {
        return this._accumulatedRoundWin;
    }

    private readonly _featureBuyTimesBetValue:FeatureBuyTimesBetValue[];
    public get featureBuyTimesBetValue():FeatureBuyTimesBetValue[] {
        return this._featureBuyTimesBetValue;
    }

    private readonly _pickedIndexesBefore:boolean[];
    private readonly _playerSelection:number;
    private readonly _freespinMultiplier:number;
    private readonly _pickedExtraLines:number;
    private readonly _pickedExtraMultiplier:number;
    private readonly _pickedExtraSpins:number;
    private readonly _isRestoreSelectedAll:boolean;
    private readonly _addedLines:number[];
    private readonly _addedMultiplier:number[];
    private readonly _addedNumberOfFreespins:number[];
    private readonly _revealedBefore:string[];
    private readonly _possibleReveals:string[];
    private readonly _pickedData:ICollectMeterConfig;

    constructor(rawData:ILeprechaunInitData, dataParser:LeprechaunServerDataParser) {
        super(rawData, dataParser);
        this._pickedIndexesBefore = rawData.pickedIndexesBefore;
        this._playerSelection = rawData.playerSelection;
        this._pickedExtraLines = rawData.pickedExtraLines;
        this._pickedExtraMultiplier = rawData.pickedExtraMultiplier;
        this._pickedExtraSpins = rawData.pickedExtraSpins;
        this._isRestoreSelectedAll = rawData.mode === LeprechaunGameMode.FS_PICK && (rawData.nextMode === "FREESPIN");
        this._addedLines = rawData.addedLines;
        this._addedMultiplier = rawData.addedMultiplier;
        this._addedNumberOfFreespins = rawData.addedNumberOfFreespins;
        this._freespinMultiplier = rawData.freespinMultiplier;
        this._revealedBefore = rawData.revealedBefore;
        this._possibleReveals = rawData.possibleReveals;
        this._pickedData = {
            "EXTRA_LINES" : {value : rawData.addedLines, pickedNumber : rawData.pickedExtraLines},
            "EXTRA_MULTIPLIER" : {value : rawData.addedMultiplier, pickedNumber : rawData.pickedExtraMultiplier},
            "EXTRA_SPINS" : {value : rawData.addedNumberOfFreespins, pickedNumber : rawData.pickedExtraSpins}
        };
        this._featureBuyTimesBetValue = rawData.featureBuyTimesBetValue;
        this._accumulatedRoundWin = rawData.accumulatedRoundWin;
    }

    public get pickedData():ICollectMeterConfig {
        return this._pickedData
    }

    public get possibleReveals():string[] {
        return this._possibleReveals
    }

    public get revealedBefore():string[] {
        return this._revealedBefore;
    }

    public get freespinMultiplier():number {
        return this._freespinMultiplier;
    }

    public get addedNumberOfFreespins():number[] {
        return this._addedNumberOfFreespins;
    }

    public get addedMultiplier():number[] {
        return this._addedMultiplier;
    }

    public get addedLines():number[] {
        return this._addedLines;
    }

    public get isRestoreSelectedAll():boolean {
        return this._isRestoreSelectedAll;
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

    public get pickedIndexesBefore():boolean[] {
        return this._pickedIndexesBefore;
    }

    public get playerSelection():number {
        return this._playerSelection;
    }

    protected isFeatureTotalWin(rawData:IServerData):boolean {
        return this.mode === LeprechaunGameMode.FS_PICK;
    }

    protected isNextFeatureTotalWin(rawData:IServerData):boolean {
        return this.nextMode === LeprechaunGameMode.FS_PICK;
    }

}