"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatedRIntroPage = void 0;
/**
 * Created by Jonas Wålekvist on 2023-10-24.
 */
const SlideShowPage_1 = require("../../../gui/views/slideshow/SlideShowPage");
const ImgLoader_1 = require("../../../loader/ImgLoader");
const GuiDefaultTextures_1 = require("../../../gui/default/GuiDefaultTextures");
const NLCText_1 = require("../../../display/NLCText");
const NolimitApplication_1 = require("../../../NolimitApplication");
const OpenSans_1 = require("../../../loader/font/OpenSans");
const FontStatics_1 = require("../../../loader/font/FontStatics");
class RatedRIntroPage extends SlideShowPage_1.SlideShowPage {
    constructor() {
        super();
        const style = new PIXI.TextStyle({
            fill: "#000000",
            fontFamily: OpenSans_1.OpenSans.FAMILY,
            fontSize: 24,
            fontStyle: FontStatics_1.FontStyle.NORMAL,
            fontWeight: FontStatics_1.FontWeight.BOLD,
            wordWrap: true,
            wordWrapWidth: 320,
            breakWords: true
        });
        const content = new PIXI.Container();
        const image = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.RATED_R));
        image.anchor.set(0.5, 0.5);
        const text = new NLCText_1.NLCText(NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("This game contains strong adult content that may be objectionable to some players."), style);
        text.anchor.set(0, 0.5);
        text.position.set(-60, 0);
        content.addChild(image, text);
        this.addChild(content);
    }
}
exports.RatedRIntroPage = RatedRIntroPage;
//# sourceMappingURL=RatedRIntroPage.js.map