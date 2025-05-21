const lastBet = require('./last-bet');

const stored = {
    availableBetLevels: [],
    unavailableBetLevels: [],
};

const betLevelData = {
    /**
     *
     * @param api the game-api
     */
    init(api) {
        this.api = api;

        /**
         * @param {Object} data the BetLevelData object from the server
         * @param {String} data.bet
         * @param {String} data.message
         * @param {String[]} data.availableLevels
         * @param {String[]} data.unAvailableLevels
         */
/*        api.events.on('betLevels', data => this.onBetLevels(api, data));
        api.events.on('bet', data => this.onBet(api, data));
        api.events.on('actionSpinsBet', data => this.onBet(api, data));
        api.events.on('freeBets', data => this.setFreeBetAmount(api, data));
        api.events.on('freeBetsFinished', () => this.finishFreeBets(api));*/
    },

    onBetLevels(api, data) {
        if(lastBet.load() && api.options.replay === undefined){
            const last = lastBet.load();
            if(data.availableBetLevels.includes(last)) {
                data.bet = last;
            }
        }

        Object.assign(stored, data);
        api.events.trigger('currentBet', stored.bet);
    },

    onBet(api, data) {
        if(data.type === 'normalBet'){
            lastBet.save(data.bet);
            api.events.trigger('currentBet', stored.bet);
        }
    },

    setFreeBetAmount(api, data) {
        if(data.previous || data.previous ? data.previous.used <= 0 : data.used <= 0){
            return;
        }

        if(data.amount){
            api.events.trigger('currentBet', data.amount);
        }else{
            api.events.trigger('currentBet', data.previous.amount);
        }
    },

    finishFreeBets(api){
        api.events.trigger('currentBet', stored.bet);
    },

    increase() {
        if(this.isLast()) {
            return;
        }

        const index = stored.availableBetLevels.indexOf(stored.bet) + 1;
        this.setLevel(stored.availableBetLevels[index]);
    },

    decrease() {
        if(this.isFirst()) {
            return;
        }

        const index = stored.availableBetLevels.indexOf(stored.bet) - 1;
        this.setLevel(stored.availableBetLevels[index]);
    },

    getLevel() {
        return stored.bet;
    },

    setLevel(level) {
        if (stored.availableBetLevels.indexOf(level) !== -1) {
            stored.bet = level;
            this.api.events.trigger('currentBet', stored.bet);
            lastBet.save(stored.bet);
        } else {
            this.api.warn('level', level, 'not found in', stored.availableBetLevels);
            let nearestLevel = null;
            let nearestDifference = null;
            stored.availableBetLevels.forEach((available) => {
                const difference = Math.abs(parseFloat(available) - parseFloat(level));
                if (nearestDifference === null || difference < nearestDifference) {
                    nearestDifference = difference;
                    nearestLevel = available;
                }
            });
            if (nearestLevel !== null) {
                this.api.warn('level', nearestLevel, 'was selected as the nearest available one');
                stored.bet = nearestLevel;
                lastBet.save(nearestLevel);
            }
        }
    },

    getAvailableLevels() {
        return stored.availableBetLevels;
    },

    getUnavailableLevels() {
        return stored.unavailableBetLevels;
    },

    isFirst() {
        return stored.availableBetLevels.indexOf(stored.bet) === 0 || stored.availableBetLevels.indexOf(stored.bet) === -1;
    },

    isLast() {
        return stored.availableBetLevels.indexOf(stored.bet) === stored.availableBetLevels.length - 1;
    },

    getMessage() {
        return stored.message;
    },

    setMessage(message) {
        stored.message = message;
    },

    clearMessage() {
        delete stored.message;
    },

    isBroke() {
        return stored.availableBetLevels.length === 0;
    }
};

module.exports = betLevelData;
