import {Linear, TweenLite, TweenMax} from "gsap"
import {AnimatedParticle, Emitter} from "pixi-particles";

require("pixi-particles");


export class TweenParticleEmitter extends PIXI.Container {
    private _emitter:Emitter;
    private _totalDuration:number;
    public currentTime:number = 0;
    private _prevTime:number = 0;
    private _emitterConfig:any;
    private _currentTween:TweenLite;

    get emitter():Emitter {
        return this._emitter;
    }

    constructor(textures:PIXI.Texture[], config:any, animatedParticles:boolean = false) {
        super();
        this._emitterConfig = config;
        if(animatedParticles) {
            this._emitter = new Emitter(this, [{
                framerate : 30,
                loop : true,
                hasLoaded : true,
                textures : textures
            }], config);
            this._emitter.particleConstructor = AnimatedParticle;
        } else {
            this._emitter = new Emitter(this, textures, config);
        }
        this._totalDuration = this._emitter.emitterLifetime + this._emitter.maxLifetime;
    }

    private reset() {
        if(this._currentTween){
            if(this._currentTween.isActive()){
                this._currentTween.progress(1);
            }
            this._currentTween.kill();
        }
        this.currentTime = 0;
        this._prevTime = 0;
    }

    private onStart() {
        this._emitter.emit = true;
    }

    private onUpdate() {
        let delta:number = Math.abs(this.currentTime - this._prevTime);
        this._emitter.update(delta);
        this._prevTime = this.currentTime;
    }

    public getAnimation(ease:any = Linear.easeNone):void {
        this._emitter.emit = false;
        this._emitter.cleanup();
        this.reset();
        this._emitter.emitterLifetime = this._emitterConfig.emitterLifetime ? this._emitterConfig.emitterLifetime : 0;
        this._totalDuration = this._emitter.emitterLifetime + this._emitter.maxLifetime;
        this._currentTween = new TweenLite(this, this._totalDuration,
            {
                currentTime : this._totalDuration,
                ease : ease,
                onStart : () => this.onStart(),
                onUpdate : () => this.onUpdate()
            });
    }
}