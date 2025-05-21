/**
 * Created by Jie Gao on 2019-03-15.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {Orientation} from "@nolimitcity/slot-game/bin/core/stage/Orientation";
import {ScalableLayer} from "@nolimitcity/slot-game/bin/core/stage/ScalableLayer";
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {PropertyNode} from "pixi-particles";
import {TweenParticleEmitter} from "../../coinfountain/TweenParticleEmitter";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";

export class LeprechaunInitialWPView extends BaseView {

    private _coinParticles:TweenParticleEmitter;
    private _cloverParticles:TweenParticleEmitter;
    private _layer:ScalableLayer;

    constructor() {
        super();
        this._layer = StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.WIN_PRESENTATIONS.name);
    }

    protected initAnimations():void {
        const coinParticleTextures = GameResources.getTextures("bigWinCoin1");
        const cloverParticleTextures = GameResources.getTextures("bigWinCoin0");
        this._coinParticles = new TweenParticleEmitter(coinParticleTextures, {
            "alpha" : {
                "start" : 1,
                "end" : 1
            },
            "scale" : {
                "start" : 0.35,
                "end" : 0.35,
                "minimumScaleMultiplier" : 0.5
            },
            "color" : {
                "start" : "#ffffff",
                "end" : "#ffffff"
            },
            "speed" : {
                "start" : 700,
                "end" : 350,
                "minimumSpeedMultiplier" : 1.3
            },
            "acceleration" : {
                "x" : 0,
                "y" : 1500
            },
            "maxSpeed" : 0,
            "startRotation" : {
                "min" : -110,
                "max" : -70
            },
            "noRotation" : false,
            "rotationSpeed" : {
                "min" : -400,
                "max" : 400
            },
            "lifetime" : {
                "min" : 2.1,
                "max" : 2.1
            },
            "blendMode" : "normal",
            "frequency" : 0.002,
            "emitterLifetime" : 0.15,
            "maxParticles" : 50,
            "pos" : {
                "x" : 0,
                "y" : 0
            },
            "addAtBack" : false,
            "spawnType" : "rect",
            "spawnRect" : {
                "x" : -100,
                "y" : -25,
                "w" : 200,
                "h" : 50
            }
        });
        this._cloverParticles = new TweenParticleEmitter(cloverParticleTextures, {
            "alpha" : {
                "start" : 1,
                "end" : 1
            },
            "scale" : {
                "start" : 0.35,
                "end" : 0.35,
                "minimumScaleMultiplier" : 0.5
            },
            "color" : {
                "start" : "#ffffff",
                "end" : "#ffffff"
            },
            "speed" : {
                "start" : 700,
                "end" : 350,
                "minimumSpeedMultiplier" : 1.3
            },
            "acceleration" : {
                "x" : 0,
                "y" : 1500
            },
            "maxSpeed" : 0,
            "startRotation" : {
                "min" : -110,
                "max" : -70
            },
            "noRotation" : false,
            "rotationSpeed" : {
                "min" : -400,
                "max" : 400
            },
            "lifetime" : {
                "min" : 2.1,
                "max" : 2.1
            },
            "blendMode" : "normal",
            "frequency" : 0.002,
            "emitterLifetime" : 0.15,
            "maxParticles" : 50,
            "pos" : {
                "x" : 0,
                "y" : 0
            },
            "addAtBack" : false,
            "spawnType" : "rect",
            "spawnRect" : {
                "x" : -100,
                "y" : -25,
                "w" : 200,
                "h" : 50
            }
        });
        this._layer.addChild(this._cloverParticles)
        this._layer.addChild(this._coinParticles)
    }

    public playClovers(level:number):void {
        this._coinParticles.emitter.maxParticles = ((level === 0) ? 20 : 30);
        this._coinParticles.getAnimation();
        this._cloverParticles.emitter.maxParticles = ((level === 0) ? 20 : 30);
        this._cloverParticles.getAnimation();
    }

    protected onResize(resizeData:IResizeData):void {
        const y:number = Math.round((resizeData.height - this._layer.y) / this._layer.scale.y) + 40;
        const levelSpeed:number = (resizeData.orientation === Orientation.PORTRAIT) ? 1450 : 1000;

        this._coinParticles.y = y;
        this._coinParticles.x = 360;
        this._coinParticles.emitter.startSpeed = new PropertyNode(levelSpeed, levelSpeed);

        this._cloverParticles.y = y;
        this._cloverParticles.x = 360;
        this._cloverParticles.emitter.startSpeed = new PropertyNode(levelSpeed, levelSpeed);
    }
}