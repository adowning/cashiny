"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutMultiplier = void 0;
/**
 * Created by Jonas Wålekvist on 2019-12-09.
 */
class PayoutMultiplier {
    constructor(api) {
        this.apiPlugin = api;
    }
    updateScreen(screen) {
        let currentBet = parseFloat(this.apiPlugin.betLevel.getLevel());
        if (this.apiPlugin.freeBets.hasFreeBets()) {
            currentBet = parseFloat(this.apiPlugin.freeBets.getBet());
        }
        screen.find('[data-multiplier].multiplier').forEach((multiplier) => {
            const multipliedBet = currentBet * multiplier.dataset.multiplier;
            const noDecimals = multipliedBet >= 10 && multipliedBet.toFixed(2).endsWith('00');
            if (noDecimals) {
                multiplier.textContent = multipliedBet.toFixed(0);
            }
            else {
                multiplier.textContent = this.apiPlugin.currency.formatValue(multipliedBet);
            }
        });
    }
}
exports.PayoutMultiplier = PayoutMultiplier;
//# sourceMappingURL=PayoutMultiplier.js.map