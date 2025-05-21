/**
 * Created by Jie Gao on 11/23/2018.
 */

import {IGameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/IGameConfig";
import {BetWinMode} from "@nolimitcity/slot-game/bin/core/gametype/BetWinMode";
import {SpinMode} from "@nolimitcity/slot-game/bin/core/gametype/SpinMode";
import {IStackedReelSymbolsConfig} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {LayerScaleOption} from "@nolimitcity/slot-game/bin/core/stage/LayerScaleOption";
import {BitmapTextStyleOptions} from "@nolimitcity/slot-game/bin/core/text/BitmapTextStyleOptions";
import {IDeviceDependentConfig} from "@nolimitcity/slot-game/bin/core/useragent/UserAgent";
import {IWinRatios, WinRatioType} from "@nolimitcity/slot-game/bin/core/winpresentation/WinRatio";
import {Back, Ease} from "gsap";
import {LeprechaunGameAssets} from "./LeprechaunGameAssets";
import {ILeprechaunLayerConfig} from "./stage/ILeprechaunLayerConfig";
import {ILeprechaunSymbolStates} from "./symbols/LeprechaunReelSymbol";

export class LeprechaunGameConfig implements IGameConfig {

    public static instance:LeprechaunGameConfig = new LeprechaunGameConfig();

    BROWSER_FPS:number = 30;

    GAME_WIDTH:number = 1280;
    GAME_HEIGHT:number = 720;

    DEFAULT_LAYER_SCALE_OPTION:IDeviceDependentConfig<LayerScaleOption> = {
        desktop : {landscape : LayerScaleOption.FIT_WINDOW},
        mobile : {
            landscape : LayerScaleOption.FIT_WINDOW,
            portrait : LayerScaleOption.REELS_FIT_WINDOW
        }
    };

    LAYERS:ILeprechaunLayerConfig = {
        BACKGROUND : {name : "background"},
        BACKGROUND_ELEMENTS : {name : "backgroundElements"},
        BACKGROUND_ANIMATION : {name : "backgroundAnimation"},
        REEL_BACKGROUND : {name : "reelBackground"},
        HOTZONE : {name : "hotzone"},
        SYMBOLS : {name : "symbols"},
        REEL_FRAME : {name : "reelFrame"},
        LOGO : {name : "logo"},
        SYMBOL_BACKGROUND : {name : "symbolBackground"},
        REEL_ATTENTION : {name : "reelAttention"},
        SYMBOL_WIN_ANIMATION : {name : "symbolWinAnimation"},
        BET_LINES : {name : "betLines"},
        BET_LINE_NUMBERS : {name : "betline_Numbers"},
        WIN_PRESENTATIONS : {name : "winPresentations"},
        FOREGROUND : {name : "foreground"},
        MULTIPLIER : {name : "multiplier"},
        BIG_WIN_FOUNTAIN : {name : "bigWinFountain"},
        BIG_WIN : {name : "bigWin"},
        WIN_COUNT_UP : {name : "winCountUp"},
        FREESPIN_INTRO : {name : "freespinIntro"},
        INTRO : {name : "introScreen"},
        TWEAK_MODULE : {name : "tweakModule"}
    };

    BET_WIN_MODE:BetWinMode = BetWinMode.BET_LINE;
    SPIN_MODE:SpinMode = SpinMode.SPIN;

    REEL_AREA_POS_X:number = 0;
    REEL_AREA_POS_Y:number = 120;
    REEL_AREA_WIDTH:number = 760;
    REEL_AREA_HEIGHT:number = 526;

    SYMBOL_STATES:ILeprechaunSymbolStates = {
        normal : {
            prio : 0,
            keyword : "normal",
            texturesCreator : (symName:string, stateKey:string) => {
                return LeprechaunGameAssets.getSymbolStateTextures(symName);
            },
            fpsGetter : (symName, stateKey) => 15,
            offsetGetter : (symName, stateKey) => ((symName.indexOf("B") > -1) ? [-4, -26] : [0, 0])
        },
        nudge : {
            prio : 1,
            keyword : "nudge",
            symbols : ["W"],
            texturesCreator : (symName:string, stateKey:string) => {
                return GameResources.getTextures(symName);
            }
        },
        floating : {
            prio : 2,
            keyword : "floating",
            symbols : ["B"],
            texturesCreator : (symName:string, stateKey:string) => {
                return GameResources.getTextures("bonusFloating");
            },
            fpsGetter : (symName, stateKey) => 15,
            offsetGetter : (symName, stateKey) => [-4, -26]
        },
        landing : {
            prio : 3,
            keyword : "landing",
            symbols : ["B"],
            texturesCreator : (symName:string, stateKey:string) => {
                return GameResources.getTextures("bonusLand");
            },
            fpsGetter : (symName, stateKey) => 15,
            offsetGetter : (symName, stateKey) => [-4, -26]
        },
        idle : {
            prio : 4,
            keyword : "idle",
            texturesCreator : (symName:string, stateKey:string) => {
                return LeprechaunGameAssets.getSymbolStateTextures(symName);
            },
            fpsGetter : (symName, stateKey) => 15,
            offsetGetter : (symName, stateKey) => ((symName.indexOf("B") > -1) ? [-4, -26] : [0, 0])
        },
        spin : {
            prio : 5,
            keyword : "spin",
            texturesCreator : (symName:string, stateKey:string) => {
                return LeprechaunGameAssets.getSymbolStateTextures(symName, stateKey);
            }
        },

        noWin : {
            prio : 6,
            keyword : "noWin",
            texturesCreator : (symName:string, stateKey:string) => {
                return LeprechaunGameAssets.getSymbolStateTextures(symName);
            },
            offsetGetter : (symName, stateKey) => ((symName.indexOf("B") > -1) ? [-4, -26] : [0, 0])
        },
        win : {
            prio : 7,
            keyword : "win",
            texturesCreator : (symName:string, stateKey:string) => {
                return LeprechaunGameAssets.getSymbolStateTextures(symName, stateKey);
            },
            offsetGetter : (symName, stateKey) => ((symName.indexOf("B") > -1) ? [-4, -26] : [0, 0])
        },
        hidden : {
            prio : 8,
            keyword : "hidden"
        }
    };
    STACKED_SYMBOLS:IStackedReelSymbolsConfig = {
        "W" : {
            totalNum : [3, 3, 3],
            reels : [0, 1, 2]
        }
    };
    SYMBOL_WIDTH:number = 196;
    SYMBOL_HEIGHT:number = 168;
    SYMBOL_BOTTOM_PADDING:number = 6;

    REELS_NUM:number = 3;
    SPACE_BETWEEN_REELS:number = 10;
    REEL_DISPLAY_POSITIONS:[number, number][] = [
        [60 + this.SYMBOL_WIDTH * 0.5, 0],
        [60 + this.SYMBOL_WIDTH * 1.5 + this.SPACE_BETWEEN_REELS, 0],
        [60 + this.SYMBOL_WIDTH * 2.5 + this.SPACE_BETWEEN_REELS * 2, 0]];
    SYMBOLS_NUM_IN_REEL:[number, number, number, number, number] = [2, 2, 3, 2, 2];


    REEL_SPIN_TIME:number = 0.9;
    REEL_FAST_SPIN_SPIN_TIME:number = 0.1;
    MIN_STOPPING_TIME:number = 1.3;

    REEL_SPIN_START_SYMBOL_CHANGE_TO_SPIN_STATE_DURATION:number = 0.15;
    REEL_SPIN_START_SYMBOL_CHANGE_TO_SPIN_STATE_DELAY:number = 0.25;
    REEL_SPIN_START_EASE:Ease = Back.easeIn.config(4);
    REEL_SPIN_STOP_SYMBOL_CHANGE_FROM_SPIN_STATE_DURATION:number = 0.05;
    REEL_SPIN_STOP_SYMBOL_CHANGE_FROM_SPIN_STATE_DELAY:number = 0;
    REEL_SPIN_STOP_ELASTIC_CONFIG:[number, number] = [1.5, 0.95];
    REEL_SPIN_QUICK_STOP_ELASTIC_CONFIG:[number, number] = [1.2, 0.75];

    REEL_SPIN_START_SPEED:number = 0.3;
    REEL_SPIN_SPIN_SPEED:number = 0.03;
    REEL_NEAR_WIN_SPIN_SPEED:number = 0.03;
    REEL_SPIN_STOP_SPEED:number = 0.2;
    REEL_SPIN_QUICK_STOP_SPEED:number = 0.3;

    REEL_STOP_DELAY:number = 0.3;
    REEL_QUICK_STOP_DELAY:number = 0;
    REEL_NEAR_WIN_STOP_DELAY:number = 2.0;

    REEL_SETS:any = {
        "BASE_REELSET" : [
            ["L1", "L1", "L1", "M1", "M3", "L2", "M2", "M4", "L3", "L4", "M2", "L1", "M3", "L4", "L1", "L2", "M4", "L1", "L2", "M5",
                "L3", "L3", "L3", "M3", "L1", "M3", "L2", "M2", "M5", "L4", "M4", "M4", "M4", "M5", "M2", "L2", "L1", "M4", "L4", "L3",
                "L2", "L2", "L2", "L1", "M1", "L1", "L2", "M4", "M3", "M1", "M2", "M2", "M2", "L2", "M5", "M4", "L1", "L2", "M2", "M1",
                "L4", "L4", "L4", "L3", "L1", "M3", "L2", "M4", "M3", "L2", "M5", "M5", "M5", "L4", "M4", "L2", "L1", "L3", "L4", "M3",
                "M1", "M1", "M1", "L1", "M4", "L1", "M5", "L2", "L4", "L1", "M3", "M3", "M3", "L2", "M4", "L3", "L1", "L2", "M1", "L4",
                "W", "W", "W", "L1", "L1", "L1", "M1", "M3", "L2", "M2", "M4", "L3", "L4", "M2", "L1", "M3", "L4", "L1", "L2", "M4",
                "L1", "L2", "M5", "L3", "L3", "L3", "M3", "L1", "M3", "L2", "M2", "M5", "L4", "M4", "M4", "M4", "M5", "M2", "L2", "L1",
                "M4", "L4", "L3", "L2", "L2", "L2", "L1", "M1", "L1", "L2", "M4", "M3", "M1", "M2", "M2", "M2", "L2", "M5", "M4", "L1",
                "L2", "M2", "M1", "L4", "L4", "L4", "L3", "L1", "M3", "L2", "M4", "M3", "L2", "M5", "M5", "M5", "L4", "M4", "L2", "L1",
                "L3", "L4", "M3", "M1", "M1", "M1", "L1", "M4", "L1", "M5", "L2", "L4", "L1", "M3", "M3", "M3", "L2", "M4", "L3", "L1",
                "L2", "M1", "L4"],
            ["M3", "L4", "M2", "L1", "L3", "L2", "M5", "L4", "M1", "L3", "B", "M4", "L1", "M5", "M1", "L2", "L3", "M4", "M2", "L3",
                "M3", "L1", "L3", "L2", "M4", "L4", "L1", "L2", "L4", "L3", "L1", "L1", "L1", "M4", "L4", "M3", "L2", "L4", "M4", "L1",
                "M1", "M3", "L2", "M3", "L1", "M1", "L2", "L4", "L3", "M4", "M1", "M1", "M1", "L1", "L4", "M5", "L3", "L2", "M4", "L3",
                "L4", "L4", "L4", "M2", "M3", "M4", "L2", "M5", "M3", "L1", "M2", "M5", "L2", "L3", "M5", "M4", "L1", "M5", "L2", "L3",
                "W", "W", "W", "L1", "M3", "L2", "M4", "M3", "L3", "L2", "M5", "M4", "L3", "L2", "L2", "L2", "M1", "M4", "L1", "M3",
                "M5", "L3", "L4", "L1", "M3", "M5", "L2", "M3", "M2", "L3", "L2", "M3", "M4", "M2", "M2", "M2", "L3", "M2", "L1", "L2",
                "M1", "L3", "M4", "L1", "M3", "L2", "L4", "L3", "M1", "L1", "M4", "M3", "M5", "M5", "M5", "M2", "L4", "L2", "M3", "M5",
                "L1", "L4", "M3", "M2", "L3", "L1", "M4", "L3", "M1", "L2", "M4", "M3", "L3", "M1", "L2", "L4", "M4", "L3", "L1", "M3",
                "M4", "L3", "L1", "M5", "M4", "L1", "L2", "M3", "M4", "L3", "L1", "M2", "M3", "M3", "M3", "M1", "L1", "M5", "L2", "L3",
                "M4", "M3", "M2", "L1", "M4", "L1", "M3", "L2", "L4", "M5", "M3", "L2", "B", "M4", "L3", "M3", "M2", "L1", "L2", "M5",
                "M1", "M3", "L3", "L3", "L3", "M4", "M2", "L3", "L2", "M4", "M3", "L1", "L3", "M1", "M2", "M3", "L2", "L4", "M4", "L1",
                "M5", "L3", "M4", "M4", "M4", "L1", "M2", "M3", "L4", "M4", "L2", "L3", "L3", "M2", "M4", "L1", "M5", "L2", "L1", "M5",
                "L3", "M1", "M4", "M3", "L2", "L4", "M4", "L1", "M4", "L2", "M3", "L1", "W", "W", "W", "M3", "L4", "M2", "L1", "L3",
                "L2", "M5", "L4", "M1", "L3", "M4", "L1", "M5", "M1", "L2", "L3", "M4", "M2", "L3", "M3", "L1", "L3", "L2", "M4", "L3",
                "L1", "L2", "L4", "L3", "L1", "L1", "L1", "M4", "M4", "M3", "L2", "L4", "M4", "L1", "M1", "M3", "L2", "M3", "L1", "M1",
                "L2", "L4", "L3", "M4", "M1", "M1", "M1", "L1", "L4", "M5", "L3", "L2", "M4", "L3", "L4", "L4", "L4", "M2", "M3", "M4",
                "L2", "M5", "M3", "L1", "M2", "M5", "L2", "L3", "M5", "M4", "L1", "M5", "L2", "L3", "L1", "M3", "L2", "M4", "M3", "L3",
                "L2", "M5", "M4", "L3", "L2", "L2", "L2", "M1", "M4", "L1", "M3", "M5", "L3", "L4", "L1", "M3", "M5", "L2", "M3", "M2",
                "L3", "L2", "M3", "M4", "M2", "M2", "M2", "L3", "M2", "L1", "L2", "M1", "L3", "M4", "L1", "M3", "L2", "L4", "L3", "M1",
                "L1", "M4", "M3", "M5", "M5", "M5", "M2", "L4", "L2", "M3", "M5", "L1", "L4", "M3", "M2", "L3", "L1", "M4", "L3", "M1",
                "L2", "M4", "M3", "L3", "M1", "L2", "L4", "M4", "L3", "L1", "M3", "M4", "L3", "L1", "M5", "M4", "L1", "L2", "M3", "M4",
                "L3", "L1", "M2", "M3", "M3", "M3", "M1", "L1", "M5", "L2", "L3", "M4", "M3", "M2", "L1", "M4", "L1", "M3", "L2", "L4",
                "M5", "M3", "L2", "B", "M4", "L3", "M3", "M2", "L1", "L2", "M5", "M1", "M3", "L3", "L3", "L3", "M4", "M2", "L3", "L2",
                "M4", "M3", "L1", "L3", "M1", "M2", "M3", "L2", "L4", "M4", "L1", "M5", "L3", "M4", "M4", "M4", "L1", "M2", "M3", "L4",
                "M4", "L2", "L3", "L3", "M2", "M4", "L1", "M5", "L2", "L1", "M5", "L3", "M1", "M4", "M3", "L2", "L4", "M4", "L1", "M4",
                "L2", "M3", "L1"],
            ["L1", "L1", "L1", "M5", "M4", "L2", "L4", "M2", "M3", "L2", "L3", "L3", "L3", "M2", "M4", "L1", "M2", "L3", "M3", "L1",
                "M4", "M4", "M4", "L3", "L1", "L1", "L3", "L2", "M4", "L4", "L2", "L2", "L2", "M3", "L3", "M4", "L1", "M1", "M3", "L1",
                "M2", "M2", "M2", "L1", "M3", "L3", "L2", "L1", "M3", "M4", "L4", "L4", "L4", "M4", "L3", "M2", "M5", "L3", "M2", "M1",
                "M5", "M5", "M5", "L1", "L3", "M4", "M3", "M5", "L2", "L1", "M1", "M1", "M1", "L1", "L3", "M3", "L2", "L1", "M4", "L1",
                "M3", "M3", "M3", "M2", "L1", "L2", "M4", "M5", "L1", "L2", "L3", "L3", "L3", "L1", "M5", "M3", "M3", "L1", "M1", "M3",
                "W", "W", "W", "L1", "L1", "L1", "M5", "M4", "L2", "L4", "M2", "M3", "L2", "L3", "L3", "L3", "M2", "M4", "L1", "M2",
                "L3", "M3", "L1", "M4", "M4", "M4", "L3", "L1", "L1", "L3", "L2", "M4", "L3", "L2", "L2", "L2", "M3", "L3", "M4", "L1",
                "M1", "M3", "L1", "M2", "M2", "M2", "L1", "M3", "L3", "L2", "L1", "M3", "M4", "L4", "L4", "L4", "M4", "L3", "M2", "M5",
                "L3", "M2", "M1", "M5", "M5", "M5", "L1", "L3", "M4", "M3", "M5", "L2", "L1", "M1", "M1", "M1", "L1", "L3", "M3", "L2",
                "L1", "M4", "L1", "M3", "M3", "M3", "M2", "L1", "L2", "M4", "M5", "L1", "L2", "L3", "L3", "L3", "L1", "M5", "M3", "M3",
                "L1", "M1", "M3", "L1", "L1", "L1", "M5", "M4", "L2", "L4", "M2", "M3", "L2", "L3", "L3", "L3", "M2", "M4", "L1", "M2",
                "L3", "M3", "L1", "M4", "M4", "M4", "L3", "L1", "L1", "L3", "L2", "M4", "L1", "L2", "L2", "L2", "M3", "L3", "M4", "L1",
                "M1", "M3", "L1", "M2", "M2", "M2", "L1", "M3", "L3", "L2", "L1", "M3", "M4", "L4", "L4", "L4", "M4", "L3", "M2", "M5",
                "L3", "M2", "M1", "M5", "M5", "M5", "L1", "L3", "M4", "M3", "M5", "L2", "L1", "M1", "M1", "M1", "L1", "L3", "M3", "L2",
                "L1", "M4", "L1", "M3", "M3", "M3", "M2", "L1", "L2", "M4", "M5", "L1", "L2", "L3", "L3", "L3", "L1", "M5", "M3", "M3",
                "L1", "M1", "M3"]
        ],
        "FREESPIN_REELSET" : [
            ["L3", "L2", "M5", "M4", "L1", "M5", "L2", "L3", "M4", "M5", "M2", "M4", "M3", "M5", "L1", "M2", "M5", "M3", "L2", "L1",
                "M5", "L2", "L3", "M5", "L2", "L1", "M4", "M5", "L1", "L2", "M4", "L1", "M5", "L2", "L1", "M5", "L2", "L3", "M5", "L1",
                "L4", "W", "W", "W", "M1", "M5", "M3", "M2", "M5", "L3", "L2", "M5", "L1", "L3", "L2", "M5", "M1", "L2", "L1", "M3",
                "M5", "L3", "M3", "L1", "M5", "M3", "L2", "L1", "M4", "M5", "L2", "W", "W", "W", "M3", "L1", "L3", "M2", "M5", "L2", "M4", "L3", "M3",
                "M4", "M2", "M1", "M4", "M3", "L1", "M5", "L2", "L1", "M5", "L2", "M1", "M5", "L2", "L4", "L1", "M2", "L2", "L1", "M4",
                "L2", "M5", "M3", "M4", "L1", "L2", "M5", "M4", "L1", "M1", "L2", "L1", "M1", "L2", "L1", "M5", "L2", "L1", "M5", "L2",
                "M4", "L1", "M2", "M3", "M1", "M4", "M3", "L2", "M5", "L3", "L1", "M3", "M4", "M5", "L1", "M4", "L2", "M5", "M4", "M3",
                "M5", "M4", "L2", "M3", "M5", "L4", "L2", "M1", "M4", "L1", "L2", "L3", "L1", "L2", "L3", "M5", "M4", "L1", "M3", "L3",
                "M2", "L2", "L1", "L3", "M4", "L1", "M5", "L2", "M4", "M1", "W", "W", "W", "L1", "M5", "M2", "L3", "M5", "M2", "L2", "M5", "M4", "L2",
                "L3", "M5", "L2", "M4", "M5", "L1", "M4", "M5", "L3", "L1", "L2", "L3", "L1", "L2", "M3", "L1", "L4", "L2", "M4", "M5",
                "M2", "L1", "M4", "M2", "L2", "M4", "M5", "L3", "M3", "M1", "L3", "L1", "M5", "L3", "L1", "M3", "M5", "L1", "M3", "L3",
                "M4", "M3", "L1", "M5", "M2", "M4", "L1", "M3", "M2", "M5", "L2", "L1", "L3", "M4", "M2", "L1", "M4", "L3", "M5", "M1",
                "L1", "L3", "L2", "M5", "L1", "M2", "M5", "L1", "L3", "L2", "M5", "M2", "L2", "M5", "L3", "M4", "L1", "L3", "L2", "M5",
                "M4", "L1", "M5", "L2", "L3", "M4", "M5", "M2", "M4", "M3", "M5", "L1", "M2", "M5", "M3", "L2", "L1", "M5", "L2", "L3",
                "M5", "L2", "L1", "M4", "M5", "L1", "L2", "M4", "L1", "M5", "L2", "L1", "M5", "L2", "L3", "M5", "L1", "L4", "M1", "M5",
                "M3", "M2", "M5", "L3", "L2", "M5", "L1", "L3", "L2", "M5", "M1", "L2", "L1", "M3", "M5", "L3", "M3", "L1", "M5", "M3",
                "L2", "L1", "M4", "M5", "L2", "M3", "L1", "L3", "M2", "M5", "L2", "M4", "L3", "M3", "M4", "M2", "M1", "M4", "M3", "L1",
                "M5", "L2", "L1", "M5", "L2", "M1", "M5", "L2", "L4", "L1", "M2", "W", "W", "W", "L2", "L1", "M4", "L2", "M5", "M3", "M4", "L1", "L2",
                "M5", "M4", "L1", "M1", "L2", "L1", "M1", "L2", "L1", "M5", "L2", "L1", "M5", "L2", "M4", "L1", "M2", "M3", "M1", "M4",
                "M3", "L2", "M5", "L3", "L1", "M3", "M4", "M5", "L1", "M4", "L2", "M5", "M4", "M3", "M5", "M4", "L2", "M3", "M5", "L4",
                "L2", "M1", "M4", "L1", "L2", "L3", "L1", "L2", "L3", "M5", "M4", "L1", "M3", "L3", "M2", "L2", "L1", "L3", "M4", "L1",
                "M5", "L2", "M4", "M1", "L1", "M5", "M2", "L3", "M5", "M2", "L2", "M5", "M4", "L2", "L3", "M5", "L2", "M4", "M5", "L1",
                "M4", "M5", "L3", "L1", "L2", "L3", "L1", "L2", "M3", "L1", "L4", "L2", "M4", "M5", "M2", "L1", "M4", "M2", "L2", "M4",
                "M5", "L3", "M3", "M1", "L3", "L1", "M5", "L3", "L1", "M3", "M5", "L1", "M3", "L3", "M4", "M3", "L1", "M5", "M2", "M4",
                "L1", "M3", "M2", "M5", "L2", "L1", "L3", "M4", "M2", "L1", "M4", "L3", "M5", "M1", "L1", "L3", "L2", "M5", "L1", "M2",
                "M5", "L1", "L3", "L2", "M5", "M2", "L2", "M5", "L3", "M4", "L1"],
            ["L2", "M5", "L3", "L2", "L1", "L3", "M4", "M3", "L3", "L2", "L1", "M2", "L2", "L3", "M3", "M4", "M5", "L3", "M2", "M4",
                "M3", "L3", "M1", "L2", "M2", "L3", "L1", "M5", "M1", "M3", "L4", "L3", "L2", "M3", "M4", "L3", "L2", "M4", "L1", "M2",
                "M3", "L3", "L1", "M2", "M3", "L3", "L2", "M2", "L3", "M4", "L1", "W", "W", "W", "L3", "L2", "M3", "M5", "L3", "M4",
                "L2", "M3", "M4", "L1", "M3", "L2", "L3", "L1", "M2", "L3", "L2", "M5", "M3", "M4", "L3", "M3", "M5", "L3", "M4", "L2",
                "L1", "M3", "L2", "L3", "L4", "M3", "L2", "L1", "L3", "M1", "M5", "L2", "M4", "M3", "L3", "M4", "M5", "M3", "M2", "M4",
                "M3", "L2", "L1", "M3", "M4", "L3", "L2", "M3", "L3", "L1", "W", "W", "W", "M5", "L3", "L2", "M3", "M1", "L2", "M2", "M4", "M3", "M5",
                "L3", "M4", "M3", "L3", "M4", "M1", "L2", "M2", "L3", "M3", "L2", "L3", "M4", "L2", "M3", "L4", "L3", "M5", "M1", "M3",
                "L3", "M5", "M3", "L2", "L3", "L1", "L2", "L3", "M4", "M3", "L1", "M2", "L2", "L3", "M3", "M4", "L2", "M3", "L3", "M1",
                "M4", "L1", "L3", "L2", "M4", "L3", "L2", "L1", "L3", "M3", "M2", "L2", "M3", "L3", "M4", "L2", "L3", "L1", "L2", "M4",
                "L3", "M3", "L2", "L3", "M3", "M4", "L4", "M5", "L3", "L1", "L2", "L3", "M2", "L2", "M3", "M1", "M4", "W", "W", "W",
                "L3", "L2", "M5", "M3", "M4", "M5", "M2", "L1", "L2", "L3", "M1", "L2", "L3", "M4", "M3", "L3", "L2", "M4", "M3", "L3",
                "M4", "L2", "L1", "L3", "M4", "L1", "M3", "L3", "M1", "M3", "L4", "W", "W", "W", "M5", "L1", "L3", "L2", "M3", "L3", "L2", "L1", "M4",
                "L3", "L2", "M4", "L3", "L2", "M3", "M4", "M2", "L3", "M5", "M2", "M4", "L3", "M2", "L2", "M5", "M2", "L2", "M4", "L3",
                "L2", "M5", "L1", "L3", "L2", "M3", "L3", "L2", "L1", "M4", "L3", "L2", "M2", "L3", "M5", "M2", "L1", "M4", "M5", "M3",
                "M2", "M4", "M3", "L2", "L1", "M3", "M4", "L3", "L2", "M3", "L3", "L1", "M5", "L3", "L2", "M3", "M1", "L2", "M2", "M4",
                "M3", "M5", "L3", "M4", "M3", "L3", "M4", "M1", "L2", "M2", "L3", "M3", "L2", "L3", "M4", "L2", "M3", "L4", "L3", "M5",
                "M1", "M3", "L3", "M5", "M3", "L2", "L3", "L1", "L2", "L3", "W", "W", "W", "M4", "M3", "L1", "M2", "L2", "L3", "M3", "M4", "L2", "M3",
                "L3", "M1", "M4", "L1", "L3", "L2", "M4", "L3", "L2", "L1", "L3", "M3", "M2", "L2", "M3", "L3", "M4", "L2", "L3", "L1",
                "L2", "M4", "L3", "M3", "L2", "L3", "M3", "M4", "L4", "M5", "L3", "L1", "L2", "L3", "M2", "L2", "M3", "M1", "M4", "W",
                "W", "W", "L3", "L2", "M5", "M3", "M4", "M5", "M2", "L1", "L2", "L3", "M1", "L2", "L3", "M4", "M3", "L3", "L2", "M4",
                "M3", "L3", "M4", "L2", "L1", "L3", "M4", "L1", "M3", "L3", "M1", "M3", "L4", "M5", "L1", "L3", "L2", "M3", "L3", "L2",
                "L1", "M4", "L3", "L2", "M4", "L3", "L2", "M3", "M4", "M2", "L3", "M5", "M2", "M4", "L3", "M2", "L2", "M5", "M2", "L2",
                "M4", "L3", "L2", "M5", "L1", "L3", "L2", "M3", "L3", "L2", "L1", "M4", "L3", "L2", "M2", "L3", "M5", "M2", "L1", "L2",
                "M4", "L3", "L2", "M3", "M4", "M2", "L3", "M5", "M2", "M4", "L3", "M2", "L2", "M5", "M2", "L2", "M4", "L3", "L2", "M5",
                "L1", "L3", "L2", "M3", "L3", "L2", "L1", "M4", "L3", "L2", "M2", "L3", "M5", "M2", "L1", "M4", "M5", "M3", "M2", "M4",
                "M3", "L2", "L1", "M3", "M4", "L3", "L2", "M3", "L3", "L1", "M5", "L3", "L2", "M3", "M1", "L2", "M2", "M4", "M3", "M5",
                "L3", "M4", "M3", "L3", "M4", "M1", "L2", "M2", "L3", "M3", "L2", "L3", "M4", "L2", "M3", "L4", "L3", "M5", "M1", "M3",
                "L3", "M5", "M3", "L2", "L3", "L1", "L2", "L3", "M4", "M3", "L1", "M2", "L2", "L3", "M3", "M4", "L2", "M3", "L3", "M1",
                "M4", "L1", "L3", "L2", "M4", "L3", "L2", "L1", "L3", "M3", "M2", "L2", "M3", "L3", "M4", "L2", "L3", "L1", "L2", "M4",
                "L3", "M3", "L2", "L3", "M3", "M4", "L4", "M5", "L3", "L1", "L2", "L3", "M2", "L2", "M3", "M1", "M4", "L3", "L2", "M5",
                "M3", "M4", "M5", "M2", "L1", "L2", "L3", "M1", "L2", "L3", "M4", "M3", "L3", "L2", "M4", "M3", "L3", "M4", "L2", "L1",
                "L3", "M4", "L1", "M3", "L3", "M1", "M3", "L4", "M5", "L1", "L3", "L2", "M3", "L3", "L2", "L1", "M4", "L3", "L2", "M4",
                "L3", "L2", "M3", "M4", "M2", "L3", "M5", "M2", "M4", "L3", "M2", "L2", "M5", "M2", "L2", "M4", "L3", "L2", "M5", "L1",
                "L3", "L2", "M3", "L3", "L2", "L1", "M4", "L3", "L2", "M2", "L3", "M5", "M2", "L1", "M5", "L3", "L1", "L2", "L3", "M2",
                "L2", "M3", "M1", "M4", "L3", "L2", "M5", "M3", "M4", "M5", "M2", "L1", "L2", "L3"],
            ["L1", "L2", "L3", "L1", "M4", "M5", "L1", "M2", "M5", "M3", "L1", "L3", "M5", "M3", "L1", "L3", "L2", "M3", "L3", "M4",
                "M5", "L3", "M4", "M5", "L3", "M1", "L1", "L3", "M3", "M4", "L4", "L3", "M3", "M2", "M1", "M5", "M4", "L1", "L2", "M5",
                "L3", "M4", "L1", "M3", "M4", "L1", "L3", "M5", "L1", "L3", "M5", "M3", "L3", "M4", "L1", "L3", "M2", "M4", "L3", "L2",
                "M5", "W", "W", "W", "M4", "L2", "L1", "L3", "M3", "L1", "M4", "M5", "M3", "M4", "L1", "M2", "M4", "L3", "M5", "M1",
                "L3", "L2", "L1", "M5", "L3", "L1", "M3", "L2", "L3", "M4", "M5", "L2", "L1", "M3", "L4", "M4", "L1", "L3", "M1", "M4",
                "L1", "M1", "M5", "L3", "M4", "L1", "M5", "M3", "L1", "L3", "M4", "L1", "M5", "L3", "M2", "L4", "M5", "M3", "M2", "L1",
                "L3", "L2", "M1", "M5", "L3", "M1", "L2", "L3", "L1", "M4", "L2", "L1", "L3", "M1", "M4", "L3", "L1", "L2", "L3", "M4",
                "M5", "L3", "M2", "M4", "M5", "L1", "L3", "M5", "M4", "L1", "L2", "M5", "L1", "M4", "L2", "L3", "M4", "L1", "L3", "L2",
                "L1", "M2", "M1", "L3", "M4", "L1", "L4", "L3", "L2", "M5", "W", "W", "W", "L3", "M1", "L1", "L3", "M3", "L2", "M4", "M3", "L2", "M4",
                "L1", "M1", "M4", "M3", "M5", "L1", "M4", "L4", "M5", "L3", "M4", "M1", "M5", "L3", "M4", "M5", "M3", "L3", "M1", "L1",
                "L3", "L2", "M4", "M3", "L3", "L2", "M3", "M1", "M4", "M2", "L1", "M5", "M4", "L1", "M5", "L3", "M4", "M3", "L1", "L3",
                "M4", "M5", "M3", "L2", "L3", "M4", "M5", "L1", "L3", "M4", "M2", "M3", "M1", "M2", "M5", "L3", "M1", "M5", "L4", "L1",
                "M3", "L3", "M5", "L2", "M1", "L3", "M4", "M5", "L3", "M2", "M5", "L2", "L3", "M5", "M4", "L1", "M5", "L3", "M4"]
        ]
    };

    WIN_RATIOS:IWinRatios = {
        normalWin : [
            {
                ratio : 0,
                text : "Tiny Win",
                duration : 0,
                type : WinRatioType.TINY
            },
            {
                ratio : 1.5,
                text : "Small Win",
                duration : 0.671,
                type : WinRatioType.SMALL
            },
            {
                ratio : 3,
                text : "Medium Win",
                duration : 1.220,
                type : WinRatioType.MEDIUM
            },
            {
                ratio : 5,
                text : "Large Win",
                duration : 1.159,
                type : WinRatioType.LARGE
            }
        ],
        bigWin : [
            {
                ratio : 15,
                text : "Big Win",
                duration : 4,
                type : WinRatioType.BIG_WIN
            },
            {
                ratio : 25,
                text : "Mega Win",
                duration : 3.902,
                type : WinRatioType.MEGA_WIN

            },
            {
                ratio : 50,
                text : "Super Mega Win",
                duration : 3.902,
                type : WinRatioType.SUPER_MEGA_WIN
            }
        ]
    };

    WIN_COUNTUP_BITMAP_STYLE:BitmapTextStyleOptions = {
        font : {
            name : "NumbersWinCountUp",
            size : 23
        },
        tint : parseInt(("#ffffff").replace(/^#/, ''), 16)
    };

    PERFORMANCE_LOGGER:boolean = true;
    // #259
    WIN_BELOW_STAKE: boolean = false;

    private constructor() {
        if(LeprechaunGameConfig.instance) {
            throw new Error("LeprechaunGameConfig.constructor() - Instantiation failed: Singleton.");
        }
    }
}
