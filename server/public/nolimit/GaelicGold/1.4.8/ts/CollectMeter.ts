/**
 * Created by Jie Gao on 2019-11-14.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {SlotGame} from "@nolimitcity/slot-game/bin/core/SlotGame";
import {Orientation} from "@nolimitcity/slot-game/bin/core/stage/Orientation";
import {IResizeData} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {Translation} from "@nolimitcity/slot-game/bin/core/translation/Translation";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {FontWeight} from "@nolimitcity/slot-launcher/bin/loader/font/FontStatics";
import {Elastic, TimelineLite, TweenLite} from "gsap";
import {LeprechaunBetlineEvent} from "../../betline/LeprechaunBetlineEvent";
import {LeprechaunGameModuleConfig} from "../../LeprechaunGameModuleConfig";
import {LeprechaunSoundConfig} from "../../LeprechaunSoundConfig";
import {ICollectMeterConfig} from "./LeprechaunPickNClick";

export interface ICollectMeter {
    dots:PIXI.Sprite[];
    dotGlows:PIXI.Sprite[];
    dotNames:PIXI.Text[];
    text:PIXI.Text;
    resultNumber:PIXI.Text;
    collected:number;
    meterFactor:number;
    name:string
    result:PIXI.Sprite
    mark:string
    id:number
}

export class CollectMeter extends BaseView {
    private readonly COLLECT_LINE_TEXTS:string[][] = [["EXTRA_SPINS", "EXTRA SPINS", "+2", "+"], ["EXTRA_LINES", "RAINBOW LINES", "+2", ""], ["EXTRA_MULTIPLIER", "MULTIPLIER", "+1", "x"]];
    private readonly COLLECT_LINE_Y:number[] = [110, 190, 270];
    private readonly COLLECT_LINE_DOTS_NR:number[] = [3, 2, 3];
    private readonly _meterNameTextStyle:any = {
        fontFamily : "Open Sans",
        fontSize : 40,
        fill : 0xffffff,
        fontWeight : FontWeight.EXTRA_BOLD
    };

    private readonly _coinTextStyle:any = {
        fontFamily : "Open Sans",
        fontSize : 44,
        fontWeight : FontWeight.EXTRA_BOLD,
        align : "center",
        wordWrap : true,
        wordWrapWidth : 300,
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
    private readonly _dotValueStyle:any = {
        fontFamily : "Open Sans",
        fontSize : 38,
        fontWeight : FontWeight.EXTRA_BOLD,
        wordWrap : true,
        align : "center",
        wordWrapWidth : 100,
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
    private readonly _coinResultNumberStyle:any = {
        fontFamily : "Open Sans",
        fontSize : 130,
        fontWeight : FontWeight.EXTRA_BOLD,
        wordWrap : true,
        align : "center",
        wordWrapWidth : 300,
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
    private _collectMeters:ICollectMeter[];
    private _endPosMultiplier:number[];
    private _endPosFS:number[];
    private _endPosLines:number[];
    private _resultPos:number[][] = [[300, 20], [-300, -150], [-300, 90]];
    private _resultScale:number = 0.8;
    private _resultWrapper:PIXI.Sprite;

    constructor() {
        super();
    }

    public createMeter(container:PIXI.Container):void {
        this._resultWrapper = new PIXI.Sprite();
        this._resultWrapper.position.set(360, 360);
        this.addChild(this._resultWrapper);
        this._collectMeters = [];
        this._coinTextStyle.fontSize = this.getMeterNameFontSize();
        this.COLLECT_LINE_TEXTS.forEach((lineText:string[], id:number) => {
            this._collectMeters.push(this.createCollectFiled(lineText, this.COLLECT_LINE_DOTS_NR[id], id));
        });
        container.addChild(this);
    }

    private getMeterNameFontSize():number {
        let fontSize = 44;
        this.COLLECT_LINE_TEXTS.forEach((lineText:string[], id:number) => {
            lineText[1] = Translation.translate(lineText[1]);
            const str:string[] = lineText[1].split(" ");
            str.forEach((text:string) => {
                if(text.length > 10) {
                    fontSize = 28;
                }
            });
        });
        return fontSize;
    }

    public show():void {
        TweenLite.to(this, 0.5, {alpha : 1});
        this._collectMeters.forEach((collectLine:ICollectMeter) => {
            collectLine.dots.forEach((dot:PIXI.Sprite) => {
                dot.visible = true;
            });
            collectLine.text.visible = true;
            collectLine.result.visible = false;
            collectLine.result.alpha = 1;
        });
    }

    public getDot(line:string, index:number):PIXI.Sprite {
        let dot:PIXI.Sprite = new PIXI.Sprite();
        dot.name = "";
        this._collectMeters.forEach((collectLine:ICollectMeter) => {
            if(line === collectLine.name) {
                dot = collectLine.dots[index];
                dot.name = collectLine.mark;
            }
        });
        if(!dot) {
            throw new Error("Undefined picked option name.");
        }
        return dot;
    }

    public updateCollectLine(line:string, index:number, value:number):void {
        this._collectMeters.forEach((collectLine:ICollectMeter) => {
            if(collectLine.name === line) {
                this.updateDots(collectLine, index, value)
            }
        });
    }

    private updateDots(collectLine:ICollectMeter, index:number, value:number):void {
        collectLine.dots[index].texture = GameResources.getTextures("pncCircleCollected")[0];
        collectLine.dots[index].blendMode = PIXI.BLEND_MODES.NORMAL;
        collectLine.dots[index].scale.set(0.2, 0.2);
        collectLine.dotNames[index].text = collectLine.mark + value.toString();
        collectLine.dotNames[index].style.fontSize = (value > 9) ? 32 : 38;
        collectLine.dotNames[index].visible = true;
        collectLine.collected += value;
        if(((collectLine.mark.indexOf("+") > -1) && value > 3) || ((collectLine.mark.indexOf("x") > -1) && value > 2)) {
            TweenLite.fromTo(collectLine.dotGlows[index], 0.2, {alpha : 0}, {alpha : 1});
        }
    }

    public updateAllDots(data:ICollectMeterConfig):void {
        this._collectMeters.forEach((collectLine:ICollectMeter) => {
            const nrCollected:number = (<any>data)[collectLine.name].pickedNumber;
            for(let i:number = 0; i < nrCollected; i++) {
                this.updateDots(collectLine, i, (<any>data)[collectLine.name].value[i])
            }
        });
    }

    public updateMeterData(data:ICollectMeterConfig):void {
        this._collectMeters.forEach((collectLine:ICollectMeter) => {
            const nrCollected:number = (<any>data)[collectLine.name].pickedNumber;
            collectLine.collected = 0;
            for(let i:number = 0; i < nrCollected; i++) {
                collectLine.collected += (<any>data)[collectLine.name].value[i];
            }
        });
    }

    private createCollectFiled(sentance:string[], nrDots:number, id:number):ICollectMeter {
        const titleText = sentance[1];
        const text:PIXI.Text = new PIXI.Text(titleText, this._meterNameTextStyle);
        Helper.shrinkTextWidth(titleText, text, 270);
        text.position.set(-98, this.COLLECT_LINE_Y[id]);
        text.anchor.set(1, 0.5);
        this.addChild(text);
        let dotNames:PIXI.Text[] = [];
        let dotGlows:PIXI.Sprite[] = [];
        const dots:PIXI.Sprite[] = ArrayHelper.initArrayWithValues(nrDots, (i:number) => {
            const glow:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("highCoinGlow")[0]);
            glow.anchor.set(0.5, 0.5);
            glow.scale.set(0.6, 0.6);
            glow.position.set(i * 146 + (id % 2) * 78, this.COLLECT_LINE_Y[id]);
            glow.blendMode = PIXI.BLEND_MODES.ADD;
            glow.alpha = 0;

            const dot:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("pncCircle")[0]);
            dot.anchor.set(0.5, 0.5);
            dot.scale.set(0.9, 0.9);
            dot.position.set(i * 146 + (id % 2) * 78, this.COLLECT_LINE_Y[id]);
            dot.blendMode = PIXI.BLEND_MODES.ADD;
            dot.name = sentance[1];

            const dotName = new PIXI.Text(sentance[2], this._dotValueStyle);
            dotName.anchor.set(0.5, 0.5);
            dotName.position.set(i * 146 + (id % 2) * 78 + 2, this.COLLECT_LINE_Y[id]);
            dotName.visible = false;
            dotNames.push(dotName);
            dotGlows.push(glow);
            this.addChild(glow);
            this.addChild(dot);
            this.addChild(dotName);
            return dot;
        });
        const result:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("pncCircleCollected")[0]);
        result.anchor.set(0.5, 0.5);
        result.position.set(this._resultPos[id][0] - 360, this._resultPos[id][1] - 360);
        result.scale.set(this._resultScale);
        result.name = sentance[1];
        this._resultWrapper.addChild(result);
        const resultName = new PIXI.Text(titleText, this._coinTextStyle);
        resultName.anchor.set(0.5, 0);
        resultName.position.set(3, 12);
        result.visible = false;
        result.addChild(resultName);

        const resultNumber = new PIXI.Text("+", this._coinResultNumberStyle);
        resultNumber.anchor.set(0.5, 0.5);
        resultNumber.position.set(0, 35 - resultNumber.height * 0.5);
        result.addChild(resultNumber);

        return {
            id : id,
            meterFactor : Number(sentance[2].replace(/^\D+/g, '')),
            text : text,
            result : result,
            resultNumber : resultNumber,
            dots : dots,
            dotGlows : dotGlows,
            dotNames : dotNames,
            collected : 0,
            name : sentance[0],
            mark : sentance[3]
        }
    }

    public reset():void {
        this._collectMeters.forEach((collectLine:ICollectMeter, id:number) => {
            collectLine.dots.forEach((dot:PIXI.Sprite, i:number) => {
                this.resetDot(collectLine, dot, i);
            });
            collectLine.text.visible = false;
            collectLine.result.visible = false;
            collectLine.result.position.set(this._resultPos[id][0], this._resultPos[id][1]);
            collectLine.result.scale.set(this._resultScale);
            collectLine.collected = (collectLine.name === "EXTRA_MULTIPLIER") ? 1 : 0;
        });
    }

    private resetDot(collectLine:ICollectMeter, dot:PIXI.Sprite, i:number):void {
        dot.texture = GameResources.getTextures("pncCircle")[0];
        dot.blendMode = PIXI.BLEND_MODES.ADD;
        dot.scale.set(0.9, 0.9);
        dot.visible = false;
        collectLine.dotNames[i].visible = false;
        collectLine.dotGlows[i].alpha = 0;
    }

    public showResult(data:ICollectMeterConfig):TimelineLite {
        const tl:TimelineLite = new TimelineLite();
        this.updateMeterData(data);
        let soundCounter:number = 0;
        this._collectMeters.forEach((collectLine:ICollectMeter) => {
            tl.add([
                () => {
                    collectLine.result.visible = true;
                    collectLine.resultNumber.text = "-";
                    collectLine.dots.forEach((dot:PIXI.Sprite, i:number) => {
                        this.resetDot(collectLine, dot, i);
                    });
                    collectLine.text.visible = false;
                },
                TweenLite.to(collectLine.result, 0.2, {alpha : 1})
            ], 0);
            if(collectLine.collected > 0) {
                const duration:number = Math.min(MathHelper.floorToDecimals(3 / collectLine.collected, 2), 0.4);
                for(let i:number = 0; i < collectLine.collected; i++) {
                    tl.add([
                        () => {
                            collectLine.resultNumber.text = `${collectLine.mark}${i + 1}`;
                            SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_PLING[soundCounter % 2]);
                            soundCounter++;
                        },
                        TweenLite.fromTo(collectLine.resultNumber.scale, duration, {x : 0.8, y : 0.8}, {
                            x : 1,
                            y : 1,
                            ease : Elastic.easeOut
                        })
                    ]);
                }
            }
        });

        return tl;
    }

    public updateGamePanel():TimelineLite {
        const tl:TimelineLite = new TimelineLite();
        let startTime:number = 0;
        let soundIndex:number = 0;
        [2, 0, 1].forEach((i:number) => {
            const collectLine:ICollectMeter = this._collectMeters[i];
            const duration:number = (collectLine.collected > 0) ? 1 : 0;
            tl.add([
                TweenLite.to(collectLine.result, duration, {alpha : 0}),
                TweenLite.to(collectLine.result.scale, duration, {x : 0, y : 0})
            ], startTime);
            switch(collectLine.name) {
                case "EXTRA_SPINS":
                    if(collectLine.collected > 0) {
                        tl.add([
                            TweenLite.to(collectLine.result, duration, {
                                x : this._endPosFS[0],
                                y : this._endPosFS[1]
                            }),
                            () => {
                                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_COLLECTS[soundIndex % 2]);
                                soundIndex++;
                            }], startTime);
                        tl.add(() => {SlotGame.keypad.setZeroBetSpinCounter(5 + collectLine.collected);}, startTime + duration);
                        startTime += duration;
                    }
                    break;
                case "EXTRA_LINES":
                    if(collectLine.collected > 0) {
                        tl.add([
                            TweenLite.to(collectLine.result, duration, {
                                x : this._endPosLines[0],
                                y : this._endPosLines[1]
                            }),
                            () => {
                                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_COLLECTS[soundIndex % 2]);
                                soundIndex++;
                            }], startTime);

                        tl.add(() => {
                            EventHandler.dispatchEvent(new GameEvent(LeprechaunBetlineEvent.SHOW_RAINBOW_NUMBER, collectLine.collected));
                        });
                        startTime += collectLine.collected * 1.2 + duration;
                        tl.add(() => {}, startTime);
                    }
                    break;
                case "EXTRA_MULTIPLIER":
                    if(collectLine.collected > 0) {
                        tl.add([TweenLite.to(collectLine.result, duration, {
                            x : this._endPosMultiplier[0],
                            y : this._endPosMultiplier[1]
                        }),
                            () => {
                                SlotGame.sound.playEffect(LeprechaunSoundConfig.instance.BONUS_COLLECTS[soundIndex % 2]);
                                soundIndex++;
                            }], startTime);

                        tl.add(() => {LeprechaunGameModuleConfig.logo.showMultiplier(collectLine.collected + 1);});
                        startTime += duration;
                    }
                    break;
                default:
                    break;
            }
        });

        return tl;
    }

    protected onResize(resizeData:IResizeData):void {
        const isPortrait:boolean = resizeData.orientation === Orientation.PORTRAIT;
        this._resultScale = (isPortrait ? 0.6 : 0.8);
        this._resultPos = [[-60, -390], [-660, -560], [-660, -220]];
        this._endPosFS = isPortrait ? [-360, -90] : [100, -240];
        this._endPosLines = isPortrait ? [-725, -577] : [-671, -560];
        this._endPosMultiplier = isPortrait ? [-95, -657] : [-140, -635];
        let scale:number = (isPortrait ? 0.86 : 1);
        this.scale.set(scale, scale);
    }
}
