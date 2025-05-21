"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceFreezeBlur = void 0;
const gsap_1 = require("gsap");
const NolimitApplication_1 = require("../NolimitApplication");
/**
 * Created by jonas on 2020-02-07.
 */
class PerformanceFreezeBlur {
    get isFrozen() {
        return this._isFrozen;
    }
    constructor(gameStage) {
        this._isFrozen = false;
        this._hasInit = false;
        this._gameStage = gameStage;
    }
    init() {
        this._resolution = 0.05;
        this._app = NolimitApplication_1.NolimitApplication.pixiApp;
        this._freezeTexture = PIXI.RenderTexture.create({
            width: this._app.renderer.screen.width,
            height: this._app.renderer.screen.height,
            resolution: NolimitApplication_1.NolimitApplication.resolution,
            scaleMode: PIXI.SCALE_MODES.LINEAR
        });
        this._freezeSprite = new PIXI.Sprite(this._freezeTexture);
        this._freezeSprite.name = "freezeSprite";
        this._blurTexture = PIXI.RenderTexture.create({
            width: this._app.renderer.screen.width,
            height: this._app.renderer.screen.height,
            resolution: this._resolution,
            scaleMode: PIXI.SCALE_MODES.LINEAR
        });
        this._blurSprite = new PIXI.Sprite(this._blurTexture);
        this._blurFilter = new PIXI.filters.BlurFilter();
        this._blurFilter.autoFit = false;
        this._blurFilter.blur = 60;
        this._blurFilter.padding = 0;
        this._blurSprite.filters = [this._blurFilter];
        this._hasInit = true;
    }
    freeze(duration = 0.22, disableInteraction = false) {
        if (this._isFrozen) {
            return new gsap_1.TimelineLite();
        }
        if (!this._hasInit) {
            this.init();
        }
        if (this._animation != undefined && this._animation.isActive()) {
            this._animation.progress(1, false);
            delete this._animation;
        }
        this.renderTextures();
        this.resize();
        const tl = new gsap_1.TimelineLite();
        tl.add(() => {
            if (disableInteraction) {
                NolimitApplication_1.NolimitApplication.pixiApp.stage.interactiveChildren = false;
            }
            this._isFrozen = true;
            this._freezeSprite.alpha = 0;
            NolimitApplication_1.NolimitApplication.pixiApp.stage.addChildAt(this._freezeSprite, 0);
            NolimitApplication_1.NolimitApplication.pixiApp.stage.addChildAt(this._gameStage, 0);
        });
        tl.add(new gsap_1.TweenLite(this._freezeSprite, duration, { alpha: 1 }));
        tl.add(() => {
            NolimitApplication_1.NolimitApplication.pixiApp.stage.removeChild(this._gameStage);
            delete this._animation;
        });
        this._animation = tl;
        return tl;
    }
    unfreeze(duration = 0.22) {
        if (!this._isFrozen) {
            return new gsap_1.TimelineLite();
        }
        if (this._animation != undefined && this._animation.isActive()) {
            this._animation.progress(1, false);
            delete this._animation;
        }
        const tl = new gsap_1.TimelineLite({ onComplete: () => {
                NolimitApplication_1.NolimitApplication.pixiApp.stage.removeChild(this._freezeSprite);
                NolimitApplication_1.NolimitApplication.pixiApp.stage.interactiveChildren = true;
                delete this._animation;
                this._isFrozen = false;
            }
        });
        tl.add(() => {
            NolimitApplication_1.NolimitApplication.pixiApp.stage.addChildAt(this._gameStage, 0);
        });
        tl.add(new gsap_1.TweenLite(this._freezeSprite, duration, { alpha: 0 }));
        return tl;
    }
    renderTextures() {
        this._freezeSprite.scale.set(1, 1);
        this._freezeTexture.resize(NolimitApplication_1.NolimitApplication.screenBounds.width, NolimitApplication_1.NolimitApplication.screenBounds.height);
        //The extra size here is due to pixis bad edge clamping that does not work. So we blur a bigger texture then when in turn is rendered to freezeTexture the offending extra pixels will be cut.
        this._blurTexture.resize(NolimitApplication_1.NolimitApplication.screenBounds.width + 200, NolimitApplication_1.NolimitApplication.screenBounds.height + 200);
        //Make sure game stage is rendered correctly before rendering to texture
        NolimitApplication_1.NolimitApplication.pixiApp.renderer.render(this._gameStage, this._blurTexture, true, PerformanceFreezeBlur.getStageMatrix());
        //Make sure that blur sprite is rendered with the blur.
        this._blurSprite.render(NolimitApplication_1.NolimitApplication.pixiApp.renderer);
        //Render blur sprite to final texture
        NolimitApplication_1.NolimitApplication.pixiApp.renderer.render(this._blurSprite, this._freezeTexture, true);
    }
    static getStageMatrix() {
        const matrix = new PIXI.Matrix();
        matrix.translate(-NolimitApplication_1.NolimitApplication.screenBounds.left, -NolimitApplication_1.NolimitApplication.screenBounds.top);
        return matrix;
    }
    resize() {
        this._freezeSprite.position.set(NolimitApplication_1.NolimitApplication.screenBounds.left, NolimitApplication_1.NolimitApplication.screenBounds.top);
        this._freezeSprite.width = NolimitApplication_1.NolimitApplication.screenBounds.width;
        this._freezeSprite.height = NolimitApplication_1.NolimitApplication.screenBounds.height;
    }
    onOrientationChanged() {
        if (this._isFrozen) {
            this.renderTextures();
        }
    }
    onResize() {
        if (this._hasInit) {
            this.resize();
        }
    }
}
exports.PerformanceFreezeBlur = PerformanceFreezeBlur;
//# sourceMappingURL=PerformanceFreezeBlur.js.map