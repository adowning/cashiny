const communication = require('./communication');
const channel = new MessageChannel();

// events registered by nolimit.js
const registeredEvents = {};

function connect() {
    window.postMessage(JSON.stringify({method: 'connect'}), '*', [channel.port2]);
}

let busy = false;
let paused = false;
let wantsPause = false;
let started = false;

const externalApi = {
    init(api) {
        channel.port1.onmessage = e => {
            const message = e.data;

            if(message.method === 'register') {
                api.log('external-api register', message);
                for(let i = 0; i < message.params.length; i++) {
                    const param = message.params[i];
                    registeredEvents[param] = true;
                }
            }

            else if(started) {
                api.log('external-api', message.method);

                if(message.method === 'refresh') {
                    communication.refreshBalance();
                }

                if(message.method === 'reload') {
                    location.reload();
                }

                if(message.method === 'send') {
                    communication.send(message.params[0], message.params[1]);
                }

                if(message.method === 'hold') {
                    hold();
                }

                if(message.method === 'pause') {
                    pause();
                }

                if(message.method === 'resume') {
                    resume();
                }

                if(message.method === 'fastspin') {
                    api.settings.set('fastspin', message.data);
                }

                if(message.method === 'mute') {
                    api.settings.set('music', false);
                    api.settings.set('sfx', false);
                }

                if(message.method === 'unmute') {
                    api.settings.set('music', true);
                    api.settings.set('sfx', true);
                }
            }

            if(message.method === 'events.trigger') {
                if(Array.isArray(message.params)) {
                    api.events.trigger(...message.params);
                }
                if(typeof message.params === 'string') {
                    api.events.trigger(message.params);
                }
            }
            if(message.method === 'events.on') {
                api.events.on(message.params[0], message.params[1]);
            }

        };

        api.events.on('ready', () => {
            externalApi.trigger('intro');
        });

        api.events.on('start', () => {
            externalApi.trigger('ready');
            started = true;

            if (!busy){
                externalApi.trigger('idle');
            }

            api.events.on('pause', () => {
                externalApi.trigger('pause');
            });

            api.events.on('resume', () => {
                externalApi.trigger('resume');
            });
        });

        api.events.on('busy', () => {
            if(!busy) {
                busy = true;
                externalApi.trigger('busy');
            }
        });

        api.events.on('idle', () => {
            if(busy) {
                busy = false;
                if(wantsPause) {
                    triggerPause();
                }
                //https://github.com/nolimitcity/nolimit-slot-launcher/issues/518
                //Triggers "idle" externally even though we are paused. This is used as a signal externally to be able to pause the game and for example show custom external dialogs etc.
                externalApi.trigger('idle');
            }
        });

        api.events.any((name, data) => {
            if(name !== 'tick') {
                externalApi.trigger('external', {name, data});
            }
        });

        api.settings.on('sfx', (value)=> {
            const master = api.settings.get('masterSoundEnabled', false);
            if (master === true){
                const music = api.settings.get('music', false);
                if (value === false && music === false) {
                    api.settings.set('masterSoundEnabled', false);
                }
            } else {
                if (value === true) {
                    api.settings.set('masterSoundEnabled', true);
                }
            }
        });

        api.settings.on('music', (value)=> {
            const master = api.settings.get('masterSoundEnabled', false);
            if (master === true){
                const sfx = api.settings.get('sfx', false);
                if (value === false && sfx === false) {
                    api.settings.set('masterSoundEnabled', false);
                }
            } else {
                if (value === true) {
                    api.settings.set('masterSoundEnabled', true);
                }
            }
        });

        api.settings.set('masterSoundEnabled', false);

        connect();

        function triggerPause() {
            wantsPause = false;
            paused = true;
            api.events.trigger('pause');
            api.events.pause();
        }

        function hold() {
            paused = true;
            api.events.trigger('hold');
            api.events.pause();
        }

        function pause() {
            wantsPause = true;
            if(!busy) {
                triggerPause();
            }
        }

        function resume() {
            if(paused) {
                paused = false;
                api.events.resume();
                api.events.trigger('resume');
                externalApi.trigger('idle');
            } else {
                //If resumed before pause is triggered, we cancel the "request" for pause.
                wantsPause = false;
            }
        }
    },

    // find out if supposed to show registration button etc
    isRegistered(method) {
        return registeredEvents[method] !== undefined;
    },

    // event to nolimit.js
    trigger(method, params) {
        const continuation = {};

        if(registeredEvents[method]) {
            continuation.or = () => {
            };
        } else {
            continuation.or = callback => callback();
        }

        const message = {
            method: method
        };

        if(params) {
            message.params = params;
        }

        try {
            channel.port1.postMessage(message);
        } catch(e) {
            // eslint-disable-next-line no-console
            console.warn('External API communications problem:', e);
        }

        return continuation;
    }
};

module.exports = externalApi;
