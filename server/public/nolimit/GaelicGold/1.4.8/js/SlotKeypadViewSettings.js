"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotKeypadViewSettings = void 0;
/**
 * Class description
 *
 * Created: 2019-09-20
 * @author jonas
 */
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
class SlotKeypadViewSettings {
    static set instance(value) {
        this._instance = value;
    }
    static get instance() {
        if (this._instance == undefined) {
            this._instance = new SlotKeypadViewSettings();
        }
        return this._instance;
    }
    constructor() {
        this.activePointerStateColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFC00, 0xFFFFFC00, 0xFFFFFC00, 0x33FFFC00);
        this.freeBetsPointerStateColors = new PointerStateColorSet_1.PointerStateColorSet(0xFF7EFF00, 0xFF7EFF00, 0xFF7EFF00, 0x337EFF00);
        this.boostedBetsPointerStateColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        this.normalNonEmphasisPointerStateColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        this.normalPointerStateColors = new PointerStateColorSet_1.PointerStateColorSet(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x33FFFFFF);
        this.normalBackPlatePointerStateColors = new PointerStateColorSet_1.PointerStateColorSet(0x99000000, 0xBB000000, 0x88000000, 0x99000000);
    }
}
SlotKeypadViewSettings.NORMAL_COLOR = 0xFFFFFFFF;
SlotKeypadViewSettings.AUTOPLAY_COLOR = 0xFFFFFC00;
SlotKeypadViewSettings.FREE_BETS_COLOR = 0xFF7EFF00;
SlotKeypadViewSettings.FREE_FEATURE_BET_COLOR = 0xFF7EFF00;
SlotKeypadViewSettings.BOOSTED_BET_COLOR = 0xFFEE2653;
exports.SlotKeypadViewSettings = SlotKeypadViewSettings;
//# sourceMappingURL=SlotKeypadViewSettings.js.map