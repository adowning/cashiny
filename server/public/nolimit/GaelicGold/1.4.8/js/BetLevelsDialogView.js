"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLevelsDialogView = void 0;
const SlotKeypad_1 = require("../../../SlotKeypad");
const BetLevelsPage_1 = require("./pages/BetLevelsPage");
const DialogView_1 = require("./DialogView");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const ScreenBounds_1 = require("@nolimitcity/slot-launcher/bin/display/ScreenBounds");
/**
 * Created by Jonas Wålekvist on 2019-10-16.
 */
class BetLevelsDialogView extends DialogView_1.DialogView {
    constructor(controller, api) {
        super(controller, api, "BetLevels", true);
    }
    init() {
        super.init();
        this.makePage();
    }
    makePage() {
        if (this._page) {
            this.removeChild(this._page);
            this._page.destroy();
        }
        const currencyCode = this.api.options.hideCurrency ? "" : this.api.currency.getSymbol();
        this._page = new BetLevelsPage_1.BetLevelsPage(this, SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("BET"), "" + currencyCode);
        this.addChild(this._page);
    }
    onResize() {
        super.onResize();
        if (!this.shouldResize()) {
            return;
        }
        const bounds = (0, ScreenBounds_1.cloneScreenBounds)(NolimitApplication_1.NolimitApplication.screenBounds);
        bounds.bottom -= this.bottomMargin;
        bounds.height -= this.bottomMargin;
        this._page.onResize(bounds);
        this._page.position.set(bounds.left, bounds.top);
    }
    onInteraction(name, value) {
        this._controller.newBetLevelSelected(name);
        this.close();
    }
    onRefresh() {
        if (this.isOpen) {
            this._page.updateButtons();
        }
    }
    open() {
        super.open();
        this.makePage();
        this._page.updateButtons();
        this.onResize();
    }
    close() {
        super.close();
    }
}
exports.BetLevelsDialogView = BetLevelsDialogView;
//# sourceMappingURL=BetLevelsDialogView.js.map