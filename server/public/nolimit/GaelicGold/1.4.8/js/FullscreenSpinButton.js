"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullscreenSpinButton = void 0;
/**
 * Class description
 *
 * Created: 2019-11-04
 * @author jonas
 */
const GuiButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/GuiButton");
const gsap_1 = require("gsap");
class FullscreenSpinButton extends GuiButton_1.GuiButton {
    constructor(name) {
        super(name);
        const gfx = new PIXI.Graphics();
        gfx.beginFill(0xffffff, 1);
        gfx.drawRect(0, 0, 100, 100);
        gfx.endFill();
        this.addChild(gfx);
    }
    playClickedAnimation() {
        const tl = new gsap_1.TimelineLite();
        tl.add(new gsap_1.TweenLite(this, 0.1, { alpha: 0.1, ease: gsap_1.Linear.easeNone }));
        tl.add(new gsap_1.TweenLite(this, 0.2, { alpha: 0, ease: gsap_1.Power2.easeOut }));
        return tl;
    }
}
exports.FullscreenSpinButton = FullscreenSpinButton;
//# sourceMappingURL=FullscreenSpinButton.js.map