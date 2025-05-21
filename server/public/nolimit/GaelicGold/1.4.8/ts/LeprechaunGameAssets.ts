/**
 * Class description
 *
 * Created: 2017-11-17
 * @author jonas
 */

import {AssetQualityLevel, IResourcesGroupConfig} from "@nolimitcity/slot-game/bin/core/resource/asset/Asset";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {TextureAsset} from "@nolimitcity/slot-game/bin/core/resource/asset/assettypes/TextureAsset";
import {BitmapFontAsset} from "@nolimitcity/slot-game/bin/core/resource/asset/assettypes/BitmapFontAsset";
import {SpineAsset} from "@nolimitcity/slot-game/bin/core/resource/asset/assettypes/SpineAsset";

export class LeprechaunGameAssets {

    public static INTRO_BACKGROUND:string = "resources/images/intro/Intro_BG.jpg";
    public static INTRO_LOGO:string = "resources/images/intro/introLogo.png";

    public static MAIN_GAME_BACKGROUND:string = LeprechaunGameAssets.INTRO_BACKGROUND;
    public static FREESPIN_BACKGROUND:string = LeprechaunGameAssets.INTRO_BACKGROUND;
    public static PICK_AND_CLICK_BACKGROUND:string = "pncGrayMultSmall";
    public static MINI_PAYTABLE_PORTRAIT:string = "miniPayTableBGPortrait";
    public static MINI_PAYTABLE_LANSCAPE:string = "miniPayTableBGLandscape";


    public static getSymbolStateTexturePath(symbolName:string, stateName:string | null = null):string {
        if(stateName == null || stateName == "") {
            return symbolName + "/" + symbolName;
        }
        return symbolName + "/" + symbolName + "_" + stateName;
    }

    public static getSymbolStateTextures(symbolName:string, stateName:string | null = null):PIXI.Texture[] {
        return GameResources.getTextures(LeprechaunGameAssets.getSymbolStateTexturePath(symbolName, stateName));
    }

