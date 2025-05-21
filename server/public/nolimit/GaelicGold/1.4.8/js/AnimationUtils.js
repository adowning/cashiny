"use strict";
/**
 * Created by Jonas Wålekvist on 2020-01-08.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationUtils = void 0;
const gsap_1 = require("gsap");
class AnimationUtils {
    static hideObject(duration = 0.5, autoVisible = true) {
        const tl = new gsap_1.TimelineLite();
        return tl;
    }
    static elementVisibilityAnimation(element, duration, show, startAlpha, autoVisibility = true) {
        const tl = new gsap_1.TimelineLite();
        if (startAlpha != undefined) {
            tl.add(() => {
                element.alpha = startAlpha;
            });
        }
        if (show) {
            tl.add(() => { element.visible = true; });
            tl.add(new gsap_1.TweenLite(element, duration, { alpha: 1, ease: gsap_1.Linear.easeNone }));
        }
        else {
            tl.add(new gsap_1.TweenLite(element, duration, { alpha: 0, ease: gsap_1.Linear.easeNone }));
            if (autoVisibility) {
                tl.add(() => { element.visible = false; });
            }
        }
        return tl;
    }
}
exports.AnimationUtils = AnimationUtils;
//# sourceMappingURL=AnimationUtils.js.map