const eventSocket = require('./event-socket');

const outcome = {
    /**
     *
     * @param options - api.options from slot-api
     */
    connect(options) {
        const url = options.demo;
        const client = eventSocket(url);

        client.addFlag = (flag) => {
            send({
                action: 'add-flag',
                flag
            });
        };

        client.addReels = reels => {
            send({
                action: 'add-reels',
                reels
            });
        };

        client.clear = () => {
            send({action: 'clear'});
        };

        function send(data) {
            client.send(JSON.stringify(data));
        }

        return client;
    }
};

module.exports = outcome;
