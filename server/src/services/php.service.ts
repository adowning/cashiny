export interface NodeGameRequest {
  userId: string | number; // User identifier
  gameId: string; // Game identifier, e.g., "CleosHeartNG"
  command: string; // The primary game command, e.g., "SpinRequest", "InitRequest", "AuthRequest"
  /**
   * Parameters specific to the command. This object will be passed as the
   * main JSON body to the PHP Server script (which reads it via php://input).
   * Its structure must match what Server.php expects for the given command.
   *
   * Examples:
   * For "SpinRequest": { "action": "SpinRequest", "data": { "coin": 1, "bet": 10 } }
   * For "AuthRequest": { "action": "AuthRequest" }
   * For "PickBonusItemRequest": { "action": "PickBonusItemRequest", "data": { "index": "symbol_id" } }
   */
  parameters: Record<string, any>;
}

/**
 * Represents the payload structure sent from Node.js to the master_game_handler.php's STDIN.
 */
export interface PhpMasterInput {
  userId: string | number;
  gameId: string;
  /**
   * This is the actual data that Server.php will process as if it came from a direct HTTP request.
   * It's the `parameters` from `NodeGameRequest`.
   */
  phpInputCommandData: Record<string, any>;
}

/**
 * Represents a generic game response from PHP.
 * The actual structure will vary based on the command executed by Server.php.
 * It could be a single JSON object or an array if PHP returns multiple joined responses.
 */
export type PhpGameResponse = Record<string, any> | Record<string, any>[];

// src/game_service.ts
import { spawn } from 'child_process';
import path from 'path';
import { HonoRequest } from 'hono';

// Adjust this path if your php_scripts directory is located differently relative to the compiled JS output
const PHP_SCRIPTS_BASE_DIR = path.resolve(__dirname, '../../public/php/games/'); // Assumes php_scripts is sibling to dist/ or src/
const MASTER_PHP_HANDLER_SCRIPT = 'master_game_handler.php';

/**
 * Executes the master PHP game handler script.
 * @param dataForPhpMaster The payload containing userId, gameId, and the command data for PHP.
 * @returns {Promise<string>} Raw string output from the PHP script.
 */
function executePhp(dataForPhpMaster: PhpMasterInput): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(PHP_SCRIPTS_BASE_DIR, MASTER_PHP_HANDLER_SCRIPT);

    // IMPORTANT: The Current Working Directory (cwd) for the PHP script.
    // This should be the root of your Laravel project if master_game_handler.php
    // needs to bootstrap Laravel correctly (e.g., to find vendor/autoload.php, .env).
    // Adjust this path to your actual Laravel project root.
    const laravelProjectRoot = path.resolve(PHP_SCRIPTS_BASE_DIR, '..'); // Example: if php_scripts is inside project root
    // Or simply PHP_SCRIPTS_BASE_DIR if it IS the project root.

    // For debugging paths:
    // console.log(`Executing PHP script: ${scriptPath}`);
    // console.log(`Laravel Project Root (cwd for PHP): ${laravelProjectRoot}`);
    // console.log(`Data being sent to PHP stdin: ${JSON.stringify(dataForPhpMaster)}`);

    const phpProcess = spawn('php', [scriptPath], {
      cwd: laravelProjectRoot, // CRITICAL for Laravel bootstrap
    });

    let stdoutData = '';
    let stderrData = '';

    phpProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    phpProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    phpProcess.on('close', (code) => {
      // console.log(`PHP process exited with code: ${code}`);
      // console.log(`PHP stdout:\n${stdoutData}`);
      // console.log(`PHP stderr:\n${stderrData}`);

      if (code !== 0) {
        reject(
          new Error(
            `PHP script '${MASTER_PHP_HANDLER_SCRIPT}' exited with code ${code}.\n` +
              `Stderr: ${stderrData || 'N/A'}\n` +
              `Stdout (if any): ${stdoutData || 'N/A'}`
          )
        );
      } else if (
        stderrData &&
        !stdoutData.trim().startsWith('{') &&
        !stdoutData.trim().startsWith('[')
      ) {
        // If there's stderr and stdout doesn't look like JSON, it might be a PHP warning/error
        // that occurred before or instead of the expected JSON output.
        // However, Server.php might output non-JSON debug info before ':::'
        // This logic needs to be robust based on actual PHP output.
        console.warn(
          `PHP script '${MASTER_PHP_HANDLER_SCRIPT}' produced stderr output (but exited successfully):\n${stderrData}`
        );
        resolve(stdoutData); // Still resolve with stdout if it exists
      } else {
        resolve(stdoutData);
      }
    });

    phpProcess.on('error', (err) => {
      reject(
        new Error(`Failed to start PHP script '${MASTER_PHP_HANDLER_SCRIPT}': ${err.message}`)
      );
    });

    // Write the structured payload to PHP's stdin
    // master_game_handler.php will read this using file_get_contents('php://input')
    try {
      phpProcess.stdin.write(JSON.stringify(dataForPhpMaster));
      phpProcess.stdin.end();
    } catch (e: any) {
      reject(new Error(`Error writing to PHP stdin: ${e.message}`));
    }
  });
}

