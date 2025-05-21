let currentMode;
let defaultMode;

const gameMode = {
    init(api, initialMode = 'main') {
        this.api = api;
        defaultMode = initialMode;
        this.clear();
    },

    is(...mode) {
        return mode.includes(currentMode);
    },

    isNot(...mode) {
        return !this.is(...mode);
    },

    get() {
        return currentMode;
    },

    set(mode) {
        currentMode = mode;
        this.api.events.trigger('gameMode', mode);
    },

    clear() {
        this.set(defaultMode);
    },

    clearIf(mode) {
        if(this.is(mode)) {
            this.clear();
        }
    },

    isDefault() {
        return currentMode === defaultMode;
    }
};

module.exports = gameMode;
