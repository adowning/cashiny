"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameOptionButton = void 0;
/**
 * Created by jonas on 2023-05-29.
 */
const GuiToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/GuiToggleButton");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const ToggleState_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/ToggleState");
class GameOptionButton extends GuiToggleButton_1.GuiToggleButton {
    constructor(data) {
        super(data.name, () => this.toggleCallback());
        this.data = data;
        const imageContainer = new PIXI.Container();
        if (data.image) {
            let texture = ImgLoader_1.ImgLoader.getImgTexture(data.image);
            texture.baseTexture.setResolution(2);
            const sprite = new PIXI.Sprite(texture);
            const maskSprite = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_MASK));
            //sprite.anchor.set(0.5,0.5);
            //maskSprite.anchor.set(0.5,0.5);
            imageContainer.addChild(sprite);
            imageContainer.addChild(maskSprite);
            sprite.mask = maskSprite;
        }
        const btnGfxContainer = new PIXI.Container();
        this.onSprite = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_ACTIVE));
        this.offSprite = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_INACTIVE));
        btnGfxContainer.addChild(this.offSprite, this.onSprite);
        this.addChild(btnGfxContainer);
        this.addChild(imageContainer);
    }
    virtualClick() {
        this.onClick();
    }
    toggleCallback() {
        this.onSprite.visible = (this.toggleState == ToggleState_1.ToggleState.ON);
        this.offSprite.visible = !this.onSprite.visible;
    }
}
exports.GameOptionButton = GameOptionButton;
//# sourceMappingURL=GameOptionButton.js.map