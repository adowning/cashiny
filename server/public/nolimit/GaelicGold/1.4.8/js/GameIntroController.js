"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameIntroController = void 0;
/**
 * Class description
 *
 * Created: 2017-11-22
 * @author jonas
 */
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const EventHandler_1 = require("../event/EventHandler");
const GameEvent_1 = require("../event/GameEvent");
const AssetLoaderEvent_1 = require("../resource/asset/AssetLoaderEvent");
const ResourcesGroupName_1 = require("../resource/ResourcesGroupName");
const gsap_1 = require("gsap");
class GameIntroController {
    constructor(viewCreator) {
        this._view = viewCreator(() => this.onClickCallback());
        this.addEventListeners();
        this.progress = 0;
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, AssetLoaderEvent_1.AssetLoaderEvent.PROGRESS, (event) => this.onLoadProgress(event));
    }
    // helping in the hack to load translations before initializing legacy game intro.
    introAssetsAndTranslationsLoaded(data) {
        this._view.introAssetsAndTranslationsLoaded(data);
    }
    show() {
        this._view.show();
    }
    loaderDone() {
        const tl = new gsap_1.TimelineLite();
        tl.add(new gsap_1.TweenLite(this, 0.3, { progress: 100, onUpdate: () => this.updateProgress() }));
        tl.add(() => this._view.enableButton());
    }
    onLoadProgress(event) {
        if (event.name == ResourcesGroupName_1.ResourcesGroupName.MAIN) {
            this.progress = event.progress * 0.9;
            this.updateProgress();
        }
    }
    updateProgress() {
        this._view.updateLoadProgress(this.progress);
    }
    onClickCallback() {
        this._view.close(() => this.onCloseCompleteCallback());
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(GameIntroController.CLOSE));
    }
    onCloseCompleteCallback() {
        Logger_1.Logger.logDev("GameIntroController.onCloseCompleteCallback()");
    }
    resourcesReady() {
        EventHandler_1.EventHandler.removeEventListener(this, AssetLoaderEvent_1.AssetLoaderEvent.PROGRESS);
    }
    gameReady() {
        this.resourcesReady();
        this.loaderDone();
    }
}
GameIntroController.CLOSE = "GameIntroController.close";
exports.GameIntroController = GameIntroController;
//# sourceMappingURL=GameIntroController.js.map