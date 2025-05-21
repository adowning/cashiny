/**
 * Created by jonas on 2020-03-18.
 */
import {
    GameIntroColors,
    GameIntroViewConfig,
    StampConfig,
    Volatility
} from "@nolimitcity/slot-launcher/bin/plugins/concreteplugins/nolimitgameintro/GameIntroView";
import {ImgLoader} from "@nolimitcity/slot-launcher/bin/loader/ImgLoader";
import {NolimitApplication} from "@nolimitcity/slot-launcher/bin/NolimitApplication";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {SlideShowPage} from "@nolimitcity/slot-launcher/bin/gui/views/slideshow/SlideShowPage";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {Align, Direction, GuiLayout} from "@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout";
import {Translation} from "@nolimitcity/slot-game/bin/core/translation/Translation";
import {LeprechaunGameAssets} from "../LeprechaunGameAssets";
import {Leprechaun} from "../Leprechaun";
import {APIEvent} from "@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem";
import {FontStyle, FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";
import {GameClientConfiguration} from "@nolimitcity/slot-launcher/bin/plugins/apiplugin/GameClientConfiguration";

export class LeprechaunIntroConfig implements GameIntroViewConfig {

    colors: GameIntroColors = {
        slideShowColors: {
            backgroundColor: 0x000000,
            bulletColor: 0xffffff
        },
        stampColor: 0xFFFFFF,
    };


    stampConfig: StampConfig = {
        xWays: false,
        xNudge: true,
        volatility: Volatility.MEDIUM
    };

    background: PIXI.Container;
    borderBottom: PIXI.Container;
    borderTop: PIXI.Container;
    logo: PIXI.Container;
    pages: SlideShowPage[];


    public static INTRO_BG = LeprechaunGameAssets.INTRO_BACKGROUND;
    public static INTRO_LOGO = LeprechaunGameAssets.INTRO_LOGO;
    public static INTRO_FEATURE_1 = "resources/images/intro/Intro_Feature_1.png";
    public static INTRO_FEATURE_2 = "resources/images/intro/Intro_Feature_2.png";
    public static INTRO_DIVIDER = "resources/images/intro/Intro_Divider.png";

    private readonly _winUpTo: string = "Win more than";
    private readonly _timesBet: string = " 9 800x ";
    private readonly _bet: string = "bet";

    constructor() {
    }

    public gameClientConfigurationApplied(rules: GameClientConfiguration) {
        if(Leprechaun.api.gameClientConfiguration.explicitContentWarning) {
            Leprechaun.api.gameClientConfiguration.explicitContentWarning = false;
        }
    }

    public init(): Promise<GameIntroViewConfig> {
        const imgLoader = new ImgLoader(NolimitApplication.resourcePath);
        imgLoader.add(LeprechaunIntroConfig.INTRO_BG, LeprechaunIntroConfig.INTRO_BG);
        imgLoader.add(LeprechaunIntroConfig.INTRO_LOGO, LeprechaunIntroConfig.INTRO_LOGO);
        imgLoader.add(LeprechaunIntroConfig.INTRO_FEATURE_1, LeprechaunIntroConfig.INTRO_FEATURE_1);
        imgLoader.add(LeprechaunIntroConfig.INTRO_FEATURE_2, LeprechaunIntroConfig.INTRO_FEATURE_2);
        imgLoader.add(LeprechaunIntroConfig.INTRO_DIVIDER, LeprechaunIntroConfig.INTRO_DIVIDER);


        return imgLoader.load().then(value => {
            this.initGraphics();
            return this;
        });
    }

    private initGraphics() {
        this.background = new PIXI.Container();

        /*        const bgBlack = new PIXI.Sprite(PIXI.Texture.WHITE);
                bgBlack.anchor.set(0.5, 0.5);
                bgBlack.tint = 0x020f12;
                bgBlack.alpha = 0.7;*/
        const bgSprite = new PIXI.Sprite(ImgLoader.getImgTexture(LeprechaunIntroConfig.INTRO_BG));
        bgSprite.anchor.set(0.5, 0.5);

        /*        const stoneForeground = new PIXI.Sprite(ImgLoader.getImgTexture(BarbarianFuryGameAssets.MAIN_GAME_STONE_FOREGROUND));
                stoneForeground.anchor.set(0.5, 0.5);
                stoneForeground.position.set(0, 500);*/

        this.background.addChild(bgSprite);


        this.borderTop = new PIXI.Container();
        const topSprite = new PIXI.TilingSprite(ImgLoader.getImgTexture(LeprechaunIntroConfig.INTRO_DIVIDER), 1680, 126);
        topSprite.anchor.set(0.5, 0.5);
        this.borderTop.addChild(topSprite);

        this.borderBottom = new PIXI.Container();
        const bottomSprite = new PIXI.TilingSprite(ImgLoader.getImgTexture(LeprechaunIntroConfig.INTRO_DIVIDER), 1680, 126);
        bottomSprite.anchor.set(0.5, 0.5);
        this.borderBottom.addChild(bottomSprite);


        this.logo = new PIXI.Container();
        const logoSprite = new PIXI.Sprite(ImgLoader.getImgTexture(LeprechaunIntroConfig.INTRO_LOGO));
        logoSprite.anchor.set(0.5, 0.5);
        logoSprite.scale.set(0.6, 0.6);
        this.logo.addChild(logoSprite);

        const winUpToTextContainer: PIXI.Container = new PIXI.Container();
        winUpToTextContainer.position.set(10, -165);

        const textInfoStyle: PIXI.TextStyle = new PIXI.TextStyle({
            fill: "#ffffff",
            fontFamily: "Open Sans",
            fontSize: 28,
            fontStyle: FontStyle.NORMAL,
            fontWeight: FontWeight.NORMAL,
            wordWrap: true,
            wordWrapWidth: 340,
            breakWords: true
        });

        const timesBetString: string = Translation.translate(this._winUpTo) + this._timesBet + Translation.translate(this._bet) + "!";

        const featureText1 = "\n\n\n"+ SlotGame.api.translations.translate("Coins awards extra spin, increased multiplier or added rainbow lines in Rainbow Spins!");
        const featureText2 = SlotGame.api.translations.translate("Each nudge increases the Wild multiplier by 1!");

        this.pages = [
            new SlideShowPage(ImgLoader.getImgTexture(LeprechaunIntroConfig.INTRO_FEATURE_1), featureText1),
            new SlideShowPage(ImgLoader.getImgTexture(LeprechaunIntroConfig.INTRO_FEATURE_2), featureText2)
        ];

        this.pages[0].addChild(winUpToTextContainer);
        if (Leprechaun.api.gameClientConfiguration.isSet) {
            if (Leprechaun.api.gameClientConfiguration.showLowProbabilityGfx !== false) {
                winUpToTextContainer.addChild(new PIXI.Text(timesBetString, textInfoStyle));

            }
        } else {
            Leprechaun.api.events.once(APIEvent.GAME_CLIENT_CONFIGURATION_APPLIED, () => {
                if (Leprechaun.api.gameClientConfiguration.showLowProbabilityGfx !== false) {
                    winUpToTextContainer.addChild(new PIXI.Text(timesBetString, textInfoStyle));
                }
            });
        }

        /*
                NolimitApplication.events.on(NolimitApplication.RESIZE, () => {
                    const bounds = NolimitApplication.screenBounds;
        /!*            bgSprite.width = bounds.width;
                    bgSprite.height = bounds.height;*!/
                    bgBlack.width = bounds.width;
                    bgBlack.height = bounds.height;
                });
        */

    }
}