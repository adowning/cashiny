"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StillImageBackground = void 0;
const Background_1 = require("../../core/background/Background");
const GameConfig_1 = require("../../core/gameconfig/GameConfig");
const GameResources_1 = require("../../core/resource/GameResources");
/**
 * A simple background view that creates sprites for each game mode specified in config and automatically switches
 * background based on when game mode changes.
 *
 * This background does NOT scale on resize, used for background that has a fixed position to the reels area.
 *
 * Created: 2017-04-28
 * @author jonas
 */
class StillImageBackground extends Background_1.Background {
    constructor(config) {
        super(config);
        this._backgroundImages = config.backgroundImages;
        this._stretch = config.stretch;
    }
    /**
     * @inheritDoc
     */
    initAnimations() {
        super.initAnimations();
        this._backgroundSprite = new PIXI.Sprite();
        this.addChild(this._backgroundSprite);
    }
    /**
     * @inheritDoc
     */
    onChangeBackground(data) {
        if (!super.onChangeBackground(data)) {
            return false;
        }
        const texture = GameResources_1.GameResources.getTextures(this._backgroundImages[this._currentMode].image)[0];
        const offset = this._backgroundImages[this._currentMode].offset != undefined ? this._backgroundImages[this._currentMode].offset : StillImageBackground._DEFAULT_OFFSET;
        const scale = this._backgroundImages[this._currentMode].scale != undefined ? this._backgroundImages[this._currentMode].scale : 1;
        this._backgroundSprite.texture = texture;
        if (this._stretch) {
            this._backgroundSprite.width = GameConfig_1.GameConfig.instance.GAME_WIDTH;
            this._backgroundSprite.height = GameConfig_1.GameConfig.instance.GAME_HEIGHT;
        }
        else {
            this._backgroundSprite.scale.set(scale, scale);
        }
        this._backgroundSprite.x = offset.x;
        this._backgroundSprite.y = offset.y;
        return true;
    }
}
StillImageBackground._DEFAULT_OFFSET = new PIXI.Point(0, 0);
exports.StillImageBackground = StillImageBackground;
//# sourceMappingURL=StillImageBackground.js.map