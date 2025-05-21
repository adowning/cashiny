/**
 * Created by Jie Gao on 2019-11-25.
 */
import {BaseView} from "@nolimitcity/slot-game/bin/core/base/BaseView";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {ParticlesManager} from "@nolimitcity/slot-game/bin/core/particles/ParticlesManager";
import {AnimatedParticle, Emitter} from "pixi-particles";
import {ParticleConfigs} from "../particles/ParticleConfigs";
import {TweenLite, TimelineLite} from "gsap";

export class Rainbow extends BaseView {
    private _rainbow:PIXI.Sprite;
    private _rainbowParticles:Emitter;

    constructor() {
        super();
    }

    protected initAnimations():void {}

    public createRainbow(container:PIXI.Container):void {
        this._rainbow = new PIXI.Sprite(GameResources.getTextures("pncRainbow")[0]);
        this._rainbow.anchor.set(0.5, 0.5);
        this._rainbow.position.set(0, 208);
        this._rainbow.scale.set(4, 4);
        container.addChild(this._rainbow);

        this._rainbowParticles = new Emitter(container, [{
            framerate : 30,
            loop : true,
            hasLoaded : true,
            textures : [GameResources.getTextures("defaultParticle")[0]]
        }], ParticleConfigs.sparkleParticlesPNC);
        this._rainbowParticles.particleConstructor = AnimatedParticle;
        ParticlesManager.addEmitter(this._rainbowParticles, false);
    }

    public show(withAnimation:boolean = false):void {
        new TimelineLite().add([
            () => {
                this._rainbowParticles.emit = true;
            },
            TweenLite.to(this._rainbow, withAnimation ? 0 : 1, {alpha : 1})
        ]);
    }

    public hide():void {
        this._rainbowParticles.emit = false;
        this._rainbow.alpha = 0;
    }

    public animateHide():TimelineLite {
        return new TimelineLite().add([
            () => {
                this._rainbowParticles.emit = false;
            },
            TweenLite.to(this._rainbow, 0.6, {alpha : 0})
        ]);
    }
}