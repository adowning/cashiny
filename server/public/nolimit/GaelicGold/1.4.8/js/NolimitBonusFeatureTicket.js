"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitBonusFeatureTicket = void 0;
/**
 * Created by jonas on 2024-01-30.
 */
const ImgLoader_1 = require("../../../../loader/ImgLoader");
const GuiDefaultTextures_1 = require("../../../default/GuiDefaultTextures");
const NolimitLauncher_1 = require("../../../../NolimitLauncher");
class NolimitBonusFeatureTicket extends PIXI.Container {
    constructor(featureName) {
        super();
        this._ticketContainer = new PIXI.Container();
        const feature = NolimitLauncher_1.NolimitLauncher.apiPlugin.betFeatureController.getFeatureData(featureName);
        if ((feature === null || feature === void 0 ? void 0 : feature.type) === "FREESPIN") {
            this._baseTicketTexture = ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.FEATURE_TICKET_BASE_GOLD);
            this._selectedTicketTexture = ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.FEATURE_TICKET_GOLD);
        }
        else {
            this._baseTicketTexture = ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.FEATURE_TICKET_BASE_SILVER);
            this._selectedTicketTexture = ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.FEATURE_TICKET_SILVER);
        }
        this._ticketSprite = new PIXI.Sprite(this._baseTicketTexture);
        this.size = new PIXI.Point(this._ticketSprite.width, this._ticketSprite.height);
        this._shadow = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_BASE_9_BLUR_40), 29, 29, 29, 29);
        this._shadow.tint = 0x000000;
        this._shadow.alpha = 0.4;
        this._shadow.position.set(0, 18);
        this._shadow.width = this.size.x;
        this._shadow.height = this.size.y;
        let featureTexture = PIXI.utils.TextureCache[featureName];
        if (featureTexture == undefined) {
            featureTexture = PIXI.utils.TextureCache[featureName + ".png"];
        }
        const featureSprite = new PIXI.Sprite(featureTexture);
        featureSprite.height = this.size.y;
        featureSprite.scale.x = featureSprite.scale.y;
        this._ticketContainer.addChild(this._shadow);
        this._ticketContainer.addChild(this._ticketSprite);
        this._ticketContainer.addChild(featureSprite);
        this._ticketContainer.pivot.set(this.size.x * 0.5, this.size.y * 0.5);
        this._ticketContainer.position.set(this.size.x * 0.5, this.size.y * 0.5);
        this.addChild(this._ticketContainer);
    }
    setSelected(selected, doScale = true) {
        if (selected) {
            this._shadow.alpha = 0.4;
            this._ticketSprite.texture = this._selectedTicketTexture;
            if (doScale) {
                this._ticketContainer.scale.set(1.05, 1.05);
            }
            else {
                this._ticketContainer.scale.set(1.0, 1.0);
            }
        }
        else {
            this._shadow.alpha = 0;
            this._ticketSprite.texture = this._baseTicketTexture;
            this._ticketContainer.scale.set(1.0, 1.0);
        }
    }
}
exports.NolimitBonusFeatureTicket = NolimitBonusFeatureTicket;
//# sourceMappingURL=NolimitBonusFeatureTicket.js.map