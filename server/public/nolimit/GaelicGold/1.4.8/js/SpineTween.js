"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpineTween = void 0;
/**
 * Created by Jonas Wålekvist on 2018-09-25.
 */
const gsap_1 = require("gsap");
/**
 * Basic wrapper for Spine animations so that you can use them in gsap easier.
 */
class SpineTween extends gsap_1.TimelineLite {
    /**
     * Returns TimelineLite with a call to the targets setAnimation.
     * The timeline is padded with a duration that matches the Spine animation.
     *
     * Note on duration:
     * Duration is calculated bases on the length of the animation and loop count.
     *
     * loopCount = 0:
     *  duration of tween is equal to one play though
     *
     *  loopCount > 0:
     *   duration + duration * loopCount
     *
     * loopCount = -1: Loop for ever,
     *  duration of tween is equal to one play though
     *
     *
     * @param target The spine object you want to animate
     * @param trackIndex Channel to play animation in.
     * @param animationName Name of the animation, null will call target.state.setEmptyAnimation()
     * @param loopCount Number of times the animation will loop (after initial play through). -1 = Loop forever.
     * @param animationAlpha See Spine doc. But roughly how much the animation should effect current animation.
     */
    constructor(target, trackIndex, animationName, loopCount = 0, animationAlpha = 1) {
        super();
        if (animationName == null) {
            SpineTween.clearAnimation(target, trackIndex);
            return;
        }
        const animation = target.spineData.findAnimation(animationName);
        const spineShouldLoop = loopCount != 0;
        const duration = Math.max(animation.duration, animation.duration + (animation.duration * loopCount));
        const tween = new gsap_1.TweenLite(target, duration, {});
        this.add([
            tween,
            () => SpineTween.setAnimation(target, trackIndex, animation, spineShouldLoop, animationAlpha)
        ]);
        if (loopCount > 0) {
            this.add(() => SpineTween.stopLoop(target, trackIndex, animation));
        }
    }
    static clearAnimation(target, trackIndex) {
        target.state.setEmptyAnimation(trackIndex, 0);
    }
    static stopLoop(target, trackIndex, animation) {
        const trackEntry = target.state.getCurrent(trackIndex);
        if (trackEntry.animation == animation) {
            trackEntry.loop = false;
        }
    }
    static setAnimation(target, trackIndex, animation, loop, animationAlpha) {
        const trackEntry = target.state.setAnimationWith(trackIndex, animation, loop);
        trackEntry.alpha = animationAlpha;
    }
}
exports.SpineTween = SpineTween;
//# sourceMappingURL=SpineTween.js.map