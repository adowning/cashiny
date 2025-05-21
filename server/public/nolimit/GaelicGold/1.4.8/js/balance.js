const currency = require('./currency');
const featureBet = require('./featureBet');

let storedBalance = '0.00';

const balance = {
    init(api) {
        api.events.on('bet', function(data) {
            if(data.type === 'normalBet') {
                try {
                    if(!data.replayAndFeatureBuy) {
                        balance.subtract(data.bet);
                    }
                } catch(e) {
                    if(!api.options.replay) {
                        throw e;
                    }
                }
            }
            if(data.type === 'featureBet' && !(data.data && data.data.isPromotional)) {
                try {
                    balance.subtract(featureBet.getActualPrice(data));
                } catch(e) {
                    if(!api.options.replay) {
                        throw e;
                    }
                }
            }
        });
        api.events.on('actionSpinsBet', function(data) {
            if(data.type === 'normalBet') {
                try {
                    if(!data.replayAndFeatureBuy) {
                        balance.subtract(data.bet);
                    }
                } catch(e) {
                    if(!api.options.replay) {
                        throw e;
                    }
                }
            }
            if(data.type === 'featureBet' && !(data.data && data.data.isPromotional)) {
                try {
                    balance.subtract(featureBet.getActualPrice(data));
                } catch(e) {
                    if(!api.options.replay) {
                        throw e;
                    }
                }
            }
        });

        api.events.on('balance', this.update);
    },

    update(balance) {
        storedBalance = balance;
    },

    getAmount() {
        return parseFloat(storedBalance);
    },

    toString() {
        return storedBalance;
    },

    getFormattedBalance(precision = 2) {
        return currency.format(storedBalance, {minimumPrecision: precision});
    },

    subtract(bet) {
        function fractionalDigits(value) {
            if ((typeof value) !== 'string') {
                value = value.toString();
            }
            const parts = value.split(/\./);
            if (parts.length === 1) {
                return 0;
            } else if (parts.length === 2) {
                return parts[1].length;
            } else {
                throw new Error('Value not a number ' + value);
            }
        }
    
        const maxFractionalDigits = Math.max(2, Math.max(fractionalDigits(currency.formatValue(storedBalance, {minimumPrecision: 2})), fractionalDigits(bet)));
        const newAmount = parseFloat(storedBalance) - parseFloat(bet);

        if(newAmount < 0) {
            throw new Error('Subtraction too big: balance = ' + storedBalance + ', bet = ' + bet);
        }

        storedBalance = newAmount.toFixed(maxFractionalDigits);
    }
};

module.exports = balance;
