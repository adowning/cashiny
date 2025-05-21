let playerCurrency = {};

const currency = {
    init(api) {
        playerCurrency.hideCurrency = api.options.hideCurrency;
        api.events.on('currency', function(currency) {
            Object.assign(playerCurrency, currency);
        });
    },

    playerCurrency:playerCurrency,

    format(amount, options) {
        const fixedAmount = this.formatValue(amount, options);
        if(playerCurrency.hideCurrency) {
            return fixedAmount;
        }
        if(playerCurrency.before) {
            return (playerCurrency.symbol + ' ' + fixedAmount).replace(/\s{2,}/g, ' ');
        }
        return (fixedAmount + ' ' + playerCurrency.symbol).replace(/\s{2,}/g, ' ');
    },

    formatValue(amount, options) {
        function precision(input) {
            const parts = input.split(/\./);
            if (parts.length === 2) {
                return parts[1].length;
            } else if (parts.length === 1) {
                return 0;
            } else {
                throw new Error('Trying to get precision from ' + input + ' which isn\'t recognizable as a number');
            }
        }

        function limitToMaxPrecision(precision, max){
            return precision > max ? max : precision;
        }

        options = options || {};

        //#370, If there is a win with 3 decimals or more, display amount with 4 decimals
        /* Disabled for release 2022-03-17
        if (!options.minimumPrecision) {
            const amountString = amount.toString();
            if (amountString.indexOf('.') > -1) {
                //Don't show extra decimals if it's just zeros
                const subAmountString = parseFloat(amount).toFixed(4);
                if (subAmountString.slice(subAmountString.indexOf('.') + 3, subAmountString.indexOf('.') + 5) !== '00'){
                    options.minimumPrecision = 4;
                }
            }
        }
         */

        let optionPrecision;
        if (options.precision === undefined) {
            if (options.minimumPrecision !== undefined) {
                if ((typeof amount) === 'number') {
                    amount = amount.toString();
                }
                const amountPrecision = precision(amount);
                const strippedAmountPrecision = precision(amount.replace(/[0]*$/, ''));
                if (amountPrecision !== strippedAmountPrecision) {
                    optionPrecision = Math.max(limitToMaxPrecision(strippedAmountPrecision,2), options.minimumPrecision);
                } else {
                    optionPrecision = Math.max(limitToMaxPrecision(amountPrecision,2), options.minimumPrecision);
                }
            } else {
                optionPrecision = 2;
            }
        }

        options.thousandSeparator = options.thousandSeparator !== undefined ? options.thousandSeparator : '';

        const fixedAmount = parseFloat(amount).toFixed(optionPrecision);
        const separated = fixedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, options.thousandSeparator);
        return separated;
    },

    getCode() {
        return playerCurrency.code ? playerCurrency.code : "";
    },

    getHideCurrency() {
        return playerCurrency.hideCurrency === true;
    },

    getSymbol() {
        return playerCurrency.symbol ? playerCurrency.symbol : "";
    }
};

module.exports = currency;
