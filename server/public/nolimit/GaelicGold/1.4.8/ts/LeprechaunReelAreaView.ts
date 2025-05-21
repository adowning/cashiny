/**
 * Created by Jie Gao on 2019-01-29.
 */
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {ReelAreaView} from "@nolimitcity/slot-game/bin/core/reel/reelarea/ReelAreaView";
import {Reels} from "@nolimitcity/slot-game/bin/core/reel/reelarea/Reels";
import {StateReelSymbol} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {ResourcesGroupName} from "@nolimitcity/slot-game/bin/core/resource/ResourcesGroupName";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {Elastic, TimelineLite, TweenLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {LeprechaunGameModuleConfig} from "../LeprechaunGameModuleConfig";
import {LeprechaunSoundConfig} from "../LeprechaunSoundConfig";

export class LeprechaunReelAreaView extends ReelAreaView {

    constructor(resourcesGroup?:ResourcesGroupName) {
        super(resourcesGroup);
    }

    public liftReelUp(reelView:PIXI.Container, startPos:number):void {
        const position = LeprechaunGameConfig.instance.REEL_DISPLAY_POSITIONS[1];
        const symHeight:number = LeprechaunGameConfig.instance.SYMBOL_HEIGHT;
        TweenLite.to(reelView, <number>GameConfig.instance.REEL_NEAR_WIN_SPIN_SPEED * 3, {y : position[1] - symHeight - startPos * symHeight});
    }

    public onSlowMotionStop(reelView:PIXI.Container, startPos:number, upwards:boolean):TimelineLite {
        const tl:TimelineLite = new TimelineLite();
        const stepDuration:number = 2.4;
        const endDuration:number = 0.6;
        const position = LeprechaunGameConfig.instance.REEL_DISPLAY_POSITIONS[1];
        const symHeight:number = LeprechaunGameConfig.instance.SYMBOL_HEIGHT;
        const sym:StateReelSymbol = Reels.getSymbol(1, startPos + 1)!;
        tl.add(() => {
            //LeprechaunGameModuleConfig.nearwinBackground.play(1);
            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.ANTICIPATION_BONUS);
        });
        tl.add(TweenLite.to(reelView, stepDuration, {y : position[1] + ((upwards ? -0.5 : 0.5) * symHeight)}));
        tl.add(TweenLite.to(reelView, 2, {y : position[1] + ((upwards ? -0.5 : 0.5) * symHeight)}));
        tl.add([
            sym.changeState({
                state : LeprechaunGameConfig.instance.SYMBOL_STATES.landing,
                fadeInDuration : 0,
                onCompleteCallback : () => {
                    sym.changeState({state : GameConfig.instance.SYMBOL_STATES.normal});
                }
            }),
            () => {
                if(Reels.getSymbol(1, 1)!.symName === "B") {
                    SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_WIN);
                    SlotGame.sound.fadeAmbience(0, 50);
                    SlotGame.sound.playAmbience(LeprechaunSoundConfig.instance.BONUS_GAME_AMBIANCE);
                    SlotGame.sound.fadeAmbience(1, 50);
                    LeprechaunGameModuleConfig.bonusWinEffect.playAnimation();
                } else {
                    SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_FAIL);
                    LeprechaunGameModuleConfig.hotZone.hide(true);
                    LeprechaunGameModuleConfig.hotZone.stopHotZoneWinStar();
                }
            },
            TweenLite.to(reelView, endDuration, {y : position[1], ease : Elastic.easeOut})
        ]);
        return tl;
    }
}