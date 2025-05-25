import type { BufferSource, ServerWebSocket } from 'bun'
import type { OpenHandlerContext, CloseHandlerContext, WsData } from '@/sockets/types' // Adjust path as per your project

// --- Configuration & Constants ---
const KAGAMING_WD_DOMAIN = 'wss://pml.kaga88.com'
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

// --- App specific WsData extension for KaGaming Proxy ---
// Ensure this is compatible or merged with your global AppWsData in types.ts
export interface KaGamingProxyWsData extends WsData {
  isKaGamingProxy?: boolean
  kagamingSessionKey?: string
  kagamingRemoteWs?: WebSocket
  kagamingMessageCounter?: number
  kagamingRememberedData?: { extPlayerKey?: string }
  // Add gameCodeString, clientString, language if passed during upgrade
  kagamingGameCodeString?: string
  kagamingClientString?: string
  kagamingLanguage?: string
  kagamingToken?: string // For real money play
}
// --- Proxy Handlers ---
export async function kagamingProxyOpenHandler(context: OpenHandlerContext<KaGamingProxyWsData>) {
  const { ws } = context
  const { clientId, userId, isKaGamingProxy } = ws.data // clientId is from router, userId from auth
  if (isKaGamingProxy == false) return

  ws.data.kagamingMessageCounter = 0 // Initialize counter

  console.log(`[KA Proxy][${clientId}] Connection opened for user ${userId}.`)

  try {
    // const gameCodeString = ws.data.kagamingGameCodeString || 'BruteForce%40mobile'
    // const clientString = ws.data.kagamingClientString || 'FANPAGE_DEMO'
    // const language = ws.data.kagamingLanguage || 'en'
    const token = ws.data.kagamingToken // For real money play
    // wss://pmltest.kaga88.com/kaga/fish/GangsterOverlord?vds=eyJkdCI6IkNocm9tZSIsImR2IjoiMTM2LjAuMC4wIiwiYXYiOiIxLjAuMjMxICgxNzIwKSIsImlkYSI6IjcxYzRmM2E1OTFhNDhlMWFmMWU0NDI5ODkyODBhMmFkY2FjNDYzNGMxMjE3NDQxYTUyYzcyYzZhMzljOGI0NTgxNzQ4MTQzMTcxMDQ0IiwiaWR2IjoiZTE5NGU0MDYxNThlYzdiNmQ2NzQ3Nzk3ZDUwN2E3OTU2YzA0OTFiNjEzNDlmODk4MTA0MTc3MjYyM2MwODcwMCIsImxnIjoiZW4iLCJkbyI6IkxpbnV4IiwiYXMiOiIiLCJhayI6ImFjY2Vzc0tleSJ9&ak=accessKey

    //     const fsRequestBodyParams = new URLSearchParams({
    //       action: 'open_game',
    //       clientString: clientString,
    //       language: language,
    //       gameCodeString: gameCodeString,
    //     })
    //     if (token) {
    //       fsRequestBodyParams.append('tokenString', token)
    //     }
    //     const fsRequestBody = fsRequestBodyParams.toString()

    //     console.log(`[KA Proxy][${clientId}] Fetching KA session key. Body: ${fsRequestBody}`)
    //     const fsResponse = await fetch(KAGAMING_FS_URL, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    //         Accept: 'application/json',
    //         Origin: 'https://kagamingcity.com', // Adjust if necessary
    //         'User-Agent': 'BunProxy/1.0',
    //       },
    //       body: fsRequestBody,
    //     })

    //     if (!fsResponse.ok) {
    //       const errorText = await fsResponse.text()
    //       throw new Error(`KA FS request failed: ${fsResponse.status} - ${errorText}`)
    //     }

    //     const fsData = (await fsResponse.json()) as {
    //       key: string
    //       url?: string
    //       extPlayerKey?: string
    //       [key: string]: any
    //     }
    //     if (!fsData.key) {
    //       throw new Error('No session key from KA FS endpoint.')
    //     }

    // ws.data.kagamingSessionKey = fsData.key
    // ws.data.kagamingRememberedData = { extPlayerKey: fsData.extPlayerKey }

    const remoteWsUrl =
      KAGAMING_WD_DOMAIN +
      '/kaga/fish/' +
      ws.data.kagamingGameCodeString +
      '?vds=' +
      ws.data.kagamingToken +
      '&ak=accessKey' //ws.data.kagamingSessionKey
    // https://games.kaga88.com/?g=GangsterOverlord&p=demo&u=875802063&t=1238&ak=accessKey&cr=USD&loc=en
    //
    //wss://pml.kaga88.com/kaga/fish/GangsterOverlord?vds=eyJkdCI6IkNocm9tZSIsImR2IjoiMTM2LjAuMC4wIiwiYXYiOiIxLjAuMjMxICgxNzIwKSIsImlkYSI6ImNiZmMxZmIxMmY4YzJlMTUzMmM0MjlkYzM0ZDdjNDRiOWI0NjAwNjNkZWQzYjA3NDBmNDc5OWRiYzZmYjM1YjUxNzQ4MTQ1MjU2MDUyIiwiaWR2IjoiMWQ5ZGY1NTE3ZTAzYjZjYTI4ZGVkMTNkNjVkYjhlM2FmMmZiZDk1MTg3NWMyMjEzZWQ2MjhlOWVhNDcwNTNjMSIsImxnIjoiZW4iLCJkbyI6IkxpbnV4IiwiYXMiOiIiLCJhayI6ImFjY2Vzc0tleSJ9&ak=accessKey
    console.log(`[KA Proxy][${clientId}] Connecting to KA WebSocket: ${remoteWsUrl}`)
    const remoteWs = new WebSocket(remoteWsUrl)
    ws.data.kagamingRemoteWs = remoteWs

    remoteWs.onopen = () => {
      console.log(`[KA Proxy][${clientId}] Connected to KA remote server.`)
      if (!ws.data.kagamingSessionKey || ws.data.kagamingMessageCounter === undefined) return

      ws.data.kagamingMessageCounter++
      const initialPayload: InitPayload = {
        id: `${clientId}-${ws.data.kagamingMessageCounter}`,
        type: 'init',
        content: { type: 'init' /* bet: ws.data.lastBet */ }, // Pass lastBet if available
        protocol,
        data: ws.data.kagamingRememberedData,
        // gameClientVersion: ws.data.gameClientVersion // Pass if available
      }
      try {
        const stringifiedPayload = JSON.stringify(initialPayload)
        console.log(
          `[KA Proxy][${clientId}] Sending INIT to KA (plain): ${stringifiedPayload.substring(0, 100)}...`
        )
        const encryptedPayload = rc4Api.encrypt(ws.data.kagamingSessionKey, stringifiedPayload)
        remoteWs.send(encryptedPayload)
        console.log(`[KA Proxy][${clientId}] Sent INIT to KA (encrypted).`)
      } catch (e: any) {
        console.error(`[KA Proxy][${clientId}] Error sending INIT to KA:`, e.message)
      }
    }

    remoteWs.onmessage = (event: MessageEvent) => {
      if (ws.readyState !== 1 /* OPEN */) return
      const rawMessage = event.data.toString()
      console.log(`[KA Proxy][${clientId}] From KA (raw): ${rawMessage.substring(0, 100)}...`)
      if (!ws.data.kagamingSessionKey) return

      try {
        const decrypted = rc4Api.decrypt(ws.data.kagamingSessionKey, rawMessage)
        const lzwDecoded = lzwDecode(decrypted)
        console.log(
          `[KA Proxy][${clientId}] From KA (processed for log): ${lzwDecoded.substring(0, 100)}...`
        )

        // Update rememberedData if extPlayerKey is in the response
        try {
          const parsedPayload = JSON.parse(lzwDecoded)
          if (parsedPayload && parsedPayload.extPlayerKey && ws.data.kagamingRememberedData) {
            ws.data.kagamingRememberedData.extPlayerKey = parsedPayload.extPlayerKey
            console.log(
              `[KA Proxy][${clientId}] Updated KA extPlayerKey: ${parsedPayload.extPlayerKey}`
            )
          }
        } catch (parseError) {
          /* Not JSON or no extPlayerKey */
          console.log(parseError)
        }
      } catch (e: any) {
        console.error(`[KA Proxy][${clientId}] Error processing message from KA:`, e.message)
      }
      ws.send(event.data as string | BufferSource) // Forward original raw message to client
    }

    remoteWs.onclose = (event: CloseEvent) => {
      console.log(
        `[KA Proxy][${clientId}] KA remote WS closed. Code: ${event.code}, Reason: ${event.reason}`
      )
      if (ws.readyState === 1 /* OPEN */) {
        ws.close(event.code, event.reason)
      }
    }

    remoteWs.onerror = (event: Event) => {
      // Bun's WebSocket error event is just 'Event', not specific ErrorEvent
      console.error(`[KA Proxy][${clientId}] KA remote WS error:`, event)
      if (ws.readyState === 1 /* OPEN */) {
        ws.close(1011, 'KA remote connection error')
      }
    }
  } catch (error: any) {
    console.error(`[KA Proxy][${clientId}] Error in open handler:`, error.message, error.stack)
    if (ws.readyState === 1 /* OPEN */) {
      ws.close(1011, 'Proxy setup error')
    }
  }
}

