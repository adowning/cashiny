"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetLoaderEvent = void 0;
/**
 * Class description
 *
 * Created: 2017-11-15
 * @author jonas
 */
const GameEvent_1 = require("../../event/GameEvent");
class AssetLoaderEvent extends GameEvent_1.GameEvent {
    constructor(type, groupName, qualityLevel, progress) {
        super(type);
        this.name = groupName;
        this.level = qualityLevel;
        this.progress = progress ? progress : 100;
    }
}
AssetLoaderEvent.LEVEL_COMPLETE = "levelComplete";
AssetLoaderEvent.ALL_LEVELS_COMPLETE = "allLevelsComplete";
AssetLoaderEvent.PROGRESS = "progress";
exports.AssetLoaderEvent = AssetLoaderEvent;
//# sourceMappingURL=AssetLoaderEvent.js.map