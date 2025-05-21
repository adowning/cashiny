const insufficientFunds = {

    show: function(api) {
        const hasDeposit = api.externalApi.isRegistered('deposit');
        const fundsDialog = api.dialog.open(api.translations.render('insufficient-funds', {
            deposit: hasDeposit
        }));

        api.communication.refreshBalance();

        const depositButton = fundsDialog.querySelector('.deposit');
        if(depositButton) {
            depositButton.addEventListener('click', function() {
                api.externalApi.trigger('deposit');
            });
        }
    }
};

module.exports = insufficientFunds;
