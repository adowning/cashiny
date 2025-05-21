"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Background = void 0;
const BaseView_1 = require("../base/BaseView");
const EventHandler_1 = require("../event/EventHandler");
const GameModeEvent_1 = require("../gamemode/event/GameModeEvent");
const StageManager_1 = require("../stage/StageManager");
/**
 * Base class for a background view. Initializes with listener and handler for GameModeEvent.CHANGE_MODE.
 * So onChangeBackground is called when it's time to change background to the new current mode.
 */
class Background extends BaseView_1.BaseView {
    constructor(config, resourceGroup) {
        super(resourceGroup);
        this._layer = StageManager_1.StageManager.getLayer(config.layer);
    }
    /**
     * Add listener for GameModeEvent.CHANGE_MODE
     */
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, GameModeEvent_1.GameModeEvent.CHANGE_MODE, (event) => this.onChangeBackground(event.params[0]));
    }
    /**
     * Adds background to the layer specified in the config.
     */
    initAnimations() {
        this._layer.addChild(this);
    }
    /**
     * Handler for GameModeEvent.CHANGE_MODE. Triggered when it's time to change background. Function sets
     * this._currentMode the new mode if it's different and return true.
     * @param data Event data
     * @returns {boolean} Returns true if the new game mode is different for the current one, I.e. the game mode has
     *     changed.
     */
    onChangeBackground(data) {
        if (data.newMode === this._currentMode) {
            return false;
        }
        this._currentMode = data.newMode;
        return true;
    }
}
exports.Background = Background;
//# sourceMappingURL=Background.js.map