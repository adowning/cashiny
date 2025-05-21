const translations = require('./translations');
const currency = require('./currency');

const maxWinCap = {
    init(api) {
        api.events.on('maxWinCap', function(data) {
            const amount = currency.format(data);
            api.dialog.open(translations.render('max-win-cap', {
                amount: amount
            }), {
                closeable: false,
                blackout: true
            });
            api.events.trigger('halt');
            api.dialog.unlockAll();
        });
    }
};

module.exports = maxWinCap;
