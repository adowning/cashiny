// const window = require('../lib/dom/window');
// const storage = require('../lib/dom/storage');
// const events = require('./event-system').create();

const development = function () {
  return window.nolimit.development || false;
};

development.on = events.on;

function updateGlobal() {
  window.nolimit.development =
    JSON.parse(storage.sessionStorage.getItem('nolimit.development')) || false;
  events.trigger('development', window.nolimit.development);
}

if (
  typeof window.nolimit.development === 'boolean' &&
  storage.sessionStorage.getItem('nolimit.development') === null
) {
  storage.sessionStorage.setItem('nolimit.development', window.nolimit.development);
}

window.addEventListener('message', (e) => {
  if ('string' === typeof e.data) {
    const prefix = 'nolimit.development:';
    const index = e.data.indexOf(prefix);
    if (index === 0) {
      const command = e.data.substr(prefix.length);
      if (command === 'true' || 'false') {
        storage.sessionStorage.setItem('nolimit.development', command);
      } else if (command === 'toggle') {
        storage.sessionStorage.setItem('nolimit.development', !development());
      }
      updateGlobal();
    }
  } else {
    console.log('nolimit-development.js got unexpected event', e); // eslint-disable-line no-console
  }
});

window.addEventListener('storage', updateGlobal);
updateGlobal();

module.exports = development;
