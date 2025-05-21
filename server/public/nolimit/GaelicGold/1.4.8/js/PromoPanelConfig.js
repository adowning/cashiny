"use strict";
/**
 * Created by Pankaj on 2019-12-23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mode = exports.PromoPanelConfig = void 0;
const PromoPanelButtonIDs_1 = require("../enums/PromoPanelButtonIDs");
class PromoPanelConfig {
}
PromoPanelConfig.DISABLE_BTN_ALPHA = 0.4;
PromoPanelConfig.ENABLE_BTN_ALPHA = 1;
PromoPanelConfig.PROMO_PANEL_BTN_PANEL_HEIGHT = 150;
PromoPanelConfig.FEATURE_BTN_CONFIG = [
    {
        id: PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS,
        isDefault: true,
        isDisabled: false,
        shouldHide: false,
        shouldReAligned: false,
        viewBackgroundColor: 0xfec20e
    },
    {
        id: PromoPanelButtonIDs_1.PromoPanelButtonIDs.NOLIMIT_WINNERS,
        isDefault: true,
        isDisabled: false,
        shouldHide: false,
        shouldReAligned: false,
        viewBackgroundColor: 0x68a4d9
    },
    {
        id: PromoPanelButtonIDs_1.PromoPanelButtonIDs.VOUCHER,
        isDefault: false,
        isDisabled: true,
        shouldHide: false,
        shouldReAligned: false,
        viewBackgroundColor: 0xff0000
    }
];
PromoPanelConfig.FEATURE_SCROLL_MASK_HEIGHT_PORTRAIT = 978;
PromoPanelConfig.GAME_NAME_FILTER_REG_EXP = /\s/g;
PromoPanelConfig.DEFAULT_SCREEN_RATIO = 1280 / 720;
PromoPanelConfig.SINGLE_BLANK_SPACE = " ";
PromoPanelConfig.NO_DECIMALS_CUTOFF_POINT = 10;
PromoPanelConfig.DEFAULT_SCREEN_MIN_RATIO = 1.61;
PromoPanelConfig.TEXT_LABEL_DRAW_BORDER = false;
// false, true only for test textLablel maxWidth.
PromoPanelConfig.DEFAULT_LARGE_BUTTON_SIZE = new PIXI.Rectangle(0, 0, 144, 76);
PromoPanelConfig.DEFAULT_SMALL_BUTTON_SIZE = new PIXI.Rectangle(0, 0, 216, 72);
//public static AS_SETTING_POPUP_OK_BUTTON_SIZE: PIXI.Rectangle = new PIXI.Rectangle(0, 0, 210, 80);
PromoPanelConfig.AS_SETTING_POPUP_OK_BUTTON_SIZE = new PIXI.Rectangle(0, 0, 216, 98);
PromoPanelConfig.FEATURE_FILTER_LIST = ["FREESPIN", "FEATURE_BUY"];
PromoPanelConfig.DATE_SEPARATOR = "-";
PromoPanelConfig.NOT_AVAILABLE = "n/a";
PromoPanelConfig.NO_TEXT = "No";
PromoPanelConfig.YES_TEXT = "Yes";
PromoPanelConfig.EMPTY_STRING = "";
PromoPanelConfig.DECIMAL_CUTOFF = 2;
PromoPanelConfig.JPG_FORMAT = ".jpg";
exports.PromoPanelConfig = PromoPanelConfig;
var Mode;
(function (Mode) {
    Mode["NORMAL"] = "NORMAL";
    Mode["RESPIN"] = "RESPIN";
    Mode["FREESPIN"] = "FREESPIN";
    Mode["SUPER_FREESPIN"] = "SUPERFREESPIN";
})(Mode = exports.Mode || (exports.Mode = {}));
//# sourceMappingURL=PromoPanelConfig.js.map