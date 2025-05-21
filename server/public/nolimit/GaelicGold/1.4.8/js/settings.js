const settingsSystem = require('@nolimitcity/core/api/settings-system');
const externalApi = require('../external-api');

module.exports = {
    init(namespace, api) {
        const settings = settingsSystem.create(namespace);
        settings.any((name, data) => {
            api.log('Settings:', name, data);
            externalApi.trigger('settings', {name:name, value: data});
        });

        return settings;
    }
};
