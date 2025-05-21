"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fullscreen = void 0;
const APIOptions_1 = require("../../interfaces/APIOptions");
/**
 * Created by Jonas Wålekvist on 2020-01-07.
 */
class Fullscreen {
    constructor(api) {
        this.disabled = false;
        this.goFullscreen = (e) => {
            if (this.isFullscreen() || this.disabled) {
                return;
            }
            const element = document.documentElement;
            //const element = <any>document.querySelector("body");
            if (element.requestFullscreen) {
                element.requestFullscreen({ navigationUI: "hide" });
            }
            else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
            else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            }
            else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        };
        if (api.options.fullscreen != undefined && !api.options.fullscreen) {
            return;
        }
        this._target = document.documentElement;
        if (api.options.device === APIOptions_1.Device.MOBILE) {
            this.addListeners();
        }
        api.events.on('exit', () => this.addListeners());
        api.events.on('halt', () => this.removeListeners());
    }
    addListeners() {
        this._target.addEventListener('touchend', this.goFullscreen, true);
    }
    removeListeners() {
        this._target.removeEventListener('touchend', this.goFullscreen, true);
    }
    disable() {
        this.disabled = true;
        this.exit();
    }
    exit() {
        if (this.isFullscreen()) {
            const doc = document;
            if (doc.exitFullscreen) {
                doc.exitFullscreen();
            }
            else if (doc.webkitExitFullscreen) {
                doc.webkitExitFullscreen();
            }
            else if (doc.mozCancelFullScreen) {
                doc.mozCancelFullScreen();
            }
            else if (doc.msExitFullscreen) {
                doc.msExitFullscreen();
            }
        }
    }
    isFullscreen() {
        const doc = document;
        return doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
    }
}
exports.Fullscreen = Fullscreen;
//# sourceMappingURL=Fullscreen.js.map