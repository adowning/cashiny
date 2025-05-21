import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {SpinEvent} from "@nolimitcity/slot-game/bin/core/spin/event/SpinEvent";
import {StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {TimelineSprite} from "@nolimitcity/slot-game/bin/core/animation/TimelineSprite";
import {TimelineLite} from "gsap";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";

export class SymbolWinAnimation extends BaseView {

    private _layer:PIXI.Container;
    protected _winBackground:TimelineSprite[][] = [];
    protected _cloverBurst:TimelineSprite[][] = [];
    protected _symIdleAnimation:TimelineSprite[][] = [];

    constructor() {
        super();
        this._layer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.SYMBOL_WIN_ANIMATION.name);
    }

    protected addEventListeners():void {
        EventHandler.addEventListener(this, SpinEvent.BEFORE_START, (event:GameEvent) => this.resetAnimation());
    }

    protected initAnimations():void {
        this._winBackground = [];
        this._cloverBurst = [];
        this._symIdleAnimation = [];
        for(let i:number = 0; i < 3; i++) {
            const winBackgrounds:TimelineSprite[] = [];
            const cloverBursts:TimelineSprite[] = [];
            const symIdleAnimations:TimelineSprite[] = [];
            for(let j:number = 0; j < 3; j++) {
                const winBackground:TimelineSprite = new TimelineSprite(GameResources.getTextures("symWinBgAnimation"));
                winBackground.anchor.set(0.5, 0.5);
                winBackground.position.set(0, 0);
                winBackground.hide();
                winBackground.blendMode = PIXI.BLEND_MODES.ADD;
                const cloverBurst:TimelineSprite = new TimelineSprite(GameResources.getTextures("cloverBurst"));
                cloverBurst.anchor.set(0.5, 0.5);
                cloverBurst.position.set(0, 0);
                cloverBurst.hide();
                const symIdleAnimation:TimelineSprite = new TimelineSprite(GameResources.getTextures("symIdleAnimation"));
                symIdleAnimation.anchor.set(0.5, 0.5);
                symIdleAnimation.position.set(0, 0);
                symIdleAnimation.hide();
                symIdleAnimation.blendMode = PIXI.BLEND_MODES.ADD;

                winBackgrounds.push(winBackground);
                cloverBursts.push(cloverBurst);
                symIdleAnimations.push(symIdleAnimation);
            }
            this._winBackground.push(winBackgrounds);
            this._cloverBurst.push(cloverBursts);
            this._symIdleAnimation.push(symIdleAnimations);
        }
    }

    public playSymbolWinAnimation(reel:number, symbol:number):TimelineLite {
        const winBackground:TimelineSprite = this._winBackground[reel][symbol];
        const cloverBurst:TimelineSprite = this._cloverBurst[reel][symbol];
        const position:number[] = Helper.getSymbolPositions(reel, symbol, true);
        const tl:TimelineLite = new TimelineLite();
        tl.add([
            () => {
                winBackground.hide();
                cloverBurst.hide();
                this._layer.addChild(winBackground);
                this._layer.addChild(cloverBurst);
                winBackground.position.set(position[0], position[1]);
                cloverBurst.position.set(position[0], position[1]);
            },
            cloverBurst.getAnimationAutoShowHide(true, true),
            winBackground.getAnimationAutoShowHide(true, true)
        ]);
        return tl;
    }

    public playIdleAnimation(reel:number, symbol:number, fullSize:boolean):TimelineLite {
        const idleAnimation:TimelineSprite = (this._symIdleAnimation[reel][symbol]);
        const position:number[] = Helper.getSymbolPositions(reel, symbol, true);

        if(fullSize) {
            position[1] = GameConfig.instance.REEL_AREA_POS_Y - 70;
        }
        const tl:TimelineLite = new TimelineLite();
        tl.add([
            () => {
                this._layer.addChild(idleAnimation);
                idleAnimation.position.set(position[0], position[1]);
                idleAnimation.blendMode = PIXI.BLEND_MODES.ADD;
            },
            idleAnimation.getAnimationAutoShowHide(true, true)
        ]);
        return tl;
    }

    public resetWinAnimation():void {
        this._winBackground.forEach((winBackgrounds:TimelineSprite[]) => {
            winBackgrounds.forEach((winBackground:TimelineSprite) => {
                this._layer.removeChild(winBackground);
                winBackground.hide()
            });
        });

        this._cloverBurst.forEach((cloverBursts:TimelineSprite[]) => {
            cloverBursts.forEach((cloverBurst:TimelineSprite) => {
                this._layer.removeChild(cloverBurst);
                cloverBurst.hide()
            });
        });
    }

    public resetAnimation():void {
        this.resetWinAnimation();

        this._symIdleAnimation.forEach((symIdleAnimations:TimelineSprite[]) => {
            symIdleAnimations.forEach((symIdleAnimation:TimelineSprite) => {
                this._layer.removeChild(symIdleAnimation);
                symIdleAnimation.hide()
            });
        });
    }
}