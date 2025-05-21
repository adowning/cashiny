const OPTION_KEYS = ['game', 'version', 'cdn', 'device', 'operator', 'currency', 'language', 'environment'];
const ANALYTICS_URL = '{CDN}/analytics/analytics.html';
let channel;
let framePromise = undefined;
let connected = false;

function send(hitType, eventData) {
    if (connected) {
        channel.port1.postMessage({hitType, eventData});
    }
}

function filterOptions(options) {
    const filtered = {};
    OPTION_KEYS.forEach(key => {
        if (options[key]) {
            filtered[key] = options[key];
        }
    });
    return filtered;
}

const analytics = {
    init: function (options) {
        if (framePromise === undefined) {
            if (options['googleAnalytics'] === false) {
                framePromise = Promise.resolve();
            } else {
                analytics.options = filterOptions(options);
                framePromise = new Promise((resolve, reject) => {
                    channel = new MessageChannel();
                    const analyticsFrame = document.createElement('iframe');
                    analyticsFrame.setAttribute('frameBorder', '0');
                    analyticsFrame.style.width = '0';
                    analyticsFrame.style.height = '0';
                    analyticsFrame.id = 'nolimit-analytics';

                    analyticsFrame.onload = function () {
                        analyticsFrame.contentWindow.postMessage(JSON.stringify(analytics.options), analytics.options.cdn, [channel.port2]);
                        connected = true;
                        resolve(analyticsFrame);
                    };
                    analyticsFrame.onerror = function (e) {
                        reject(e.message);
                    };

                    analyticsFrame.src = ANALYTICS_URL.replace('{CDN}', analytics.options.cdn).replace('{GAME}', analytics.options.game);
                    document.body.appendChild(analyticsFrame);
                });
            }
        }
        return framePromise;
    },

    // https://developers.google.com/analytics/devguides/collection/analyticsjs/screens
    screenView(screenName) {
        if (connected) {
            send('screenview', {screenName});
        }
    },

    // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    event(event, label, value) {
        if (connected) {
            const eventData = {
                eventCategory: analytics.options.game + '@' + analytics.options.device,
                eventAction: event
            };

            if (label) {
                if (typeof label === 'number') {
                    eventData.eventValue = label;
                } else {
                    eventData.eventLabel = String(label);
                }
            }

            if (value) {
                eventData.eventValue = value;
            }

            send('event', eventData);
        }
    },

    // https://developers.google.com/analytics/devguides/collection/analyticsjs/exceptions
    exception(description, fatal) {
        if (connected) {
            send('exception', {
                'exDescription': description,
                'exFatal': fatal
            });
        }
    },

    // https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings
    timing(timingCategory, timingVar, timingValue, timingLabel) {
        if (connected) {
            const timingData = {
                timingCategory,
                timingVar,
                timingValue
            };

            if (timingLabel) {
                timingData.timingLabel = timingLabel;
            }

            send('timing', timingData);
        }
    }
};

module.exports = analytics;
