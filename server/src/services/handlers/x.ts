// import type { Request, Response } from 'express';

const url = 'https://casino.nolimitcity.com/EjsFrontWeb/fs';
const headers = new Headers({
  authority: 'casino.nolimitcity.com',
  accept: 'application/json',
  'accept-language': 'en-ZA,en;q=0.9',
  'cache-control': 'no-cache',
  'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  origin: 'https://casino.nolimitcdn.com',
  pragma: 'no-cache',
  'sec-ch-ua-mobile': '?0',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
  'user-agent':
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
});

export default async function handler() {
  // const data = (req as Request).body;

  const _response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      action: 'open_game',
      clientString: 'FANPAGE_DEMO',
      language: 'en',
      gameCodeString: 'BruteForce%40desktop',
    }),
  });

  // if (!_response.ok) {
  //   console.log(await _response.json());
  //   throw new Error(`HTTP error! status: ${_response.status}`);
  // }

  const responseData = await _response.text();
  // res.send(responseData);

  // console.error('Error proxying request:', error)
  // if (error instanceof Error && error.message.includes('HTTP error')) {
  //   // const status = parseInt(error.message.split('status: ')[1]);
  //   const errorData = await response.text();
  //   res.status(status).send(errorData);
  //   // } else {
  //   //   res.status(500).send('Error proxying request');
  //   // }
  // }
  // const ws = new WebSocket(`wss://casino.nolimitcity.com/EjsFrontWeb/ws`);
  // Creates a new WebSocket connection to the specified URL.
  const d = {
    url: 'https://demo.nolimitcity.com/EjsGameWeb/gs',
    key: '38a5236d026377c0951d73c729945b192f13b64abd54c23c511ec7722933b92f9103cee17f0aeee6f9eb6bcd20a62ecfdd425766a33da37e9f349ba71c5ff4a25cfb9b0b164f96a00cfe262a6e7bc1d3bcddc6458571ee86f8bc12df026a24a16b8aa6fd49d6a42896664706d42a03db4b3a1327d1e6a16423fc7c2ce0a092fc0a78fb1ca280a2dbebd1ca043ba7658f9da8482af894db16cb9d9042f5d36dba495e3fdd13b8aab5e6556d2f0f8ce353b4b24d5445fe60935051adf7c44e13460ccbd759b4cf7ea58111e56bebf056c096842dc6b287aaf1e47d98639c10884dc823841ecd8745496a59069cafcd9246e7bf3cd4f3ac44afdebca96da0e45d46c25ab61d5cef5dee8fdbd14e10c900d0f51d343ca0766db334d009df7af952fd984d72b57ae086ceb10f6d280782dbf03380a25d258f999d7d5037fd77b793d69357a546788048193452429d78c0309ed327409b1c6797745bd1cb6b28906f22b1e64cf59c45ad2afbdc56426de2',
  };
  const socket = new WebSocket('ws://casino.nolimitcity.com/EjsFrontWeb/ws/game?data=', d.key);
  // Executes when the connection is successfully established.
  socket.addEventListener('open', (event) => {
    console.log('WebSocket connection established!');
    // Sends a message to the WebSocket server.
    socket.send('Hello Server!');
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
}
handler();
