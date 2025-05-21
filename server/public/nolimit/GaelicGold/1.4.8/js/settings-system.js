const localStorage = require('../lib/dom/storage').localStorage;
const eventSystem = require('./event-system');

/**
 * Persisted, namespaced settings system for arbitrary javascript objects, built on localStorage with fallbacks.
 */
const settingsSystem = {
    create(namespace) {
        if(!namespace) {
            throw 'Settings must have a namespace';
        }
        namespace = namespace + '.';

        const events = eventSystem.create();

        const localCache = {};

        function getItem(name) {
            const key = namespace + name;
            if (localCache[key]) {
                return localCache[key].value;
            }
            const value = localStorage.getItem(key);
            localCache[key] = {value: value};
            return value;
        }

        function setItem(name, value) {
            const key = namespace + name;
            localCache[key] = {value: value};
            localStorage.setItem(key, value);
        }

        function removeItem(name) {
            const key = namespace + name;
            delete localCache[key];
            localStorage.removeItem(key);
        }

        const settings = {
            default(name, value) {
                if(getItem(name) === null) {
                    setItem(name, JSON.stringify(value));
                }
            },

            get(name, fallback) {
                const item = getItem(name);
                return item !== null ? JSON.parse(item) : fallback;
            },

            set(name, value) {
                if(value === undefined) {
                    setItem(name, null);
                } else {
                    setItem(name, JSON.stringify(value));
                }
                this.trigger(name);
            },

            remove(name) {
                removeItem(name);
            },

            on: events.on,

            any: events.any,

            trigger(name) {
                events.trigger(name, this.get(name));
            },

            destroy:events.destroy

        };

        return settings;
    }
};

module.exports = settingsSystem;
