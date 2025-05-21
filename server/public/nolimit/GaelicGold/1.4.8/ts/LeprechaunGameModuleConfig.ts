/**
 * Created by Jie Gao on 2019-02-12.
 */
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {IGameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/IGameConfig";
import {IGameModuleConfig} from "@nolimitcity/slot-game/bin/core/gamemoduleconfig/IGameModuleConfig";
import {PickAndClickController} from "@nolimitcity/slot-game/bin/core/pickandclick/PickAndClickController";
import {ReelController} from "@nolimitcity/slot-game/bin/core/reel/reel/ReelController";
import {ReelPartAnimator} from "@nolimitcity/slot-game/bin/core/reel/reel/ReelPartAnimator";
import {ReelPartCreator} from "@nolimitcity/slot-game/bin/core/reel/reel/ReelPartCreator";
import {ReelAreaView} from "@nolimitcity/slot-game/bin/core/reel/reelarea/ReelAreaView";
import {Reels} from "@nolimitcity/slot-game/bin/core/reel/reelarea/Reels";
import {ReelStopPresentationController} from "@nolimitcity/slot-game/bin/core/reelstoppresentation/ReelStopPresentationController";
import {ReelSymbolStateCreator} from "@nolimitcity/slot-game/bin/core/reelsymbol/ReelSymbolStateCreator";
import {ISymbolStateConfig} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {IResourcesGroupConfig} from "@nolimitcity/slot-game/bin/core/resource/asset/Asset";
import {IFontsConfig} from "@nolimitcity/slot-game/bin/core/resource/font/IFontsConfig";
import {ISoundConfig} from "@nolimitcity/slot-game/bin/core/resource/sound/ISoundConfig";
import {ScreenController} from "@nolimitcity/slot-game/bin/core/screen/ScreenController";
import {ParsedGameData} from "@nolimitcity/slot-game/bin/core/server/data/ParsedGameData";
import {ParsedInitData} from "@nolimitcity/slot-game/bin/core/server/data/ParsedInitData";
import {ServerDataParser} from "@nolimitcity/slot-game/bin/core/server/ServerDataParser";
import {SpinController} from "@nolimitcity/slot-game/bin/core/spin/SpinController";
import {UserAgent} from "@nolimitcity/slot-game/bin/core/useragent/UserAgent";
import {IndividualWinPresentationController} from "@nolimitcity/slot-game/bin/core/winpresentation/individualwin/IndividualWinPresentationController";
import {WinPresentationController} from "@nolimitcity/slot-game/bin/core/winpresentation/WinPresentationController";
import {ZeroBetController} from "@nolimitcity/slot-game/bin/core/zerobet/ZeroBetController";
import {SymbolIdleAnimationController} from "@nolimitcity/slot-game/bin/game/idleanimation/symbolidleanimation/SymbolIdleAnimationController";
import {NudgeSpinReelPartAnimator} from "@nolimitcity/slot-game/bin/game/reel/nudgereel/NudgeSpinReelPartAnimator";
import {FreespinZeroBetController} from "@nolimitcity/slot-game/bin/game/zerobet/FreespinZeroBetController";
import {FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";
import {BackgroundSound} from "./background/BackgroundSouond";
import {LeprechaunBackground} from "./background/LeprechaunBackground";
import {LeprechaunBetline} from "./betline/LeprechaunBetline";
import {LeprechaunBetlineNumber} from "./betline/LeprechaunBetlineNumber";
import {LeprechaunBetlinesView} from "./betline/LeprechaunBetlinesView";
import {BonusWinEffect} from "./effects/BonusWinEffect";
import {LandscapePaytable} from "./foreground/paytable/LandscapePaytable";
import {PortraitPaytable} from "./foreground/paytable/PortraitPaytable";
import {HotZone} from "./hotzone/HotZone";
import {LeprechaunSymbolIdleAnimation} from "./idleanimation/LeprechaunSymbolIdleAnimation";
import {LeprechaunFontConfig} from "./LeprechaunFontConfig";
import {LeprechaunGameAssets} from "./LeprechaunGameAssets";
import {LeprechaunGameConfig} from "./LeprechaunGameConfig";
import {LeprechaunSoundConfig} from "./LeprechaunSoundConfig";
import {Logo} from "./logo/Logo";
import {NearWinBackground} from "./nearwin/NearWinBackground";
import {LeprechaunPickNClick} from "./picknclick/intro/LeprechaunPickNClick";
import {LeprechaunPickNClickScreen} from "./picknclick/intro/LeprechaunPickNClickScreen";
import {LeprechaunOutroController} from "./picknclick/outro/LeprechaunOutroController";
import {LeprechaunOutroView} from "./picknclick/outro/LeprechaunOutroView";
import {LeprechaunReelAreaView} from "./reel/LeprechaunReelAreaView";
import {LeprechaunReelController} from "./reel/LeprechaunReelController";
import {LeprechaunReelPartAnimator} from "./reel/LeprechaunReelPartAnimator";
import {LeprechaunReels} from "./reel/LeprechaunReels";
import {BonusSymbolLanding} from "./reelstoppresentation/bonussymbollanding/BonusSymbolLanding";
import {StopHotZoneController} from "./reelstoppresentation/StopHotZoneController";
import {WildTextWriteOn} from "./reelstoppresentation/WildTextWriteOn";
import {LeprechaunParsedGameData} from "./server/data/LeprechaunParsedGameData";
import {LeprechaunParsedInitData} from "./server/data/LeprechaunParsedInitData";
import {LeprechaunServerDataParser} from "./server/LeprechaunServerDataParser";
import {SoundPlayer} from "./soundplayer/SoundPlayer";
import {LeprechaunSpinController} from "./spin/LeprechaunSpinController";
import {LeprechaunReelSymbol} from "./symbols/LeprechaunReelSymbol";
import {LeprechaunReelSymbolBonus} from "./symbols/LeprechaunReelSymbolBonus";
import {LeprechaunReelSymbolStateCreator} from "./symbols/LeprechaunReelSymbolStateCreator";
import {LeprechaunReelSymbolWild} from "./symbols/LeprechaunReelSymbolWild";
import {SymbolWinAnimation} from "./symbols/SymbolWinAimation";
import {LeprechaunBigWinController} from "./winpresentation/bigwin/LeprechaunBigWinController";
import {LeprechaunBetLineWinIndividualWPController} from "./winpresentation/individualwin/LeprechaunBetLineWinIndividualWPController";
import {LeprechaunInitialWPController} from "./winpresentation/initial/LeprechaunInitialWPController";
import {LeprechaunNoWinPresentationController} from "./winpresentation/nowin/LeprechaunNoWinPresentationController";
import {LeprechaunNudgeWildController} from "./winpresentation/nudgewildwp/LeprechaunNudgeWildController";
import {FeaturePrice} from "./server/FeaturePrice";

export class LeprechaunGameModuleConfig implements IGameModuleConfig {

    public static instance:LeprechaunGameModuleConfig = new LeprechaunGameModuleConfig();

    GAME_CONFIG:IGameConfig = LeprechaunGameConfig.instance;
    SOUND_CONFIG:ISoundConfig = LeprechaunSoundConfig.instance;
    FONTS_CONFIG:IFontsConfig = LeprechaunFontConfig.FONTS;
    RESOURCES_CONFIG:IResourcesGroupConfig = LeprechaunGameAssets.RESOURCES_GROUPS;

    public static logo:Logo;
    public static nearwinBackground:NearWinBackground;
    public static hotZone:HotZone;
    public static soundPlayer:SoundPlayer;
    public static bonusWinEffect:BonusWinEffect;
    public static symbolWinAnimation:SymbolWinAnimation;
    public static featurePrice:FeaturePrice;

    constructor() {
        if(LeprechaunGameModuleConfig.instance) {
            throw new Error("LeprechaunGameModuleConfig.constructor() - Instantiation failed: Singleton.");
        }
    }

    SERVER_PARSER:() => ServerDataParser = () => new LeprechaunServerDataParser();
    PARSED_INIT_DATA:(data:any, dataParser:ServerDataParser) => ParsedInitData = (data, dataParser:ServerDataParser) => new LeprechaunParsedInitData(data, <LeprechaunServerDataParser>dataParser);
    PARSED_GAME_DATA:(data:any, dataParser:ServerDataParser) => ParsedGameData = (data, dataParser:ServerDataParser) => new LeprechaunParsedGameData(data, <LeprechaunServerDataParser>dataParser);

    SPIN_CONTROLLER:() => SpinController = () => new LeprechaunSpinController();

    REELS:() => Reels = () => new LeprechaunReels();
    REEL_AREA_VIEW:() => ReelAreaView = () => new LeprechaunReelAreaView();

    REEL_CONTROLLER:(reelId:number) => ReelController = reelId => new LeprechaunReelController(reelId);

    REEL_PART_ANIMATOR:(reelId:number) => ReelPartAnimator = (reelId:number) => {
        if(reelId === 1) {
            return new LeprechaunReelPartAnimator(reelId);
        } else {
            return new NudgeSpinReelPartAnimator(reelId);
        }
    };

    REEL_PART_CREATOR:() => ReelPartCreator = () => new ReelPartCreator(
        (symName:string, reelId:number, state?:ISymbolStateConfig):LeprechaunReelSymbol => {
            state!.offsetGetter = (symName, stateKey) => {
                return ((symName.indexOf("B") > -1) ? [-4, -26] : [0, 0]);
            }
            if(symName.indexOf("W") > -1) {
                return new LeprechaunReelSymbolWild(symName, reelId, state);
            }

            if(symName.indexOf("B") > -1) {
                return new LeprechaunReelSymbolBonus(symName, reelId, state);
            }
            return new LeprechaunReelSymbol(symName, reelId, state);
        })

    SYMBOL_STATE_CREATOR:() => ReelSymbolStateCreator = () => new LeprechaunReelSymbolStateCreator();

    REEL_STOP_PRESENTATIONS:((index:number) => ReelStopPresentationController)[] = [
        //index => new BonusSymbolLanding(index),
        index => new StopHotZoneController(index),
        index => new WildTextWriteOn(index)
    ];

    PICK_AND_CLICKS:(() => PickAndClickController)[] = [
        () => new LeprechaunPickNClick("LeprechaunPickNClick", {
            viewCreator : (onButtonClickCallback:(index:number, auto:boolean) => void, autoClick?:boolean) => {
                return new LeprechaunPickNClickScreen({
                    layer : LeprechaunGameConfig.instance.LAYERS.FREESPIN_INTRO.name,
                    onButtonClickCallback : onButtonClickCallback,
                    recreateButtons : false,
                    mobileScale : 1,
                    portraitScale : 1
                }, autoClick);
            },
            showWinPresentations : false
        })
    ];

    SCREENS:(() => ScreenController)[] = [
        () => new LeprechaunOutroController({
            viewCreator : (onButtonClickCallback:() => void, autoClose?:boolean) => {
                return new LeprechaunOutroView({
                    layer : LeprechaunGameConfig.instance.LAYERS.FREESPIN_INTRO.name,
                    onButtonClickCallback : onButtonClickCallback,
                    mobileScale : 1,
                    portraitScale : 1
                });
            }
        })
    ];

    ZERO_BETS:(() => ZeroBetController)[] = [
        () => new FreespinZeroBetController()
    ];

    WIN_PRESENTATIONS:((indexes:[number, number]) => WinPresentationController)[][] = [
        [indexes => new LeprechaunNudgeWildController(indexes)],
        [indexes => new LeprechaunNoWinPresentationController(indexes)],
        [indexes => new LeprechaunInitialWPController(indexes)],
        [indexes => new LeprechaunBigWinController(indexes)]
    ];
    INDIVIDUAL_WIN_PRESENTATION:() => IndividualWinPresentationController = () => new LeprechaunBetLineWinIndividualWPController({
        symbolTimeOffsetCalculator : (currentTotalDuration:number, reelId:number, symbolId:number):number => {
            return 0;
        }
    });

    GAME_FEATURE_CREATOR:() => void = () => {
        if(!UserAgent.isMobile) {
            const idleAnimation = new SymbolIdleAnimationController({
                startTime : 3,
                minInterval : 0.1,
                maxInterval : 3
            });
        }

        const paytableConfig:any = {
            values : ["M1", "M2", "M3", "M4", "M5", "L1"],
            symbols : ["M1", "M2", "M3", "M4", "M5", "L1"],
            background : {
                color : "#ffffff",
                alpha : 0.3
            },
            textStyle : {
                fontFamily : "Open Sans",
                fontSize : 22,
                fontWeight : FontWeight.EXTRA_BOLD,
                dropShadow : true,
                wordWrap : true,
                wordWrapWidth : 90,
                dropShadowAlpha : 0.6,
                dropShadowAngle : 89.5,
                dropShadowBlur : 7,
                dropShadowColor : "#1a1740",
                dropShadowDistance : 1,
                fill : [
                    "#fffdec",
                    "#fff2a8",
                    "#ffc133"
                ]
            }
        };
        const symbolIdleAnimation = new LeprechaunSymbolIdleAnimation();
        const portraitPaytable = new PortraitPaytable(paytableConfig);
        const landscapePaytable = new LandscapePaytable(paytableConfig);
        const backgroundSound = new BackgroundSound();
        LeprechaunGameModuleConfig.nearwinBackground = new NearWinBackground();
        LeprechaunGameModuleConfig.hotZone = new HotZone();
        LeprechaunGameModuleConfig.bonusWinEffect = new BonusWinEffect();
        LeprechaunGameModuleConfig.symbolWinAnimation = new SymbolWinAnimation();
        LeprechaunGameModuleConfig.logo = new Logo();

        LeprechaunGameModuleConfig.soundPlayer = new SoundPlayer();

        const background = new LeprechaunBackground({
            layer : GameConfig.instance.LAYERS.BACKGROUND.name,
            backgroundImages : {
                NORMAL : {image : LeprechaunGameAssets.MAIN_GAME_BACKGROUND, offset : new PIXI.Point(-480, -480)},
                FREESPIN : {image : LeprechaunGameAssets.FREESPIN_BACKGROUND, offset : new PIXI.Point(-480, -480)},
                FREESPIN_PICKS : {
                    image : LeprechaunGameAssets.PICK_AND_CLICK_BACKGROUND,
                    offset : new PIXI.Point(-480, -480)
                }
            },
            stretch : false
        });

        const betLinesView = new LeprechaunBetlinesView(
            {
                map : [
                    4, 2, 1, 3, 5, 5, 2, 1, 3, 4
                ]
            },
            (index:number):LeprechaunBetlineNumber => {
                return new LeprechaunBetlineNumber(index, {
                    layer : GameConfig.instance.LAYERS.BET_LINE_NUMBERS.name,
                    width : 40,
                    height : 40,
                    horizontalPadding : 0,
                    verticalPadding : [0, 0],
                    textStyleNormal : {fontFamily : "Open Sans"},
                    textStyleWin : {fontFamily : "Open Sans"},
                    textWinScale : 1
                });
            },
            (index:number, numberPosition:number[], betLineData:number[]):LeprechaunBetline => {
                return new LeprechaunBetline(index, numberPosition, betLineData, {
                    staticLineLayer : GameConfig.instance.LAYERS.BET_LINES.name,
                    styles : [
                        {
                            "lineWidth" : 6,
                            "color" : 0xEDF65E,
                            "alpha" : 1
                        },
                        {
                            "lineWidth" : 2,
                            "color" : 0xffffff,
                            "alpha" : 1
                        }
                    ],
                    numberOffsetX : 0,
                    pointOverlapVerticalOffset : 8
                });
            });

        LeprechaunGameModuleConfig.featurePrice = new FeaturePrice();
    };
}
