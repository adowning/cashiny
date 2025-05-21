"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSAPCompatabilityWrapper = void 0;
/**
 * Created by jonas on 2022-05-09.
 */
const GSAP = __importStar(require("gsap"));
const Logger_1 = require("./Logger");
/**
 * Static wrapper for gsap to bridge the differences between version 3.x and 2.x.
 */
class GSAPCompatabilityWrapper {
    constructor() { }
    static get isGsap3() {
        if (this._isGsap3 == undefined) {
            try {
                this._isGsap3 = GSAP.gsap.ticker != undefined;
            }
            catch (e) {
                this._isGsap3 = false;
            }
            if (this._isGsap3) {
                Logger_1.Logger.log(`GSAP ${GSAP.gsap.version}`);
            }
            else {
                Logger_1.Logger.log("GSAP 2.0.2");
            }
        }
        return this._isGsap3;
    }
    /**
     * Adds a callback to GSAP.ticker for either 3.x or 2.x versions.
     * @param {()=void} tickerCallback Callback function that will be added to the gsap ticker. BE AWARE that anonymous callbacks will not be possible to remove later. I.e:
     * initTicker(()=> {
     *     // This is a typical anonymous function, that will be impossible to remove.
     * })
     *
     * Do something like this instead:
     *
     * initTicker(myFunction);
     * public myFunction = ()=>{
     *     //This is not anonymous.
     * }
     *
     */
    static initTicker(tickerCallback) {
        if (this.isGsap3) {
            //This is for gsap 3.x.x where the ticker is exposed in gsap
            // @ts-ignore
            GSAP.gsap.ticker.add(tickerCallback);
        }
        else {
            //This is for gsap 2.0.2 + types 1.19.2 where the ticker is exposed in TweenMax
            // @ts-ignore
            GSAP.TweenMax.ticker.addEventListener("tick", tickerCallback);
        }
    }
    /**
     * Removes a callback to GSAP.ticker for either 3.x or 2.x versions.
     * @param {()=void} tickerCallback Callback function that will be removed to the gsap ticker.
     */
    static removeTicker(tickerCallback) {
        if (this.isGsap3) {
            //This is for gsap 3.x.x where the ticker is exposed in gsap
            // @ts-ignore
            GSAP.gsap.ticker.remove(tickerCallback);
        }
        else {
            //This is for gsap 2.0.2 + types 1.19.2 where the ticker is exposed in TweenMax
            // @ts-ignore
            GSAP.TweenMax.ticker.removeEventListener("tick", tickerCallback);
        }
    }
    /**
     * Attempts to pause global timeline
     * @return {boolean} true if successful
     */
    static pauseGlobalTimeline() {
        if (this.isGsap3) {
            // @ts-ignore
            GSAP.gsap.globalTimeline.pause();
            GSAP.gsap.ticker.sleep();
            return true;
        }
        else {
            // @ts-ignore
            GSAP.TweenMax.globalTimeScale(0);
            return true;
        }
    }
    /**
     * Attempts to play global timeline
     * @return {boolean} true if successful
     */
    static resumeGlobalTimeline() {
        if (this.isGsap3) {
            // @ts-ignore
            GSAP.gsap.ticker.wake();
            GSAP.gsap.globalTimeline.play();
            return true;
        }
        else {
            // @ts-ignore
            GSAP.TweenMax.globalTimeScale(1);
            return true;
        }
    }
    /**
     * Attempts to get globalTimeline.paused()
     * @return {boolean} true if paused
     */
    static isGlobalTimelinePaused() {
        if (this.isGsap3) {
            // @ts-ignore
            return GSAP.gsap.globalTimeline.paused();
        }
        else {
            // @ts-ignore
            return GSAP.TweenMax.globalTimeScale() === 0;
        }
    }
    /**
     *  Wrapper function for gsap.delayedCall. Since it's located in different places for v 2 and 3.
     *
     * @param delay
     * @param callback
     * @param params
     */
    static delayedCall(delay, callback, params) {
        if (this.isGsap3) {
            // @ts-ignore
            return GSAP.gsap.delayedCall(delay, callback, params);
        }
        else {
            // @ts-ignore
            return GSAP.TweenLite.delayedCall(delay, callback, params);
        }
    }
}
exports.GSAPCompatabilityWrapper = GSAPCompatabilityWrapper;
//# sourceMappingURL=GSAPCompatabilityWrapper.js.map