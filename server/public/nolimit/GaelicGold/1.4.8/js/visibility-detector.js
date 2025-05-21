const visibilityDetector = {
    init(api) {
        document.addEventListener('visibilitychange', () => {
            api.events.trigger('hidden', document.hidden);
        });
    }
};

module.exports = visibilityDetector;
