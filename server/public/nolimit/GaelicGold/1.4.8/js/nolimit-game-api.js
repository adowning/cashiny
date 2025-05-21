/* eslint-disable no-console */
window.nolimit = window.nolimit || {};
window.nolimit.api = window.nolimit.api || {};

const version = require('../package.json').version;

const analytics = require('@nolimitcity/google-analytics');
const analyticsIntegration = require('./analytics-integration');
const balance = require('./balance');
const betHandler = require('./bet-handler');
const betLevelData = require('./bet-level-data');
const communication = require('./communication');
const css = require('./css/css');
const currency = require('./currency');
const development = require('@nolimitcity/core/api/nolimit-development');
const dialog = require('./dialog');
const events = require('./nolimit-core-wrapper/events');
const error = require('./error');
const externalApi = require('./external-api');
const gameArea = require('./game-area');
const jurisdiction = require('./jurisdiction');
const lastBet = require('./last-bet');
const loaderInteraction = require('./loader-interaction');
const maxWinCap = require('./max-win-cap');
const messages = require('./messages');
const options = require('./options');
const overlay = require('./overlay');
const realityCheck = require('./reality-check');
const resize = require('./resize');
const resources = require('./resources');
const gameMode = require('./game-mode');
const settings = require('./nolimit-core-wrapper/settings');
const templates = require('../templates');
const time = require('./time');
const translations = require('./translations');
const visibilityDetector = require('./visibility-detector');
const featureBet = require('./featureBet');

window.nolimit.api.events = events;
window.nolimit.api.error = error;
window.nolimit.api.transltions = translations;

const startupPromises = [];

const promises = {};

function initSubSystems(api) {
    error.init(api);
    jurisdiction.init(api);
    currency.init(api);
    featureBet.init(api);
    balance.init(api);
    lastBet.init(api);
    betLevelData.init(api);
    css.init(api);
    resources.init(api);
    overlay.init(api);
    resize.init(api);
    messages.init(api);
    dialog.init(api);
    externalApi.init(api);
    loaderInteraction.init(api);
    time.init(api);
    visibilityDetector.init(api);
    realityCheck.init(api);
    maxWinCap.init(api);
    gameMode.init(api);
}

const gameApi = {
    /**
     * Initialize the gameApi
     */
    init() {
        this.options = window.nolimit.options = options.get(window.nolimit.options);
        this.settings = settings.init(this.options.operator + '.' + this.options.game, this);

        window.nolimit.api.settings = this.settings;

        events.init(this);
        events.trigger('loading');

        window.focus();
        window.addEventListener('beforeunload', function() {
            events.trigger('halt');
        });

        analytics.init(this.options);
        analyticsIntegration.init(this);

        console.log(this.options.game, this.options.version);
        this.log('User-Agent:', navigator.userAgent);
        this.log('@nolimitcity/game-api', version);

        document.documentElement.setAttribute('data-agent', navigator.userAgent);
        document.documentElement.setAttribute('data-device', this.options.device);

        translations.init(this, templates);

        const container = translations.render('container', {
            game: this.options.game
                .replace(/DX[0-9]$/, '')
                .replace(/([A-Z][a-z])/g,' $1')
                .replace('Kitchen Drama', 'Kitchen Drama:')
                .replace('Mayan Magic', 'Mayan Magic Wildfire')
                .replace('Ture', 'Turstugan')
                .replace('Harlequin', 'Harlequin Carnival')
                .replace('Deadwood', 'Deadwood xNudge')
                .replace('Monkeys Gold', 'Monkey\'s Gold')
                .replace('Warrior Graveyard', 'Warrior Graveyard xNudge')
                .replace('East Vs West', 'East Coast Vs West Coast')
                .replace('San Quentin', 'San Quentin xWays')
                .replace('Fire In The Hole', 'Fire In The Hole xBomb')
                .replace('Infectious5', 'Infectious5 xWays')
        });
        document.body.firstElementChild.insertAdjacentHTML('beforebegin', container);

        events.on('loaded', () => {
            document.querySelector('.nolimit.container').classList.remove('loading');
        });

        events.on('start', () => {
            if(this.options.replay) {
                document.querySelector('.nolimit > .replay').style.display = 'block';
            } else if(this.options.funMode) {
                // #91
                const fun = document.querySelector('.fun');
                fun.innerHTML = translations.translate(fun.innerHTML);
                fun.style.display = 'block';
            }

            if(this.options.version && this.options.version.startsWith('0.')) {
                const beta = document.createElement('div');
                beta.classList.add('beta');
                beta.textContent = 'BETA';
                document.querySelector('.nolimit').appendChild(beta);
            }

            analytics.screenView('main');
        });

        initSubSystems(this);

        promises.ready = this.startupPromise('ready');

        communication.init(this);
    },

    loaded() {
        events.trigger('resize', gameArea.getGameSize());
        events.trigger('loaded');
    },

    ready() {
        promises.ready.fulfill();
    },

    start() {
        events.trigger('start');
    },

    bet: betHandler.bet,
    zeroBet: betHandler.zeroBet,
    pickAndClickBet: betHandler.pickAndClickBet,
    buyFeatureBet: betHandler.buyFeatureBet,

    balance,
    realityCheck,
    currency,
    betLevel: betLevelData,
    events,
    css,
    dialog,
    translations,
    resources,
    development,
    resize,

    getGameElement: gameArea.getGameElement,
    getGameSize: gameArea.getGameSize,

    startupPromise(what) {
        if(!what) {
            throw 'What is thy promise?';
        }

        startupPromises.push(what);
        gameApi.log('startupPromise given', what);

        return {
            fulfill() {
                const index = startupPromises.indexOf(what);
                if(index !== -1) {
                    startupPromises.splice(index, 1);
                    gameApi.log('startupPromise fulfilled:', what, '- remaining:', startupPromises);
                    if(startupPromises.length === 0) {
                        resize.trigger();
                        gameApi.events.trigger('ready');
                    }
                } else {
                    gameApi.warn('Unknown promise', what, 'trying to fulfill');
                }
                this.fulfill = this.break = function() {
                };
            },
            break(reason) {
                console.error('Promise', what, 'failed:', reason);
                console.error('Remaining promises:', startupPromises);
                gameApi.error.trigger('Promise failure', error.CODES.PROMISE);
                gameApi.events.trigger('halt');
            }
        };
    },

    log() {
        if(development()) {
            console.log.apply(console, arguments);
        }
    },

    warn() {
        if(development()) {
            console.warn.apply(console, arguments);
        }
    },

    externalApi,
    error,
    gameArea,
    analytics,
    communication,
    jurisdiction,
    gameMode
};

module.exports = gameApi;
