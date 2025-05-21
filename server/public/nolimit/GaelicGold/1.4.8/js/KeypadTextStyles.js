"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeypadTextStyles = void 0;
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const SlotKeypadViewSettings_1 = require("../SlotKeypadViewSettings");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
/**
 * Created by Jonas Wålekvist on 2019-10-16.
 */
class KeypadTextStyles {
}
KeypadTextStyles.DEFAULT_PORTRAIT_TEXT_SIZE = 20;
KeypadTextStyles.DEFAULT_LANDSCAPE_TEXT_SIZE = 20;
KeypadTextStyles.DEFAULT_DROP_SHADOW = {
    dropShadow: true,
    dropShadowColor: 0x000000,
    dropShadowAngle: 1.5707,
    dropShadowBlur: 4,
    dropShadowDistance: 2
};
KeypadTextStyles.KEYPAD_STANDARD_LABEL = Object.assign(Object.assign(GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_STYLE.clone(), KeypadTextStyles.DEFAULT_DROP_SHADOW), {
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
KeypadTextStyles.KEYPAD_STANDARD_VALUE = Object.assign(GuiDefaults_1.GuiDefaults.DEFAULT_LABEL_VALUE_STYLE.clone(), KeypadTextStyles.DEFAULT_DROP_SHADOW);
KeypadTextStyles.FREE_BETS_WIN_LABEL = Object.assign(KeypadTextStyles.KEYPAD_STANDARD_LABEL.clone(), {
    fill: GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR)
});
KeypadTextStyles.FREE_BETS_WIN_VALUE = Object.assign(KeypadTextStyles.KEYPAD_STANDARD_VALUE.clone(), {
    fill: GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR)
});
KeypadTextStyles.TOTAL_COST_LABEL = Object.assign(KeypadTextStyles.KEYPAD_STANDARD_LABEL.clone(), {
    fill: GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.AUTOPLAY_COLOR)
});
KeypadTextStyles.TOTAL_COST_VALUE = Object.assign(KeypadTextStyles.KEYPAD_STANDARD_VALUE.clone(), {
    fill: GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.AUTOPLAY_COLOR),
});
KeypadTextStyles.WIN_LABEL = KeypadTextStyles.KEYPAD_STANDARD_LABEL.clone();
KeypadTextStyles.WIN_VALUE = Object.assign(KeypadTextStyles.KEYPAD_STANDARD_VALUE.clone(), {
    fontSize: 34,
    fill: GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.AUTOPLAY_COLOR)
});
KeypadTextStyles.DEFAULT_RADIO_BUTTON_LABEL = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 40,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
KeypadTextStyles.DEFAULT_LABEL_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
KeypadTextStyles.AUTO_PLAY_COUNTER_LABEL_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 25,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
KeypadTextStyles.SPIN_BUTTON_FREE_BETS_NUMBER = new PIXI.TextStyle({
    fill: GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR),
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 25,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
/*    static DEFAULT_BUTTON_LABEL_STYLE:PIXI.TextStyle = new PIXI.TextStyle({
        fill:"#ffffff",
        fontFamily:OpenSans.FAMILY,
        fontSize:30,
        fontStyle:FontStyle.NORMAL,
        fontWeight:FontWeight.LIGHT
    });*/
KeypadTextStyles.DEFAULT_DIALOG_HEADER = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 48,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    padding: 10
});
KeypadTextStyles.DEFAULT_DIALOG_HEADER_EMPHASIS = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 40,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
KeypadTextStyles.BRAND_TEXT_THIN = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 17,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
KeypadTextStyles.BRAND_TEXT_THICK = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
KeypadTextStyles.CLOCK = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 14,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
KeypadTextStyles.GAME_NAME = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 14,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
KeypadTextStyles.FREE_BETS_DIALOG_HEADER = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
KeypadTextStyles.FREE_BETS_DIALOG_MESSAGE = new PIXI.TextStyle({
    fill: GuiUtils_1.GuiUtils.getColorFromARGB(SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR),
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontWeight: FontStatics_1.FontWeight.NORMAL,
    wordWrap: true,
    wordWrapWidth: 660,
    align: "center"
});
KeypadTextStyles.FREE_BETS_DIALOG_VALUE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
exports.KeypadTextStyles = KeypadTextStyles;
//# sourceMappingURL=KeypadTextStyles.js.map