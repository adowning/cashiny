"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalWindow = void 0;
/**
 * Created by jonas on 2024-04-19.
 */
const ImgLoader_1 = require("../../loader/ImgLoader");
const GuiDefaultTextures_1 = require("../default/GuiDefaultTextures");
const PointerStateColorSet_1 = require("../buttons/states/sets/PointerStateColorSet");
const OpenSans_1 = require("../../loader/font/OpenSans");
const FontStatics_1 = require("../../loader/font/FontStatics");
const LabelButton_1 = require("../buttons/LabelButton");
const NolimitApplication_1 = require("../../NolimitApplication");
const GuiLayout_1 = require("../utils/GuiLayout");
const GuiDefaults_1 = require("../default/GuiDefaults");
const CheckBoxButton_1 = require("../buttons/concretebuttons/CheckBoxButton");
class ModalWindow extends PIXI.Container {
    constructor(name, buttonConfigs, customContent, useDontShowAgainCheckbox) {
        super();
        this.dontShowAgainChecked = false;
        this.name = "name";
        this.init(buttonConfigs, customContent, useDontShowAgainCheckbox);
        this.onResize();
    }
    onResize() {
        this.position.set(NolimitApplication_1.NolimitApplication.screenBounds.left, NolimitApplication_1.NolimitApplication.screenBounds.top);
        this._screenCover.width = NolimitApplication_1.NolimitApplication.screenBounds.width;
        this._screenCover.height = NolimitApplication_1.NolimitApplication.screenBounds.height;
        const popupY = NolimitApplication_1.NolimitApplication.isLandscape ? 0 : NolimitApplication_1.NolimitApplication.screenBounds.height - this._modalBackground.height;
        this._modalBackground.position.set(NolimitApplication_1.NolimitApplication.screenBounds.width * 0.5, popupY * 0.5);
    }
    init(buttonConfigs, customContent, useDontShowAgainCheckbox = false) {
        this._screenCover = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._screenCover.tint = 0;
        this._screenCover.alpha = 0.6;
        this._screenCover.interactive = true;
        this._screenCover.name = "_screenCover";
        this._modalBackground = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.MODAL_BACKGROUND), 64, 64, 64, 64);
        this._modalBackground.width = 640;
        this._modalBackground.height = 700;
        this._modalBackground.pivot.set(this._modalBackground.width * 0.5, 0);
        this._modalBackground.name = "_modalBackground";
        this.mainContentContainer = new PIXI.Container();
        this.mainContentContainer.name = "mainContentContainer";
        this.mainContentContainer.position.set(50, 36);
        this._contentMaxWidth = 540;
        this._contentMaxHeight = 630;
        this._customContentContainer = new PIXI.Container();
        this._customContentContainer.name = "_customContentContainer";
        this._customContentContainer.addChild(customContent);
        this._defaultContent = new PIXI.Container();
        this._defaultContent.name = "_defaultContent";
        const buttons = this.createButtons(buttonConfigs);
        buttons.name = "buttons";
        buttons.position.set(0, 490);
        let dontShowAgain = new PIXI.Container();
        dontShowAgain.name = "dontShowAgain";
        if (useDontShowAgainCheckbox) {
            dontShowAgain.addChild(this.createDontShowAgain());
        }
        GuiLayout_1.GuiLayout.align([dontShowAgain, buttons], 10, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.VERTICAL);
        this._defaultContent.addChild(dontShowAgain, buttons);
        this._defaultContent.position.set(Math.floor(this._contentMaxWidth * 0.5 - this._defaultContent.width * 0.5), this._contentMaxHeight - this._defaultContent.height - 30);
        this._customContentContainer.position.set(this._contentMaxWidth * 0.5, (this._defaultContent.y - this._customContentContainer.height) * 0.5);
        this.mainContentContainer.addChild(this._customContentContainer, this._defaultContent);
        this._modalBackground.addChild(this.mainContentContainer);
        this.addChild(this._screenCover, this._modalBackground);
    }
    createButtons(buttonConfigs) {
        const btnContainer = new PIXI.Container();
        const buttons = [];
        let maxSize = 130;
        for (let conf of buttonConfigs) {
            let normalNonEmphasisColors = new PointerStateColorSet_1.PointerStateColorSet(0xFF000000, 0xFF000000, 0xFF000000, 0x33000000);
            let activeColors = new PointerStateColorSet_1.PointerStateColorSet(0xFF000000, 0xFF000000, 0xFF000000, 0x33000000);
            let style = ModalWindow.BUTTON_TEXT_STYLE;
            const button = new LabelButton_1.LabelButton(conf.id, NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate(conf.label), style, activeColors, normalNonEmphasisColors);
            button.resizeButtonToLabelWithMargin(10, 10, 10, 10);
            button.enable(true);
            button.addClickCallback(() => {
                conf.clickCallback(this, conf.id);
            });
            btnContainer.addChild(button);
            buttons.push(button);
            if (button.width > maxSize) {
                maxSize = button.width;
            }
        }
        //Making all buttons same size.
        for (let button of buttons) {
            button.setSize(maxSize, button.height);
        }
        GuiLayout_1.GuiLayout.align(buttons, 30, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
        return btnContainer;
    }
    createDontShowAgain() {
        let activeColors = new PointerStateColorSet_1.PointerStateColorSet(0xFF000000, 0xFF000000, 0xFF000000, 0x33000000);
        const radioStyle = GuiDefaults_1.GuiDefaults.DEFAULT_CHECKBOX_BUTTON_LABEL.clone();
        radioStyle.padding = 20;
        radioStyle.fill = "#000000";
        const checkBox = new CheckBoxButton_1.CheckBoxButton("dontShow", NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("Don't show again"), radioStyle, activeColors, activeColors);
        checkBox.toggled = false;
        checkBox.enable(true);
        checkBox.addClickCallback(() => {
            checkBox.toggled = !checkBox.toggled;
            this.dontShowAgainChecked = checkBox.toggled;
        });
        return checkBox;
    }
    open() {
        NolimitApplication_1.NolimitApplication.addLayer(this.name, this);
    }
    close() {
        NolimitApplication_1.NolimitApplication.removeLayer(this.name);
    }
}
ModalWindow.BUTTON_TEXT_STYLE = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 38,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 59
});
exports.ModalWindow = ModalWindow;
//# sourceMappingURL=ModalWindow.js.map