"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameOptionSelectorComponent = void 0;
/**
 * Created by jonas on 2023-05-26.
 */
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const GameOptionButton_1 = require("./GameOptionButton");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelLabelIDs_1 = require("../../../enums/PromoPanelLabelIDs");
class GameOptionSelectorComponent extends PIXI.Container {
    constructor(type, stateChangeCallback, options, titleString, titleValue = "", deselectable = false) {
        super();
        this.buttons = [];
        this._enabled = true;
        this.skipSound = false;
        this.type = type;
        this.stateChangeCallback = stateChangeCallback;
        this.deselectable = deselectable;
        this.textContainer = new PIXI.Container();
        this.title = new Label_1.Label(titleString, PromoPanelTextStyles_1.PromoPanelTextStyles.ACTION_SPINS_OPTIONS_TITLE);
        this.titleValue = new Label_1.Label(titleValue, PromoPanelTextStyles_1.PromoPanelTextStyles.ACTION_SPINS_OPTIONS_VALUE);
        this.textContainer.addChild(this.title, this.titleValue);
        this.buttonsContainer = new PIXI.Container();
        for (let option of options) {
            option.header = titleString;
            const button = new GameOptionButton_1.GameOptionButton(option);
            button.addClickCallback(() => {
                this.buttonClicked(button);
            });
            button.toggled = false;
            button.enable(true);
            this.buttons.push(button);
            this.buttonsContainer.addChild(button);
        }
        this.updateLayout(false, 633);
        this.addChild(this.textContainer, this.buttonsContainer);
    }
    enable(value) {
        this._enabled = value;
        if (value) {
            this.alpha = 1;
        }
        else {
            this.alpha = 0.4;
        }
    }
    addContinueButtonGraphics() {
        for (let button of this.buttons) {
            const container = new PIXI.Container();
            const sprite = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_GAME_CONTINUE_SMALL));
            sprite.anchor.set(0, 0);
            const label = new Label_1.Label(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.CONTINUE), PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_CONTINUE_STYLE);
            label.anchor.set(0, 0.5);
            label.position.set(sprite.width + 5, sprite.height * 0.5);
            container.addChild(sprite, label);
            container.pivot.set(container.width * 0.5, 0);
            container.position.set(button.width * 0.5, button.height + 5);
            button.addChild(container);
        }
    }
    updateLayout(center, width) {
        if (center) {
            GuiLayout_1.GuiLayout.align([this.title, this.titleValue], 10, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.align(this.buttons, 25, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.align([this.textContainer, this.buttonsContainer], 10, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
            this.buttonsContainer.position.x = (width - this.buttonsContainer.width) * 0.5;
        }
        else {
            GuiLayout_1.GuiLayout.align([this.title, this.titleValue], 10, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.align(this.buttons, 5, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
            GuiLayout_1.GuiLayout.align([this.textContainer, this.buttonsContainer], 10, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
            this.buttonsContainer.position.x = 0;
        }
    }
    getSelection() {
        return this.selection;
    }
    setTitleValue(value) {
        this.titleValue.text = value;
    }
    select(index) {
        this.skipSound = true;
        this.buttons[index].virtualClick();
    }
    buttonClicked(clickedButton) {
        if (this._enabled) {
            if (!this.skipSound) {
                NolimitPromotionPlugin_1.NolimitPromotionPlugin.sound.playKeypadEffect("click");
            }
            this.skipSound = false;
            if (!clickedButton.toggled) {
                clickedButton.toggled = true;
                for (let btn of this.buttons) {
                    if (btn != clickedButton) {
                        btn.toggled = false;
                    }
                }
                this.selection = clickedButton.data;
                this.stateChangeCallback(this);
            }
            else {
                if (this.deselectable) {
                    clickedButton.toggled = false;
                    this.selection = undefined;
                    this.stateChangeCallback(this);
                }
            }
        }
    }
}
exports.GameOptionSelectorComponent = GameOptionSelectorComponent;
//# sourceMappingURL=GameOptionSelectorComponent.js.map