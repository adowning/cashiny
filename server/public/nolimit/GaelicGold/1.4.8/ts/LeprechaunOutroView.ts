/**
 * Created by Jie Gao on 2018-06-14.
 */
import {CountDownTimer} from "@nolimitcity/slot-game/bin/core/component/CountDownTimer";
import {IScreenViewConfig, ScreenView} from "@nolimitcity/slot-game/bin/core/screen/ScreenView";
import {ParsedGameData} from "@nolimitcity/slot-game/bin/core/server/data/ParsedGameData";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {Orientation} from "@nolimitcity/slot-game/bin/core/stage/Orientation";
import {IResizeData} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {Translation} from "@nolimitcity/slot-game/bin/core/translation/Translation";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";
import {TimelineLite, TweenLite} from "gsap";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";
import {LeprechaunInitialWinCountUp} from "../../winpresentation/initial/LeprechaunInitialWinCountUp";
import {Rainbow} from "../Rainbow";
import {LeprechaunGameModuleConfig} from "../../LeprechaunGameModuleConfig";

export class LeprechaunOutroView extends ScreenView {

    private _winBlowStake:boolean = false; // #259
    private readonly YOU_WON_TEXT:string = "You won";
    private readonly SPINS_PLAYES_TEXT:string = "Spins played";
    private readonly textStyle:any = {
        fontFamily : "Open Sans",
        fontSize : 40,
        fontWeight : FontWeight.EXTRA_BOLD,
        wordWrap : true,
        wordWrapWidth : 600,
        breakWords : true,
        dropShadow : true,
        dropShadowAngle : 89.5,
        dropShadowBlur : 1,
        dropShadowColor : "#6a3c40",
        dropShadowDistance : 4,
        fill : [
            "#fffdec",
            "#fff2a8",
            "#ffc133"],
        lineJoin : "round",
        miterLimit : 7,
        stroke : "#6a3c40",
        strokeThickness : 4
    };
    private readonly numberStyle:any = {
        font : {
            name : "NumbersWinCountUp",
            size : 26
        },
        tint : parseInt(("#ffffff").replace(/^#/, ''), 16)
    };
    private _container:PIXI.Container;
    private _rainbowView:Rainbow;
    private _infoPanel:PIXI.Container;
    private _youWinText:PIXI.Text;
    private _spinsPlayed:PIXI.Text;
    private _spinsPlayedNumber:PIXI.BitmapText;
    private _dimmer:PIXI.Sprite;
    private _winCountUp:LeprechaunInitialWinCountUp;
    private _playSoundCallback:() => void;

    constructor(config:IScreenViewConfig, autoClose:boolean = true) {
        super(config, autoClose);
        this._winCountUp = new LeprechaunInitialWinCountUp(this.numberStyle);
        this._rainbowView = new Rainbow();
    }

    protected createGameGraphics():PIXI.DisplayObject {
        const container:PIXI.Container = new PIXI.Container();
        this._infoPanel = new PIXI.Container();
        this._dimmer = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._dimmer.anchor.set(0.5, 0.5);
        this._dimmer.position.set(360, 360);
        this._dimmer.tint = 0X000000;
        this._dimmer.alpha = 0.5;
        this.addChild(this._dimmer);

        this._rainbowView.createRainbow(container);

        this._youWinText = new PIXI.Text(Translation.translate(this.YOU_WON_TEXT), this.textStyle);
        this._youWinText.anchor.set(0.5);
        this._youWinText.position.set(0, -170);

        this._spinsPlayed = new PIXI.Text(Translation.translate(this.SPINS_PLAYES_TEXT), this.textStyle);
        this._spinsPlayed.anchor.set(0.5);
        this._spinsPlayed.position.set(0, 50);
        Helper.shrinkTextWidth(this.SPINS_PLAYES_TEXT, this._spinsPlayed, 700);
        this._spinsPlayedNumber = new PIXI.BitmapText(Translation.translate(this.SPINS_PLAYES_TEXT), this.numberStyle);
        this._spinsPlayedNumber.position.set(0, 100);

        this.reset();
        this._winCountUp.position.set(0, -56);
        this._infoPanel.addChild(this._youWinText);
        this._infoPanel.addChild(this._spinsPlayed);
        this._infoPanel.addChild(this._spinsPlayedNumber);
        container.addChild(this._winCountUp);
        container.addChild(this._infoPanel);
        this._container = container;
        return container;
    }

    protected onResizeGameGraphics(resizeData:IResizeData):void {
        if(resizeData.orientation == Orientation.PORTRAIT) {
            this._infoPanel.scale.set(1.3, 1.3);
        } else {
            this._infoPanel.scale.set(1.0, 1.0);
        }
        this._container.position.set(360, 360);
        this._dimmer.width = resizeData.width + 100;
        this._dimmer.height = resizeData.height + 100;
    }

    protected startPresentation(data:ParsedGameData, onShowComplete:() => void):void {
        const hasWon:boolean = (data.totalWin > 0);
        // #259
        this._winBlowStake = LeprechaunGameModuleConfig.featurePrice.isWinBelowStake();

        this.alpha = 0;
        const tl:TimelineLite = new TimelineLite({
            paused : true,
            onComplete : () => {
                this._button.visible = true;
                super.startPresentation(data, onShowComplete);
            }
        });
        tl.add(() => {
            this._rainbowView.show(true);
            this._button.visible = false;
            this._spinsPlayed.visible = true;
            this._spinsPlayedNumber.visible = true;
            this._spinsPlayedNumber.text = (<ParsedGameData>data).numberOfFreespinsPlayed!.toString();
            this._spinsPlayed.position.y = (hasWon ? 50 : -30);
            this._spinsPlayedNumber.position.x = 0 - this._spinsPlayedNumber.width / 2;
            this._spinsPlayedNumber.position.y = (hasWon ? 100 : 30);
            this._youWinText.visible = hasWon && !this._winBlowStake;
            this._winCountUp.visible = false;
        });
        tl.add([
            TweenLite.fromTo(this, 1, {alpha : 0}, {alpha : 1}),
            () => {
                // #259
                !this._winBlowStake && SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_END_SWEEEP);
            }
        ]);
        tl.add(() => {
            // #259
            !this._winBlowStake && SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_END);
            SlotGame.sound.fadeAmbience(0, 50);
            SlotGame.sound.playAmbience(LeprechaunSoundConfig.instance.MAIN_GAME_AMBIANCE);
            SlotGame.sound.fadeAmbience(1, 50);
        });
        if(hasWon) {
            tl.add([
                () => {
                    this._winCountUp.visible = true;
                    // #259
                    !this._winBlowStake && SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.COUNT_UP);
                },
                // #259
                this._winCountUp.getCountUpAnimation(0, data.totalWin, this._winBlowStake ? 0 : 2.37, 1)
            ]);
            tl.add(() => {
                SlotGame.sound.stopEffect(LeprechaunSoundConfig.instance.COUNT_UP);
                // #259
                !this._winBlowStake && SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.COUNT_UP_ENDS);
            });
        }
        tl.play(0);
    }

    private reset():void {
        this._rainbowView.hide();
        this._youWinText.visible = false;
        this._winCountUp.visible = false;
        this._spinsPlayed.visible = false;
        this._spinsPlayedNumber.visible = false;
    }

    private playSound():void {
        if(this._playSoundCallback) {
            this._playSoundCallback();
        }
    }

    protected setButtonPosition(resizeData:IResizeData):void {
        const btnPosY:number = resizeData.height * 0.9 - (resizeData.height - 720) * 0.5;
        this._button.position.set(360, btnPosY);
    }

    protected createAutoCloseTimer():CountDownTimer {
        const countDown:CountDownTimer = super.createAutoCloseTimer();
        countDown.visible = false;
        return countDown;
    }

    protected onResizeButton(data:IResizeData):void {
        this._orientationScale = 1;
        super.onResizeButton(data)
    }
}
