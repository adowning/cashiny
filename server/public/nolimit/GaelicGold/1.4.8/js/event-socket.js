const eventSystem = require('@nolimitcity/core/api/event-system');

const TIMEOUT = 10000;

const eventSocket = url => {
    let ws = null;
    let connected = false;
    let createSocketAttempt = 0;
    const dataQueue = [];

    const client = eventSystem.create();

    function drainQueue() {
        try {
            while(dataQueue.length > 0) {
                ws.send(dataQueue[0]);
                dataQueue.shift();
            }
        } catch(e) {
            clearSocket();
            createSocket();
        }
    }

    function clearSocket() {
        if (ws !== null) {
            ws.onopen = () => {
            };
            ws.onerror = () => {
            };
            ws.onclose = () => {
            };
            ws.close();
            //onmessage intentionally left intact in case of message in flight
            ws = null;
        }
    }

    function lzwDecode(input) {
        if (input.startsWith('lzw:')) {
            input = input.substr('lzw:'.length);
        } else {
            return input;
        }
        const dict = {};
        let currChar = input.substr(0, 1);
        let oldPhrase = currChar;
        let code = 256;
        const out = [currChar];
        for (let i = 1; i < input.length; i++) {
            const currentCode = input.charCodeAt(i);
            let phrase;
            if (currentCode < 256) {
                phrase = input.substr(i, 1);
            } else if (dict[currentCode]) {
                phrase = dict[currentCode];
            } else {
                phrase = oldPhrase + currChar;
            }
            out.push(phrase);
            currChar = phrase.substr(0, 1);
            dict[code] = oldPhrase + currChar;
            code++;
            oldPhrase = phrase;
            //console.log(code, out.join('').substr(out.join('').length - 100));
        }
        return out.join('');
    }

    function createSocket() {
        connected = false;
        ws = new WebSocket(url);
        ws.onopen = () => {
            createSocketAttempt = 0;
            drainQueue();
        };
        ws.onerror = e => {
            clearSocket();
            if(!connected) {
                if (createSocketAttempt < 10) {
                    createSocketAttempt++;
                    setTimeout(createSocket, 500);
                } else {
                    let message;
                    if(e.type === 'error' && e.target.url) {
                        message = 'Websocket error at: ' + e.target.url;
                    } else if(e.message) {
                        message = e.message;
                    } else {
                        message = 'Websocket error';
                    }
                    client.trigger('error', {
                        message
                    });
                }
            } else if(dataQueue.length > 0) {
                createSocket();
            }
        };
        ws.onclose = e => {
            clearSocket();
            const normalClose = e.code === 1000;
            if(normalClose) {
                client.trigger('close', e.reason);
            } else if(!connected) {
                client.trigger('error', e);
            }
        };
        ws.onmessage = e => {
            let incoming = e.data;
            if (incoming.startsWith('lzw:')) {
                incoming = lzwDecode(incoming);
            }
            try {
                client.trigger('message', JSON.parse(incoming));
            } catch(e) {
                client.trigger('error', {
                    message: '' + e
                });
            }
            connected = true;
        };
    }

    client.send = data => {
        dataQueue.push(data);
        if (ws !== null && ws.readyState === WebSocket.OPEN) { // Connected
            drainQueue();
        } else if (ws === null || ws.readyState !== WebSocket.CONNECTING) { // Closed or closing
            clearSocket();
            createSocket();
            setTimeout(() => {
                if(dataQueue.length > 0) {
                    client.trigger('debug', 'Timeout after reconnecting at ' + TIMEOUT + 'ms, clearing and trying again');
                    clearSocket();
                    createSocket();
                }
            }, TIMEOUT);
        } else { // Connecting
            setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING && dataQueue.indexOf(data) !== -1) { // Still connecting and data not sent
                    client.trigger('debug', 'Timeout while connecting at ' + TIMEOUT + 'ms, clearing and trying again');
                    clearSocket();
                    createSocket();
                }
            }, TIMEOUT);
        }
    };

    return client;
};

module.exports = eventSocket;
