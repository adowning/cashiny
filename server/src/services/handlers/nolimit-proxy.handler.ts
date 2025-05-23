import type { BufferSource, ServerWebSocket } from 'bun'
import type { OpenHandlerContext, CloseHandlerContext, WsData } from '@/sockets/types' // Adjust path as per your project

// --- Configuration & Constants ---
const NOLIMIT_FS_URL = 'https://demo.nolimitcity.com/EjsFrontWeb/fs'
const packageInfo = {
  name: 'your-proxy-app', // From your package.json
  version: '1.0.0', // From your package.json
}
const protocol = `${packageInfo.name}@${packageInfo.version}`

interface InitPayloadContent {
  type: string
  bet?: any
}
interface InitPayload {
  id: string
  type: string
  content: InitPayloadContent
  protocol: string
  gameClientVersion?: string
  data?: { extPlayerKey?: string }
}

// --- RC4 Implementation ---
const HEX_CHARACTERS = '0123456789abcdef'
function toHex(byteArray: number[]): string {
  const hex: string[] = []
  byteArray.forEach((b) => {
    hex.push(HEX_CHARACTERS.charAt((b >> 4) & 0xf))
    hex.push(HEX_CHARACTERS.charAt(b & 0xf))
  })
  return hex.join('')
}
function fromHex(str: string): number[] {
  if (typeof str !== 'string') return []
  const byteArray: number[] = []
  for (let i = 0; i < str.length; i += 2) {
    byteArray.push(parseInt(str.substring(i, i + 2), 16))
  }
  return byteArray
}
function rc4Logic(keyByteArray: number[], inputByteArray: number[]): number[] {
  const s: number[] = [],
    outputByteArray: number[] = []
  let i: number, j: number, x: number
  for (i = 0; i < 256; i++) s[i] = i
  for (i = 0, j = 0; i < 256; i++) {
    j = (j + s[i] + keyByteArray[i % keyByteArray.length]) % 256
    x = s[i]
    s[i] = s[j]
    s[j] = x
  }
  for (let y = 0, i = 0, j = 0; y < inputByteArray.length; y++) {
    i = (i + 1) % 256
    j = (j + s[i]) % 256
    x = s[i]
    s[i] = s[j]
    s[j] = x
    outputByteArray.push(inputByteArray[y] ^ s[(s[i] + s[j]) % 256])
  }
  return outputByteArray
}
function stringToByteArray(str: string): number[] {
  const encoded = encodeURIComponent(str)
  const byteArray: number[] = []
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === '%') {
      byteArray.push(parseInt(encoded.substring(i + 1, i + 3), 16))
      i += 2
    } else {
      byteArray.push(encoded.charCodeAt(i))
    }
  }
  return byteArray
}
function byteArrayToString(byteArray: number[]): string {
  let encoded = ''
  for (let i = 0; i < byteArray.length; i++) {
    encoded += '%' + ('0' + byteArray[i].toString(16)).slice(-2)
  }
  try {
    return decodeURIComponent(encoded)
  } catch (e) {
    console.error('Error decoding URI component in byteArrayToString', e)
    // Fallback or re-throw, depending on how you want to handle malformed sequences
    return 'DECODING_ERROR'
  }
}
const rc4Api = {
  encrypt: (key: string, str: string): string =>
    toHex(rc4Logic(stringToByteArray(key), stringToByteArray(str))),
  decrypt: (key: string, hexStr: string): string =>
    byteArrayToString(rc4Logic(stringToByteArray(key), fromHex(hexStr))),
}

// --- LZW Decoding ---
function lzwDecode(input: string): string {
  if (!input.startsWith('lzw:')) return input
  input = input.substring('lzw:'.length)
  const dict: { [key: number]: string } = {}
  let currChar = input.substring(0, 1)
  let oldPhrase = currChar
  let code = 256
  const out = [currChar]
  for (let i = 1; i < input.length; i++) {
    const currentCode = input.charCodeAt(i)
    let phrase: string
    if (currentCode < 256) phrase = input.substring(i, 1)
    else if (dict[currentCode]) phrase = dict[currentCode]
    else phrase = oldPhrase + currChar
    out.push(phrase)
    currChar = phrase.substring(0, 1)
    dict[code++] = oldPhrase + currChar
    oldPhrase = phrase
  }
  return out.join('')
}

