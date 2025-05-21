"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModeEvent = void 0;
/**
 * Created by Ning Jiang on 3/23/2017.
 */
const GameEvent_1 = require("../../event/GameEvent");
class GameModeEvent extends GameEvent_1.GameEvent {
    constructor(type, fromMode, toMode) {
        super(type, fromMode, toMode);
        this.fromMode = fromMode;
        this.toMode = toMode;
    }
}
GameModeEvent.CHANGE_MODE = "gameModeEvent_changeMode";
GameModeEvent.GAME_MODE_TRANSITION_STARTED = "GameModeEvent_GAME_MODE_TRASITION_STARTED";
GameModeEvent.GAME_MODE_TRANSITION_FINISHED = "GameModeEvent_GAME_MODE_TRASITION_FINISHED";
GameModeEvent.GAME_MODE_TRANSITION_PREPARE = "GAME_MODE_TRANSITION_PREPARE";
exports.GameModeEvent = GameModeEvent;
//# sourceMappingURL=GameModeEvent.js.map