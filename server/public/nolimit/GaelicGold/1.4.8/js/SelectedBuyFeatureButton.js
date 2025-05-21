"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectedBuyFeatureButton = void 0;
/**
 * Created by jonas on 2024-01-30.
 */
const GuiButton_1 = require("../GuiButton");
const NolimitBonusFeatureTicket_1 = require("./parts/NolimitBonusFeatureTicket");
const ImgLoader_1 = require("../../../loader/ImgLoader");
const GuiDefaultTextures_1 = require("../../default/GuiDefaultTextures");
class SelectedBuyFeatureButton extends GuiButton_1.GuiButton {
    constructor(featureName, clickCallback) {
        super(featureName + "_selected", () => {
            clickCallback("open");
        });
        this._backgroundPlate = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_BASE_20), 20, 20, 20, 20);
        this._backgroundPlate.alpha = 1;
        this._backgroundPlate.tint = 0xEE2653;
        this._backgroundStroke = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_STROKE_20), 20, 20, 20, 20);
        this._backgroundStroke.alpha = 1;
        this._backgroundStroke.tint = 0x9b1b43;
        this._backgroundStroke2 = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_STROKE_20), 20, 20, 20, 20);
        this._backgroundStroke2.alpha = 1;
        this._backgroundStroke2.tint = 0x9b1b43;
        this.featureTicket = new NolimitBonusFeatureTicket_1.NolimitBonusFeatureTicket(featureName);
        this.featureTicket.scale.set(0.6, 0.6);
        this.featureTicket.setSelected(true, false);
        this.featureTicket.position.set(13, 12);
        this.setBackgroundSize(this.featureTicket.width + 26, this.featureTicket.height + 20);
        this.closeGfx = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BONUS_CLOSE_BUTTON));
        this.closeGfx.anchor.set(1, 0);
        this.closeGfx.scale.set(0.5, 0.5);
        this.closeGfx.position.set(this.size.x + 10, -10);
        const closeButton = new GuiButton_1.GuiButton(featureName + "_selected_close", () => {
            clickCallback("close");
        });
        closeButton.addChild(this.closeGfx);
        closeButton.enable(true);
        this.addChild(this._backgroundPlate, this._backgroundStroke, this._backgroundStroke2);
        this.addChild(this.featureTicket);
        this.addChild(closeButton);
        //  this.scale.set(0.8,0.8)
    }
    setBackgroundSize(width, height) {
        this.size = new PIXI.Point(width, height);
        this._backgroundPlate.width = this.size.x;
        this._backgroundPlate.height = this.size.y;
        this._backgroundStroke.width = this.size.x;
        this._backgroundStroke.height = this.size.y;
        this._backgroundStroke2.width = this.size.x;
        this._backgroundStroke2.height = this.size.y - 3;
    }
}
exports.SelectedBuyFeatureButton = SelectedBuyFeatureButton;
//# sourceMappingURL=SelectedBuyFeatureButton.js.map