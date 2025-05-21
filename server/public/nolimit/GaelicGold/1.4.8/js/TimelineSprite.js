"use strict";
/**
 * Class description
 *
 * created on 2016-12-16
 * @author jowa
 *
 * Refactored by Ning Jiang on 1/24/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineSprite = void 0;
const gsap_1 = require("gsap");
class TimelineSprite extends PIXI.Sprite {
    get totalFrames() {
        return this._textures.length;
    }
    get totalDuration() {
        return this._totalDuration;
    }
    get frameDuration() {
        return this._frameDuration;
    }
    get currentFrame() {
        const currFrame = Math.floor(this.currentTweenFrame);
        return Math.max(0, Math.min(currFrame, this._textures.length - 1));
    }
    constructor(textures, sourceFPS = 30) {
        super(textures[0]);
        this._textures = textures;
        this._sourceFPS = sourceFPS;
        this._totalDuration = this._textures.length / this._sourceFPS;
        this._frameDuration = this._totalDuration / this._textures.length;
        this.currentTweenFrame = 0;
    }
    getAnimation(frames, onUpdateCallback, onCompleteCallback) {
        frames = frames != undefined ? frames : [0];
        if (frames.length === 1) {
            frames.push(this._textures.length - 1);
        }
        const timeline = new gsap_1.TimelineLite();
        timeline.add(() => this.setFrame(TimelineSprite.wrapIndex(this._textures.length, frames[0])));
        for (let i = 1; i < frames.length; i++) {
            const from = TimelineSprite.wrapIndex(this._textures.length, frames[i - 1]);
            const to = TimelineSprite.wrapIndex(this._textures.length, frames[i]);
            const duration = (Math.abs(from - to) + 1) * this._frameDuration;
            timeline.add(new gsap_1.TweenLite(this, duration, {
                currentTweenFrame: to + (to >= from ? 0.99 : -0.99),
                ease: gsap_1.Linear.easeNone,
                onUpdate: () => {
                    this.applyFrame();
                    if (onUpdateCallback) {
                        onUpdateCallback();
                    }
                },
                onComplete: i === frames.length - 1 ? () => {
                    if (onCompleteCallback) {
                        onCompleteCallback();
                    }
                } : undefined
            }));
        }
        return timeline;
    }
    static wrapIndex(length, index) {
        if (length <= 0) {
            throw new Error(`Error: ArrayHelper.getValueInLoopRange(): length must bigger than zero!`);
        }
        if (index > (length - 1)) {
            return index % length;
        }
        if (index < 0) {
            return length - (Math.abs(index) % length);
        }
        return index;
    }
    getAnimationAutoShowHide(autoShow = true, autoHide = true, frames, onUpdateCallback, onCompleteCallback) {
        const tl = new gsap_1.TimelineLite();
        if (autoShow) {
            tl.add(() => this.show());
        }
        tl.add(this.getAnimation(frames, onUpdateCallback, () => {
            if (autoHide) {
                this.hide();
            }
            if (onCompleteCallback) {
                onCompleteCallback();
            }
        }));
        return tl;
    }
    /**
     * Sets the texture to be this frame. Should not be used during animation.
     * This is only for displaying a specific frame when not animating.
     * @param {number} frame
     */
    setFrame(frame) {
        this.currentTweenFrame = frame;
        this.applyFrame();
    }
    applyFrame() {
        this.texture = this._textures[this.currentFrame];
    }
    playLoop(onUpdateCallback) {
        if (this._loopAnimation && this._loopAnimation.isActive()) {
            return;
        }
        this._loopAnimation = this.getAnimation([0], onUpdateCallback, () => this.playLoop(onUpdateCallback));
    }
    stopLoop() {
        if (this._loopAnimation && this._loopAnimation.isActive()) {
            this._loopAnimation.pause();
            this._loopAnimation.kill();
        }
    }
    show() {
        this.visible = true;
    }
    hide() {
        this.visible = false;
    }
}
exports.TimelineSprite = TimelineSprite;
//# sourceMappingURL=TimelineSprite.js.map