/**
 * storage wrapper with fallback for missing storage or incognito modes where storage exists but throws on write
 */
const window = require('./window');
const cookie = require('js-cookie');
const STORAGE_TEST = 'nolimit.storageTest';

const storage = {};

function storageFactory(storageArea) {
    return {
        cache: {},
        getItem: function(name) {
            return this.cache[name] || null;
        },
        setItem: function(name, value) {
            const stringValue = String(value);
            this.cache[name] = stringValue;
            window.dispatchEvent(new window.Event('storage', {
                key: name,
                oldValue: this.cache[name] || null,
                newValue: stringValue,
                storageArea: storage[storageArea]
            }));
        },
        removeItem: function(name) {
            delete this.cache[name];
        }
    };
}

function handleIncognitoStorage() {
    try {
        window.localStorage.setItem(STORAGE_TEST, STORAGE_TEST);
        if (window.localStorage.getItem(STORAGE_TEST) !== STORAGE_TEST) {
            throw 'Did not store test value';
        }
        window.localStorage.removeItem(STORAGE_TEST);
        storage.localStorage = window.localStorage;
        storage.sessionStorage = window.sessionStorage;
    } catch(ignored) {
        storage.localStorage = storageFactory('localStorage');
        storage.sessionStorage = storageFactory('sessionStorage');
    }

    storage.tempStorage = storageFactory('tempStorage');

    storage.cookieStorage = {
        getItem(name) {
            return cookie.getJSON(name);
        },
        setItem(name, value) {
            cookie.set(name, value);
        },
        removeItem(name) {
            cookie.remove(name);
        }
    };
}

handleIncognitoStorage();

module.exports = storage;
