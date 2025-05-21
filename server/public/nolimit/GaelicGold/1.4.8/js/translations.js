const hogan = require('hogan.js');
const translationData = {};
const availableLanguages = ['bg', 'bp', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fi', 'fr', 'hi', 'hu', 'id', 'is', 'it', 'ja', 'ka', 'ko', 'lt', 'lv', 'ms', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sr', 'succinct', 'sv', 'zh-hant', 'th', 'tr', 'verbose', 'vi', 'zh', 'sk', 'uk', 'mk', 'us-sweepstakes'];

// TODO: with the addition of this, it's not just translating anymore, it's also rendering: move some stuff to templates
const currency = require('./currency');

const translations = {

    init: function(api, templates) {
        translations.gamePath = api.resources.getPath();
        translations.device = api.options.device;
        translations.templates = templates;
        translations.warn = api.warn;
        translations.jurisdictionName = api.jurisdiction.name();

        let apiLang = api.options.language.toLowerCase();

        // https://github.com/nolimitcity/nolimit-slot-translations/issues/56
        if (apiLang === 'pt-br') {
            apiLang = 'bp';
        }
        // https://github.com/nolimitcity/nolimit-game-api/issues/99
        else if (apiLang === 'hr') {
            apiLang = 'sr';
        }

        translations.language = apiLang;
        // defaulting to 'en' language
        if (availableLanguages.indexOf(apiLang) === -1) {
            translations.warn(`${apiLang} language is not available`);
            translations.language = 'en';
        }
    },

    add: function(data) {
        const language = translations.language;

        if (data[language]) {
            for (let key in data[language]) {
                translationData[key] = data[language][key];
            }
        } else {
            translations.warn('Something wrong in translations.');
        }
    },

    render: function(template, data) {
        template = translations.templates[template] || template;
        if(typeof template === 'string') {
            template = hogan.compile(template);
        }
        data = data || {};

        data.tr = function() {
            return function(text) {
                text = data[text] || text;
                return translations.translate(text);
            };
        };

        data.formatCurrency = function() {
            return function(text) {
                text = data[text] || text;
                return currency.format(text);
            };
        };

        data.language = data.language || translations.language;
        data.gamePath = data.gamePath || translations.gamePath;

        if (availableLanguages.indexOf(data.language) === -1) {
            translations.warn(`${data.language} language is not available`);
            data.language = 'en';
        }

        const jurisdiction = translations.jurisdictionName;
        if(jurisdiction) {
            data.jurisdiction = data.jurisdiction || 'jurisdiction:' + jurisdiction;
            data['jurisdiction:' + jurisdiction] = true;
        }

        if(translations.device === 'desktop') {
            data.desktop = true;
        } else {
            data.mobile = true;
        }

        return template.render(data);
    },

    translate: function(text) {
        const language = translations.language;

        if(translationData[text]) {
            return translationData[text];
        }

        if(language !== 'en') {
            translations.warn(`No translation available for: "${text}" in "${language}"`);
        }

        return text;
    }
};

module.exports = translations;
