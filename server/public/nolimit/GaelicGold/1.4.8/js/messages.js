const ajaxPromise = require('@nolimitcity/core/api/ajax-promise');
const translations = require('./translations');
const BREAKING = 'https://www.nolimitcdn.com/messages/messages.json';

const breakingQueue = [];
const seen = new Set();

const MANDATORY_FIELDS = ['operator', 'environment', 'game'];

const messages = {
    init: (api) => {
        if (api.options.replay) {
            return;
        }
        if (api.options.readMessagesJson === false) {
            return;
        }
        const promise = api.startupPromise('messages');
        api.settings.default('shownMessages', []);

        api.events.on('messages', (data) => {
            for (let i = 0; i < data.length; i++) {
                const message = data[i];

                const id = message.id;
                if (id) {
                    if (seen.has(id)) {
                        return;
                    }
                    seen.add(id);
                }

                const template = message.template || 'generic-message';
                const html = translations.render(template, message.data);
                api.dialog.open(html);
            }
        });

        ajaxPromise.get(BREAKING)
            .json(messages => {
                messages = Array.isArray(messages) ? messages : [];

                api.log('messages', messages);

                messages.forEach(msg => {
                    if (typeof msg.id === 'undefined') {
                        api.warn('Missing \'id\' field in message:', msg);
                        return;
                    }

                    if (typeof msg.filter === 'undefined') {
                        api.warn('Missing \'filter\' field in message:', msg);
                        return;
                    }

                    for (let i = 0; i < MANDATORY_FIELDS.length; i++) {
                        const field = MANDATORY_FIELDS[i];
                        if (typeof msg.filter[field] === 'undefined') {
                            api.warn(`Missing filter.'${field}' in message:`, msg);
                            return;
                        }
                    }

                    const id = msg.id;
                    const shownMessages = api.settings.get('shownMessages');

                    if (shownMessages.includes(id)) {
                        api.log('Already seen message with id:', id);
                        return;
                    }

                    if (msg.filter) {
                        for (const option in msg.filter) {
                            if (!msg.filter[option].includes(api.options[option])) {
                                return;
                            }
                        }

                        const language = api.options.language;
                        const data = {
                            title: msg.title[language] || msg.title['en'],
                            message: msg.message[language] || msg.message['en']
                        };
                        breakingQueue.push({data});
                    }

                    shownMessages.push(id);
                    api.settings.set('shownMessages', shownMessages);
                });

                promise.fulfill();
            })
            .catch(e => {
                api.warn('Message json failed', e);
                promise.fulfill();
            });

        api.events.once('start', () => {
            if (breakingQueue.length > 0) {
                api.events.trigger('messages', breakingQueue);
            }
            if (api.options.messages && api.options.messages.length > 0) {
                api.events.trigger('messages', api.options.messages);
            }
        });
    }
};

module.exports = messages;
