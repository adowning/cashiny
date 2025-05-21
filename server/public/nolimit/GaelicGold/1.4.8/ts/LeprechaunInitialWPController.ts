/**
 * Created by Ning Jiang on 10/10/2018.
 */

import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {IParsedStackedSymbolName, StateReelSymbol} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {IBetLineWinData} from "@nolimitcity/slot-game/bin/core/server/data/IServerData";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {SequentiallyBetLineInitialWPController} from "@nolimitcity/slot-game/bin/game/winpresentation/initial/sequentially/SequentiallyBetLineInitialWPController";
import {Timeline, TimelineLite} from "gsap";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";
import {LeprechaunGameModuleConfig} from "../../LeprechaunGameModuleConfig";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";
import {LeprechaunParsedGameData} from "../../server/data/LeprechaunParsedGameData";
import {LeprechaunInitialWinCountUp} from "./LeprechaunInitialWinCountUp";
import {LeprechaunInitialWPView} from "./LeprechaunInitialWPView";
import {Leprechaun} from "../../Leprechaun";

export class LeprechaunInitialWPController extends SequentiallyBetLineInitialWPController {

    private _reelsNum:number;
    private _symbolsNum:number;
    private _gameView:LeprechaunInitialWPView;
    private _hasStarted:boolean;
    private _winCountUp:LeprechaunInitialWinCountUp;
    private _symbolWinStates:boolean[][];

    constructor(indexes:[number, number]) {
        super(indexes);

        this._reelsNum = GameConfig.instance.REELS_NUM;
        this._symbolsNum = GameConfig.instance.SYMBOLS_NUM_IN_REEL[2];
        this._gameView = new LeprechaunInitialWPView();
        this._winCountUp = new LeprechaunInitialWinCountUp(LeprechaunGameConfig.instance.WIN_COUNTUP_BITMAP_STYLE);
        this._winCountUp.position.set(GameConfig.instance.REEL_AREA_WIDTH / 2 - 20, 360);
        StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.WIN_COUNT_UP.name).addChild(this._winCountUp);
    }

    protected hasWin():boolean {
        this._hasStarted = false;
        return this._gameData!.singleWin > 0;
    }

    protected parseFeatureGameData(data:LeprechaunParsedGameData):void {
        this._symbolWinStates = ArrayHelper.initArrayWithValues<boolean[]>(this._reelsNum, () => {
            return ArrayHelper.initArrayWithValues<boolean>(this._symbolsNum, () => false)
        });

        (<IBetLineWinData[]>this._betWinsData!).forEach((betLineWinData:IBetLineWinData) => {
            for(let reelId:number = 0; reelId < betLineWinData.nrOfSymbols; reelId++) {
                const symbolId:number = betLineWinData.betLine[reelId];
                this._symbolWinStates[reelId][symbolId] = true;

                if(GameConfig.instance.STACKED_SYMBOLS != null) {
                    // To mark all the stack win.
                    const parsedStackedSymbolName:IParsedStackedSymbolName = StateReelSymbol.parseStackedSymbolName(this._gameData!.reels[reelId][symbolId + GameConfig.instance.SYMBOLS_NUM_IN_REEL[1]], reelId);
                    if(parsedStackedSymbolName.isStacked) {
                        for(let i:number = 0; i < parsedStackedSymbolName.totalNum; i++) {
                            this._symbolWinStates[reelId][Math.min(GameConfig.instance.SYMBOLS_NUM_IN_REEL[2] - 1, Math.max(0, i - parsedStackedSymbolName.index + symbolId))] = true;
                        }
                    }
                }
            }
        });
        // #259
        LeprechaunGameConfig.instance.WIN_BELOW_STAKE = (Leprechaun.api.gameClientConfiguration.belowStakeWinRestriction && (data.singleWin <= data.playedBetValue));
    }

    protected startWinPresentation():void {
        this._hasStarted = true;
        super.startWinPresentation();
        // #259
        !LeprechaunGameConfig.instance.WIN_BELOW_STAKE && LeprechaunGameModuleConfig.soundPlayer.playNormalWinSound(this._gameData!.currentWinRatioConfig!);
    }

    protected addSymbolWinAnimationToTimeline(betLineWinData:IBetLineWinData, timeline:Timeline, startTime:number, symbol:StateReelSymbol, reelId:number, symbolId:number):number {
        const symbolAnimation:Timeline = symbol.changeState({
            state : GameConfig.instance.SYMBOL_STATES.win,
            fadeInDuration : 0.1
        })!;
        if (!LeprechaunGameConfig.instance.WIN_BELOW_STAKE) { // #259
            timeline.add(LeprechaunGameModuleConfig.symbolWinAnimation.playSymbolWinAnimation(reelId, symbolId), startTime);
        }
        timeline.add([
            symbolAnimation,
            () => {
                if (!LeprechaunGameConfig.instance.WIN_BELOW_STAKE) { // #259
                    const winSound: string | null = LeprechaunSoundConfig.instance.SYMBOL_WIN_HIT;
                    SlotGame.sound.playEffect(winSound);
                }
            }
        ], startTime);

        return this.getNextSymbolAnimationTimeOffset(symbolAnimation.totalDuration());
    }

    protected getNextSymbolAnimationTimeOffset(duration:number):number {
        // #259
        return LeprechaunGameConfig.instance.WIN_BELOW_STAKE ? 0 : 0.2;
    }

    protected getNextBetWinAnimationTimeOffset(lastSymbolDelay:number):number {
        return 0.3;
    }

    protected addWinCountUpToTimeline(timeline:Timeline):void {
        if(this._gameData!.isBigWin) {
            return;
        }

        const totalWin:number = this._gameData!.totalWin;
        const from:number = totalWin - this._gameData!.singleWin;
        const duration:number = this._gameData!.currentWinRatioConfig!.duration;

        const countUpTimeline:TimelineLite = new TimelineLite();
        const multiplier:number = (this._gameData!.mode === GameMode.FREESPIN) ? (<LeprechaunParsedGameData>this._gameData!).freespinMultiplier : this._gameData!.currentMultiplier;
        countUpTimeline.add(this._winCountUp.getCountUpAnimation(0, this._gameData!.singleWin, duration, multiplier));
        timeline.add([
            countUpTimeline,
            () => {
                if(duration > 1) {
                    this._gameView.playClovers((duration > 1.5) ? 1 : 0);
                }
            }
        ], 0);
        const delay:number = countUpTimeline.duration();
        timeline.add(() => SlotGame.winFieldController.showWinField(), delay);
    }

    protected stopWinPresentation(isAborted:boolean):void {
        if(isAborted && !this._hasStarted && !LeprechaunGameConfig.instance.WIN_BELOW_STAKE) { // #259
            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.COUNT_UP_ENDS);
        }
        LeprechaunGameModuleConfig.symbolWinAnimation.resetWinAnimation();
        this._winCountUp.abort(this._gameData!.singleWin, isAborted, this._gameData!.currentMultiplier, this._gameData!.isBigWin);
        if(!this._gameData!.isBigWin) {
            SlotGame.winFieldController.showWinField();
        }
        super.stopWinPresentation(isAborted);
    }
}