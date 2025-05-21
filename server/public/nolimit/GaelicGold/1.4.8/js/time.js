let initialTime;

function padToTwo(num) {
    return ('0' + num).slice(-2);
}

function updateClock() {
    const deltaTime = Date.now() - initialTime;

    const deltaSeconds = Math.floor(deltaTime / 1000);
    const deltaMinutes = Math.floor(deltaSeconds / 60);
    const deltaHours = Math.floor(deltaMinutes / 60);

    const seconds = padToTwo(deltaSeconds % 60);
    const minutes = padToTwo(deltaMinutes % 60);
    const hours = padToTwo(deltaHours);

    const timeData = {
        deltaSeconds,
        deltaMinutes,
        deltaHours,
        seconds,
        minutes,
        hours
    };

    time.api.events.trigger('tick', timeData);
}

const time = {
    init(api) {
        this.api = api;
        api.events.on('init', () => {
            initialTime = api.options.realityCheck.sessionStart || Date.now();
            setInterval(updateClock, 1000);
            updateClock();
        });
    }
};

module.exports = time;
