const LAST_BET = 'lastBet';

const lastBet = {
    init(api) {
        this.api = api;
        this.api.settings.default(LAST_BET, {});
    },

    load() {
        const currency = this.api.currency.getCode();
        const lastBet = this.api.settings.get(LAST_BET);
        return lastBet[currency];
    },

    save(bet) {
        const currency = this.api.currency.getCode();
        const lastBet = this.api.settings.get(LAST_BET);
        lastBet[currency] = bet;
        this.api.settings.set(LAST_BET, lastBet);
    }
};

module.exports = lastBet;
