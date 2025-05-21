/**
 * Created by Jie Gao on 2018-11-07.
 */
import {BetLinesView, IBetLinesViewConfig} from "@nolimitcity/slot-game/bin/core/betline/BetLinesView";
import {BetLineNumber} from "@nolimitcity/slot-game/bin/core/betline/BetLineNumber";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {ServerEvent} from "@nolimitcity/slot-game/bin/core/server/event/ServerEvent";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {LeprechaunBetline} from "./LeprechaunBetline";
import {LeprechaunBetlineNumber} from "./LeprechaunBetlineNumber";
import {LeprechaunBetlineEvent} from "./LeprechaunBetlineEvent";
import {TimelineLite} from "gsap";
import {LeprechaunParsedInitData} from "../server/data/LeprechaunParsedInitData";
import {ScreenEvent} from "@nolimitcity/slot-game/bin/core/screen/event/ScreenEvent";
import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {LeprechaunParsedGameData} from "../server/data/LeprechaunParsedGameData";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";

export class LeprechaunBetlinesView extends BetLinesView {
    private readonly _ssNumberFactoryMethod:(index:number) => BetLineNumber;
    private readonly _ssLineFactoryMethod:(index:number, numberPosition:number[], betLineData:number[]) => LeprechaunBetline;
    private readonly _ssBetlineConfig:IBetLinesViewConfig;
    private _ssBetLinesData:number[][];
    private _isRestore:boolean = false;
    private _isFirstNormalSpin:boolean = false;
    private _pickedExtraLines:number[];

    constructor(config:IBetLinesViewConfig,
                numberFactoryMethod:(index:number) => BetLineNumber,
                lineFactoryMethod:(index:number, numberPosition:number[], betLineData:number[]) => LeprechaunBetline) {

        super(config, numberFactoryMethod, lineFactoryMethod);
        this._ssNumberFactoryMethod = numberFactoryMethod;
        this._ssLineFactoryMethod = lineFactoryMethod;
        this._ssBetlineConfig = config;
    }

    protected addEventListeners():void {
        EventHandler.addEventListener(this, ServerEvent.INIT_DATA_PARSED, (event:GameEvent) => this.parsedInitData(event.params[0]));
        EventHandler.addEventListener(this, ServerEvent.GAME_DATA_PARSED, (event:GameEvent) => this.parsedGameData(event.params[0]));
        EventHandler.addEventListener(this, LeprechaunBetlineEvent.SHOW_RAINBOW_NUMBER, (event:GameEvent) => this.onShowRainbowLineNumber(event.params[0]));
        EventHandler.addEventListener(this, ScreenEvent.GAME_READY, (event:GameEvent) => this.onGameReady());
    }

    private parsedGameData(data:LeprechaunParsedGameData):void {
        this._isFirstNormalSpin = (data.mode === GameMode.FREESPIN && data.nextMode === GameMode.NORMAL);
    }

    private parsedInitData(data:LeprechaunParsedInitData):void {
        this._ssBetLinesData = data.betLines.concat(data.betLines);
        if(this._ssBetLinesData.length != this._ssBetlineConfig.map.length) {
        debugger;
            throw new Error(`Error: There are only ${this._ssBetlineConfig.map.length} betLines in the config order while the server sends ${this._ssBetLinesData.length} lines.`);
        }

        this._dataInitialized = true;
        this._pickedExtraLines = data.addedLines;
        this.draw();

        if(data.isRestoreState && (data.pickedExtraLines > 0) && (data.mode === GameMode.FREESPIN)) {
            this._isRestore = true;
        }
    }

    public onGameReady():void {
        if(this._isRestore) {
            this._isRestore = false;
            let totalLines:number = ArrayHelper.arraySum(this._pickedExtraLines);
            this.onShowRainbowLineNumber(totalLines);
        }
    }

    private onShowRainbowLineNumber(pickedExtraLines:number):void {
        if(pickedExtraLines <= 0) {
            return;
        }
        if(this._betLineNumbers.length < 11) {
            for(let i:number = 0; i < 8; i++) {
                if(i < 4) {
                    const betLineNumber:BetLineNumber = this._ssNumberFactoryMethod(i + 6);
                    const betLineNumberPosition:number[] = betLineNumber.setPosition(10, i);
                    this._betLineNumbers.push(betLineNumber);
                    const betLine:LeprechaunBetline = this._ssLineFactoryMethod(i + 6, betLineNumberPosition, this._ssBetLinesData[i - 1]);
                    this._betLines.push(betLine);
                } else {
                    const betLineNumber:BetLineNumber = this._ssNumberFactoryMethod(i + 2);
                    const betLineNumberPosition:number[] = betLineNumber.setPosition(8, i);
                    this._betLineNumbers.push(betLineNumber);
                }
            }
        }
        const tl:TimelineLite = new TimelineLite();
        for(let j:number = 0; j < pickedExtraLines; j++) {
            tl.add(() => {
                (<LeprechaunBetlineNumber>this._betLineNumbers[10 + j]).animateShow();
                (<LeprechaunBetlineNumber>this._betLineNumbers[14 + j]).animateShow();
            }, 0);
            tl.add((<LeprechaunBetline>this._betLines[5 + j]).animateShow(), j * 0.4);
        }
    }

    protected draw():void {
        if(!this._resourcesLoaded || !this._dataInitialized) {
            return;
        }

        const map:number[] = this._ssBetlineConfig.map;
        const numNumbers:number = map.length;
        for(let i:number = 0; i < numNumbers; i++) {
            const betLineNumber:BetLineNumber = this._ssNumberFactoryMethod(map[i]);
            const betLineNumberPosition:number[] = betLineNumber.setPosition(this._ssBetLinesData.length, i);
            this._betLineNumbers.push(betLineNumber);
            if(i < 5) {
                const betLine:LeprechaunBetline = this._ssLineFactoryMethod(map[i], betLineNumberPosition, this._ssBetLinesData[map[i] - 1]);
                this._betLines.push(betLine);
            }
        }
    }
}