const isPlainObject = require('is-plain-object');

function eventHandlerFactory() {
  let events = {};
  let any = [];
  let saved = {};
  let paused = false;

  function save(name, data) {
    saved[name] = saved[name] || [];
    saved[name].push(data);
  }

  const eventHandler = {
    on(name, callback) {
      if (typeof callback !== 'function') {
        throw new Error('Callback ' + callback + ' is not a function');
      }
      events[name] = events[name] || [];
      events[name].push(callback);
      if (saved[name]) {
        while (saved[name].length > 0) {
          this.trigger(name, saved[name].pop());
        }
      }
    },

    any(callback) {
      any.push(callback);
    },

    once(name, callback) {
      callback.once = true;
      this.on(name, callback);
    },

    trigger(name, data) {
      if (paused) {
        return;
      }

      any.forEach((callback) => {
        callback(name, clone(data));
      });
      if (events[name]) {
        events[name].forEach((callback) => {
          if (callback.once !== true || callback.called !== true) {
            callback.called = true;
            callback(clone(data));
          }
        });
        events[name] = events[name].filter((callback) => {
          return callback.once !== true;
        });
      } else {
        save(name, data);
      }

      function clone(anything) {
        if (Array.isArray(anything)) {
          return anything.slice(0);
        }
        if (isPlainObject(anything)) {
          return Object.assign({}, anything);
        }
        return anything;
      }
    },

    pause() {
      paused = true;
    },

    resume() {
      paused = false;
    },

    shutdown() {
      this.trigger = function () {};
    },
    destroy() {
      events = null;
      any = null;
      saved = null;
    },
  };

  return eventHandler;
}

const eventSystem = {
  create: eventHandlerFactory,
};

module.exports = eventSystem;
