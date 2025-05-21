const gameJsLoaded = Date.now();

const analytics = {
    init(api) {
        api.events.on('loaded', () => {
            if(api.options.loadStart) {
                const loadTime = gameJsLoaded - api.options.loadStart;
                api.analytics.timing(api.options.game, 'loaded', loadTime);
            }
        });

        api.events.on('init', () => {
            api.analytics.event('init', api.options.operator);
        });

        api.events.on('bet', data => {
            api.analytics.event('bet', data.type, data.bet * 100);
        });

        api.events.on('actionSpinsBet', data => {
            api.analytics.event('bet', data.type, data.bet * 100);
        });

        api.events.on('balance', balance => {
            api.analytics.event('balance', parseFloat(balance) * 100);
        });
    }
};

module.exports = analytics;
