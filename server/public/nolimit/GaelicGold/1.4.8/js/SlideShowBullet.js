"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlideShowBullet = void 0;
const IconToggleButton_1 = require("../../buttons/IconToggleButton");
const PointerStateIconSet_1 = require("../../buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("../../displayobjects/Icon");
const SvgLoader_1 = require("../../../loader/SvgLoader");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
const PointerStateColorSet_1 = require("../../buttons/states/sets/PointerStateColorSet");
const GuiUtils_1 = require("../../utils/GuiUtils");
/**
 * Created by jonas on 2020-03-23.
 */
class SlideShowBullet extends PIXI.Container {
    constructor(index, clickCallback, color = 0xffffff) {
        super();
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SvgLoader_1.SvgLoader.getSvgTexture(GuiDefaultTextures_1.GuiDefaultTextures.BULLET_LARGE)));
        const offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SvgLoader_1.SvgLoader.getSvgTexture(GuiDefaultTextures_1.GuiDefaultTextures.BULLET_SMALL)));
        const onColors = new PointerStateColorSet_1.PointerStateColorSet(GuiUtils_1.GuiUtils.getARGB(color, 1));
        this.index = index;
        this.button = new IconToggleButton_1.IconToggleButton(`navBullet[${index}]`, onIcons, onColors, offIcons);
        this.button.addClickCallback(clickCallback);
        this.button.enable(true);
        this.addChild(this.button);
    }
}
exports.SlideShowBullet = SlideShowBullet;
//# sourceMappingURL=SlideShowBullet.js.map