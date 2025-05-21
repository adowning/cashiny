/**
 * Created by Jie Gao on 11/11/18.
 */
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {TimelineLite, Timeline} from "gsap";
import {IBetLineWinData} from "@nolimitcity/slot-game/bin/core/server/data/IServerData";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {BetLineEvent} from "@nolimitcity/slot-game/bin/core/betline/event/BetLineEvent";
import {BetLineWinIndividualWPController} from "@nolimitcity/slot-game/bin/game/winpresentation/individualwin/BetLineWinIndividualWPController";
import {IIndividualWinPresentationConfig} from "@nolimitcity/slot-game/bin/core/winpresentation/individualwin/IndividualWinPresentationController";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {LeprechaunBetlineEvent} from "../../betline/LeprechaunBetlineEvent";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";
import {StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {LeprechaunParsedGameData} from "../../server/data/LeprechaunParsedGameData";
import {Reels} from "@nolimitcity/slot-game/bin/core/reel/reelarea/Reels";
import {LeprechaunGameModuleConfig} from "../../LeprechaunGameModuleConfig";
import {StateReelSymbol} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";

export class LeprechaunBetLineWinIndividualWPController extends BetLineWinIndividualWPController {

    private _reelsNum:number = 3;
    private _symbolsNum:number = 3;
    private _symbolWinStates:boolean[][];
    private _totalWinText:PIXI.BitmapText;
    private _totalWin:number;

    constructor(config:IIndividualWinPresentationConfig, name:string = "BetLineIndividualWin", tweakEnabled?:boolean,) {
        super(config, name, tweakEnabled);
    }

    protected parseFeatureGameData(data:LeprechaunParsedGameData):void {
        this._totalWin = data.singleWin;
        this._symbolWinStates = ArrayHelper.initArrayWithValues<boolean[]>(this._reelsNum, () => {
            return ArrayHelper.initArrayWithValues<boolean>(this._symbolsNum, () => false)
        });

        (<IBetLineWinData[]>this._betWinsData!).forEach((betLineWinData:IBetLineWinData) => {
            for(let reelId:number = 0; reelId < betLineWinData.nrOfSymbols; reelId++) {
                const symbolId:number = betLineWinData.betLine[reelId];
                this._symbolWinStates[reelId][symbolId] = true;
            }
        });
    }

    protected startWinPresentation():void {
        super.startWinPresentation();
        if(!this._totalWinText){
            this.createTotalWinText();
        }
    }

    private createTotalWinText():void{
        this._totalWinText = new PIXI.BitmapText("0", {
            fontName : "NumbersWinCountUp",
            fontSize : 28
        });
        this._totalWinText.visible = false;
        StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.FOREGROUND.name).addChild(this._totalWinText);
    }

    protected getLineAnimation(betLineWinData:IBetLineWinData):Timeline {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add(() => {
            EventHandler.dispatchEvent(new GameEvent(BetLineEvent.HIDE_ALL_BET_LINES));
            if(betLineWinData.betLineIndex>4){
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.RAINBOW_LINES[this._currentIndex%2]);
            }
            EventHandler.dispatchEvent(new GameEvent(LeprechaunBetlineEvent.SHOW_WIN_BET_LINE_WINS, betLineWinData.betLineIndex + 1));
        });

        for(let i:number = 0; i < betLineWinData.nrOfSymbols; i++) {
            const symbol = Reels.getSymbol(i, betLineWinData.betLine[i]);
            if(symbol) {
                this.addSymbolWinAnimationToTimeline(betLineWinData, timeline, this._config.symbolTimeOffsetCalculator(timeline.totalDuration(), i, betLineWinData.betLine[i]), symbol, i, betLineWinData.betLine[i]);
                this._winSymbols.push(symbol);
            }
        }
        return timeline;
    }

    protected addSymbolWinAnimationToTimeline(betLineWinData:IBetLineWinData, timeline:Timeline, startTime:number, symbol:StateReelSymbol, reelId:number, symbolId:number):void {
        super.addSymbolWinAnimationToTimeline(betLineWinData,timeline,startTime,symbol,reelId,symbolId);
        timeline.add(LeprechaunGameModuleConfig.symbolWinAnimation.playIdleAnimation(reelId, symbolId, false), startTime);
    }

    protected stopWinPresentation(isAborted: boolean):void{
        super.stopWinPresentation(isAborted);
        if(!this._totalWinText){
            this.createTotalWinText();
        }
        this._totalWinText.visible = false;
        LeprechaunGameModuleConfig.symbolWinAnimation.resetWinAnimation();
    }
}