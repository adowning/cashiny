/**
 * Created by Jie Gao on 2018-11-02.
 */

import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {StepCountUpBigWinController} from "@nolimitcity/slot-game/bin/game/winpresentation/bigwin/stepcountup/StepCountUpBigWinController";
import {Timeline, TimelineLite} from "gsap";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";
import {LeprechaunBigWinCountUp} from "./LeprechaunBigWinCountUp";
import {LeprechaunBigWinView} from "./LeprechaunBigWinView";

export class LeprechaunBigWinController extends StepCountUpBigWinController {

    private _gameView:LeprechaunBigWinView;
    private _isEnding:boolean = false;
    private _winCountUp:LeprechaunBigWinCountUp; // If you need to put more big win gfx on top of the count up, move the countUp to bigWinView.
    private _winCountUpTimeline:TimelineLite | null; // If you need to put more big win gfx on top of the count up, move the countUp to bigWinView.

    constructor(indexes:[number, number]) {
        super(indexes, {skipLastLevelCountUpIfSmall : false, skippableOnEachLevel:false});

        this._gameView = new LeprechaunBigWinView();
        this._winCountUp = new LeprechaunBigWinCountUp();
        this._winCountUp.position.set(360, 450);
        StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.WIN_COUNT_UP.name).addChild(this._winCountUp);
    }

    protected playBigWinSound():void {
        SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.WIN_BIG);
        SlotGame.sound.fadeAmbience(0, 1000);
    }

    protected playBigWinCountUp(level:number, duration:number):Timeline | null {
        const timeline:TimelineLite = new TimelineLite();
        if(level === 0) {
            this._winCountUpTimeline = new TimelineLite({paused : true});
            let i:number = 0;

            let duration:number = 0;
            while(i <= this._winLevel) {
                duration += this._winRatios[i].duration;
                i++;
            }
            this._winCountUpTimeline.add(this.playCountUp(0, this._gameData!.singleWin, duration));
            this._winCountUpTimeline.play(0);
        }
        return timeline;
    }

    protected getBigWinLevelAnimation(level:number):Timeline {
        const timeline:TimelineLite = new TimelineLite();
        timeline.add(this._gameView.getBigWinLevelAnimation(level, this._winRatios[level]));
        if(level === this._winLevel) {
            timeline.add([
                this._gameView.playEndingAnimation(this._winLevel, this._winCountUp, this._gameData!.totalWin),
                () => {
                    this._isEnding = true;
                    SlotGame.sound.fadeAmbience(1, 2000);
                    SlotGame.sound.stopEffect(LeprechaunSoundConfig.instance.WIN_BIG);
                    SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.WIN_BIG_END[this._winLevel]);
                }]);
        }
        return timeline;
    }

    protected playCountUp(from:number, to:number, duration:number, preTotalWin:number = 0):Timeline | null {
        return this._winCountUp.getCountUpAnimation(from, to, duration);
    }

    protected playEndingAnimation(isAborted:boolean):void {
        if(this._winCountUpTimeline) {
            if(this._winCountUpTimeline.isActive()) {
                this._winCountUpTimeline.pause();
            }
            this._winCountUpTimeline = null;
        }
        this._winCountUp.abort(this._gameData!.singleWin, isAborted);
        SlotGame.winFieldController.showWinField(this._gameData!.totalWin);
        if(isAborted) {
            if(!this._isEnding) {
                SlotGame.sound.fadeAmbience(1, 2000);
                SlotGame.sound.stopEffect(LeprechaunSoundConfig.instance.WIN_BIG);
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.WIN_BIG_END[this._winLevel]);
            }
            this._gameView.playAbortedEndingAnimation(this._winLevel);
        }
        this._isEnding = false;
    }

    protected stopAllSounds():void {}
}