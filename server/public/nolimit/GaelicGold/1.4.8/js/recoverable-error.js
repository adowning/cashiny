


const recoverableError = {

    /**
     * Shows recoverable error. if recoverable external handlers are registered or localRecoverable is true a soft reset will occur.
     * The continue button will be disabled until a fake round (in the background) is completed.
     *
     * @param api game-api
     * @param dialogData
     * @param customTemplate string, name of a custom template
     * @param localRecoverable if true, no external-api handlers needs to be registered for the soft reset to occur.
     */
    show: function(api, dialogData, customTemplate, localRecoverable) {
        const hasRecoverableErrors = api.externalApi.isRegistered('recoverableErrorChoice') || localRecoverable === true;

        const options = {
            closeable: false
        };

        dialogData.title = dialogData.title || 'Recoverable error';
        dialogData.text = dialogData.text || 'An error occurred';
        dialogData.continue = hasRecoverableErrors;


        let template = 'recoverable-error';
        if (customTemplate){
            template = customTemplate;
        }
        const div = api.dialog.open(api.translations.render(template, dialogData), options);
        this.addEvent(api, div);
    },


    addEvent: function(api, div) {
        const hasRecoverableErrors = api.externalApi.isRegistered('recoverableErrorChoice');
        const stopButton = div.querySelector('.stop');
        if(stopButton) {
            stopButton.addEventListener('click', function() {
                if (hasRecoverableErrors){
                    api.externalApi.trigger('recoverableErrorChoice', {action:'stop'});
                } else {
                    api.externalApi.trigger('exit').or(() => history.back());
                }
            });
        }

        const continueButton = div.querySelector('.close');
        if(continueButton) {
            continueButton.disabled = true;
            continueButton.classList.add('disabled');
            continueButton.classList.add('waiting');

            api.events.once('finish', ()=> {
                continueButton.disabled = false;
                continueButton.classList.remove('disabled');
                continueButton.classList.remove('waiting');

            });
        }

        if(hasRecoverableErrors) {
            if(continueButton) {
                continueButton.addEventListener('click', function() {
                    api.externalApi.trigger('recoverableErrorChoice', {action:'continue'});
                });
            }
        }else{
            if(continueButton) {
                continueButton.addEventListener('click', function() {
                    api.externalApi.trigger('ready');
                });
            }
        }

        let buttonWithDataEvents = div.querySelectorAll('[data-event]');
        for(let button of buttonWithDataEvents){
            let event = button.dataset.event;
            if(event) {
                button.addEventListener('click', function() {
                 api.externalApi.trigger(event);
                });
            }
        }

        api.communication.refreshBalance();
        api.events.trigger('softReset');
    }
};

module.exports = recoverableError;
