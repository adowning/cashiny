import { JoinRoom, NewMessage, SendMessage, UserJoined } from '@/sockets/schema';
import { MessageHandlerContext, OpenHandlerContext, WsData } from '@/sockets/types';
import { publish } from '@/utils';
import { ClientOptionDef } from '@prisma/client/runtime/library';
import { uuid } from 'short-uuid';
import { communication } from './nolimit/communication.js';
const packageJson = require('../../../package.json');

const protocol = packageJson.name + '@' + packageJson.version;
const INIT_PAYLOAD = {
  type: 'init',
  content: {
    type: 'init',
  },
  protocol,
};

function lzwDecode(input) {
  if (input.startsWith('lzw:')) {
    input = input.substr('lzw:'.length);
  } else {
    return input;
  }
  const dict = {};
  let currChar = input.substr(0, 1);
  let oldPhrase = currChar;
  let code = 256;
  const out = [currChar];
  for (let i = 1; i < input.length; i++) {
    const currentCode = input.charCodeAt(i);
    let phrase;
    if (currentCode < 256) {
      phrase = input.substr(i, 1);
    } else if (dict[currentCode]) {
      phrase = dict[currentCode];
    } else {
      phrase = oldPhrase + currChar;
    }
    out.push(phrase);
    currChar = phrase.substr(0, 1);
    dict[code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
    //console.log(code, out.join('').substr(out.join('').length - 100));
  }
  return out.join('');
}

class NolimitProxyHandler {
  static clients = new Map();
}
// Handler for JOIN_ROOM
export async function handleOpenProxy(context: OpenHandlerContext) {
  // const url = 'https://demo.nolimitcity.com/EjsFrontWeb/fs';
  // const headers = new Headers({
  //   authority: 'casino.nolimitcity.com',
  //   accept: 'application/json',
  //   host: 'demo.nolimitcity.com',
  //   origin: 'https://nolimitcity.com',
  //   'accept-language': 'en-ZA,en;q=0.9',
  //   'cache-control': 'no-cache',
  //   'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  //   // origin: 'https://casino.nolimitcdn.com',
  //   pragma: 'no-cache',
  //   'sec-ch-ua-mobile': '?0',
  //   'sec-fetch-dest': 'empty',
  //   'sec-fetch-mode': 'cors',
  //   'sec-fetch-site': 'cross-site',
  //   'user-agent':
  //     'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36',
  // });
  // const resp = await fetch(url, {
  //   method: 'POST',
  //   headers: headers,
  //   body: JSON.stringify({
  //     action: 'open_game',
  //     clientString: 'FANPAGE_DEMO',
  //     language: 'en',
  //     gameCodeString: 'BruteForce%40mobile',
  //   }),
  // });
  const data = context.ws.data;
  console.log('xxxxx here xxxxx');
  console.log(data);
  const resp = await fetch('https://demo.nolimitcity.com/EjsFrontWeb/fs', {
    headers: {
      accept: 'application/json',
      'accept-language': 'en-US,en;q=0.9,es;q=0.8,pt;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      pragma: 'no-cache',
      priority: 'u=1, i',
      'sec-ch-ua': '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: 'action=open_game&clientString=FANPAGE_DEMO&language=en&gameCodeString=BruteForce%40mobile',
    method: 'POST',
  });
  console.log(resp);
  const body = (await resp.json()) as { key: string; [key: string]: any };
  const url = body.key;
  const key = body.key;

  const { ws } = context;
  // const proxyClient = new WebSocket('wss://nolimit');
  const socket = new WebSocket('ws://demo.nolimitcity.com/EjsGameWeb/ws/game?data=', data.key);

  // Executes when the connection is successfully established.
  socket.addEventListener('open', (event) => {
    console.log('WebSocket connection established!');
    // Sends a message to the WebSocket server.
    // socket.send('Hello Server!');
  });
  // Listen for messages and executes when a message is received from the server.
  socket.addEventListener('message', (event) => {
    console.log('Message from server: ', event.data);
  });
  // Executes when the connection is closed, providing the close code and reason.
  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed:', event.code, event.reason);
  });
  // Executes if an error occurs during the WebSocket communication.
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
  NolimitProxyHandler.clients.set(ws.data.clientId, { client: ws, socket });
  const clientId = ws.data.clientId;
  // const clientUrl = `wss://demo.nolimitcity.com/EjsGameWeb/ws/game?data=38a5236d026377c0951d73c72994054a2c4ee21abf03c232551c90722960b22e9100ceb1730abaeaa5eb3ac825ad7895df105766a33da37e9f349ba71c5ff4a25cfb9b0b164f96a00cfe262a6e7bc1d3bcddc6458571ee86f8bc12df026a24a16b8aa6fd49d6a42896664706d42a03db4b3a1327d1e6a16423fc7c2ce0a092fc0a78fb1ca280a2dbebd1ca043ba7658f9da8482af894db16cb9d9042f7d36fba4c043dd841bda3b5b6553a280e8be353eab2410842a463930a0dacf79f4e1c460f97d259b4cf7ea58111e56bebf056c096842dc6b287aaf1e47d98639c10884dc823841ecd8745496a59069cafcd9246e7bf3cd4f3ac44afdebca96da0e45d46c25ab61d5cef5dee8fdbd14e10c900d0f51d343ca0766db334d009df7af952fd984d72b57ae086ceb10f6f2a04d480a93c8cf30d2283cece7e0133f276e293d69357a546788048193452429d78c0309ed327409b1c6797745bd1cb6b28906f22b1e64cf59c45ad2afbdc56426de2`;
  // // const clientUrl = useSubdomains
  // //   ? `${new URL(baseUrl).protocol}//${clientId}.${new URL(baseUrl).host}`
  // //   : `${baseUrl}/${clientId}`;
  // proxyClient.on
  // ws.send(JSON.stringify({ type: 'id', clientId, key }));
  const protocol = packageJson.name + '@' + packageJson.version;
  const INIT_PAYLOAD = {
    type: 'init',
    content: {
      type: 'init',
    },
    protocol,
  };
  // const response = JSON.parse(data.toString());
  const response = data;

  if (response.error) {
    communication.trigger('error', response);
  } else if (response.url && response.key) {
    // trigger('connected', response);

    // serverUrl = response.url + '?data=' + response.key;
    // serverKey = response.key;

    // const websocketUrl = serverUrl.replace(/^http/, 'ws').replace('/gs?data=', '/ws/game?data=');

    // history.init(response.url.replace(/\/gs$/, '/history'), response.key);

    let websocket: any = eventSocket(websocketUrl);
    websocket.on('message', (message) => trigger('debug', { 'communication.game': message }));
    websocket.on('message', (message) => emitEvents(message));
    websocket.on('error', (error) => trigger('error', error));

    const payload = Object.assign({}, INIT_PAYLOAD);
    payload.id = options.uuid + '-' + counter;
    payload.content.bet = options.lastBet;
    payload.gameClientVersion = options.version;
    payload.data = rememberedData;

    // trigger('id', payload.id);

    // websocket.send(rc4.encrypt(serverKey, JSON.stringify(payload)));
  } else {
    // communication.trigger('error', 'No url and/or key from server: ' + request.responseText);
  }
  ws.data.pendingRequests = new Map();
}

// Handler for SEND_MESSAGE
export function handleSendMessage(context: MessageHandlerContext<typeof NolimitSendMessage>) {
  const { ws, payload, server } = context; // Get server from context
  let { roomId, text } = payload;
  const userId = ws.data.userId;

  if (!userId || !server) {
    // Check server existence
    console.warn('[WS SEND_MESSAGE] Missing userId or server instance.');
    return;
  }
  if (text.startsWith('lzw:')) {
    text = lzwDecode(text);
  }
  try {
    ws.trigger('message', JSON.parse(text));
  } catch (e) {
    ws.trigger('error', {
      message: '' + e,
    });
  }

  //  ws.onmessage = e => {
  // let incoming = e.data;

  // connected = true;
  // };
  console.log(`[WS] Message from ${userId} in room ${roomId}: ${text}`);
  publish(ws, server, roomId, NewMessage, {
    // Pass server to publish
    roomId,
    userId,
    text,
    timestamp: Date.now(),
  });
}

// Add other chat-related handlers here (e.g., handleLeaveRoom, handleRoomList)