async function processGameCommand(nodeRequest: NodeGameRequest): Promise<PhpGameResponse> {
  const { userId, gameId, parameters } = nodeRequest;

  // This is the data that master_game_handler.php will receive on its STDIN.
  // The `phpInputCommandData` will then be processed by Server.php as its main input.
  const payloadForPhpMaster: PhpMasterInput = {
    userId,
    gameId,
    phpInputCommandData: parameters, // This is what Server.php expects
  };

  const rawPhpOutput = await executePhp(payloadForPhpMaster);
  console.log(rawPhpOutput);
  // Server.php prefixes its output with ':::' and can join multiple JSONs with '------'
  let actualJsonResponse = rawPhpOutput;
  if (rawPhpOutput.startsWith(':::')) actualJsonResponse = rawPhpOutput;
  if (rawPhpOutput.startsWith(':::')) {
    actualJsonResponse = rawPhpOutput.substring(3);
  }

  try {
    if (actualJsonResponse.includes('------')) {
      // Handle multiple JSON objects if Server.php returns them this way
      return actualJsonResponse
        .split('------')
        .map((jsonString) => JSON.parse(jsonString.trim()))
        .filter((obj) => obj); // Filter out any empty strings from split
    }
    // Handle a single JSON object
    return JSON.parse(actualJsonResponse.trim());
  } catch (parseError: any) {
    console.error('Error parsing JSON response from PHP:', parseError.message);
    console.error('Raw PHP output (after potential ::: trim):', actualJsonResponse);
    throw new Error(
      'Failed to parse JSON response from PHP. Output: ' +
        (actualJsonResponse.length > 500
          ? actualJsonResponse.substring(0, 500) + '...'
          : actualJsonResponse)
    );
  }
}

export async function handleGameCommand(req: HonoRequest, res: Response): Promise<PhpGameResponse> {
  const gameRequest = req.body as NodeGameRequest;

  // Basic validation of the incoming request to Node.js
  if (
    !gameRequest ||
    typeof gameRequest.userId === 'undefined' ||
    !gameRequest.gameId ||
    !gameRequest.command || // command is used for logging/routing on Node side if needed
    typeof gameRequest.parameters !== 'object' ||
    gameRequest.parameters === null
  ) {
    // return res.json({status: 400}).json({
    //     error: 'Invalid request payload. Required fields: userId, gameId, command, and parameters (object).',
    // });
  }

  try {
    console.log(
      `Processing command '${gameRequest.command}' for game '${gameRequest.gameId}' by user '${gameRequest.userId}'`
    );
    const phpResponse = await processGameCommand(gameRequest);
    console.log(phpResponse);
  } catch (error: any) {
    console.error('Error during game command processing:', error.message);
    // Avoid sending detailed internal error messages to the client in production
    res.status(500).json({
      error: 'An error occurred while processing your request with the PHP backend.',
      details: error.message, // Consider removing or sanitizing for production
    });
  }
  return new Promise((resolve, reject) => {
    const phpProcess = spawn('php', [MASTER_PHP_HANDLER_SCRIPT]);

    let stderrData = '';
    let stdoutData = '';

    phpProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
    });
  });
}