    public static RESOURCES_GROUPS:IResourcesGroupConfig = {
        intro : [
            {
                name : "fonts",
                autoLoad : [AssetQualityLevel.HIGH],
                assets : [
                    new BitmapFontAsset("numbersOpenSans800", "fonts/bitmapfonts/NumbersOpenSans800.fnt"),
                    new BitmapFontAsset("numbersWinCountUp", "fonts/bitmapfonts/NumbersWinCountUp.fnt"),
                    new BitmapFontAsset("numbersWinMultiplier", "fonts/bitmapfonts/NumbersWinMultiplier.fnt")
                ]
            },


        ],
        main : [
            {
                name : "mainJpegHighQuality",
                autoLoad : [AssetQualityLevel.HIGH],
                assets : [
                    new TextureAsset("mainHighQuality0", "sheets/mainHighQuality/mainHighQuality0.json")
                ],
                animations : {
                    "wildWriteOnText" : "WildText_WriteOn/WildText_",
                    "bigWinText0" : "bigwin/BW_1",
                    "bigWinText1" : "bigwin/BW_2",
                    "bigWinText2" : "bigwin/BW_3",
                    "X1" : "Multiplier/x1",
                    "X2" : "Multiplier/x2",
                    "X3" : "Multiplier/x3",
                    "X4" : "Multiplier/x4",
                    "X5" : "Multiplier/x5",
                    "X1_blur" : "Multiplier/x1_blur",
                    "X2_blur" : "Multiplier/x2_blur",
                    "X3_blur" : "Multiplier/x3_blur",
                    "X4_blur" : "Multiplier/x4_blur",
                    "X5_blur" : "Multiplier/x5_blur"
                }
            },
            {
                name : "bonusAnimationHighQuality",
                autoLoad : [AssetQualityLevel.HIGH],
                assets : [
                    new TextureAsset("bonusAnimationHighQuality0", "sheets/bonusAnimationHighQuality/bonusAnimationHighQuality0.json")
                ],
                animations : {
                    "bonusLand" : "Bonus_Land_15FPS/Bonus_Land_",
                    "bonusFloating" : "BonusFloating15FPS/BonusFloating_"
                }
            },
            {
                name : "mainYellow",
                autoLoad : [AssetQualityLevel.HIGH],
                assets : [
                    new TextureAsset("mainYellow0", "sheets/mainYellow/mainYellow0.json")
                ],
                animations : {
                    "reelFrame" : "Reel_frame",
                    "bigWinCoin2" : "coinGold/CoinGold_",
                    "wildBg" : "W",
                }
            },
            {
                name : "main",
                assets : [
                    new TextureAsset("main0", "sheets/main/main0.json")
                ],
                animations : {
                    "foreground" : "Foreground",
                }
            },
            {
                name : "mainSingleColor",
                assets : [
                    new TextureAsset("mainSingleColor0", "sheets/mainSingleColor/mainSingleColor0.json")
                ],
                animations : {
                    "reelBackground" : "Game_Reels",
                    "cloud0" : "Clouds/BG_Cloud1",
                    "cloud1" : "Clouds/BG_Cloud2",
                    "cloud2" : "Clouds/BG_Cloud3",
                    "bigWinCoin1" : "bigwin/coinSilver/CoinSilver_"
                }
            },
            {
                name : "mainJpegHighQuality",
                autoLoad : [AssetQualityLevel.HIGH],
                assets : [
                    new TextureAsset("miniPayTableBGPortrait", "images/miniPaytable/PaytableBG_portrait.jpg"),
                    new TextureAsset("miniPayTableBGLandscape", "images/miniPaytable/PaytableBG_Landscape.jpg")
                ]
            },
            {
                name : "mainJpeg",
                assets : [
                    new TextureAsset("mainJpeg0", "sheets/mainJpeg/mainJpeg0.json"),
                    new TextureAsset("mainJpeg1", "sheets/mainJpeg/mainJpeg1.json"),
                    new TextureAsset("mainJpeg2", "sheets/mainJpeg/mainJpeg2.json"),
                    new TextureAsset("mainJpeg3", "sheets/mainJpeg/mainJpeg3.json"),
                    new TextureAsset("mainJpeg4", "sheets/mainJpeg/mainJpeg4.json"),
                    new TextureAsset("mainJpeg5", "sheets/mainJpeg/mainJpeg5.json"),
                    new TextureAsset("mainJpeg6", "sheets/mainJpeg/mainJpeg6.json"),
                    new TextureAsset("mainJpeg7", "sheets/mainJpeg/mainJpeg7.json")
                ],
                animations : {
                    "rainbowBonusIdle" : "BonusIdle/Bonus_Idle_00",
                    "raindrop" : "raindrop",
                    "bgSky" : "Background/BG_Sky_halfSize",
                    "bgRipples0" : "Background/ShoreRipples/bg_ripples_1",
                    "bgRipples1" : "Background/ShoreRipples/bg_ripples_2",
                    "bgRipples2" : "Background/ShoreRipples/bg_ripples_3",
                    "wildNudgeBg" : "W_RainbowFrame/W_RainbowFrame_",
                    "wildNudgeSparkles" : "nudge_VFX/nudge_VFX_",
                    "rainbowBetLine" : "RainbowLine/RainbowLine_",
                    "splashRing" : "SplashRing",
                    "rainbowTail" : "RainbowHighlight",
                    "defaultParticle" : "Default-Particle_2",
                    "symIdleAnimation" : "FX_Symbol_Idle/FX_Sym_Idle_",
                    "winSplash" : "FX_Explosion/FX_Explosion_",
                    "winStar" : "Win_FX/Win_FX_StarSplash_",
                    "hotZone" : "FX_HotZone_A/FX_HotZone_A_",
                    "hotZoneWin" : "FX_HotZone/FX_HotZone_",
                    "reelExcitement" : "Reel_Excitement/Reel_Excitement_",
                    "bigWinTextStar" : "FX_BW_Stars/FX_BW_Stars_",
                    "bigWinTextEffect0" : "FX_BW1/FX_BW_1_000",
                    "bigWinTextEffect1" : "FX_BW2/FX_BW_2_000",
                    "bigWinTextEffect2" : "FX_BW3/FX_BW_3_000",
                    "symWinBgAnimation" : "FX_Sym_Win/FX_Sym_Win_"

                }
            },
            {
                name : "mainRainbow",
                assets : [
                    new TextureAsset("mainRainbow0", "sheets/mainRainbow/mainRainbow0.json")
                ],
                animations : {
                    "pncRainbow" : "rainbow",
                    "bgRainbow" : "BG_Rainbow_Screen"
                }
            },
            {
                name : "pncJpeg",
                assets : [
                    new TextureAsset("pncJpeg0", "sheets/pncJpeg/pncJpeg0.json")
                ],
                animations : {
                    "pncGrayMultSmall" : "BG/graymultsmall",
                    "pncCircle" : "Circle",
                    "highCoinGlow" : "HighCoinGlow",
                    "pncStoneGlow" : "stoneglow",
                    "pncSelectring" : "SelectRing/selectring_",
                    "pncSparkleBurst" : "sparkleburst/sparkleburst_"
                }
            },
            {
                name : "pncHighQuality",
                assets : [
                    new TextureAsset("pncHighQuality0", "sheets/pncHighQuality/pncHighQuality0.json")
                ],
                animations : {
                    "pncStartCoin" : "StartCoin",
                    "pncRainbowIcon" : "rainbowIcon",
                    "pncSpinsIcon" : "SpinsIcon"
                }
            },
            {
                name : "pncCoins",
                assets : [
                    new TextureAsset("pncCoins0", "sheets/pncCoins/pncCoins0.json")
                ],
                animations : {
                    "pncCoinFlip" : "Coin/CoinFlip/CoinFlip_",
                    "pncCircleCollected" : "Coin/CoinFlip/CoinFlip_00000",
                    "pncStoneBlue" : "Stones/stoneBlue",
                    "pncStoneYellow" : "Stones/stoneyellow",
                    "pncStoneTurquoise" : "Stones/stoneturquoise",
                    "pncStoneRed" : "Stones/stonered",
                    "pncStonePurple" : "Stones/stonepurple",
                    "pncStonePink" : "Stones/stonepink",
                    "pncStoneOrange" : "Stones/stoneorange",
                    "pncStoneGreen" : "Stones/stonegreen",
                    "pncStoneGray" : "Stones/stonegray"
                }
            },
            {
                name : "betlineNumber",
                assets : [
                    new TextureAsset("betlineNumber0", "sheets/betlineNumber/betlineNumber0.json")
                ],
                animations : {
                    "bigWinCoin0" : "bigwin/coinCopper/CoinCopper_",
                    "cloverBurst" : "CloverBurstFX/CloverBurstFX_",
                    "multiplierClover" : "MultiplierClover",
                    "betlineNumber1Left" : "LeftSide/1_Left",
                    "betlineNumber2Left" : "LeftSide/2_Left",
                    "betlineNumber3Left" : "LeftSide/3_Left",
                    "betlineNumber4Left" : "LeftSide/4_Left",
                    "betlineNumber5Left" : "LeftSide/5_Left",
                    "betlineNumber1LeftWin" : "LeftSide/1_Left_Win",
                    "betlineNumber2LeftWin" : "LeftSide/2_Left_Win",
                    "betlineNumber3LeftWin" : "LeftSide/3_Left_Win",
                    "betlineNumber4LeftWin" : "LeftSide/4_Left_Win",
                    "betlineNumber5LeftWin" : "LeftSide/5_Left_Win",
                    "betlineNumber1Right" : "RightSide/1_Right",
                    "betlineNumber2Right" : "RightSide/2_Right",
                    "betlineNumber3Right" : "RightSide/3_Right",
                    "betlineNumber4Right" : "RightSide/4_Right",
                    "betlineNumber5Right" : "RightSide/5_Right",
                    "betlineNumber1RightWin" : "RightSide/1_Right_Win",
                    "betlineNumber2RightWin" : "RightSide/2_Right_Win",
                    "betlineNumber3RightWin" : "RightSide/3_Right_Win",
                    "betlineNumber4RightWin" : "RightSide/4_Right_Win",
                    "betlineNumber5RightWin" : "RightSide/5_Right_Win",
                    "betline_1" : "Betline/Betline_1",
                    "betline_2" : "Betline/Betline_2",
                    "betline_3" : "Betline/Betline_3",
                    "betline_4" : "Betline/Betline_4",
                    "betline_5" : "Betline/Betline_5",
                    "betlineNumber6" : "6",
                    "betlineNumber6Win" : "6_Win",
                    "betlineNumber7" : "7",
                    "betlineNumber7Win" : "7_Win",
                    "betlineNumber8" : "8",
                    "betlineNumber8Win" : "8_Win",
                    "betlineNumber9" : "9",
                    "betlineNumber9Win" : "9_Win"
                }
            },
            {
                name : "spine",
                assets : [
                    new SpineAsset("wLand", "spine/Wild/W_Land.json"),
                    new SpineAsset("leprechaunPick", "spine/LeprechaunPick/LeprechaunPick.json")
                ]
            },
            {
                name : "symbols",
                autoLoad : [AssetQualityLevel.HIGH],
                assets : [
                    new TextureAsset("symbols0", "sheets/symbols/symbols0.json")
                ],
                animations : {
                    "miniPayTableM1" : "miniPaytable/paytable_sym_M1",
                    "miniPayTableM2" : "miniPaytable/paytable_sym_M2",
                    "miniPayTableM3" : "miniPaytable/paytable_sym_M3",
                    "miniPayTableM4" : "miniPaytable/paytable_sym_M4",
                    "miniPayTableM5" : "miniPaytable/paytable_sym_M5",
                    "miniPayTableL1" : "miniPaytable/paytable_sym_L"
                }
            }
        ]
    };
}