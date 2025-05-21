/**
 * Created by Ning Jiang on 11/24/2016.
 */

import {ISoundConfig} from "@nolimitcity/slot-game/bin/core/resource/sound/ISoundConfig";

export class LeprechaunSoundConfig implements ISoundConfig {

    public static instance:LeprechaunSoundConfig = new LeprechaunSoundConfig();
    AS_WIN:string="asWin";
    AS_WIN_BIG:string="asWinBig";
    MAIN_GAME_AMBIANCE:string = "background-music-main";
    FREE_SPIN_AMBIANCE:string = "background-music-bonus";
    BONUS_GAME_AMBIANCE:string = "background-music-pick";
    REELS_SPINNING_START_ON_SPIN_START:string = "wheels-spinning";
    REELS_DEFAULT_BOUNCE:string[] = ["reel-one-landing", "reel-one-landing", "reel-one-landing"];

    WIN_BIG:string = "bigwin";
    WIN_BIG_END:string[] = ["bigwinEnds1", "bigwinEnds1", "bigwinEnds1"];

    COUNT_UP:string = "countup";
    COUNT_UP_ENDS:string = "countupEnds";
    SYMBOL_WIN_HIT:string = "winHit";
    NUDGE_START:string = "wildLanding";
    NUDGE_NO_WIN_1:string = "wildNudgeNoWin1";
    NUDGE_NO_WIN_2:string = "wildNudgeNoWin2";
    NUDGE_ABORT:string = "wildNudgeAbort";
    WILD_NUDGES:string[] = ["wildNudge1", "wildNudge2"];
    ANTICIPATION:string = "anticipation";
    ANTICIPATION_BONUS:string = "anticipation2";
    BONUS_COLLECTS:string[] = ["bonusCollectsToPosition1", "bonusCollectsToPosition2"];
    RAINBOW_LINES:string[] = ["rainbow1", "rainbow2"];
    BONUS_WIN:string = "bonusWin";
    BONUS_FAIL:string = "bonusFail";
    BONUS_STAR_OUT2:string = "bonusStarsOut2";
    BONUS_STAR_IN:string = "bonusStarsIn";
    BONUS_STAR_PICK:string = "bonusStarPick";
    BONUS_STAR_END:string = "bonusStarToCenter";
    BONUS_STAR_PICK_EXPAND:string = "bonusStarPickExpand";
    BONUS_PLING:string[] = ["bonusPling1", "bonusPling2"];
    BONUS_START:string = "bonusContinue";
    BONUS_END_SWEEEP:string = "bonusEndsSweep";
    BONUS_END:string = "bonusEnds";
    static TINY_WIN:string = "winTiny";
    static SMALL_WIN:string = "winSmall";
    static MEDIUM_WIN:string = "winMedium";
    static LARGE_WIN:string = "winLarge";
    static BIG_WIN_START:string = "bigwinInitialWin";
    constructor() {
        if(LeprechaunSoundConfig.instance) {
            throw new Error("LeprechaunSoundConfig.constructor() - Instantiation failed: Singleton.");
        }
    }
}