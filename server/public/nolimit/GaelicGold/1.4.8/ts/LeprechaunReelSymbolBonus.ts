import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {ISymbolStateConfig, SymbolStateTransition} from "@nolimitcity/slot-game/bin/core/reelsymbol/StateReelSymbol";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {TimelineLite} from "gsap";
import {LeprechaunReelSymbol} from "./LeprechaunReelSymbol";

/**
 * Created by Jie Gao on 2019-11-25.
 */

export class LeprechaunReelSymbolBonus extends LeprechaunReelSymbol {

    private _rainbowTail:PIXI.Sprite;
    private _rainbowIdle:TimelineSprite;

    constructor(symName:string, reelId:number, state?:ISymbolStateConfig) {
        super(symName, reelId, state);
    }

    protected initAnimations():void {
        if(!this._rainbowTail) {
            this._rainbowTail = this.createRainbowTail();
        }
        if(!this._rainbowIdle) {
            this._rainbowIdle = this.createRainbowIdle();
        }
    }

    protected addNewStateAnimation(timeline:TimelineLite, newState:SymbolStateTransition, stateAnimation:TimelineSprite, delay:number):void {
        super.addNewStateAnimation(timeline, newState, stateAnimation, delay);
        if(newState.state.keyword === GameConfig.instance.SYMBOL_STATES.normal.keyword && this.visible) {
            timeline.add(() => {
                if(!this._rainbowIdle) {
                    this._rainbowIdle = this.createRainbowIdle();
                }
                this._rainbowIdle.show();
                this._rainbowIdle.playLoop();
            }, delay);
        } else {
            if(this._rainbowIdle) {
                this._rainbowIdle.stopLoop();
                this._rainbowIdle.hide();
            }
        }

        if(newState.state.keyword === GameConfig.instance.SYMBOL_STATES.spin.keyword && this.visible) {
            timeline.add(() => this.playRainbowTail(), delay);
        } else {
            this.stopRainbowTail();
        }
    }

    protected createRainbowTail():PIXI.Sprite {
        const tail:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("rainbowTail")[0]);
        tail.anchor.set(0.5, 1);
        tail.alpha = 0;
        tail.position.set(0, 98);
        tail.blendMode = PIXI.BLEND_MODES.ADD;
        return tail;
    }

    protected createRainbowIdle():TimelineSprite {
        const rainbowIdle:TimelineSprite = new TimelineSprite(GameResources.getTextures("rainbowBonusIdle"), 15);
        rainbowIdle.anchor.set(0.5, 1);
        rainbowIdle.hide();
        rainbowIdle.position.set(0, 58);
        rainbowIdle.blendMode = PIXI.BLEND_MODES.ADD;
        this.addChild(rainbowIdle);
        return rainbowIdle;
    }

    protected playRainbowTailSound():void {
    }

    private playRainbowTail():void {
        if(!this._rainbowTail) {
            this._rainbowTail = this.createRainbowTail();
        }
        // To move the patches always on the top.
        this.addChild(this._rainbowTail);
        this._rainbowTail.alpha = 1;
        // move the current reel to the top of all reels.
        if(this.parent) {
            this.parent.addChild(this);
        }
        if(this.playRainbowTailSound) {
            this.playRainbowTailSound();
        }
    }

    public stopRainbowTail():void {
        if(this._rainbowTail) {
            this._rainbowTail.alpha = 0;
        }
    }

    protected reset(remove:boolean):void {
        super.reset(remove);

        if(this._rainbowTail) {
            this.removeChild(this._rainbowTail);
        }

    }

    protected initState(stateConfig:ISymbolStateConfig):boolean {
        if(super.initState(stateConfig)) {
            // To move the patches always on the top.
            if(this._rainbowTail) {
                this.addChild(this._rainbowTail);
            }
            return true;
        }
        return false;
    }
}