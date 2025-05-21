/**
 * Created by Jie Gao on 2018-11-08.
 */
import {SpineTween} from "@nolimitcity/slot-game/bin/core/animation/SpineTween";
import {NineSliceButton} from "@nolimitcity/slot-game/bin/core/component/NineSliceButton";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {IPickAndClickViewConfig, PickAndClickView} from "@nolimitcity/slot-game/bin/core/pickandclick/PickAndClickView";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ParsedServerData} from "@nolimitcity/slot-game/bin/core/server/data/ParsedServerData";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {Orientation} from "@nolimitcity/slot-game/bin/core/stage/Orientation";
import {IResizeData} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {TextStyleOptions} from "@nolimitcity/slot-game/bin/core/text/TextStyleOptions";
import {Translation} from "@nolimitcity/slot-game/bin/core/translation/Translation";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {FontStyle, FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";
import {Power2, Power3, TimelineLite, Tween, TweenLite} from "gsap";
import {LeprechaunButton} from "../../effects/LeprechaunButton";
import {LeprechaunGameAssets} from "../../LeprechaunGameAssets";
import {LeprechaunGameModuleConfig} from "../../LeprechaunGameModuleConfig";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";
import {LeprechaunParsedGameData} from "../../server/data/LeprechaunParsedGameData";
import {LeprechaunParsedInitData} from "../../server/data/LeprechaunParsedInitData";
import {Rainbow} from "../Rainbow";
import {CollectMeter} from "./CollectMeter";
import {ICoin, LeprechaunPCNCoin} from "./LeprechaunPCNCoin";
import {ICollectMeterData} from "./LeprechaunPickNClick";
import {PncEvent} from "./PncEvent";

require("@nolimitcity/slot-game/lib/gsap/src/umd/CustomWiggle.js");

export function isNumber(value:any):value is number {
    return typeof value === "number" && value === value;
}

export class LeprechaunPickNClickScreen extends PickAndClickView {

    private readonly STONE_POS_PORTRAIT:number[][] = [[-574, -608], [-360, -646], [-122, -604], [-486, -503], [-242, -503], [-576, -356], [-126, -362], [-516, -779], [-236, -779]];
    private readonly STONE_POS_LANDSCAPE:number[][] = [[-775, -498], [-598, -584], [-368, -630], [-150, -582], [45, -506], [-785, -272], [-494, -394], [-218, -398], [64, -284]];
    private readonly BUTTON_COLORS:string[] = ["Red", "Yellow", "Green", "Gray", "Orange", "Blue", "Pink", "Purple", "Turquoise"];
    private readonly DEFAULT_BUTTON_SIZE:PIXI.Point = new PIXI.Point(240, 64);
    private readonly PICK_STONE_TEXT:string = "Pick a coin";
    private readonly INTRO_EXPLAIN_TEXT_0:string = "You won 5 Rainbow Spins";
    private readonly INTRO_EXPLAIN_TEXT_1:string = "Coins award added lines, multipliers and spins.";
    private _pickText:PIXI.Text;
    private _introExplainText0:PIXI.Text;
    private _introExplainText1:PIXI.Text;
    private _coinFlipAnimationText:PIXI.Text;
    private _container:PIXI.Container;
    private _buttonsWrapper:PIXI.Sprite;
    private _collectMeter:CollectMeter;
    private _rainbowView:Rainbow;
    private _coinFlipAnimationIcon:PIXI.Sprite;
    private _clickedCoins:ICoin[];
    private _stonePos:number[][];
    private _coinFlipAnimation:TimelineSprite;
    private _sparkleBurst:TimelineSprite;
    private _fsStartAnimation:PIXI.spine.Spine;
    private _collectAnimation:TimelineLite;
    private _button:NineSliceButton;
    private _startButton:LeprechaunButton;
    private _bonusSymbolTriggerAnimation:TimelineSprite;
    private _bonusSymbolTriggerSprite:PIXI.Sprite;
    private _idleTimer:Tween | null;
    private _startTime:number = 8;
    private _minInterval:number = 8;
    private _maxInterval:number = 12;
    private _isPlaying:boolean = false;
    private _addDelay:boolean = false;

    // private _deviceScale:number = 1.2;
    private _portraitScale:number = 1.2;

    constructor(config:IPickAndClickViewConfig, autoClick:boolean = false) {
        super(config, autoClick);
        this._buttons = [];
        this._collectMeter = new CollectMeter();
        this._rainbowView = new Rainbow();
    }

    protected initAnimations():void {
        super.initAnimations();
        this._bonusSymbolTriggerSprite = new PIXI.Sprite();
        this._bonusSymbolTriggerSprite.anchor.set(0.5, 0.5);
        const bonusSymbol:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("B/B")[0]);
        bonusSymbol.position.set(0, 0);
        bonusSymbol.anchor.set(0.5, 0.5);
        const rainbowIdle:TimelineSprite = new TimelineSprite(GameResources.getTextures("rainbowBonusIdle"), 15);
        rainbowIdle.anchor.set(0.5, 1);
        rainbowIdle.hide();
        rainbowIdle.position.set(0, 58);
        rainbowIdle.blendMode = PIXI.BLEND_MODES.ADD;
        this._bonusSymbolTriggerAnimation = rainbowIdle;
        this._bonusSymbolTriggerSprite.addChild(rainbowIdle);
        this._bonusSymbolTriggerSprite.addChild(bonusSymbol);
        this._bonusSymbolTriggerSprite.position.set(-4, -16);
    }


    private createContinueButton(clickCallback:() => void):NineSliceButton {
        const text:string = Translation.translate("CONTINUE");
        const textStyle:TextStyleOptions = this.getScaledButtonTextStyle();
        const button = new NineSliceButton(clickCallback, ` ${text} `, textStyle, {
            cornerRadius : 12,
            lineThickness : 2,
            lineColor : 0xFFFFFF,
            lineAlpha : 1,
            backgroundColor : 0x000000,
            backgroundAlpha : 0.0,
        });
        button.enabled = false;
        return button;
    }

    private createStartButton(clickCallback:() => void):LeprechaunButton {
        const button = new LeprechaunButton(GameResources.getTextures("pncStartCoin")[0], () => clickCallback());
        button.anchor.set(0.5, 0.5);
        button.enabled = false;
        return button;
    }

    protected getScaledButtonTextStyle():TextStyleOptions {
        const style:TextStyleOptions = {
            fontFamily : "Open Sans",
            fontStyle : FontStyle.ITALIC,
            fontSize : 34,
            fill : "#ffffff",
            fontWeight : FontWeight.EXTRA_BOLD
        };
        if(!isNumber(style.fontSize)) {
            debugger;
            throw new Error("Error: IntoView.getScaledButtonTextStyle(): please use number fontSize!");
        }

        style.fontSize = (<number>style.fontSize) * this._deviceScale;
        return style;
    }

    protected createGameGraphics():PIXI.DisplayObject {
        const textStyle:any = {
            fontFamily : "Open Sans",
            fontSize : 38,
            wordWrap : true,
            wordWrapWidth : 530,
            breakWords : true,
            fontWeight : FontWeight.EXTRA_BOLD,
            fill : 0xffffff,
            dropShadow : true,
            dropShadowAngle : 8,
            dropShadowBlur : 10,
            dropShadowDistance : 4,
            padding: 6
        };
        const explainTextStyle:any = {
            fontFamily : "Open Sans",
            fontSize : 22,
            wordWrap : true,
            wordWrapWidth : 700,
            breakWords : true,
            fontWeight : FontWeight.EXTRA_BOLD,
            fill : 0xffffff,
            dropShadow : true,
            dropShadowAngle : 8,
            dropShadowBlur : 10,
            dropShadowDistance : 4,
            padding: 6
        };
        const container:PIXI.Container = new PIXI.Container();
        this._container = container;
        this._buttonsWrapper = new PIXI.Sprite();
        this._container.position.set(360, 360);
        this._buttonsWrapper.position.set(360, 360);
        this._rainbowView.createRainbow(container);
        this._collectMeter.createMeter(container);
        //empty space is for the drop shadow on the text
        const pickText:string = " " + Translation.translate(this.PICK_STONE_TEXT) + " ";
        this._pickText = this.createText(pickText, textStyle, 40);
        Helper.shrinkTextWidth(pickText, this._pickText, 400);
        this._introExplainText0 = this.createText(Translation.translate(this.INTRO_EXPLAIN_TEXT_0), explainTextStyle, 160);
        this._introExplainText1 = this.createText(Translation.translate(this.INTRO_EXPLAIN_TEXT_1), explainTextStyle, 200);
        this._coinFlipAnimationText = this.createText("", textStyle, 0);
        this._coinFlipAnimationText.style.fontSize = 70;

        this._coinFlipAnimationIcon = new PIXI.Sprite();
        this._coinFlipAnimationIcon.anchor.set(0.5, 0.5);
        this._coinFlipAnimationIcon.scale.set(0.5, 0.5);
        this._coinFlipAnimationIcon.position.set(0, -70);
        this._coinFlipAnimationIcon.alpha = 0;

        this._coinFlipAnimation = new TimelineSprite(GameResources.getTextures("pncCoinFlip"));
        this._coinFlipAnimation.anchor.set(0.5, 0.5);
        this._coinFlipAnimation.hide();

        this._sparkleBurst = new TimelineSprite(GameResources.getTextures("pncSparkleBurst"));
        this._sparkleBurst.blendMode = PIXI.BLEND_MODES.ADD;
        this._sparkleBurst.anchor.set(0.5, 0.5);
        this._sparkleBurst.hide();

        this._bonusSymbolTriggerAnimation = new TimelineSprite(GameResources.getTextures("bonusIdleRainbow"), 15);
        this._bonusSymbolTriggerAnimation.anchor.set(0.5, 0.5);
        this._bonusSymbolTriggerAnimation.hide();

        this._fsStartAnimation = new PIXI.spine.Spine(GameResources.getSpineAsset("leprechaunPick"));
        this._fsStartAnimation.autoUpdate = true;
        this._fsStartAnimation.position.set(0, -98);
        this._fsStartAnimation.state.setEmptyAnimation(0, 0);
        this._coinFlipAnimation.visible = false;
        this._coinFlipAnimation.addChild(this._coinFlipAnimationText);
        this._coinFlipAnimation.addChild(this._coinFlipAnimationIcon);
        this._buttonsWrapper.addChild(this._pickText);
        container.addChild(this._buttonsWrapper);
        return container;
    }

    protected createBackground():PIXI.DisplayObject {
        const bg:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures(LeprechaunGameAssets.PICK_AND_CLICK_BACKGROUND)[0]);
        bg.scale.set(8, 8);
        bg.anchor.set(0.5, 0.5);
        bg.position.set(360, 360);
        bg.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        return bg;
    }

    protected createButton(id:number, selectedIndex:number, clickCallback:(id:number, auto:boolean) => void):LeprechaunButton {
        const button = new LeprechaunButton(GameResources.getTextures("pncStone" + this.BUTTON_COLORS[id])[0],
            () => {clickCallback(selectedIndex, this._autoClicked);});
        button.anchor.set(0.5, 0.5);
        this._buttonsWrapper.addChild(button);
        return button;
    }

    protected createButtons(buttonConfig:any[]):LeprechaunButton[] {
        const buttons:LeprechaunButton[] = [];
        this._clickedCoins = ArrayHelper.initArrayWithValues(this.BUTTON_COLORS.length, (index) => {
            const coin:LeprechaunPCNCoin = new LeprechaunPCNCoin(index);
            this._buttonsWrapper.addChild(coin.coin);
            return coin;
        });
        ArrayHelper.initArrayWithValues(this.BUTTON_COLORS.length, (index) => {
            const button:LeprechaunButton = this.createButton(index, index, this._onButtonClickCallback);
            button.enabled = false;
            buttons.push(button);
        });
        return buttons;
    }

    private createText(value:string, style:any, y:number):PIXI.Text {
        const text:PIXI.Text = new PIXI.Text(value, style);
        text.anchor.set(0.5, 0.5);
        text.position.set(0, y);
        text.alpha = 0;
        return text;
    }

    public createContinueButtons(onCloseComplete?:() => void):void {
        if(!this._button) {
            this._button = this.createContinueButton(() => {
                onCloseComplete!();
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_START);
                SlotGame.sound.fadeAmbience(0, 1000);
                SlotGame.sound.playAmbience(LeprechaunSoundConfig.instance.FREE_SPIN_AMBIANCE);
                SlotGame.sound.fadeAmbience(1, 1000);
            });
            this._startButton = this.createStartButton(() => {
                onCloseComplete!();
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_START);
                SlotGame.sound.fadeAmbience(0, 1000);
                SlotGame.sound.playAmbience(LeprechaunSoundConfig.instance.FREE_SPIN_AMBIANCE);
                SlotGame.sound.fadeAmbience(1, 1000);
            });
        }
        this._button.visible = false;
        this._container.addChild(this._button);
        this._startButton.visible = false;
        this._container.addChild(this._startButton);
    }

    public startPresentation(data:ParsedServerData, onShowComplete:() => void):void {
        this.reset();
        const gameData:LeprechaunParsedInitData = <LeprechaunParsedInitData>data;
        if(gameData.isRestoreSelectedAll) {
            this.hideAllButtons();
            this.visible = true;
            this._rainbowView.show(true);
            this._background.alpha = 1;
            this._container.addChild(this._fsStartAnimation);
            this._fsStartAnimation.visible = true;
            this._collectMeter.show();
            this._collectMeter.showResult((<LeprechaunParsedGameData>data).pickedData).progress(1);
            this._fsStartAnimation.position.set(0, 0);
            this._fsStartAnimation.scale.set(1.3, 1.3);
            this._pickText.alpha = 0;
            LeprechaunGameModuleConfig.hotZone.stopHotZoneWinStar();
            this._container.addChild(this._button);
            new TimelineLite().add(new SpineTween(this._fsStartAnimation, 0, "animation")).add(() => {
                this._container.addChild(this._startButton);
                this._button.visible = true;
                this._button.enabled = true;
                this._startButton.visible = true;
                this._startButton.enabled = true;
            });
            return;
        }
        const tl:TimelineLite = new TimelineLite({paused : true});
        const fs:number = 0.033;
        tl.add(() => {
            LeprechaunGameModuleConfig.hotZone.hide(true);
            this.hideAllButtons();
            this.visible = true;
        });
        if(!gameData.isRestoreState) {
            tl.add([
                () => {
                    this._bonusSymbolTriggerAnimation.show();
                    this._bonusSymbolTriggerAnimation.playLoop();
                    this._container.addChild(this._bonusSymbolTriggerSprite);
                },
                TweenLite.to(this._bonusSymbolTriggerSprite.scale, 15 * fs, {x : 1.3, y : 1.3}),
                TweenLite.to(this._bonusSymbolTriggerSprite, 1, {alpha : 1})
            ], 0);
        }
        if(gameData.isRestoreState) {
            tl.add(this.showAllButtonsOnRestore());
        } else {
            tl.add(this.showAllButtons((<LeprechaunParsedGameData>data).possibleReveals));
        }

        tl.add(() => this.setButtonStates(gameData));
        tl.add([
            () => {
                this._collectMeter.show();
                if(onShowComplete) {
                    onShowComplete();
                }
            },
            TweenLite.fromTo(this._pickText, 4 * fs, {alpha : 0}, {alpha : gameData.isRestoreSelectedAll ? 0 : 1})
        ]);
        LeprechaunGameModuleConfig.hotZone.stopHotZoneWinStar();
        tl.play();
    }

    private setButtonStates(gameData:LeprechaunParsedInitData):void {
        if(gameData.isRestoreState) {
            this._collectMeter.updateAllDots({
                "EXTRA_LINES" : {value : gameData.addedLines, pickedNumber : gameData.pickedExtraLines},
                "EXTRA_MULTIPLIER" : {value : gameData.addedMultiplier, pickedNumber : gameData.pickedExtraMultiplier},
                "EXTRA_SPINS" : {value : gameData.addedNumberOfFreespins, pickedNumber : gameData.pickedExtraSpins}
            });
        }
        (<LeprechaunButton[]>this._buttons).forEach((button:LeprechaunButton, i:number) => {
            const coin:ICoin = this._clickedCoins[i];
            button.position.set(this._stonePos[i][0], this._stonePos[i][1]);
            coin.coin.position.set(this._stonePos[i][0], this._stonePos[i][1]);
            if(gameData.isRestoreState) {
                if(gameData.pickedIndexesBefore) {
                    const picked:boolean = gameData.pickedIndexesBefore[i];
                    button.visible = !picked;
                    button.enabled = !picked;
                    coin.setStoneState(gameData.revealedBefore[i], picked, false);
                } else {
                    button.enabled = true;
                    button.visible = true;
                }
            } else {
                button.enabled = true;
                button.visible = true;
                coin.coin.visible = false;
                coin.coinValue.text = "";
            }
        });
    }

    public showAllButtons(values:string[]):TimelineLite {
        const tl:TimelineLite = new TimelineLite();
        const showTextDuration:number = 3.7;
        const flyTime:number[] = [0.6, 0.3, 0.2, 0.3, 0.4, 0.4, 0.3, 0.3, 0.6];
        tl.add([() => {
            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_STAR_IN);
            this._container.addChild(this._introExplainText0);
            this._container.addChild(this._introExplainText1);
            this._introExplainText0.alpha = 0;
            this._introExplainText1.alpha = 0;
        },
            TweenLite.fromTo(this._introExplainText0, 0.5, {alpha : 0}, {alpha : 1}),
            TweenLite.fromTo(this._introExplainText1, 0.5, {alpha : 0}, {alpha : 1}),
        ], 0);

        this._clickedCoins.forEach((coin:ICoin, i:number) => {
            const coinValue:string = values[i];
            tl.add([
                () => {
                    this._buttons[i].alpha = 0;
                    this._buttons[i].position.set(-360, -360);
                    this._buttons[i].visible = true;
                    coin.setStoneState(coinValue, true, true);
                },
                TweenLite.fromTo(coin.coin, 1, {x : -360, y : -360}, {
                    x : this._stonePos[i][0],
                    y : this._stonePos[i][1],
                    ease : Power2.easeOut
                })
            ], flyTime[i]);
            tl.add([
                TweenLite.to(coin.coin, 0.5, {x : -360, y : -360}),
                TweenLite.to(coin.coin, 0.5, {alpha : 0})
            ], 0.6 + showTextDuration);

            tl.add([
                () => {
                    coin.coinValue.text = "";
                    coin.coinIcon.visible = false;
                    coin.coin.visible = false;
                    coin.coin.alpha = 1;
                    coin.coin.position.set(this._stonePos[i][0], this._stonePos[i][1]);
                },
                TweenLite.to(this._buttons[i], 0.5, {
                    x : this._stonePos[i][0],
                    y : this._stonePos[i][1],
                    ease : Power2.easeOut
                }),
                TweenLite.to(this._buttons[i], 0.5, {alpha : 1})
            ], 1 + showTextDuration + flyTime[i]);
        });

        tl.add([
            () => {
                this._rainbowView.show(false);
            },
            TweenLite.to(this._background, 0.6, {alpha : 1})], 1.4);
        tl.add(() => {
            this._bonusSymbolTriggerSprite.alpha = 0;
            this._bonusSymbolTriggerAnimation.hide();
            this._bonusSymbolTriggerAnimation.stopLoop();
            this._container.removeChild(this._bonusSymbolTriggerSprite);
            this._container.removeChild(this._introExplainText0);
            this._container.removeChild(this._introExplainText1);
            this._introExplainText0.alpha = 0;
            this._introExplainText1.alpha = 0;
        }, 1.4 + showTextDuration);
        tl.add([
            () => {
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_STAR_OUT2);
                this.onIdle();
            }
        ], 0.6 + showTextDuration);

        return tl;
    }

    public showAllButtonsOnRestore():TimelineLite {
        const tl:TimelineLite = new TimelineLite();
        tl.add([
            () => {
                this._rainbowView.show(true);
                this.onIdle();
            },
            TweenLite.to(this._background, 0, {alpha : 1})
        ], 0);
        return tl;
    }

    public doCollectAnimation(thisRevealedPicked:string, collectMeterData:ICollectMeterData, btnId:number, pickedIndexesAfter:boolean[], pickedType:string, onShowComplete:() => void):void {
        if(this._collectAnimation && this._collectAnimation.isActive()) {
            this._collectAnimation.progress(1);
            this._collectAnimation.kill();
        }
        this._collectAnimation = new TimelineLite({paused : true});
        const value:number = collectMeterData.value[collectMeterData.pickedNumber - 1];
        const dot:PIXI.Sprite = this._collectMeter.getDot(pickedType, collectMeterData.pickedNumber - 1);
        this.playRevealAnimation(thisRevealedPicked, btnId, this._collectAnimation);
        this._collectAnimation.add([
            TweenLite.to(this._coinFlipAnimation.scale, 0.2, {x : 0.2, y : 0.2}),
            TweenLite.to(this._coinFlipAnimation, 0.2, {x : dot.position.x, y : dot.position.y})
        ]);
        this._collectAnimation.add(() => {
            this._clickedCoins[btnId].setStoneState(thisRevealedPicked, true, false);
            let nrUnclickedBtn:number = 0;
            this._coinFlipAnimation.hide();
            this._collectMeter.updateCollectLine(pickedType, collectMeterData.pickedNumber - 1, value);
            (<LeprechaunButton[]>this._buttons).forEach((button:LeprechaunButton, i:number) => {
                button.enabled = !pickedIndexesAfter[i];
                nrUnclickedBtn += (pickedIndexesAfter[i] ? 0 : 1);
            });
            if(nrUnclickedBtn < 2) {
                EventHandler.dispatchEvent(new GameEvent(PncEvent.LAST_PICK));
            }
            onShowComplete();
        });
        this._collectAnimation.play();
    }

    private playRevealAnimation(thisRevealedPicked:string, btnId:number, tl:TimelineLite):void {
        const button:LeprechaunButton = <LeprechaunButton>this._buttons[btnId];
        this._coinFlipAnimation.position.set(button.position.x + 360, button.position.y + 360);
        this._coinFlipAnimation.scale.set(0.36, 0.36);
        this._container.addChild(this._coinFlipAnimation);
        this._container.addChild(this._sparkleBurst);

        this.getIconTexture(thisRevealedPicked, this._coinFlipAnimationIcon);
        this._coinFlipAnimationIcon.visible = false;
        //empty space is for the drop shadow on the text
        this._coinFlipAnimationText.text = " " + thisRevealedPicked + " ";
        this._coinFlipAnimationText.visible = false;
        this._coinFlipAnimationText.alpha = 1;
        this._coinFlipAnimation.alpha = 1;
        this._collectAnimation.add([
            () => {
                this.enableButtons(false);
                button.visible = false;
                this._sparkleBurst.scale.set(1, 1);
                this._sparkleBurst.position.set(button.position.x + 360, button.position.y + 360);
            },
            this._sparkleBurst.getAnimationAutoShowHide(true, true)
        ], 0);
        this._collectAnimation.add([
            () => {SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_STAR_PICK_EXPAND);},
            this._coinFlipAnimation.getAnimationAutoShowHide(true, false, [0]),
            TweenLite.to(this._coinFlipAnimation, 0.5, {x : 0, y : 0}),
            TweenLite.to(this._coinFlipAnimation.scale, 0.5, {x : 1, y : 1}),
            TweenLite.to(this._coinFlipAnimationText, 0.2, {alpha : 1}),
            TweenLite.to(this._coinFlipAnimationIcon, 0.2, {alpha : ((thisRevealedPicked.indexOf("x") > -1 || thisRevealedPicked.length > 3) ? 0 : 1)})
        ], 0);
        this._collectAnimation.add(this._coinFlipAnimation.getAnimationAutoShowHide(true, false), "0.5");
        this._collectAnimation.add([
            () => {
                this._sparkleBurst.position.set(0, 0);
                this._sparkleBurst.scale.set(3.5, 3.5);
            },
            this._sparkleBurst.getAnimationAutoShowHide(true, true)], "0.86");
        this._collectAnimation.add([
            () => {
                this._coinFlipAnimationText.visible = true;
                this._coinFlipAnimationIcon.visible = true;
            },
            TweenLite.to(this._coinFlipAnimationText, 1, {alpha : 1}),
            TweenLite.to(this._coinFlipAnimation.scale, 0.5, {x : 1.1, y : 1.1})
        ], "0.8");
    }

    private showStartCoin(possibleReveals:string[], playerSelection:number, pickedIndexesAfter:boolean[]):TimelineLite {
        if(this._collectAnimation && this._collectAnimation.isActive()) {
            this._collectAnimation.progress(1);
            this._collectAnimation.kill();
        }
        this._collectAnimation = new TimelineLite();
        let startIndex:number = possibleReveals.length > 0 ? playerSelection : -1;
        if(startIndex < 0) {
            pickedIndexesAfter.forEach((picked:boolean, i:number) => {if(!picked) {startIndex = i;}});
        }
        const button:LeprechaunButton = <LeprechaunButton>this._buttons[startIndex];
        this._fsStartAnimation.position.set(button.position.x, button.position.y - 200);
        this._fsStartAnimation.scale.set(0.4, 0.4);
        this.playRevealAnimation("START", startIndex, this._collectAnimation);
        this._collectAnimation.add([
            TweenLite.to(this._coinFlipAnimation, 0.2, {alpha : 0}),
            TweenLite.to(this._pickText, 0.2, {alpha : 0})
        ]);
        return this._collectAnimation;
    }

    public updateAllButtons(buttonState:boolean[]):void {
        if(!this._buttons || this._buttons.length === 0) {
            return;
        }
        buttonState.forEach((picked:boolean, i:number) => {
            this._buttons[i].visible = !picked;
            this._clickedCoins[i].coin.visible = picked;
            this._buttons[i].enabled = !picked;
        });
    }

    public hideAllButtons():void {
        (<LeprechaunButton[]>this._buttons).forEach((button:LeprechaunButton, i:number) => {
            button.visible = false;
            this._clickedCoins[i].coin.visible = false;
            button.enabled = false;
        });
    }

    protected stopPresentation(data:LeprechaunParsedGameData, closeCallback:() => void):void {
        const tl:TimelineLite = new TimelineLite({paused : true});
        const fs:number = 0.033;
        if(this._collectAnimation && this._collectAnimation.isActive()) {
            this._collectAnimation.progress(1);
        }
        this.onIdleStop();
        this.enableButtons(false);
        this._container.addChild(this._fsStartAnimation);
        this._fsStartAnimation.visible = true;
        tl.add(this.showStartCoin(data.possibleReveals, data.playerSelection, data.pickedIndexesAfter));
        tl.add([
            () => {
                this._pickText.alpha = 0;
                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_STAR_END);
                this.hideAllButtons();
            },
            TweenLite.to(this._fsStartAnimation, 30 * fs, {x : 0, y : 0, ease : Power3.easeIn}),
            TweenLite.to(this._fsStartAnimation.scale, 30 * fs, {x : 1.3, y : 1.3, ease : Power3.easeIn})
        ]);
        tl.add([
            new SpineTween(this._fsStartAnimation, 0, "animation"),
            this._collectMeter.showResult(data.pickedData)
        ]);
        tl.add(() => {
            this._container.addChild(this._button);
            this._button.visible = true;
            this._button.enabled = true;

            this._container.addChild(this._startButton);
            this._startButton.visible = true;
            this._startButton.enabled = true;
        });
        tl.play(0);
    }

    public updateGamePanel():TimelineLite {
        const tl:TimelineLite = new TimelineLite();
        tl.add([
            () => {
                this._button.visible = false;
                this._startButton.visible = false;
            },
            TweenLite.to(this._background, 0.2, {alpha : 0}),
            new SpineTween(this._fsStartAnimation, 0, "animation"),
            this._rainbowView.animateHide()
        ]);
        tl.add([
            () => {this._fsStartAnimation.visible = false;},
            this._collectMeter.updateGamePanel()
        ]);
        tl.add(() => {this.reset()});
        return tl;
    }

    protected onResizeGameGraphics(resizeData:IResizeData):void {
        this._isResizeDirty = false;
        const ratio:number = resizeData.height / resizeData.width;
        if(ratio < 1.32 && ratio > 0.85) {
            this._buttonsWrapper.position.set(300, (resizeData.orientation === Orientation.PORTRAIT) ? 334 : 286);
            this._buttonsWrapper.scale.set(0.85, 0.85);
            return;
        }
        this._buttonsWrapper.scale.set(1, 1);
        this._buttonsWrapper.position.set(360, 360);
    }

    public reset():void {
        this._introExplainText0.alpha = 0;
        this._introExplainText1.alpha = 0;
        this._bonusSymbolTriggerSprite.scale.set(1, 1);
        this._bonusSymbolTriggerSprite.alpha = 0;
        this._bonusSymbolTriggerAnimation.hide();
        this._bonusSymbolTriggerAnimation.stopLoop();
        this._collectMeter.reset();
        this._rainbowView.hide();
        if(this._fsStartAnimation) {
            this.removeChild(this._fsStartAnimation);
            this._fsStartAnimation.state.clearTrack(0);
            this._fsStartAnimation.skeleton.setToSetupPose();
            this._fsStartAnimation.visible = false;
        }
        this._coinFlipAnimationText.visible = false;
        this._coinFlipAnimationIcon.visible = false;
        this._coinFlipAnimation.hide();
        this._background.alpha = 0;
        if(this._collectAnimation) {
            if(this._collectAnimation.isActive()) {
                this._collectAnimation.progress(1);
            }
            this._collectAnimation.kill();
        }
    }

    public removeView() {
        this._layer.removeChild(this);
        this._isShowing = false;
        this._autoClicked = false;
    }

    public getIconTexture(value:string, sprite:PIXI.Sprite):void {
        const isSpins:boolean = value.indexOf("+") > -1;
        const hasSign:boolean = (isSpins || (value.length < 2));
        if(!hasSign) {
            sprite.visible = false;
            return;
        }
        sprite.visible = true;
        sprite.texture = GameResources.getTextures(isSpins ? "pncSpinsIcon" : "pncRainbowIcon")[0];
    }

    public addDelayToStart():void {
        this._addDelay = true;
    }

    public resetDelay():void {
        this._addDelay = false;
    }

    protected onResizeButtons(resizeData:IResizeData):void {
        const isPortrait:boolean = (resizeData.orientation === Orientation.PORTRAIT);
        const stonePos:number[][] = (isPortrait ? this.STONE_POS_PORTRAIT : this.STONE_POS_LANDSCAPE);
        if(!this.visible) {
            return;
        }
        this._pickText.position.set(-360, isPortrait ? -407 : -495);
        (<LeprechaunButton[]>this._buttons).forEach((button:LeprechaunButton, i:number) => {
            button.position.set(stonePos[i][0], stonePos[i][1]);
            this._clickedCoins[i].coin.position.set(stonePos[i][0], stonePos[i][1]);
        });
        this._stonePos = stonePos;
        this.onResizeButton(resizeData);
    }

    protected onResizeButton(data:IResizeData):void {
        this._orientationScale = 1;
        const buttonSize:PIXI.Point = this.getScaledButtonSize();
        this._button.setSize(buttonSize.x, buttonSize.y, this._layer.scale.x * this._orientationScale);
        this.setButtonPosition(data);
    }

    private getScaledButtonSize():PIXI.Point {
        const buttonSize:PIXI.Point = this.DEFAULT_BUTTON_SIZE;
        return new PIXI.Point(buttonSize.x * this._deviceScale, buttonSize.y * this._deviceScale);
    }

    protected setButtonPosition(data:IResizeData):void {
        this._button.position.set(0, this._screenHeight * 0.35);
        this._startButton.position.set(-22, -6);
    }

    protected onResizeBackground(data:IResizeData):void {}

    private playIdleAnimation(startTime:number, playBefore:boolean):void {
        if(!this._isPlaying) {
            return;
        }
        CustomWiggle.create("wiggle", {wiggles : 3, type : "easeInOut"});
        (<LeprechaunButton[]>this._buttons).forEach((button:LeprechaunButton) => {
            if(button.visible) {
                new TimelineLite().add(new TimelineLite().to(button, 2, {rotation : Math.PI / 6, ease : "wiggle"}));
            }
        });

        this._idleTimer = TweenLite.to(this, startTime, {onComplete : () => this.playIdleAnimation(MathHelper.randomNumberInRange(this._minInterval, this._maxInterval), true)});
    }

    private onIdleStop():void {
        this._isPlaying = false;

        if(this._idleTimer) {
            this._idleTimer.pause();
            this._idleTimer.kill();
            this._idleTimer = null;
        }
    }

    private onIdle():void {
        this._isPlaying = true;
        this.playIdleAnimation(this._startTime, false);
    }

    public wait():void {}
}
