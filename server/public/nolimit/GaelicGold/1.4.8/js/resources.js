const PREFIX = '/nolimit/';

const ajaxPromises = require('./ext/ajax-promises');

const staticRoot = require('@nolimitcity/core/api/current-script').root;

function getAbsoluteResourcePath(relativePath, prefix) {
    return staticRoot + prefix + relativePath;
}

function getResourceUrl(relativePath, prefix) {
    return getAbsoluteResourcePath(relativePath, prefix);
}

function loadConfig(api) {
    const promise = api.startupPromise('config.json');

    function triggerConfig(config) {
        const device = api.options.device;
        config.device = device;
        config[device] = true;

        config.staticRoot = staticRoot;

        resources.config = config;

        api.events.trigger('config', config);
        promise.fulfill();
    }

    function success(config) {
        triggerConfig(config);
    }

    resources.loadJson('config.json')
        .then(config => success(config))
        .catch(why => promise.break(why));
}

const resources = {
    init(api) {
        loadConfig(api);
    },

    load(relativePath) {
        const absolutePath = getResourceUrl(relativePath, PREFIX);
        return ajaxPromises.get(absolutePath);
    },

    loadJson(relativePath, prefix) {
        if (prefix === undefined) {
            prefix = PREFIX;
        }
        const absolutePath = getResourceUrl(relativePath, prefix);
        return ajaxPromises.get(absolutePath).json();
    },

    getPath(path) {
        return getAbsoluteResourcePath(path || '', PREFIX);
    },

    getStaticRoot() {
        return staticRoot;
    },

    getConfig() {
        return this.config;
    }
};

module.exports = resources;
