let counter = 0;

// const packageJson = require('../package.json');
const rc4 = require('./rc4.js');
const eventSocket = require('./event-socket.js').default;
const eventSystem = require('./event-system.js');
// const history = require('./history');
// const outcome = require('./outcome');
const history = {};
const outcome = {};
export const communication = eventSystem.create();

// const protocol = packageJson.name + '@' + packageJson.version;
const protocol = 'nolimitcity@1.0.0';
const rememberedData = {};

const INIT_PAYLOAD = {
  type: 'init',
  content: {
    type: 'init',
  },
  protocol,
};

const ORDERED_EVENTS = [
  'currency',
  'betLevels',
  'operatorFreeBetMessages',
  'freeBets',
  'balance',
  'balances',
];

function emitOrderedEvents(response) {
  ORDERED_EVENTS.forEach((name) => {
    if (response[name]) {
      communication.trigger(name, response[name]);
      delete response[name];
    }
  });
}

function emitExtraEvents(response) {
  for (let name in response) {
    communication.trigger(name, response[name]);
  }
}

function emitEvents(response) {
  const game = response.game;
  delete response.game;

  const isInit = response.init === 'ok';
  delete response.init;

  if (response.extPlayerKey) {
    rememberedData.extPlayerKey = response.extPlayerKey;
  }

  if (response.id) {
    communication.trigger('id', response.id);
    delete response.id;
  }

  if (response.error) {
    communication.trigger('error', response.error);
  } else {
    emitOrderedEvents(response);
    emitExtraEvents(response);

    if (game) {
      if (isInit) {
        communication.trigger('init', game);
      } else {
        communication.trigger('game', game);
      }
    }
  }
}

function getXmlHttpRequest(url) {
  const request = new XMLHttpRequest();

  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.setRequestHeader('Accept', 'application/json');

  request.onerror = (e) => communication.trigger('error', e);

  return request;
}

function makeData(options) {
  const game = options.gameServer || options.game;
  const gameCodeString = game + '@' + options.device;
  const data = {
    action: 'open_game',
    clientString: options.operator,
    language: options.language,
    gameCodeString: gameCodeString,
  };

  if (options.extra || options.jsonData) {
    const jsonData = options.extra || options.jsonData;
    data.jsonData = typeof jsonData === 'object' ? JSON.stringify(jsonData) : jsonData;
  }

  if (options.token) {
    data.tokenString = options.token;
  }

  if (options.jurisdiction) {
    data.jurisdiction =
      typeof options.jurisdiction === 'object'
        ? JSON.stringify(options.jurisdiction)
        : options.jurisdiction;
  }

  if (options.playForFunCurrency) {
    data.playForFunCurrency = options.playForFunCurrency;
  }

  return data;
}

function makeUrlData(data) {
  const urlData = [];

  for (let key in data) {
    const value = data[key];
    urlData.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  }
  return urlData.join('&');
}

/**
 * Connect to server using options
 *
 * @param {Object} options
 * @param {String} options.serverHost example: https://partner.nolimitcity.com
 * @param {String} options.operator the operator code
 * @param {String} options.game the game code
 * @param {String} options.device the device, 'desktop' or 'mobile'
 * @param {String} [options.token] the optional token for real money play
 * @param {String} [options.language] optional language code, example: 'en'
 * @param {String} [options.lastBet] last bet made earlier by player, if available
 * @param {String} [options.jurisdiction] set specific jurisdiction when loading game
 * @param {String} [options.extra] arbitrary extra data to be passed on to a specific game
 * @param {String} [options.uuid=<random>] optional UUID that will be attached to each request/response together with an increasing counter
 */
communication.connect = function (options) {
  options.uuid = options.uuid || Math.random().toString(36).substr(2, 10);
  this.options = options;

  const url = options.serverHost + '/EjsFrontWeb/fs';

  const request = getXmlHttpRequest(url);
  const data = makeData(options);

  request.onload = () => {
    const response = JSON.parse(request.responseText);

    if (response.error) {
      communication.trigger('error', response);
    } else if (response.url && response.key) {
      this.trigger('connected', response);

      this.serverUrl = response.url + '?data=' + response.key;
      this.serverKey = response.key;

      const websocketUrl = this.serverUrl
        .replace(/^http/, 'ws')
        .replace('/gs?data=', '/ws/game?data=');
      var history = {};
      history.init(response.url.replace(/\/gs$/, '/history'), response.key);

      this.websocket = eventSocket(websocketUrl);
      this.websocket.on('message', (message) =>
        this.trigger('debug', { 'communication.game': message })
      );
      this.websocket.on('message', (message) => emitEvents(message));
      this.websocket.on('error', (error) => this.trigger('error', error));

      const payload = Object.assign({}, INIT_PAYLOAD);
      payload.id = options.uuid + '-' + counter;
      payload.content.bet = options.lastBet;
      payload.gameClientVersion = options.version;
      payload.data = rememberedData;

      this.trigger('id', payload.id);

      this.websocket.send(rc4.encrypt(this.serverKey, JSON.stringify(payload)));
    } else {
      communication.trigger('error', 'No url and/or key from server: ' + request.responseText);
    }
  };

  this.trigger('debug', { 'communication.open': data });
  request.send(makeUrlData(data));
};

communication.send = function (type, content) {
  counter++;
  const payload = {
    type,
    content,
    protocol,
    data: rememberedData,
    id: this.options.uuid + '-' + counter,
  };

  this.trigger('debug', { 'communication.send': payload });

  this.websocket.send(rc4.encrypt(this.serverKey, JSON.stringify(payload)));
};

/**
 *
 * @param lastBet last bet made by user, if available
 */
communication.balance = function (lastBet, data) {
  const content = {
    type: 'balance',
    bet: lastBet,
  };
  if (data) {
    content.data = data;
  }
  this.send('balance', content);
};

communication.history = history;
communication.outcome = outcome;

/**
 * Emit communication data through the event system as if it came from the server.
 * Note: one 'init' or 'game' at the time as caller will have to maintain timing outside each block.
 *
 * @param replayData {Object} one 'init' or 'game' data object to pass through the system.
 */
communication.replay = emitEvents;

// module.exports = communication;
