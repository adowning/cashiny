"use strict";
/**
 * Created by Ning Jiang on 8/1/2016.
 * Refactored by Ning Jiang on 1/23/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticlesManager = void 0;
require("pixi-particles");
const gsap_1 = require("gsap");
class ParticlesManager {
    constructor() {
        if (ParticlesManager._instance) {
            debugger;
            throw new Error("Error: ParticlesManager.constructor() - Instantiation failed: Singleton.");
        }
        ParticlesManager._instance = this;
        ParticlesManager._emitters = [];
        this.createMainLoop();
    }
    createMainLoop() {
        const ticker = PIXI.Ticker.shared;
        ticker.autoStart = false;
        ticker.stop();
        gsap_1.TweenLite.ticker.addEventListener("tick", this.update, this);
    }
    update() {
        if (ParticlesManager._emitters.length === 0) {
            return;
        }
        let now = Date.now();
        ParticlesManager._emitters.forEach((emitter) => {
            emitter.update((now - ParticlesManager._elapsed) * 0.001);
        });
        ParticlesManager._elapsed = now;
    }
    static addEmitter(emitter, start = true) {
        if (!ParticlesManager._instance) {
            new ParticlesManager();
        }
        ParticlesManager._emitters.push(emitter);
        emitter.emit = start;
        ParticlesManager._elapsed = Date.now();
        ParticlesManager._instance.update();
    }
    static removeEmitter(emitter, forceCleanUpWhenEmpty = false) {
        if (!ParticlesManager._instance) {
            return false;
        }
        const index = ParticlesManager._emitters.indexOf(emitter);
        if (index === -1) {
            return false;
        }
        ParticlesManager._emitters.splice(index, 1);
        emitter.emit = false;
        emitter.destroy();
        if (forceCleanUpWhenEmpty && ParticlesManager._emitters.length === 0) {
            //TODO - This does not work in PIXI v5, so another solution is needed.
            //  StageManager.renderer.plugins.sprite.sprites.length = 0;
        }
        ParticlesManager._elapsed = Date.now();
        ParticlesManager._instance.update();
        return true;
    }
}
exports.ParticlesManager = ParticlesManager;
//# sourceMappingURL=ParticlesManager.js.map