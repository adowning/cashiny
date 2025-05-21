import { create } from './event-system.js';

const events = create();

events.init = function (api) {
  events.any((name, data) => {
    if (name !== 'tick') {
      if (data !== undefined) {
        api.log('Event:', name, data);
      } else {
        api.log('Event:', name);
      }
    }
    if (name === 'halt') {
      events.shutdown();
    }
  });
};

export default events;