// --- App specific WsData extension for NoLimit Proxy ---
// Ensure this is compatible or merged with your global AppWsData in types.ts
export interface NoLimitProxyWsData extends WsData {
  isNoLimitProxy?: boolean
  nolimitSessionKey?: string
  nolimitRemoteWs?: WebSocket
  nolimitMessageCounter?: number
  nolimitRememberedData?: { extPlayerKey?: string }
  // Add gameCodeString, clientString, language if passed during upgrade
  nolimitGameCodeString?: string
  nolimitClientString?: string
  nolimitLanguage?: string
  nolimitToken?: string // For real money play
}

// --- Proxy Handlers ---
export async function nolimitProxyOpenHandler(context: OpenHandlerContext<NoLimitProxyWsData>) {
  const { ws } = context
  const { clientId, userId } = ws.data // clientId is from router, userId from auth
  ws.data.nolimitMessageCounter = 0 // Initialize counter

  console.log(`[NLC Proxy][${clientId}] Connection opened for user ${userId}.`)

  try {
    const gameCodeString = ws.data.nolimitGameCodeString || 'BruteForce%40mobile'
    const clientString = ws.data.nolimitClientString || 'FANPAGE_DEMO'
    const language = ws.data.nolimitLanguage || 'en'
    const token = ws.data.nolimitToken // For real money play

    const fsRequestBodyParams = new URLSearchParams({
      action: 'open_game',
      clientString: clientString,
      language: language,
      gameCodeString: gameCodeString,
    })
    if (token) {
      fsRequestBodyParams.append('tokenString', token)
    }
    const fsRequestBody = fsRequestBodyParams.toString()

    console.log(`[NLC Proxy][${clientId}] Fetching NLC session key. Body: ${fsRequestBody}`)
    const fsResponse = await fetch(NOLIMIT_FS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json',
        Origin: 'https://nolimitcity.com', // Adjust if necessary
        'User-Agent': 'BunProxy/1.0',
      },
      body: fsRequestBody,
    })

    if (!fsResponse.ok) {
      const errorText = await fsResponse.text()
      throw new Error(`NLC FS request failed: ${fsResponse.status} - ${errorText}`)
    }

    const fsData = (await fsResponse.json()) as {
      key: string
      url?: string
      extPlayerKey?: string
      [key: string]: any
    }
    if (!fsData.key) {
      throw new Error('No session key from NLC FS endpoint.')
    }

    ws.data.nolimitSessionKey = fsData.key
    ws.data.nolimitRememberedData = { extPlayerKey: fsData.extPlayerKey }

    const wsUrlPath = fsData.url
      ? fsData.url.replace(/^http(s?):\/\/[^/]+/, '').replace('/gs?data=', '/ws/game?data=')
      : '/EjsGameWeb/ws/game?data='
    const remoteWsDomain = fsData.url
      ? new URL(fsData.url).origin.replace(/^http/, 'ws')
      : 'wss://demo.nolimitcity.com' // Default domain
    const remoteWsUrl = remoteWsDomain + wsUrlPath + ws.data.nolimitSessionKey

    console.log(`[NLC Proxy][${clientId}] Connecting to NLC WebSocket: ${remoteWsUrl}`)
    const remoteWs = new WebSocket(remoteWsUrl)
    ws.data.nolimitRemoteWs = remoteWs

    remoteWs.onopen = () => {
      console.log(`[NLC Proxy][${clientId}] Connected to NLC remote server.`)
      if (!ws.data.nolimitSessionKey || ws.data.nolimitMessageCounter === undefined) return

      ws.data.nolimitMessageCounter++
      const initialPayload: InitPayload = {
        id: `${clientId}-${ws.data.nolimitMessageCounter}`,
        type: 'init',
        content: { type: 'init' /* bet: ws.data.lastBet */ }, // Pass lastBet if available
        protocol,
        data: ws.data.nolimitRememberedData,
        // gameClientVersion: ws.data.gameClientVersion // Pass if available
      }
      try {
        const stringifiedPayload = JSON.stringify(initialPayload)
        console.log(
          `[NLC Proxy][${clientId}] Sending INIT to NLC (plain): ${stringifiedPayload.substring(0, 100)}...`
        )
        const encryptedPayload = rc4Api.encrypt(ws.data.nolimitSessionKey, stringifiedPayload)
        remoteWs.send(encryptedPayload)
        console.log(`[NLC Proxy][${clientId}] Sent INIT to NLC (encrypted).`)
      } catch (e: any) {
        console.error(`[NLC Proxy][${clientId}] Error sending INIT to NLC:`, e.message)
      }
    }

    remoteWs.onmessage = (event: MessageEvent) => {
      if (ws.readyState !== 1 /* OPEN */) return
      const rawMessage = event.data.toString()
      console.log(`[NLC Proxy][${clientId}] From NLC (raw): ${rawMessage.substring(0, 100)}...`)
      if (!ws.data.nolimitSessionKey) return

      try {
        const decrypted = rc4Api.decrypt(ws.data.nolimitSessionKey, rawMessage)
        const lzwDecoded = lzwDecode(decrypted)
        console.log(
          `[NLC Proxy][${clientId}] From NLC (processed for log): ${lzwDecoded.substring(0, 100)}...`
        )

        // Update rememberedData if extPlayerKey is in the response
        try {
          const parsedPayload = JSON.parse(lzwDecoded)
          if (parsedPayload && parsedPayload.extPlayerKey && ws.data.nolimitRememberedData) {
            ws.data.nolimitRememberedData.extPlayerKey = parsedPayload.extPlayerKey
            console.log(
              `[NLC Proxy][${clientId}] Updated NLC extPlayerKey: ${parsedPayload.extPlayerKey}`
            )
          }
        } catch (parseError) {
          /* Not JSON or no extPlayerKey */
          console.log(parseError)
        }
      } catch (e: any) {
        console.error(`[NLC Proxy][${clientId}] Error processing message from NLC:`, e.message)
      }
      ws.send(event.data as string | BufferSource) // Forward original raw message to client
    }

    remoteWs.onclose = (event: CloseEvent) => {
      console.log(
        `[NLC Proxy][${clientId}] NLC remote WS closed. Code: ${event.code}, Reason: ${event.reason}`
      )
      if (ws.readyState === 1 /* OPEN */) {
        ws.close(event.code, event.reason)
      }
    }

    remoteWs.onerror = (event: Event) => {
      // Bun's WebSocket error event is just 'Event', not specific ErrorEvent
      console.error(`[NLC Proxy][${clientId}] NLC remote WS error:`, event)
      if (ws.readyState === 1 /* OPEN */) {
        ws.close(1011, 'NLC remote connection error')
      }
    }
  } catch (error: any) {
    console.error(`[NLC Proxy][${clientId}] Error in open handler:`, error.message, error.stack)
    if (ws.readyState === 1 /* OPEN */) {
      ws.close(1011, 'Proxy setup error')
    }
  }
}

