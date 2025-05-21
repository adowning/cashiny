/**
 * Created by  Jie Gao on 3/28/2019.
 */

import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ArrayHelper} from "@nolimitcity/slot-game/bin/core/utils/ArrayHelper";
import {ParticleConfigs} from "../particles/ParticleConfigs";
import {AnimatedParticle, Emitter} from "pixi-particles";
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {LeprechaunGameConfig} from "../LeprechaunGameConfig";
import {TimelineMax, TweenLite, TimelineLite} from "gsap";
import {LeParticlesManager} from "../../utils/LeParticlesManager";

export class BackgroundAnimations extends BaseView {
    private readonly cloudYs:number[] = [226, -112, 152];
    private readonly cloudStartPos:number[] = [116, 286, 1062];
    private readonly cloudEndPos:number[] = [382, 460, 1284];
    private readonly fwOffset:number = 280;
    private _cloudPanningTimeLine:TimelineLite;
    private _layer:PIXI.Container;
    private _clouds:PIXI.Sprite[];

    private _emitter:Emitter;
    private _rainDrops:Emitter;
    private _sparkleParticlesSmall:Emitter;
    private _splashRingUpper:Emitter;
    private _splashRingLower:Emitter;
    private _splashRingMid:Emitter;
    private _foreground:PIXI.Sprite;
    private _bgRipples0:PIXI.Sprite;
    private _bgRipples1:PIXI.Sprite;
    private _bgRipples2:PIXI.Sprite;

    constructor() {
        super();
        this._layer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.BACKGROUND_ANIMATION.name);
    }

    protected initAnimations():void {
        const fs:number = 0.033;
        const offset:number = this.fwOffset;
        this._clouds = ArrayHelper.initArrayWithValues(3, (i:number) => {
            const cloud:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures(`cloud${i}`)[0]);
            cloud.anchor.set(0.5, 0.5);
            cloud.position.set(0, this.cloudYs[i]);
            this._layer.addChild(cloud);
            return cloud;
        });
        this._foreground = new PIXI.Sprite(GameResources.getTextures("foreground")[0]);
        this._foreground.anchor.set(0.5, 0.5);
        this._foreground.position.set(360, 660);
        this._layer.addChild(this._foreground);
        this._rainDrops = this.createEmitters(GameResources.getTextures("raindrop"), ParticleConfigs.rainDrops);
        this._emitter = this.createEmitters([GameResources.getTextures("defaultParticle")[0]], ParticleConfigs.sparkleParticles);
        this._sparkleParticlesSmall = this.createEmitters([GameResources.getTextures("defaultParticle")[0]], ParticleConfigs.sparkleParticlesSmall);

        this._bgRipples0 = this.createSprite("bgRipples0", [313-offset, 524], 0.55);
        this._bgRipples1 = this.createSprite("bgRipples1", [527-offset, 673], 0.95);
        this._bgRipples2 = this.createSprite("bgRipples2", [1005-offset, 480], 0.25);

        this._splashRingUpper = this.createEmitters([GameResources.getTextures("splashRing")[0]], ParticleConfigs.splashRingUpper);
        this._splashRingLower = this.createEmitters([GameResources.getTextures("splashRing")[0]], ParticleConfigs.splashRingLower);
        this._splashRingMid = this.createEmitters([GameResources.getTextures("splashRing")[0]], ParticleConfigs.splashRingMid);

        const tlRipples0:TimelineMax = new TimelineMax({delay : 0, repeat : -1, repeatDelay : 45 * fs});
        tlRipples0.add(new TimelineLite().add([
            TweenLite.to(this._bgRipples0, 2.5, {x : 296-offset, y : 545}),
            TweenLite.to(this._bgRipples0.scale, 2.5, {x : 1.09, y : 1.09}),
            TweenLite.to(this._bgRipples0, 1, {alpha : 1}),
            TweenLite.to(this._bgRipples0, 45 * fs, {alpha : 0, delay : 1})
        ]));

        const tlRipples1:TimelineMax = new TimelineMax({delay : 0, repeat : -1, repeatDelay : 45 * fs});
        tlRipples1.add(new TimelineLite().add([
            TweenLite.to(this._bgRipples1, 2, {x : 513-offset, y : 683}),
            TweenLite.to(this._bgRipples1.scale, 2, {x : 1.2, y : 1.2}),
            TweenLite.to(this._bgRipples1, 0.8, {alpha : 1}),
            TweenLite.to(this._bgRipples1, 36 * fs, {alpha : 0, delay : 0.8})
        ]));

        const tlRipples2:TimelineMax = new TimelineMax({delay : 0, repeat : -1, repeatDelay : 40 * fs});
        tlRipples2.add(new TimelineLite().add([
            TweenLite.to(this._bgRipples2, 64 * fs, {x : 976-offset, y : 490}),
            TweenLite.to(this._bgRipples2.scale, 64 * fs, {x : .9, y : .9}),
            TweenLite.to(this._bgRipples2, 24 * fs, {alpha : .8}),
            TweenLite.to(this._bgRipples2, 40 * fs, {alpha : 0, delay : 24 * fs})
        ]));

        this.playCloudAnimation();
    }

    private createSprite(textureName:string, position:number[], scale:number):PIXI.Sprite {
        const sprite:PIXI.Sprite = new PIXI.Sprite(GameResources.getTextures(textureName)[0]);
        sprite.alpha = 0;
        sprite.blendMode = PIXI.BLEND_MODES.ADD;
        sprite.anchor.set(0.5, 0.5);
        sprite.position.set(position[0], position[1]);
        this._layer.addChild(sprite);
        return sprite;
    }

    private createEmitters(textures:PIXI.Texture[], config:any):Emitter {
        const emitter:Emitter = new Emitter(this._layer, [{
            framerate : 30,
            loop : true,
            hasLoaded : true,
            textures : textures
        }], config);
        emitter.particleConstructor = AnimatedParticle;
        LeParticlesManager.addEmitter(emitter, true);
        return emitter;
    }

    protected onResize(resizeData:IResizeData):void {

    }

    private playCloudAnimation():void {
        this._cloudPanningTimeLine = new TimelineLite();
        if(this._clouds && this._clouds.length > 0) {
            this._clouds.forEach((cloud:PIXI.Sprite, index:number) => {
                cloud.position.x = this.cloudStartPos[index];
                this._cloudPanningTimeLine.add(this.getCloudAnimation(cloud, index), index);
            });
        }
    }

    private getCloudAnimation(cloud:PIXI.Sprite, index:number):TimelineLite {
        const offset:number = this.fwOffset;
        const timeLine:TimelineLite = new TimelineLite({
            onComplete : () => {
                cloud.position.x = this.cloudStartPos[index] - offset;
                this.getCloudAnimation(cloud, index);
                timeLine.pause();
                timeLine.kill();
            }
        });
        timeLine.to(cloud, 20, {x : this.cloudEndPos[index] - offset});
        timeLine.to(cloud, 20, {x : this.cloudStartPos[index] - offset});
        return timeLine;
    }
}