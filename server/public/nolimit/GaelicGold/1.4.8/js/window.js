/**
 * window fallback ensuring a minimal set of functionality and reliability for other parts of this project + testing
 */
const eventSystem = require('../../api/event-system');

function windowFactory() {
    const events = eventSystem.create();

    const mockWindow = {
        addEventListener(type, listener) {
            events.on(type, listener);
        },
        dispatchEvent(event) {
            events.trigger(event.type, event);
        },
        Event: class {
            constructor(type, data) {
                this.type = type;
                this.data = data;
            }
        },
        nolimit: {}
    };
    return mockWindow;
}

module.exports = typeof window === 'object' ? window : windowFactory();
