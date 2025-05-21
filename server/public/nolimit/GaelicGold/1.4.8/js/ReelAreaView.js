"use strict";
/**
 * Created by Ning Jiang on 7/24/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReelAreaView = void 0;
const BaseView_1 = require("../../base/BaseView");
const GameConfig_1 = require("../../gameconfig/GameConfig");
const StageManager_1 = require("../../stage/StageManager");
class ReelAreaView extends BaseView_1.BaseView {
    constructor(resourcesGroup) {
        super(resourcesGroup);
        this._reelViews = [];
        this._layer = StageManager_1.StageManager.getLayer(GameConfig_1.GameConfig.instance.LAYERS.SYMBOLS.name);
        this._layer.addChild(this);
    }
    UpdateReelAreaMask() {
        if (GameConfig_1.GameConfig.instance.REEL_AREA_MASK === false) {
            return;
        }
        const rect = GameConfig_1.GameConfig.instance.REEL_AREA_MASK_RECT != undefined ? GameConfig_1.GameConfig.instance.REEL_AREA_MASK_RECT :
            new PIXI.Rectangle(GameConfig_1.GameConfig.instance.REEL_AREA_POS_X, GameConfig_1.GameConfig.instance.REEL_AREA_POS_Y, GameConfig_1.GameConfig.instance.REEL_AREA_WIDTH, GameConfig_1.GameConfig.instance.REEL_AREA_HEIGHT);
        const maskShape = new PIXI.Graphics();
        maskShape.beginFill(0xFFFFFF, 1);
        maskShape.drawRect(rect.x - GameConfig_1.GameConfig.instance.REEL_AREA_POS_X, rect.y - GameConfig_1.GameConfig.instance.REEL_AREA_POS_Y, rect.width, rect.height);
        maskShape.endFill();
        if (this._reelAreaMask != null) {
            this.removeChild(this._reelAreaMask);
        }
        this._reelAreaMask = maskShape;
        this.addChild(this._reelAreaMask);
        this.mask = this._reelAreaMask;
    }
    onResize(resizeData) {
        this.x = GameConfig_1.GameConfig.instance.REEL_AREA_POS_X;
        this.y = GameConfig_1.GameConfig.instance.REEL_AREA_POS_Y;
        this._reelViews.forEach((reelView, reelId) => {
            this.updateReelViewPosition(reelView, reelId);
        });
        this.UpdateReelAreaMask();
    }
    updateReelViewPosition(reelView, reelId) {
        const position = GameConfig_1.GameConfig.instance.REEL_DISPLAY_POSITIONS[reelId];
        reelView.x = position[0];
        reelView.y = position[1];
    }
    // Note, addReelView is not necessary to run after initAnimations.
    // If reelViews need to be added to a certain container,
    // init the container in the ReelAreaView constructor instead of initAnimations().
    addReelView(reel) {
        this._reelViews[reel.reelId] = reel.view;
        this.updateReelViewPosition(reel.view, reel.reelId);
        this.addChild(reel.view);
    }
}
exports.ReelAreaView = ReelAreaView;
//# sourceMappingURL=ReelAreaView.js.map