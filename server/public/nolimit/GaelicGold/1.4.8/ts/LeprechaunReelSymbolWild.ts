/**
 * Created by Jie Gao on 2019-10-29.
 */
import {SpineTween} from "@nolimitcity/slot-game/bin/core/animation/SpineTween";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {
    ISymbolStateConfig,
    StateReelSymbol,
    SymbolStateTransition
} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {Timeline, TimelineLite, TweenLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {LeprechaunReelSymbol} from "./LeprechaunReelSymbol";

export class LeprechaunReelSymbolWild extends LeprechaunReelSymbol {

    private _multiplierPatch:PIXI.Sprite;
    private _writeOnText:TimelineSprite;
    private _currentMultiplier:number = 1;
    private _nudgeAnimation:PIXI.spine.Spine | null;
    private _winFrames:TimelineSprite;
    private _wildNudgeSparkles:TimelineSprite;
    private _background:PIXI.Sprite;

    constructor(symName:string, reelId:number, state?:ISymbolStateConfig) {
        super(symName, reelId, state);
    }

    protected initAnimations():void {
        if(!this._background) {
            this._background = new PIXI.Sprite(GameResources.getTextures("wildBg")[0]);
            this._background.anchor.set(0.5, 0.5);
            this._background.position.set(0, -172);
            this.addChild(this._background);
        }

        if(!this._nudgeAnimation) {
            this._nudgeAnimation = new PIXI.spine.Spine(GameResources.getSpineAsset("wLand"));
            this._nudgeAnimation.autoUpdate = true;
            this._nudgeAnimation.position.set(0, -172);
            this._nudgeAnimation.state.setEmptyAnimation(0, 0);
        }

        if(!this._winFrames) {
            this._winFrames = new TimelineSprite(GameResources.getTextures("wildNudgeBg"));
            this._winFrames.blendMode = PIXI.BLEND_MODES.ADD;
            this._winFrames.anchor.set(0.5, 0.5);
            this._winFrames.scale.set(2, 2);
            this._winFrames.position.set(0, -172);
            this._winFrames.hide();
            this.addChild(this._winFrames);
        }

        if(!this._wildNudgeSparkles) {
            this._wildNudgeSparkles = new TimelineSprite(GameResources.getTextures("wildNudgeSparkles"));
            this._wildNudgeSparkles.blendMode = PIXI.BLEND_MODES.ADD;
            this._wildNudgeSparkles.anchor.set(0.5, 0.5);
            this._wildNudgeSparkles.scale.set(2, 2);
            this._wildNudgeSparkles.position.set(0, -172);
            this.addChild(this._wildNudgeSparkles);
        }

        if(!this._multiplierPatch) {
            this._multiplierPatch = new PIXI.Sprite(GameResources.getTextures("X1")[0]);
            this._multiplierPatch.anchor.set(0.5, 0.5);
            this._multiplierPatch.position.set(-18, -178);
        }

        if(!this._writeOnText) {
            this._writeOnText = new TimelineSprite(GameResources.getTextures("wildWriteOnText"));
            this._writeOnText.anchor.set(0.5, 0.5);
            this._writeOnText.position.set(0, 0);
            this._writeOnText.getAnimation([30, 30]);
        }
    }

    protected initState(stateConfig:ISymbolStateConfig):boolean {
        if(super.initState(stateConfig)) {
            if(this._multiplierPatch) {
                this.addChild(this._multiplierPatch);
            }

            if(this._writeOnText) {
                this.addChild(this._writeOnText);
            }
            return true;
        }
        return false;
    }

    protected addNewStateAnimation(timeline:TimelineLite, newState:SymbolStateTransition, stateAnimation:TimelineSprite, delay:number):void {
        super.addNewStateAnimation(timeline, newState, stateAnimation, delay);
        const multiplierName:string = "X" + (this._currentMultiplier ? this._currentMultiplier : 1) + ((newState.state.keyword === GameConfig.instance.SYMBOL_STATES.spin.keyword) ? "_blur" : "");
        this._multiplierPatch.texture = GameResources.getTextures(multiplierName)[0];
        if(newState.state.keyword === GameConfig.instance.SYMBOL_STATES.spin.keyword) {
            timeline.add([
                TweenLite.to(this._writeOnText, newState.fadeInDuration, {alpha : 0}),
                TweenLite.to(this._multiplierPatch, newState.fadeInDuration, {alpha : 0}),
            ], delay);
        } else {
            if(this._multiplierPatch) {
                this._multiplierPatch.alpha = 1;
            }
        }

        if(newState.state.keyword === GameConfig.instance.SYMBOL_STATES.win.keyword || newState.state.keyword === LeprechaunGameConfig.instance.SYMBOL_STATES.nudge.keyword) {
            if(this._winFrames) {
                timeline.add(() => {
                    this._winFrames.show();
                    this._winFrames.playLoop();
                }, delay);
            }

            if(this._nudgeAnimation) {
                if(newState.state.keyword === LeprechaunGameConfig.instance.SYMBOL_STATES.nudge.keyword) {
                    this._multiplierPatch.alpha = 1;
                    this.addChild(this._nudgeAnimation);
                    this.addChild(this._multiplierPatch);
                    this.addChild(this._writeOnText);
                    timeline.add(new SpineTween(this._nudgeAnimation, 0, "animation", -1), delay);
                } else {
                    this._nudgeAnimation!.state.clearTrack(0);
                    this._nudgeAnimation!.skeleton.setToSetupPose();
                }
            }
        }
    }


    public stopNudgeAnimation():void {
        if(this._nudgeAnimation) {
            this._nudgeAnimation!.state.clearTrack(0);
            this._nudgeAnimation!.skeleton.setToSetupPose();
        }
    }

    protected reset(remove:boolean):void {
        if(this._nudgeAnimation) {
            this.removeChild(this._nudgeAnimation);
            this._nudgeAnimation.state.clearTrack(0);
            this._nudgeAnimation.skeleton.setToSetupPose();
            this._nudgeAnimation = null;
        }

        if(this._winFrames) {
            this.removeChild(this._winFrames);
            this._winFrames.stopLoop();
            this._winFrames.hide();
        }

        if(this._writeOnText) {
            this._writeOnText.hide();
            this.removeChild(this._writeOnText);
        }

        if(this._wildNudgeSparkles) {
            this.removeChild(this._wildNudgeSparkles);
            this._wildNudgeSparkles.stopLoop();
            this._wildNudgeSparkles.hide();
        }

        if(this._multiplierPatch) {
            this.removeChild(this._multiplierPatch);
        }

        super.reset(remove);
    }

    public playWriteOn():void {
        if(this._multiplierPatch) {
            this._multiplierPatch.alpha = 1;
            this.addChild(this._multiplierPatch);
        }
    }

    public playWriteOnWild():Timeline {
        this.playWriteOn();
        this._writeOnText.alpha = 1;
        this.addChild(this._writeOnText);
        return this._writeOnText.getAnimationAutoShowHide(true, false);
    }

    public playNudgeSparkles():void {
        if(this._wildNudgeSparkles) {
            this._wildNudgeSparkles.getAnimation();
        }
    }

    public updateMultiplier(multiplier:number, isAnimated:boolean):TimelineLite | null {
        // Logger.logDev(`Updating multiplier to ${multiplier}`);
        const timeline:TimelineLite = new TimelineLite();
        const spriteName:string = "X" + multiplier.toString();
        if(this._multiplierPatch !== null) {
            if(this.stack) {
                this.stack!.symbols.forEach((wild:StateReelSymbol |null) => {
                    if(wild) {
                        timeline.add((<LeprechaunReelSymbolWild>wild).updateMultiplierInternal(multiplier, wild === this ? isAnimated : false, spriteName), 0);
                    }
                });
            } else {
                timeline.add(this.updateMultiplierInternal(multiplier, isAnimated, spriteName), 0);
            }
        }
        return timeline;
    }

    private updateMultiplierInternal(multiplier:number, isAnimated:boolean, spriteName:string):TimelineLite | null {
        this._currentMultiplier = multiplier;
        const timeline:TimelineLite = new TimelineLite();
        timeline.add(() => {this._multiplierPatch.texture = GameResources.getTextures(spriteName)[0];}, 0);
        if(isAnimated) {
            timeline.add(TweenLite.fromTo(this._multiplierPatch.scale, 0.07, {x : 1, y : 1}, {x : 2, y : 2}));
            timeline.add(TweenLite.to(this._multiplierPatch.scale, 0.07, {x : 2, y : 2}));
            timeline.add(TweenLite.to(this._multiplierPatch.scale, 0.17, {x : 1, y : 1}));
        }
        return timeline;
    }

}