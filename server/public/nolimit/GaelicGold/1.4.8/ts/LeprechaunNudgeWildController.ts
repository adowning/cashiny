/**
 * Created by Jie Gao on 2019-10-29.
 */
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {Reels} from "@nolimitcity/slot-game/bin/core/reel/reelarea/Reels";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {NudgeStackedSymbolWPController} from "@nolimitcity/slot-game/bin/game/winpresentation/nudge/NudgeStackedSymbolWPController";
import {TimelineLite} from "gsap";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";
import {LeprechaunReelSymbolWild} from "../../symbols/LeprechaunReelSymbolWild";
import {StateReelSymbol} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";

export class LeprechaunNudgeWildController extends NudgeStackedSymbolWPController {

    private _writeMultiplierTimelines:TimelineLite[];
    private _nudgeCompleted:boolean = true;
    private _writeMultiplierStates:boolean[];
    private _currentSoundId:number = 0;
    private _isAborted:boolean = false;
    private _nudgeSoundIndex:number[] = [0, 1, 0, 1, 0, 1];

    constructor(indexes:[number, number]) {
        super(indexes, {
            nudgeStepSpeed : 0.6,
            stackedSymbolKeyword : "W"
        });
    }

    protected startWinPresentation():void {
        this._isAborted = false;
        this._nudgeCompleted = false;
        this._currentSoundId = 0;
        super.startWinPresentation();
    }

    protected playNudgeStepStart(reelId:number, stepsLeft:number):void {
        this.playNudgeSounds(reelId, stepsLeft);
        const symbol:LeprechaunReelSymbolWild = <LeprechaunReelSymbolWild>Reels.getSymbol(reelId, this._nudgeSymbolId[reelId]);
        if(symbol) {
            symbol.changeState({
                state : LeprechaunGameConfig.instance.SYMBOL_STATES.nudge,
                setStack : true,
                fadeInDuration : 0.3
            });
        }
    }

    protected getNoWinNudgeSpeed():number {
        return 0.3;
    }

    private playNudgeSounds(reelId:number, stepsLeft:number) {
        if(Math.abs(this._steps[reelId]) >= 1 && !this._isAborted) {
            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.WILD_NUDGES[this._nudgeSoundIndex[this._currentSoundId++]]);
        }
    }

    protected playNudgeAbortSound():void {
        this._isAborted = true;
        this.stopAllNudgeSound();
        SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.NUDGE_ABORT);
    }

    private stopAllNudgeSound():void {
        SlotGame.sound.stopEffect(LeprechaunSoundConfig.instance.NUDGE_NO_WIN_2);
        SlotGame.sound.stopEffect(LeprechaunSoundConfig.instance.NUDGE_NO_WIN_1);
        SlotGame.sound.stopEffect(LeprechaunSoundConfig.instance.WILD_NUDGES[0]);
        SlotGame.sound.stopEffect(LeprechaunSoundConfig.instance.WILD_NUDGES[1]);
    }

    protected playOnNudgeStepComplete(reelId:number, stepsLeft:number):void {
        if(this.getReelNoWinNudge(reelId) && !this._isAborted) {
            //Add a bigger bounce for the last step in no win nudge.
            if(Math.abs(this._steps[reelId]) === 1) {
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.NUDGE_NO_WIN_1);
            } else if(Math.abs(stepsLeft) === 1) {
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.NUDGE_NO_WIN_2);
            }
        } else {
            const symbol:LeprechaunReelSymbolWild = <LeprechaunReelSymbolWild>Reels.getSymbol(reelId, this._nudgeSymbolId[reelId]);
            if(symbol) {
                symbol.playNudgeSparkles();
                symbol.updateMultiplier(Math.abs(this._nudgedSteps[reelId]) + 1, true);
            }
        }
    }

    protected playOnReelNudgeComplete(reelId:number, aborted:boolean):void {
        const symbol:LeprechaunReelSymbolWild = <LeprechaunReelSymbolWild>Reels.getSymbol(reelId, this._nudgeSymbolId[reelId]);
        if(symbol) {
            symbol.stopNudgeAnimation();
            if(this.getReelNoWinNudge(reelId)) {
                symbol.stack!.symbols.forEach((symbol:StateReelSymbol | null) => {
                    if (symbol){
                        (<LeprechaunReelSymbolWild>symbol).updateMultiplier(Math.abs(this._nudgedSteps[reelId]) + 1, false);
                        (<LeprechaunReelSymbolWild>symbol).playWriteOnWild().progress(1);
                    }
                });
            } else {
                const timeline:TimelineLite = new TimelineLite();
                timeline.add(() => {
                    symbol.playWriteOn();
                    this._writeMultiplierStates[reelId] = false;
                    this.checkComplete();
                });
                timeline.add(symbol.playWriteOnWild());
                timeline.timeScale(aborted ? 20 : 1);
                this._writeMultiplierTimelines.push(timeline);
                this._writeMultiplierStates[reelId] = true;
            }
        }
    }

    protected playOnAllNudgeComplete():void {
        this._nudgeCompleted = true;
        this.checkComplete();
    }

    protected checkComplete():void {
        if(!this._nudgeCompleted || this._writeMultiplierStates.some(state => state)) {
            return;
        }

        this.finish();
    }

    protected abortWinPresentation() {
        super.abortWinPresentation();
        this._isAborted = true;
        this._writeMultiplierTimelines.forEach((timeline:TimelineLite) => {
            if(timeline && timeline.isActive()) {
                timeline.timeScale(20);
            }
        });
        this._nudgeSymbolId.forEach((symbolId:number, reelId:number) => {
            if(symbolId === -1) {
                return;
            }
            const symbol:LeprechaunReelSymbolWild = <LeprechaunReelSymbolWild>Reels.getSymbol(reelId, symbolId);
            if(symbol) {
                symbol.stack!.symbols.forEach((symbol:StateReelSymbol | null) => {
                    (<LeprechaunReelSymbolWild>symbol).updateMultiplier(Math.abs(this._steps[reelId]) + 1, false);
                    (<LeprechaunReelSymbolWild>symbol).playWriteOnWild().progress(1);
                });
            }
        });
    }

    protected resetFeature():void {
        super.resetFeature();
        this._currentSoundId = 0;
        this._writeMultiplierTimelines = [];
        this._writeMultiplierStates = ArrayHelper.initArrayWithValues<boolean>(GameConfig.instance.REELS_NUM, () => false);
    }
}
