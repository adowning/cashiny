"use strict";
/**
 * Created by Ning Jiang on 4/11/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoaderEvent = void 0;
const GameEvent_1 = require("../../event/GameEvent");
class LoaderEvent extends GameEvent_1.GameEvent {
    get key() {
        return this._key;
    }
    /*
     resources can be anything that PIXI.loader accepts.
     */
    constructor(type, key) {
        super(type, key);
        this._key = key;
    }
}
LoaderEvent.RESOURCES_LOADED = "loaderEvent_resourcesLoaded";
exports.LoaderEvent = LoaderEvent;
//# sourceMappingURL=LoaderEvent.js.map