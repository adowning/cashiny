/**
 * Created by  Jie Gao on 3/28/2019.
 */

import {GameMode} from "@nolimitcity/slot-game/bin/core/gamemode/GameMode";
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {
    IStillImageBackgroundConfig,
    StillImageBackground
} from "@nolimitcity/slot-game/bin/game/background/StillImageBackground";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ScalableLayer} from "@nolimitcity/slot-game/bin/core/stage/ScalableLayer";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {BackgroundAnimations} from "./BackgroundAnimations";
import {TweenMax, Power2} from "gsap";

export class LeprechaunBackground extends StillImageBackground {
    private _bgSky:PIXI.Sprite;
    private _bgRainbow:PIXI.Sprite;
    private _reelBackground:PIXI.Sprite;
    private _backgroundAnimations:BackgroundAnimations;

    constructor(config:IStillImageBackgroundConfig) {
        super(config);
        this._backgroundAnimations = new BackgroundAnimations();
    }

    protected initAnimations():void {
        super.initAnimations();
        const backgroundElementsLayer:ScalableLayer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.BACKGROUND_ELEMENTS.name);
        const reelBackground:ScalableLayer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.REEL_BACKGROUND.name);

        this._bgSky = this.createSprite("bgSky",  backgroundElementsLayer);
        this._bgSky.scale.set(2);

        this._bgRainbow = this.createSprite("bgRainbow",  backgroundElementsLayer);
        this._bgRainbow.blendMode = PIXI.BLEND_MODES.SCREEN;

        this._reelBackground = new PIXI.Sprite(GameResources.getTextures("reelBackground")[0]);
        this._reelBackground.anchor.set(0.5,0.5);
        this._reelBackground.position.set(360, 380);
        reelBackground.addChild(this._reelBackground);
        const reelFrame:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures("reelFrame")[0]);
        reelFrame.anchor.set(0.5,0.5);
        reelFrame.position.set(360,380);
        StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.REEL_FRAME.name).addChild(reelFrame);

        TweenMax.to(this._bgRainbow, 5, {
            alpha : 0.6,
            ease : Power2.easeOut,
            yoyoEase : Power2.easeOut,
            repeat : -1,
            repeatDelay : 0.1
        });
    }

    private createSprite(textureName:string, layer:ScalableLayer):PIXI.Sprite {
        const sprite:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures(textureName)[0]);
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(360, 26);
        layer.addChild(sprite);
        return sprite;
    }
}