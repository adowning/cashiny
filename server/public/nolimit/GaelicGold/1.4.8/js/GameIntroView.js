"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameIntroView = exports.Volatility = void 0;
const LoadingButton_1 = require("./LoadingButton");
const SlideShow_1 = require("../../../gui/views/slideshow/SlideShow");
const GuiDefaultTextures_1 = require("../../../gui/default/GuiDefaultTextures");
const GuiLayout_1 = require("../../../gui/utils/GuiLayout");
const RadioButton_1 = require("../../../gui/buttons/concretebuttons/RadioButton");
const NolimitApplication_1 = require("../../../NolimitApplication");
const ScreenBounds_1 = require("../../../display/ScreenBounds");
const NolimitGameIntroPlugin_1 = require("../NolimitGameIntroPlugin");
const gsap_1 = require("gsap");
const NolimitLauncher_1 = require("../../../NolimitLauncher");
const SoundButton_1 = require("../../../gui/buttons/concretebuttons/SoundButton");
const ImgLoader_1 = require("../../../loader/ImgLoader");
var Volatility;
(function (Volatility) {
    Volatility[Volatility["MEDIUM"] = 0] = "MEDIUM";
    Volatility[Volatility["HIGH"] = 1] = "HIGH";
    Volatility[Volatility["EXTREME"] = 2] = "EXTREME";
    Volatility[Volatility["INSANE"] = 3] = "INSANE";
})(Volatility = exports.Volatility || (exports.Volatility = {}));
class GameIntroView extends PIXI.Container {
    constructor(config) {
        super();
        this._config = config;
        this.initAnimations();
        this.updateSoundButton();
    }
    initAnimations() {
        this._background = this._config.background;
        this._topInfo = this._config.logo;
        this.slideShow = new SlideShow_1.SlideShow(this._config.pages, this._config.borderTop, this._config.borderBottom, this._config.colors.slideShowColors);
        this._gameStampsContainer = this.createStamps(this._config.stampConfig);
        this._gameStampsContainer.pivot.set(this._gameStampsContainer.width, this._gameStampsContainer.height * 0.5); //Anchor (1,0.5)
        this._continueButton = new LoadingButton_1.LoadingButton();
        this._continueButton.addClickCallback(() => {
            if (this._config.continueButtonClickSound) {
                NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.player.playEffect(this._config.continueButtonClickSound);
            }
            else {
                NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.playKeypadEffect("click");
            }
        });
        this.soundButton = new SoundButton_1.SoundButton("sound");
        this.soundButton.addClickCallback(() => {
            NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.toggleQuickMute();
            this.updateSoundButton();
        });
        /*  this.soundSetting = this.createSoundSetting();
          this.soundSetting.pivot.set(0, 28); //Anchor (0,0.5)*/
        this._background.position.set(360, 360);
        this.addChild(this._background, this._topInfo, this.slideShow, this._gameStampsContainer, this._continueButton, this.soundButton);
    }
    onResize() {
        const bounds = (0, ScreenBounds_1.cloneScreenBounds)(NolimitApplication_1.NolimitApplication.screenBounds);
        this.slideShow.position.set(360, 130);
        this.slideShow.changeWidth(bounds.width);
        this.slideShow.resize();
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            this._continueButton.position.set(360, 615);
            this.soundButton.position.set(bounds.left + 20, 615 - 40);
            //this.soundSetting.position.set(bounds.left + 20, 675);
            this._gameStampsContainer.position.set(bounds.right - 20, 675);
        }
        else {
            //this.soundSetting.position.set(bounds.left + 20, 646);
            this._gameStampsContainer.position.set(bounds.right - 20, 590);
            const centerBottom = (bounds.bottom - 640) * 0.5 + 640;
            this._continueButton.position.set(360, centerBottom);
            this.soundButton.position.set(bounds.left + 20, centerBottom - 40);
        }
        //        const centerTop = bounds.top * 0.5 + 65;
        this._topInfo.position.set(360, 65);
        if (this._config.onResize) {
            this._config.onResize();
        }
    }
    createStamps(stampConfig) {
        const cont = new PIXI.Container();
        const stamps = [];
        if (stampConfig.snowflake && NolimitLauncher_1.NolimitLauncher.apiPlugin.gameClientConfiguration.useCensoredGfx) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.SNOW_FLAKE))));
        }
        if (stampConfig.xSplit) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_SPLIT))));
        }
        if (stampConfig.xReelSplit) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_REEL_SPLIT))));
        }
        if (stampConfig.xBomb) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_BOMB))));
        }
        if (stampConfig.xSize) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_SIZE))));
        }
        if (stampConfig.xBet && NolimitLauncher_1.NolimitLauncher.apiPlugin.gameClientConfiguration.boostedBetAllowed) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_BET))));
        }
        if (stampConfig.xPays) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_PAYS))));
        }
        if (stampConfig.xWays) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_WAYS))));
        }
        if (stampConfig.xWaysInfectious) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_WAYS_INFECTIOUS))));
        }
        if (stampConfig.xNudge) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_NUDGE))));
        }
        if (stampConfig.xCluster) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_CLUSTER))));
        }
        if (stampConfig.xMount) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_MOUNT))));
        }
        if (stampConfig.xCap) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_CAP))));
        }
        if (stampConfig.xBizarre) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_BIZARRE))));
        }
        if (stampConfig.xZone) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_ZONE))));
        }
        if (stampConfig.xGod) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_GOD))));
        }
        if (stampConfig.xHole) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_HOLE))));
        }
        if (stampConfig.xRip) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_RIP))));
        }
        if (stampConfig.xNudgeSuper) {
            stamps.push(cont.addChild(new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.X_NUDGE_SUPER))));
        }
        if (stampConfig.volatility !== undefined) {
            const volatilitySprite = new PIXI.Sprite(GameIntroView.getVolatilityTexture(stampConfig.volatility));
            volatilitySprite.pivot.set(0, 6);
            stamps.push(cont.addChild(volatilitySprite));
        }
        GuiLayout_1.GuiLayout.align(stamps, 10, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.HORIZONTAL);
        for (let stamp of stamps) {
            stamp.tint = this._config.colors.stampColor;
            stamp.alpha = 0.8;
        }
        return cont;
    }
    static getVolatilityTexture(volatility) {
        switch (volatility) {
            case Volatility.INSANE:
                return ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.VOL_INSANE);
            case Volatility.EXTREME:
                return ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.VOL_EXTREME);
            case Volatility.HIGH:
                return ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.VOL_HIGH);
            case Volatility.MEDIUM:
            default:
                return ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.VOL_MEDIUM);
        }
    }
    updateSoundButton() {
        const loaded = NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.isLoaded;
        const loading = NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.loading;
        const soundOn = !NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.isQuickMute();
        if (loading || (soundOn && !loaded)) {
            this.soundButton.toggled = false;
            this.soundButton.enable(false);
            this.soundButton.startLoadingAnimation(() => { this.updateSoundButton(); });
        }
        else {
            this.soundButton.stopLoadingAnimation();
            this.soundButton.toggled = soundOn;
            this.soundButton.enable(true);
        }
    }
    createSoundSetting() {
        const container = new PIXI.Container();
        const button = new RadioButton_1.RadioButton("SoundSetting", NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.apiPlugin.translations.translate("Sound on"));
        button.addClickCallback(() => {
            NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.toggleQuickMute();
            button.toggled = !NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.isQuickMute();
        });
        button.enable(true);
        button.toggled = !NolimitGameIntroPlugin_1.NolimitGameIntroPlugin.soundPlugin.isQuickMute();
        container.addChild(button);
        return container;
    }
    show() {
        this.onResize();
        NolimitApplication_1.NolimitApplication.addLayer("INTRO", this);
        if (this._config.onShow) {
            this._config.onShow();
        }
        this.slideShow.start();
        this._continueButton.start();
    }
    close(closeCompleteCallback) {
        const tl = new gsap_1.TimelineLite();
        if (this._config.getCloseTimeline) {
            tl.add(this._config.getCloseTimeline(this));
        }
        else {
            tl.add(new gsap_1.TweenLite(this, 0.2, { alpha: 0, ease: gsap_1.Linear.easeNone }));
        }
        tl.add(() => {
            NolimitApplication_1.NolimitApplication.removeLayer("INTRO");
            this.slideShow.stop();
            this.soundButton.stopLoadingAnimation();
            if (this._config.onClose) {
                this._config.onClose();
            }
            if (closeCompleteCallback) {
                closeCompleteCallback();
            }
        });
        return tl;
    }
    //This resolves when player clicks the continue button
    gameLoadComplete() {
        return new Promise(resolve => {
            this._continueButton.loadingComplete(() => {
                this._continueButton.disable();
                resolve(true);
            });
        });
    }
    pauseSlideShow() {
        this.slideShow.pause();
    }
    resumeSlideShow() {
        this.slideShow.resume();
    }
}
exports.GameIntroView = GameIntroView;
//# sourceMappingURL=GameIntroView.js.map