export function kagamingProxyMessageHandler(
  ws: ServerWebSocket<KaGamingProxyWsData>,
  message: string | Buffer
) {
  const {
    clientId,
    kagamingRemoteWs,
    kagamingSessionKey,
    kagamingMessageCounter,
    // kagamingRememberedData,
  } = ws.data
  if (!kagamingRemoteWs || !kagamingSessionKey || kagamingMessageCounter === undefined) {
    console.warn(
      `[KA Proxy][${clientId}] Received message, but KA proxy not fully initialized. Ignoring.`
    )
    return
  }

  const rawClientMessage = message.toString()
  console.log(
    `[KA Proxy][${clientId}] To KA (raw from client): ${rawClientMessage.substring(0, 100)}...`
  )

  try {
    // Decrypt for logging, assuming client sends RC4 encrypted JSON string
    const decryptedForLog = rc4Api.decrypt(kagamingSessionKey, rawClientMessage)
    console.log(
      `[KA Proxy][${clientId}] To KA (decrypted for log): ${decryptedForLog.substring(0, 100)}...`
    )
  } catch (e: any) {
    console.error(`[KA Proxy][${clientId}] Error decrypting client message for log:`, e.message)
  }

  if (kagamingRemoteWs.readyState === WebSocket.OPEN) {
    // Forward the original raw message (assumed to be already RC4 encrypted by client)
    kagamingRemoteWs.send(message as string | BufferSource)
    console.log(`[KA Proxy][${clientId}] Forwarded client message to KA.`)
  } else {
    console.warn(`[KA Proxy][${clientId}] KA remote WS not open. Cannot forward client message.`)
  }
}

export function kagamingProxyCloseHandler(context: CloseHandlerContext<KaGamingProxyWsData>) {
  const { ws, code, reason } = context
  const { clientId, kagamingRemoteWs } = ws.data
  console.log(`[KA Proxy][${clientId}] Client WS closed. Code: ${code}, Reason: ${reason}`)

  if (kagamingRemoteWs && kagamingRemoteWs.readyState === WebSocket.OPEN) {
    console.log(`[KA Proxy][${clientId}] Closing KA remote WS.`)
    kagamingRemoteWs.close(code, reason)
  }
  // Clear data
  delete ws.data.kagamingRemoteWs
  delete ws.data.kagamingSessionKey
  delete ws.data.kagamingMessageCounter
  delete ws.data.kagamingRememberedData
}
