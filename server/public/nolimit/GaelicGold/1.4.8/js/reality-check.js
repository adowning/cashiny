const featureBet = require('./featureBet');
const currency = require('./currency');

const settings = {
    interval: 60,
    enabled: true
};

const summary = {
    bet: 0,
    bets: 0,
    winnings: 0
};

const realityCheck = {
    init(api) {
        if(api.options.replay) {
            return;
        }

        if (api.options.funMode){
            settings.enabled = false;
        }

        settings.message = api.translations.translate('We want to remind you that you have played for an even time interval, see below for details about your game session');

        onRealityCheck(api.options.realityCheck);
        api.events.on('realityCheck', onRealityCheck);

        // #92
        api.events.once('start', () => {
            settings.message = api.translations.translate(settings.message);
        });

        function onRealityCheck(realityCheck) {
            if(typeof realityCheck.enabled === 'boolean') {
                settings.enabled = realityCheck.enabled;
            }

            if(realityCheck.bets) {
                summary.bets += parseFloat(realityCheck.bets);
            }

            if(realityCheck.winnings) {
                summary.winnings += parseFloat(realityCheck.winnings);
            }

            if(realityCheck.interval && realityCheck.interval !== settings.interval) {
                settings.interval = realityCheck.interval;
                settings.nextTime = Date.now() + minToMs(settings.interval);
            }

            if(realityCheck.sessionStart) {
                settings.sessionStart = realityCheck.sessionStart;
                settings.nextTime = settings.sessionStart + minToMs(settings.interval);
            }

            if(realityCheck.nextTime) {
                settings.nextTime = realityCheck.nextTime;
            }

            if(realityCheck.message) {
                settings.message = realityCheck.message;
            }
        }

        api.events.on('bet', data => {
            if(data.type === 'normalBet') {
                summary.bets += parseFloat(data.bet);
                summary.bet = parseFloat(data.bet);
            }
            if(data.type === 'featureBet') {
                let isPromotional = data.data && data.data.isPromotional;
                let price = isPromotional ? 0 : featureBet.getActualPrice(data);
                if (featureBet.getLockedReelPrice(data) > 0){
                    price = featureBet.getLockedReelPrice(data);
                }
                summary.bets += parseFloat(price);
                summary.bet = parseFloat(price);
            }
        });

        api.events.on('actionSpinsBet', data => {
            if(data.type === 'normalBet') {
                summary.bets += parseFloat(data.bet);
            }
            if(data.type === 'featureBet') {
                summary.bets += parseFloat(featureBet.getActualPrice(data));
            }
        });

        api.events.once('tick', () => {
            settings.sessionStart = settings.sessionStart || Date.now();
            settings.nextTime = settings.nextTime || settings.sessionStart + minToMs(settings.interval);
        });

        let accountHistoryUrl = undefined;
        api.events.on('url', url => {
            if (url.accountHistory) {
                accountHistoryUrl = url.accountHistory;
            }
        });

        api.events.on('tick', time => {
            const standings = {
                bets: currency.formatValue(summary.bets),
                winnings: currency.formatValue(summary.winnings),
                profit: currency.formatValue((summary.winnings - summary.bets)),
                hours: time.hours + ':' + time.minutes.toString().padStart(2, '0'),
                message: settings.message
            };

            if(settings.enabled && Date.now() > settings.nextTime + 5000) {
                settings.nextTime = settings.nextTime + minToMs(settings.interval);

                // #92 -> 1st time it'll actually translate and then later on, it'll not find the translations for already translated text and hence will return as it is.
                standings.message = api.translations.translate(standings.message);

                const html = api.translations.render('responsible-gaming', standings);

                const options = {
                    closeable: false,
                    replace: 'responsible-gaming',
                    ignoreLocks: true
                };

                const popup = api.dialog.open(html, options);

                popup.querySelector('div.end-session a').addEventListener('click', () => {
                    if(api.options.device === 'desktop') {
                        api.dialog.open(api.translations.render('responsible-end-session'));
                        api.events.trigger('halt');
                    } else {
                        api.externalApi.trigger('exit').or(history.back.bind(history));
                    }
                });

                // TODO: show/hide/event handler on any tick is a bit shaky
                const accountHistoryLink = popup.querySelector('div.account-history a');
                if (api.externalApi.isRegistered('accountHistory')) {
                    accountHistoryLink.addEventListener('click', () => {
                        api.externalApi.trigger('accountHistory');
                    });
                    accountHistoryLink.style.display = '';
                } else if (accountHistoryUrl) {
                    accountHistoryLink.addEventListener('click', () => {
                        window.top.location.href = accountHistoryUrl;
                    });
                    accountHistoryLink.style.display = '';
                } else {
                    accountHistoryLink.style.display = 'none';
                }
            }

            const hoursElement = document.getElementById('rc-hours');
            const winningsElement = document.getElementById('rc-winnings');
            const profitElement = document.getElementById('rc-profit');
            const messageElement = document.getElementById('rc-message');

            if(hoursElement) {
                hoursElement.textContent = standings.hours;
            }
            if(winningsElement) {
                winningsElement.textContent = standings.winnings;
            }
            if(profitElement) {
                profitElement.textContent = standings.profit;
            }
            if(messageElement) {
                messageElement.textContent = settings.message;
            }
        });
    },

    getBet() {
        return summary.bet;
    },

    getTotalBets() {
        return summary.bets;
    },

    getTotalWins() {
        return summary.winnings;
    }
};

function minToMs(minutes) {
    return minutes * 60 * 1000;
}

module.exports = realityCheck;
