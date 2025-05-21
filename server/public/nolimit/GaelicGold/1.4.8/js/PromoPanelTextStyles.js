"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoPanelTextStyles = void 0;
/**
 * Created by Pankaj singh on 2019-10-19.
 */
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
class PromoPanelTextStyles {
}
PromoPanelTextStyles.FEATURE_BASE_PANEL_TITLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 50,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    padding: 50
});
PromoPanelTextStyles.FEATURE_BASE_BUY_FEATURE_TITLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 50,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    dropShadow: true,
    dropShadowAngle: -1,
    dropShadowDistance: -3,
    dropShadowColor: "#b62449",
    padding: 50
});
PromoPanelTextStyles.FEATURE_BASE_REPLAY_TITLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 50,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    dropShadow: true,
    dropShadowAngle: -1,
    dropShadowDistance: -3,
    dropShadowColor: "#4588c8",
    padding: 59
});
PromoPanelTextStyles.FEATURE_ACTION_SPIN_REPLAY_TITLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 50,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    dropShadow: true,
    dropShadowAngle: -1,
    dropShadowDistance: -3,
    dropShadowColor: "#f57f20",
    padding: 59
});
PromoPanelTextStyles.BET_PANEL_BET_LABEL = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.BET_PANEL_CURRENCY_LABEL = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
});
PromoPanelTextStyles.BET_PANEL_BET_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 55,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.BET_PANEL_SEPARATOR_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 65,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.POP_UP_FEATURE_TEXT = new PIXI.TextStyle({
    fill: "#367fff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 42,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
PromoPanelTextStyles.AS_BONUS_SELECTION_POP_UP_GAME_NAME_TEXT = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 35,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    padding: 10
});
PromoPanelTextStyles.AS_POP_UP_HEADER_TEXT = new PIXI.TextStyle({
    fill: "#00b786",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 28,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    align: "center"
});
PromoPanelTextStyles.AS_POP_UP_CONTENT_TEXT = new PIXI.TextStyle({
    fill: "#B7B7B7",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    wordWrap: true,
    align: "center"
});
PromoPanelTextStyles.AS_POPUP_OK_TEXT = new PIXI.TextStyle({
    fill: "#FFFFFF",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 32,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 59
});
PromoPanelTextStyles.AS_BONUS_SELECTION_POP_UP_MAIN_GAME_TEXT = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.REGULAR
});
PromoPanelTextStyles.AS_BONUS_SELECTION_PICK_LABEL = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.REGULAR
});
PromoPanelTextStyles.POP_UP_HLINE = new PIXI.TextStyle({
    fill: "#367fff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 42,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.NORMAL
});
PromoPanelTextStyles.POP_UP_FORMATTED_PRICE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
PromoPanelTextStyles.POP_UP_CHARGE_FROM_WALLET_TEXT = new PIXI.TextStyle({
    fill: "#686868",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.ACTION_SPINS_SETTINGS_HEADER = new PIXI.TextStyle({
    fill: "#000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 35,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    padding: 10,
});
PromoPanelTextStyles.ACTION_SPINS_SETTINGS_MAIN_GAME_HEADER = new PIXI.TextStyle({
    fill: "#000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.REGULAR,
    padding: 10
});
PromoPanelTextStyles.ACTION_SPINS_MAIN_GAME_LABEL = new PIXI.TextStyle({
    fill: "#f78d1d",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL
});
PromoPanelTextStyles.ACTION_SPINS_STOP_ON_BONUS_LABEL = new PIXI.TextStyle({
    fill: "#f78d1d",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 26,
    fontStyle: FontStatics_1.FontStyle.NORMAL
});
PromoPanelTextStyles.ACTION_SPINS_OPTIONS_DISCLAIMER = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    wordWrap: true,
    wordWrapWidth: 633,
    dropShadow: true,
    dropShadowAngle: -1,
    dropShadowColor: "#f78d1d",
    dropShadowDistance: -2,
    padding: 5
});
PromoPanelTextStyles.ACTION_SPINS_OPTIONS_TITLE = new PIXI.TextStyle({
    fill: "#f78d1d",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 26,
    fontStyle: FontStatics_1.FontStyle.NORMAL
});
PromoPanelTextStyles.ACTION_SPINS_OPTIONS_VALUE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 26,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    dropShadow: true,
    dropShadowAngle: -1,
    dropShadowColor: "#f78d1d",
    dropShadowDistance: -2,
    padding: 5
});
PromoPanelTextStyles.AS_REPLAY_NUMBER_TEXT_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 26,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD
});
PromoPanelTextStyles.GAME_FEATURE_CURRANCY_STYLE = new PIXI.TextStyle({
    fill: "#a76f00",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
});
PromoPanelTextStyles.GAME_FEATURE_PRICE_STYLE = new PIXI.TextStyle({
    fill: "#a76f00",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 35,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.GAME_FEATURE_COST_TEXT = new PIXI.TextStyle({
    fill: "#a76f00",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.GAME_FEATURE_BUY_TEXT = new PIXI.TextStyle({
    fill: "#fff500",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 36,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 10
});
PromoPanelTextStyles.GAME_FEATURE_BUY_TEXT_DISABLED = new PIXI.TextStyle({
    fill: "#f8f49f",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 36,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 10
});
PromoPanelTextStyles.PROMO_PANEL_HEADING = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 28,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.PROMO_PANEL_PROMOTIONS_HEADING = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 28,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
});
PromoPanelTextStyles.GAME_FEATURE_OK_TEXT = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 38,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 59
});
PromoPanelTextStyles.AS_SETTING_POPUP_OK_TEXT = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 42,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 59
});
//REPLAY
PromoPanelTextStyles.REPLAY_MIDDLE_BAR_TEXT = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
PromoPanelTextStyles.REPLAY_GAME_BTN_ACTIVE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    padding: 10
});
PromoPanelTextStyles.REPLAY_GAME_BTN_INACTIVE = new PIXI.TextStyle({
    fill: "#284382",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    padding: 10
});
PromoPanelTextStyles.ROUND_INFO_BET_TEXT_ACTIVE = new PIXI.TextStyle({
    fill: "#f3e550",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 25,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
PromoPanelTextStyles.ROUND_INFO_BET_TEXT_INACTIVE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 25,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE_FILL_COLOR = GuiUtils_1.GuiUtils.getARGB(PIXI.utils.string2hex("#284382"));
PromoPanelTextStyles.REPLAY_FILTER_STYLE_INACTIVE = new PIXI.TextStyle({
    fill: "#284382",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD,
    padding: 50
    // stroke: "#284382",
    // strokeThickness: 2,
    // lineJoin: "round"
});
PromoPanelTextStyles.REPLAY_FILTER_STYLE_ACTIVE_FILL_COLOR = GuiUtils_1.GuiUtils.getARGB(PIXI.utils.string2hex("#f3e550"));
PromoPanelTextStyles.REPLAY_FILTER_STYLE_ACTIVE = new PIXI.TextStyle({
    fill: "#f3e550",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD,
    // strokeThickness: 0
});
PromoPanelTextStyles.ROUND_INFO_DATE_TEXT = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 16,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.REGULAR
});
PromoPanelTextStyles.SORT_BUTTON = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD
});
PromoPanelTextStyles.ROUND_INFO_GAME_NAME_TEXT = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 18,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
PromoPanelTextStyles.ROUND_INFO_CURRENCY_TEXT = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 25,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.ROUND_INFO_WIN_TEXT = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 25,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
PromoPanelTextStyles.ROUND_INFO_TROPHY_TEXT = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 35,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
});
PromoPanelTextStyles.DEFAULT_BUTTON_LABEL_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 40,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.SETTINGS_BUTTON_LABEL_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.AS_ROUND_INFO_X_BET_STYLE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.REGULAR
});
PromoPanelTextStyles.AS_ROUND_INFO_SLASH_STYLE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
PromoPanelTextStyles.AS_ROUND_INFO_RE_SPIN_STYLE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD
});
PromoPanelTextStyles.AS_ROUND_INFO_SPINS_LEFT_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 28,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD
});
PromoPanelTextStyles.AS_ROUND_INFO_WIN_STYLE = new PIXI.TextStyle({
    fill: "#fbc217",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    dropShadow: false,
    dropShadowAngle: 1.57,
    //dropShadowColor:"#f78d1d",
    dropShadowColor: "#000000",
    dropShadowDistance: 2,
    dropShadowAlpha: 0.7
});
PromoPanelTextStyles.AS_ROUND_INFO_PLAY_BONUS_IN_GAME_STYLE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 18,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.REGULAR,
    padding: 10
});
PromoPanelTextStyles.AS_ROUND_INFO_CONTINUE_STYLE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 15,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD
});
PromoPanelTextStyles.AS_POPUP_TOTAL_COST_STYLE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.REGULAR
});
PromoPanelTextStyles.AS_ROUND_INFO_SPIN_NUMBER_TEXT_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 11,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.BOLD
});
exports.PromoPanelTextStyles = PromoPanelTextStyles;
//# sourceMappingURL=PromoPanelTextStyles.js.map