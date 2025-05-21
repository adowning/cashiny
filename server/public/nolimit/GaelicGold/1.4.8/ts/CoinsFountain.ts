/**
 * Created by Ning Jiang on 10/26/2018.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {LeParticlesManager} from "../../utils/LeParticlesManager";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ScalableLayer} from "@nolimitcity/slot-game/bin/core/stage/ScalableLayer";
import {IResizeData} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {AnimatedParticle, Emitter, PropertyNode} from "pixi-particles";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";

export class CoinsFountain extends BaseView {

    private readonly _screenHeightRange:[number, number] = [720, 1760];
    private readonly _startSpeedRange:[number, number] = [650, 950];

    private readonly _coinsConfigs:any[] = [
        {
            "alpha" : {
                "start" : 1,
                "end" : 1
            },
            "scale" : {
                "start" : 0.5,
                "end" : .8,
                "minimumScaleMultiplier" : 1
            },
            "color" : {
                "start" : "#ffffff",
                "end" : "#ffffff"
            },
            "speed" : {
                "start" : 700,
                "end" : 350,
                "minimumSpeedMultiplier" : 2
            },
            "acceleration" : {
                "x" : 0,
                "y" : 1500
            },
            "maxSpeed" : 0,
            "startRotation" : {
                "min" : 235,
                "max" : 310
            },
            "noRotation" : false,
            "rotationSpeed" : {
                "min" : 10,
                "max" : 70
            },
            "lifetime" : {
                "min" : 2,
                "max" : 2
            },
            "blendMode" : "normal",
            "frequency" : 0.06,
            "emitterLifetime" : -1,
            "maxParticles" : 150,
            "pos" : {
                "x" : GameConfig.instance.GAME_WIDTH / 2,
                "y" : GameConfig.instance.GAME_HEIGHT + 40,
            },
            "addAtBack" : false,
            "spawnType" : "rect",
            "spawnRect" : {
                "x" : -100,
                "y" : -25,
                "w" : 200,
                "h" : 50
            }
        },
        {
            "alpha" : {
                "start" : 1,
                "end" : 1
            },
            "scale" : {
                "start" : 0.7,
                "end" : 1,
                "minimumScaleMultiplier" : 1
            },
            "color" : {
                "start" : "#ffffff",
                "end" : "#ffffff"
            },
            "speed" : {
                "start" : 700,
                "end" : 350,
                "minimumSpeedMultiplier" : 2
            },
            "acceleration" : {
                "x" : 0,
                "y" : 1500
            },
            "maxSpeed" : 0,
            "startRotation" : {
                "min" : 235,
                "max" : 310
            },
            "noRotation" : false,
            "rotationSpeed" : {
                "min" : 20,
                "max" : 40
            },
            "lifetime" : {
                "min" : 2,
                "max" : 2
            },
            "blendMode" : "normal",
            "frequency" : 0.06,
            "emitterLifetime" : -1,
            "maxParticles" : 200,
            "pos" : {
                "x" : GameConfig.instance.GAME_WIDTH / 2,
                "y" : GameConfig.instance.GAME_HEIGHT + 40,
            },
            "addAtBack" : false,
            "spawnType" : "rect",
            "spawnRect" : {
                "x" : -100,
                "y" : -25,
                "w" : 200,
                "h" : 50
            }
        },
        {
            "alpha" : {
                "start" : 1,
                "end" : 1
            },
            "scale" : {
                "start" : 0.7,
                "end" : 1,
                "minimumScaleMultiplier" : 1
            },
            "color" : {
                "start" : "#ffffff",
                "end" : "#ffffff"
            },
            "speed" : {
                "start" : 700,
                "end" : 350,
                "minimumSpeedMultiplier" : 2
            },
            "acceleration" : {
                "x" : 0,
                "y" : 1500
            },
            "maxSpeed" : 0,
            "startRotation" : {
                "min" : 235,
                "max" : 310
            },
            "noRotation" : false,
            "rotationSpeed" : {
                "min" : 20,
                "max" : 40
            },
            "lifetime" : {
                "min" : 2,
                "max" : 2
            },
            "blendMode" : "normal",
            "frequency" : 0.1,
            "emitterLifetime" : -1,
            "maxParticles" : 200,
            "pos" : {
                "x" : GameConfig.instance.GAME_WIDTH / 2,
                "y" : GameConfig.instance.GAME_HEIGHT + 40,
            },
            "addAtBack" : false,
            "spawnType" : "rect",
            "spawnRect" : {
                "x" : -100,
                "y" : -25,
                "w" : 200,
                "h" : 50
            }
        }
    ];

    private _coinsEmiters:Emitter[];
    private _layer:ScalableLayer;

    private _isPlaying:boolean = false;

    constructor(layer:ScalableLayer) {
        super();
        this._layer = layer;
    }

    protected initAnimations():void {
        this._coinsEmiters = [];
        this._coinsConfigs.forEach((config:any, level:number) => {
            const emitter:Emitter = new Emitter(this._layer, [{
                framerate : 30,
                loop : true,
                hasLoaded : true,
                textures : GameResources.getTextures(`bigWinCoin${level}`)
            }], config);
            emitter.particleConstructor = AnimatedParticle;
            LeParticlesManager.addEmitter(emitter, false);
            this._coinsEmiters.push(emitter);
        });
    }

    public startFountain(playLevel:number):void {
        this._isPlaying = true;
        if(this._isResizeDirty) {
            this.onResize(this._resizeData);
        }
        this._coinsEmiters.forEach((emitter:Emitter, level:number) => {
            if(level <= playLevel) {
                emitter.emit = true;
            }
        });
    }

    public stopFountain():void {
        this._isPlaying = false;
        this._coinsEmiters.forEach((emitter:Emitter) => {
            emitter.emit = false;
        })
    }

    protected onResize(resizeData:IResizeData):void {
        this._resizeData = resizeData;

        if(!this._isPlaying) {
            this._isResizeDirty = true;
            return;
        }

        this._isResizeDirty = false;
        let screenHeight:number = Math.round(resizeData.height / this._layer.scale.y);
        screenHeight = Math.max(this._screenHeightRange[0], Math.min(screenHeight, this._screenHeightRange[1]));
        const startSpeed:number = Math.round((screenHeight - this._screenHeightRange[0]) * (this._startSpeedRange[1] - this._startSpeedRange[0]) / (this._screenHeightRange[1] - this._screenHeightRange[0]) + this._startSpeedRange[0]);
        const y:number = Math.round((resizeData.height - this._layer.y) / this._layer.scale.y) + 40;
        const x:number = Helper.getSymbolPositions(1, 1)[0];
        this._coinsEmiters.forEach((emitter:Emitter, level:number) => {
            const levelSpeed:number = startSpeed * (1.2 + 0.05 * level);
            emitter.cleanup();
            emitter.startSpeed = new PropertyNode(levelSpeed,levelSpeed);
            emitter.spawnPos.y = y;
            emitter.spawnPos.x = x;
        });
    }
}