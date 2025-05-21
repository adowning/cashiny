const insufficientFunds = require('./insufficient-funds');

// Note: since we are linking this into gameApi, 'this' is actually api in here
const betHandler = {

    bet(type = 'normalBet', betLevel = this.betLevel.getLevel(), playerInteraction = {}, replayAndFeatureBuy = false) {
        const balance = this.balance.getAmount();

        if(type === 'normalBet' && parseFloat(betLevel) > balance && !this.options.replay) {
            insufficientFunds.show(this);
        } else {
            // FIXME: this is turning into a huge mess

            const isPickAndClickBet = type === 'pickAndClickBet';
            const blockBetSend = playerInteraction.blockBetSend && isPickAndClickBet;
            delete playerInteraction.blockBetSend;

            const bet = {
                type: isPickAndClickBet ? 'zeroBet' : type,
                bet: betLevel,
                playerInteraction: playerInteraction,
                replayAndFeatureBuy: replayAndFeatureBuy
            };

            if(!blockBetSend) {
                this.events.trigger('bet', bet);
            }

            this.communication.send('normal', bet);
        }
    },

    zeroBet(playerInteraction = {}) {
        this.bet('zeroBet', 0.00, playerInteraction);
    },

    pickAndClickBet(selectionIndex, blockBetSend = true) {
        const selectedIndex = selectionIndex.toString();
        this.bet('pickAndClickBet', 0.00, {selectedIndex, blockBetSend});
    },

    buyFeatureBet(featureName) {
        const bet = {
            type: 'featureBet',
            bet: this.betLevel.getLevel(),
            featureName: featureName
        };

        this.events.trigger('bet', bet);
        this.communication.send('normal', bet);
    }
};

module.exports = betHandler;
