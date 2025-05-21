"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiDefaults = void 0;
/**
 * Created by Jonas Wålekvist on 2019-11-28.
 */
const OpenSans_1 = require("../../loader/font/OpenSans");
const FontStatics_1 = require("../../loader/font/FontStatics");
class GuiDefaults {
}
GuiDefaults.DEFAULT_LABEL_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
GuiDefaults.DEFAULT_LABEL_STYLE_SMALL = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 16,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
GuiDefaults.DEFAULT_LABEL_VALUE_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
GuiDefaults.INTRO_PAGE_TEXT = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 28,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.NORMAL,
    wordWrap: true,
    wordWrapWidth: 340,
    breakWords: true
});
//Button related
GuiDefaults.DEFAULT_CONTINUE_BUTTON_LABEL_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 34,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 10
});
GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
GuiDefaults.DEFAULT_RADIO_BUTTON_LABEL = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 34,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
GuiDefaults.DEFAULT_CHECKBOX_BUTTON_LABEL = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
exports.GuiDefaults = GuiDefaults;
//# sourceMappingURL=GuiDefaults.js.map