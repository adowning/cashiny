"use strict";
/**
 * Created by Ning Jiang on 11/30/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseView = void 0;
const EventHandler_1 = require("../event/EventHandler");
const LoaderEvent_1 = require("../resource/event/LoaderEvent");
const ResourcesGroupName_1 = require("../resource/ResourcesGroupName");
const StageEvent_1 = require("../stage/event/StageEvent");
class BaseView extends PIXI.Container {
    constructor(resourcesGroup = ResourcesGroupName_1.ResourcesGroupName.MAIN) {
        super();
        this._isResizeDirty = false;
        this._hasInit = false;
        this._resourcesGroup = resourcesGroup;
        this.addBaseEventListeners();
        if (this.addEventListeners) {
            this.addEventListeners();
        }
    }
    addBaseEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, LoaderEvent_1.LoaderEvent.RESOURCES_LOADED, (event) => this.onResourcesLoaded(event));
        EventHandler_1.EventHandler.addEventListener(this, StageEvent_1.StageEvent.STAGE_RESIZED, (event) => this.onStageResized(event.params[0]));
    }
    onResourcesLoaded(event) {
        if (event.key != this._resourcesGroup) {
            return;
        }
        if (this.initAnimations) {
            this.initAnimations();
        }
        this._hasInit = true;
        if (this._isResizeDirty && this.onResize) {
            this._isResizeDirty = false;
            this.onResize(this._resizeData);
        }
    }
    onStageResized(resizeData) {
        this._resizeData = resizeData;
        if (this.onResize && this._hasInit) {
            this._isResizeDirty = false;
            this.onResize(resizeData);
        }
        else {
            this._isResizeDirty = true;
        }
    }
}
exports.BaseView = BaseView;
//# sourceMappingURL=BaseView.js.map