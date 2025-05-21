"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundButton = void 0;
/**
 * Created by jonas on 2023-05-22.
 */
const IconToggleButton_1 = require("../IconToggleButton");
const PointerStateIconSet_1 = require("../states/sets/PointerStateIconSet");
const PointerStateColorSet_1 = require("../states/sets/PointerStateColorSet");
const gsap_1 = require("gsap");
const Icon_1 = require("../../displayobjects/Icon");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
const ImgLoader_1 = require("../../../loader/ImgLoader");
class SoundButton extends IconToggleButton_1.IconToggleButton {
    constructor(name) {
        const onColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFC00, 0xFFFFFC00, 0xFFFFFC00, 0x33FFFC00);
        const offColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.SOUND_ON)));
        const offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.SOUND_OFF)));
        super(name, onIcons, onColors, offIcons, offColors);
        this._loadingRing = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.SOUND_RING));
        this._loadingRing.anchor.set(0.5, 0.5);
        this._loadingRing.position.set(this._loadingRing.width * 0.5, this._loadingRing.height * 0.5);
    }
    startLoadingAnimation(loopCallback) {
        if (this._tl == undefined) {
            if (loopCallback != undefined) {
                this._tl = new gsap_1.TimelineMax({ repeat: -1, onRepeat: () => { loopCallback(); } });
            }
            else {
                this._tl = new gsap_1.TimelineMax({ repeat: -1 });
            }
            this.addChild(this._loadingRing);
            this._tl.add(new gsap_1.TweenLite(this._loadingRing, 1, { rotation: Math.PI * 2, ease: gsap_1.Linear.easeNone }));
        }
    }
    stopLoadingAnimation() {
        if (this._tl != undefined) {
            this._tl.pause();
            this._tl.kill();
            this.removeChild(this._loadingRing);
            this._tl = undefined;
        }
    }
}
exports.SoundButton = SoundButton;
//# sourceMappingURL=SoundButton.js.map