"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NLCStaticText = void 0;
/**
 * Created by jonas on 2023-03-17.
 *
 * Replacement for PIXI.Text that will create a PIXI.Text and then render it into a render texture and then destroy the original
 * PIXI.Text. It derives from PIXI.Sprite instead
 *
 * This means that the original canvas is destroyed and can be freed from memory. Thus the text will be static, you cannot
 * change the  text after creation, it will be static.
 *
 * Use this for buttons and labels that does not change over time. For dynamic text use NLCText
 *
 */
const NolimitApplication_1 = require("../NolimitApplication");
const pixi_js_1 = require("pixi.js");
class NLCStaticText extends PIXI.Sprite {
    constructor(text, style) {
        super(NLCStaticText.renderTextToTexture(new PIXI.Text(text, style)));
        this.roundPixels = true;
    }
    ;
    static renderTextToTexture(textObj) {
        const padding = textObj.style.padding ? textObj.style.padding : 0;
        const renderTexture = PIXI.RenderTexture.create({
            width: textObj.width + padding * 2,
            height: textObj.height + padding * 2,
            resolution: NolimitApplication_1.NolimitApplication.resolution
        });
        textObj.position.set(padding, padding);
        NolimitApplication_1.NolimitApplication.pixiApp.renderer.render(textObj, renderTexture);
        renderTexture.trim = new pixi_js_1.Rectangle(-padding, -padding, textObj.width + padding * 2, textObj.height + padding * 2);
        renderTexture.orig = new pixi_js_1.Rectangle(padding, padding, textObj.width, textObj.height);
        renderTexture.updateUvs();
        textObj.destroy({ children: true, texture: true, baseTexture: true });
        return renderTexture;
    }
}
exports.NLCStaticText = NLCStaticText;
//# sourceMappingURL=NLCStaticText.js.map