export function nolimitProxyMessageHandler(
  ws: ServerWebSocket<NoLimitProxyWsData>,
  message: string | Buffer
) {
  const {
    clientId,
    nolimitRemoteWs,
    nolimitSessionKey,
    nolimitMessageCounter,
    // nolimitRememberedData,
  } = ws.data
  if (!nolimitRemoteWs || !nolimitSessionKey || nolimitMessageCounter === undefined) {
    console.warn(
      `[NLC Proxy][${clientId}] Received message, but NLC proxy not fully initialized. Ignoring.`
    )
    return
  }

  const rawClientMessage = message.toString()
  console.log(
    `[NLC Proxy][${clientId}] To NLC (raw from client): ${rawClientMessage.substring(0, 100)}...`
  )

  try {
    // Decrypt for logging, assuming client sends RC4 encrypted JSON string
    const decryptedForLog = rc4Api.decrypt(nolimitSessionKey, rawClientMessage)
    console.log(
      `[NLC Proxy][${clientId}] To NLC (decrypted for log): ${decryptedForLog.substring(0, 100)}...`
    )
  } catch (e: any) {
    console.error(`[NLC Proxy][${clientId}] Error decrypting client message for log:`, e.message)
  }

  if (nolimitRemoteWs.readyState === WebSocket.OPEN) {
    // Forward the original raw message (assumed to be already RC4 encrypted by client)
    nolimitRemoteWs.send(message as string | BufferSource)
    console.log(`[NLC Proxy][${clientId}] Forwarded client message to NLC.`)
  } else {
    console.warn(`[NLC Proxy][${clientId}] NLC remote WS not open. Cannot forward client message.`)
  }
}

export function nolimitProxyCloseHandler(context: CloseHandlerContext<NoLimitProxyWsData>) {
  const { ws, code, reason } = context
  const { clientId, nolimitRemoteWs } = ws.data
  console.log(`[NLC Proxy][${clientId}] Client WS closed. Code: ${code}, Reason: ${reason}`)

  if (nolimitRemoteWs && nolimitRemoteWs.readyState === WebSocket.OPEN) {
    console.log(`[NLC Proxy][${clientId}] Closing NLC remote WS.`)
    nolimitRemoteWs.close(code, reason)
  }
  // Clear data
  delete ws.data.nolimitRemoteWs
  delete ws.data.nolimitSessionKey
  delete ws.data.nolimitMessageCounter
  delete ws.data.nolimitRememberedData
}
