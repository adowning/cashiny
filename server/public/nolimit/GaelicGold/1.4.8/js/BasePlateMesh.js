"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlateMesh = void 0;
/**
 * Class description
 *
 * Created: 2017-11-22
 * @author jonas
 */
const StageManager_1 = require("../stage/StageManager");
class BasePlateMesh extends PIXI.NineSlicePlane {
    get shape() {
        return this._shape;
    }
    constructor(config) {
        super(PIXI.Texture.EMPTY);
        this._config = config;
    }
    //Back plate
    updateTexture() {
        this._shape = new PIXI.RoundedRectangle(0, 0, 128 - this._scaleRelativeTexturePadding * 2, 128 - this._scaleRelativeTexturePadding * 2, this._config.cornerRadius);
        const gfx = new PIXI.Graphics();
        gfx.lineStyle(this._scaleRelativeLineThickness, this._config.lineColor, this._config.lineAlpha);
        gfx.beginFill(this._config.backgroundColor, this._config.backgroundAlpha);
        gfx.drawShape(this._shape);
        gfx.endFill();
        gfx.position.set(this._scaleRelativeTexturePadding, this._scaleRelativeTexturePadding);
        const extraMeshPadding = this._scaleRelativeTexturePadding * 2;
        this.texture = this.generateCanvasTexture(gfx);
        this.topHeight = this._config.cornerRadius + extraMeshPadding;
        this.rightWidth = this._config.cornerRadius + extraMeshPadding;
        this.bottomHeight = this._config.cornerRadius + extraMeshPadding;
        this.leftWidth = this._config.cornerRadius + extraMeshPadding;
    }
    generateCanvasTexture(container) {
        //TODO - This is a temp solution for the now terminated canvas renderer. See if this is a good method or if we should do it some other way.
        let renderTexture = PIXI.RenderTexture.create({ width: 128, height: 128, scaleMode: PIXI.SCALE_MODES.LINEAR });
        StageManager_1.StageManager.renderer.render(container, renderTexture, false);
        /*    let canvasTexture:PIXI.Texture = PIXI.Texture.fromCanvas(<HTMLCanvasElement>renderTexture.baseTexture.source, PIXI.SCALE_MODES.LINEAR);
            canvasTexture.baseTexture.mipmap = false;
            canvasTexture.baseTexture.update();
    */
        return renderTexture;
    }
    update(stageScale) {
        this._scaleRelativeLineThickness = Math.max(this._config.lineThickness, this._config.lineThickness / stageScale);
        this._scaleRelativeTexturePadding = Math.ceil(this._scaleRelativeLineThickness);
        if (this._oldScaleRelativePadding != this._scaleRelativeTexturePadding) {
            this.updateTexture();
            this._oldScaleRelativePadding = this._scaleRelativeTexturePadding;
        }
    }
}
exports.BasePlateMesh = BasePlateMesh;
//# sourceMappingURL=BasePlateMesh.js.map