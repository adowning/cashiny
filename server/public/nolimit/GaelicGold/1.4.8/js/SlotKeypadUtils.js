"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotKeypadUtils = void 0;
const KeypadTextStyles_1 = require("../config/KeypadTextStyles");
/**
 * Created by Jonas Wålekvist on 2020-01-24.
 */
class SlotKeypadUtils {
    static disableElement(element) {
        if (element.parent) {
            element.parent.removeChild(element);
        }
    }
    static doFontHack(data) {
        const styles = [
            [KeypadTextStyles_1.KeypadTextStyles.DEFAULT_RADIO_BUTTON_LABEL, "DEFAULT_RADIO_BUTTON_LABEL"],
            [KeypadTextStyles_1.KeypadTextStyles.DEFAULT_LABEL_STYLE, "DEFAULT_LABEL_STYLE"],
            [KeypadTextStyles_1.KeypadTextStyles.AUTO_PLAY_COUNTER_LABEL_STYLE, "AUTO_PLAY_COUNTER_LABEL_STYLE"],
            [KeypadTextStyles_1.KeypadTextStyles.SPIN_BUTTON_FREE_BETS_NUMBER, "SPIN_BUTTON_FREE_BETS_NUMBER"],
            [KeypadTextStyles_1.KeypadTextStyles.DEFAULT_DIALOG_HEADER, "DEFAULT_DIALOG_HEADER"],
            [KeypadTextStyles_1.KeypadTextStyles.DEFAULT_DIALOG_HEADER_EMPHASIS, "DEFAULT_DIALOG_HEADER_EMPHASIS"],
            [KeypadTextStyles_1.KeypadTextStyles.BRAND_TEXT_THIN, "BRAND_TEXT_THIN"],
            [KeypadTextStyles_1.KeypadTextStyles.BRAND_TEXT_THICK, "BRAND_TEXT_THICK"],
            [KeypadTextStyles_1.KeypadTextStyles.CLOCK, "CLOCK"],
            [KeypadTextStyles_1.KeypadTextStyles.GAME_NAME, "GAME_NAME"],
            [KeypadTextStyles_1.KeypadTextStyles.FREE_BETS_DIALOG_HEADER, "FREE_BETS_DIALOG_HEADER"],
            [KeypadTextStyles_1.KeypadTextStyles.FREE_BETS_DIALOG_MESSAGE, "FREE_BETS_DIALOG_MESSAGE"],
            [KeypadTextStyles_1.KeypadTextStyles.FREE_BETS_DIALOG_VALUE, "FREE_BETS_DIALOG_VALUE"]
        ];
        if (data.symbol != undefined) {
            const hackContainer = document.createElement("div");
            hackContainer.classList.add("currencyFontLoadHack");
            hackContainer.style.position = "absolute";
            hackContainer.style.zIndex = "-1000";
            // hackContainer.style.top = 0 + "px";
            const container = document.querySelector('.nolimit.container');
            if (container == undefined) {
                return;
            }
            container.append(hackContainer);
            let yAdvance = 0;
            for (let style of styles) {
                let fontFamily = "";
                if ((typeof style[0].fontFamily === "string")) {
                    fontFamily = style[0].fontFamily;
                }
                else {
                    for (let family of style[0].fontFamily) {
                        fontFamily += family + ",";
                    }
                }
                const ptag = document.createElement("p");
                ptag.style.position = "absolute";
                ptag.style.top = yAdvance + "px";
                ptag.style.fontFamily = fontFamily;
                ptag.style.fontWeight = style[0].fontWeight.toString();
                ptag.style.fontSize = "20px";
                ptag.style.color = "#FFFFFF";
                ptag.innerText = data.symbol;
                yAdvance += 20;
                hackContainer.append(ptag);
            }
        }
    }
}
exports.SlotKeypadUtils = SlotKeypadUtils;
//# sourceMappingURL=SlotKeypadUtils.js.map