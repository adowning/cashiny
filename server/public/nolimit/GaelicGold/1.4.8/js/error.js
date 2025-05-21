const translations = require('./translations');
const recoverableError = require('./recoverable-error');
const loaderInteraction = require('./loader-interaction');

const CODES = {
    UNKNOWN: 0,
    JAVASCRIPT: -1001,
    PROMISE: -1002,
    COMMUNICATION: -1003,
    REPLAY: -1004,
    GRAPHICS: -1005,
    FORBIDDEN: 403,
    BAD_GATEWAY: 502,
    SESSION_TIMEOUT: 1007,
    INSUFFICIENT_FUNDS: 1025,
    RESPONSIBLE_GAMING_EXCEEDED: 1026,
    RESPONSIBLE_GAMING_BLOCK: 1030,
    OPERATOR_ERROR: 1050,
    OPERATOR_ERROR_NON_FATAL: 1051,
    FRONT_CLIENT_NOT_VALID: 13004,
    FRONT_CLIENT_NOT_ACTIVE: 13005,
    COUNTRY_BLOCKED: 13043
};

const error = {
    CODES,

    init(api) {
        const dialog = api.dialog;
        this.apiEvents = api.events;

        /**
         * @param {Object} data the error information
         * @param {String} data.message error message
         * @param {Number} data.code error code, positive comes from server, negative from API
         */
        api.events.on('error', error => {
            const message = error.message;
            const code = error.code;
            //const reinitGame = error.reinitGame;
            const dialogData = error.dialog;

            const hasCustomMessage = message && message.includes("hasCustomMessage");

            const options = {
                closeable: false
            };

            if(code === CODES.INSUFFICIENT_FUNDS) {
                recoverableError.show(api, dialogData, 'recoverable-insufficient-funds', true);
            } else if(code === CODES.RESPONSIBLE_GAMING_EXCEEDED || code === CODES.RESPONSIBLE_GAMING_BLOCK) {
                dialog.open(translations.render('responsible-gaming-error', {
                    message: typeof message === 'string' ? message : null
                }), options);

                api.events.trigger('halt');
                dialog.unlockAll();

            } else if(code === CODES.SESSION_TIMEOUT) {
                dialog.open(translations.render('session-timeout'), options);
                api.externalApi.trigger('timeout');
                api.events.trigger('halt');
            } else if(code === CODES.BAD_GATEWAY) {
                dialog.open(translations.render('session-timeout'), options);
                api.externalApi.trigger('timeout');
                api.events.trigger('halt');
            } else if(code === CODES.FORBIDDEN) {
                dialog.open(translations.render('forbidden', {message: translations.translate(message)}), options);
                api.externalApi.trigger('error', message);
                api.events.trigger('halt');
            } else if(code === CODES.COUNTRY_BLOCKED) {
                loaderInteraction.sendMessage({
                    error: message,
                    message: translations.render('country-blocked')
                });
                api.externalApi.trigger('error', message);
                api.events.trigger('halt');
            } else if(code === CODES.FRONT_CLIENT_NOT_ACTIVE || code === CODES.FRONT_CLIENT_NOT_VALID) {
                loaderInteraction.sendMessage({
                    error: message,
                    message: translations.translate('The game you are trying to play is not enabled!')
                });
                api.externalApi.trigger('error', message);
                api.events.trigger('halt');
            } else if(code === CODES.GRAPHICS) {
                dialog.open(translations.render('generic-error', {message}), options);
                console.error('Error:', code, message);
                api.externalApi.trigger('error', message);
                api.events.trigger('halt');
            } else if(code === CODES.OPERATOR_ERROR) {
                let  customDialog = hasCustomMessage ? JSON.parse(message) : {};
                let div = dialog.open(translations.render(customDialog.dialog_template || 'error-message', hasCustomMessage ? customDialog: {message}), {closeable: false});
                recoverableError.addEvent(api, div);
                console.error('Error:', code, message);
                if(!hasCustomMessage){
                    api.externalApi.trigger('error', message + ' (' + code + ')');
                    api.events.trigger('halt');
                }
            } else if(code === CODES.OPERATOR_ERROR_NON_FATAL) {
                let  customDialog = hasCustomMessage ? JSON.parse(message) : {};
                recoverableError.show(api, hasCustomMessage ?  customDialog : dialogData, customDialog.dialog_template, true);
                console.error('Error:', code, message);
            } else {
                dialog.open(translations.render('generic-error'), options);
                console.error('Error:', code, message);
                api.externalApi.trigger('error', message + ' (' + code + ')');
                api.events.trigger('halt');
            }
        });
    },

    trigger(message, code = CODES.UNKNOWN) {
        this.apiEvents.trigger('error', {
            message: message,
            code: code
        });
    }
};

module.exports = error;
