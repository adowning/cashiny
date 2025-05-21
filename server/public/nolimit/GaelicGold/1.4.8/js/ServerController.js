"use strict";
/**
 * Created by Ning Jiang on 4/19/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerController = void 0;
const DevConsole_1 = require("@nolimitcity/slot-launcher/bin/devtools/DevConsole");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const GameModuleConfig_1 = require("../gamemoduleconfig/GameModuleConfig");
const ParsedGameData_1 = require("./data/ParsedGameData");
const ParsedInitData_1 = require("./data/ParsedInitData");
const ServerEvent_1 = require("./event/ServerEvent");
const ServerDataParser_1 = require("./ServerDataParser");
class ServerController {
    /**
     * data is the latest data received.
     */
    get data() {
        return ServerController._latestData;
    }
    get initData() {
        return this._parsedInitData;
    }
    get gameData() {
        return this._parsedGameData;
    }
    constructor() {
        this._initComplete = false;
        this._dataParser = GameModuleConfig_1.GameModuleConfig.instance.SERVER_PARSER ? GameModuleConfig_1.GameModuleConfig.instance.SERVER_PARSER() : new ServerDataParser_1.ServerDataParser();
        EventHandler_1.EventHandler.addLastEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_RECEIVED, (event) => this.onInitDataReceived(event.params[0]));
        EventHandler_1.EventHandler.addLastEventListener(this, ServerEvent_1.ServerEvent.GAME_DATA_RECEIVED, (event) => this.onGameDataReceived(event.params[0]));
        DevConsole_1.DevConsole.addCommand("printLatestData", () => { console.log(this.data); });
        DevConsole_1.DevConsole.addCommand("printGameData", () => { console.log(this.gameData); });
        DevConsole_1.DevConsole.addCommand("printInitData", () => { console.log(this.initData); });
    }
    onInitDataReceived(data) {
        this._parsedInitData = GameModuleConfig_1.GameModuleConfig.instance.PARSED_INIT_DATA ? GameModuleConfig_1.GameModuleConfig.instance.PARSED_INIT_DATA(data, this._dataParser) : new ParsedInitData_1.ParsedInitData(data, this._dataParser);
        ServerController._latestData = this._parsedInitData;
        this.tryDispatchInitParsed();
        EventHandler_1.EventHandler.removeLastEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_RECEIVED);
    }
    onGameDataReceived(data) {
        this._parsedGameData = GameModuleConfig_1.GameModuleConfig.instance.PARSED_GAME_DATA ? GameModuleConfig_1.GameModuleConfig.instance.PARSED_GAME_DATA(data, this._dataParser) : new ParsedGameData_1.ParsedGameData(data, this._dataParser);
        ServerController._latestData = this._parsedGameData;
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ServerEvent_1.ServerEvent.GAME_DATA_PARSED, this.gameData));
    }
    initComplete() {
        this._initComplete = true;
        this.tryDispatchInitParsed();
    }
    tryDispatchInitParsed() {
        if (this._initComplete && this._parsedInitData != undefined) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ServerEvent_1.ServerEvent.INIT_DATA_PARSED, this.initData));
        }
    }
    static getData() {
        return ServerController._latestData;
    }
}
exports.ServerController = ServerController;
//# sourceMappingURL=ServerController.js.map