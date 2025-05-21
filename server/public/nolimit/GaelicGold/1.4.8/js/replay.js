const gameCommunication = require('@nolimitcity/game-communication');
const error = require('./error');

function manageReplayData(api, replayData) {
    function replayNextRound() {
        if(replayData.length > 0) {
            const nextRound = replayData[0];
            if(nextRound.freeBets) {
                api.bet('freeBet', nextRound.freeBets.amount);
            } else {
                if(nextRound.game.actualBetThisSpin) {
                    api.bet(undefined, nextRound.game.actualBetThisSpin, undefined, nextRound.game.wasFeatureBuy);
                }
                else if(nextRound.game && nextRound.game.wasFeatureBuy) {
                    api.bet(undefined, undefined, undefined, nextRound.game.wasFeatureBuy);
                }
                else {
                    api.bet();
                }
            }
        } else {
            if (!api.options.replay.disableEndingPopup) {
                const html = api.translations.render('generic-message', {
                    title: api.translations.translate('Replay completed'),
                    message: api.translations.translate('Replay of a previously played game round is complete.')
                });
                setTimeout(() => {
                    api.dialog.open(html);
                }, 1000);
            }
            api.events.trigger('replayEnd');
        }
    }

    function sendNextEvent() {
        if(replayData.length > 0) {
            gameCommunication.replay(replayData.shift());
        }
    }

    function sendInit() {
        sendNextEvent();
    }

    api.events.on('replayBet', () => {
        setTimeout(sendNextEvent, 300);
    });

    api.events.on('start', () => {
        api.events.on('state', state => state === 'ready' && replayNextRound());
        replayNextRound();
    });

    setTimeout(sendInit, 300);
}

const replay = {
    init(api, replayData) {
        getContainer().classList.add('replay');

        if (replayData.responses) {
            manageReplayData(api, replayData.responses);
        } else {
            api.communication.history.init(replayData.url.replace(/\/gs$/, '/history'), replayData.key);

            api.communication.history.replay(replayData.id, api.development())
                .then(replayData => {
                    manageReplayData(api, replayData);
                })
                .catch(reason => {
                    api.events.trigger('error', {code: error.CODES.REPLAY, error: reason});
                });
        }
    }
};

function getContainer() {
    return document.querySelector('.nolimit.container');
}

module.exports = replay;
