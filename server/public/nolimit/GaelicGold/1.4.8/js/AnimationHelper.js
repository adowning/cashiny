"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationHelper = void 0;
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
/**
 * Created by jonas on 2023-05-11.
 */
class AnimationHelper {
    static getAnimationTextures(animationName) {
        if (Array.isArray(AnimationHelper.animationTextures[animationName])) {
            return AnimationHelper.animationTextures[animationName];
        }
        if (Array.isArray(AnimationHelper.animationTextureNames[animationName])) {
            AnimationHelper.animationTextures[animationName] = [];
            for (let textureName of AnimationHelper.animationTextureNames[animationName]) {
                AnimationHelper.animationTextures[animationName].push(ImgLoader_1.ImgLoader.getImgTexture(textureName));
            }
            return AnimationHelper.animationTextures[animationName];
        }
        throw new Error("AnimationHelper: Could not find animation");
    }
}
AnimationHelper.animationTextureNames = {
    "bigWinBase": ["bigwin/bigwinBase/bigwinBase_00018", "bigwin/bigwinBase/bigwinBase_00019", "bigwin/bigwinBase/bigwinBase_00020", "bigwin/bigwinBase/bigwinBase_00021", "bigwin/bigwinBase/bigwinBase_00022", "bigwin/bigwinBase/bigwinBase_00023", "bigwin/bigwinBase/bigwinBase_00024", "bigwin/bigwinBase/bigwinBase_00025", "bigwin/bigwinBase/bigwinBase_00026", "bigwin/bigwinBase/bigwinBase_00027", "bigwin/bigwinBase/bigwinBase_00028", "bigwin/bigwinBase/bigwinBase_00029", "bigwin/bigwinBase/bigwinBase_00030", "bigwin/bigwinBase/bigwinBase_00031", "bigwin/bigwinBase/bigwinBase_00032", "bigwin/bigwinBase/bigwinBase_00033", "bigwin/bigwinBase/bigwinBase_00034"],
    "bigWinText": ["bigwin/bigwinText/bigwinText_00018", "bigwin/bigwinText/bigwinText_00019", "bigwin/bigwinText/bigwinText_00020", "bigwin/bigwinText/bigwinText_00021", "bigwin/bigwinText/bigwinText_00022", "bigwin/bigwinText/bigwinText_00023", "bigwin/bigwinText/bigwinText_00024", "bigwin/bigwinText/bigwinText_00025", "bigwin/bigwinText/bigwinText_00026", "bigwin/bigwinText/bigwinText_00027", "bigwin/bigwinText/bigwinText_00028", "bigwin/bigwinText/bigwinText_00029", "bigwin/bigwinText/bigwinText_00030", "bigwin/bigwinText/bigwinText_00031", "bigwin/bigwinText/bigwinText_00032", "bigwin/bigwinText/bigwinText_00033", "bigwin/bigwinText/bigwinText_00034", "bigwin/bigwinText/bigwinText_00035", "bigwin/bigwinText/bigwinText_00036", "bigwin/bigwinText/bigwinText_00037", "bigwin/bigwinText/bigwinText_00038", "bigwin/bigwinText/bigwinText_00039", "bigwin/bigwinText/bigwinText_00040", "bigwin/bigwinText/bigwinText_00041", "bigwin/bigwinText/bigwinText_00042", "bigwin/bigwinText/bigwinText_00043", "bigwin/bigwinText/bigwinText_00044", "bigwin/bigwinText/bigwinText_00045"],
    "noWin": ["noWin/nowin_00001", "noWin/nowin_00002", "noWin/nowin_00003", "noWin/nowin_00004", "noWin/nowin_00005", "noWin/nowin_00006", "noWin/nowin_00007", "noWin/nowin_00008", "noWin/nowin_00009", "noWin/nowin_00010", "noWin/nowin_00011", "noWin/nowin_00012", "noWin/nowin_00013", "noWin/nowin_00014"],
    "winCoins": ["winCoins/winCoins_00018", "winCoins/winCoins_00019", "winCoins/winCoins_00020", "winCoins/winCoins_00021", "winCoins/winCoins_00022", "winCoins/winCoins_00023", "winCoins/winCoins_00024", "winCoins/winCoins_00025", "winCoins/winCoins_00026", "winCoins/winCoins_00027", "winCoins/winCoins_00028", "winCoins/winCoins_00029", "winCoins/winCoins_00030", "winCoins/winCoins_00031", "winCoins/winCoins_00032", "winCoins/winCoins_00033", "winCoins/winCoins_00034", "winCoins/winCoins_00035", "winCoins/winCoins_00036", "winCoins/winCoins_00037", "winCoins/winCoins_00038", "winCoins/winCoins_00039", "winCoins/winCoins_00040", "winCoins/winCoins_00041", "winCoins/winCoins_00042"]
};
AnimationHelper.animationTextures = {};
exports.AnimationHelper = AnimationHelper;
//# sourceMappingURL=AnimationHelper.js.map