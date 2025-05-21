/**
 * Created by Jie Gao on 2020-01-13.
 */

require("pixi-particles");
import {EventHandler} from "@nolimitcity/slot-game/bin/core/event/EventHandler";
import {GameEvent} from "@nolimitcity/slot-game/bin/core/event/GameEvent";
import {StageEvent} from "@nolimitcity/slot-game/bin/core/stage/event/StageEvent";
import {Logger} from "@nolimitcity/slot-launcher/bin/utils/Logger";
import {TweenLite} from "gsap";
import {Emitter} from "pixi-particles";

export class LeParticlesManager {

    private static _instance:LeParticlesManager;
    private static _emitters:Emitter[];
    private static _elapsed:number;

    private constructor() {
        if(LeParticlesManager._instance) {
            debugger;
            throw new Error("Error: LeParticlesManager.constructor() - Instantiation failed: Singleton.");
        }

        LeParticlesManager._instance = this;
        LeParticlesManager._emitters = [];
        EventHandler.dispatchEvent(new GameEvent(StageEvent.ADD_TO_RENDER_LOOP, () => this.update()));
    }

    private createMainLoop():void {
        TweenLite.ticker.addEventListener("tick", this.animate, this);
    }

    private handleContextLost(event:WebGLContextEvent) {
        TweenLite.ticker.removeEventListener("tick", this.animate, this);
        Logger.logDev(event.type, event);
    }

    private update():void {
        if(!LeParticlesManager._instance) {
            new LeParticlesManager();
        }

        if(LeParticlesManager._emitters.length === 0) {
            return;
        }

        let now:number = Date.now();
        for(let i:number = 0; i < LeParticlesManager._emitters.length; i++) {
            LeParticlesManager._emitters[i].update((now - LeParticlesManager._elapsed) * 0.001);
        }
        LeParticlesManager._elapsed = now;
    }

    private animate():void {
        this.update();
    }


    public static addEmitter(emitter:Emitter, start:boolean = true):void {
        if(!LeParticlesManager._instance) {
            new LeParticlesManager();
        }
        this._instance.createMainLoop();
        LeParticlesManager._emitters.push(emitter);
        emitter.emit = start;
        LeParticlesManager._elapsed = Date.now();
        LeParticlesManager._instance.update();
    }

    public static removeEmitter(emitter:Emitter, forceCleanUpWhenEmpty:boolean = false):boolean {
        if(!LeParticlesManager._instance) {
            new LeParticlesManager();
        }
        const index:number = LeParticlesManager._emitters.indexOf(emitter);
        if(index === -1) {
            return false;
        }
        LeParticlesManager._emitters.splice(index, 1);
        emitter.emit = false;
        emitter.destroy();
        // emitter = null;
        LeParticlesManager._elapsed = Date.now();
        LeParticlesManager._instance.update();
        if(forceCleanUpWhenEmpty && LeParticlesManager._emitters.length === 0) {
            //TODO - This does not work in PIXI v5, so another solution is needed.
            //  StageManager.renderer.plugins.sprite.sprites.length = 0;
        }
        return true;
    }
}