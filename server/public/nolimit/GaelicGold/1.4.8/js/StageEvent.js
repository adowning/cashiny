"use strict";
/**
 * Created by Ning Jiang on 4/1/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageEvent = void 0;
class StageEvent {
}
StageEvent.ADD_TO_RENDER_LOOP = "stageEvent_addToRenderLoop";
StageEvent.WANT_RESIZE = "stageEvent_wantResize"; // tell the api to send resize event.
StageEvent.CONTAINER_RESIZED = "stageEvent_containerResized"; // Receive from the api for triggering game internal resizing.
StageEvent.STAGE_RESIZED = "stageEvent_stageResized"; // Dispatched when the stage complete it's resizing.
StageEvent.LEFT_HANDED_SETTING = "stageEvent_leftHandedSetting";
exports.StageEvent = StageEvent;
//# sourceMappingURL=StageEvent.js.map