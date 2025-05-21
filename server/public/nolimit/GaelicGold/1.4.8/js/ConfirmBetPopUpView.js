"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmBetPopUpView = void 0;
const LabelButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/LabelButton");
const SkinLoader_1 = require("../../../../SkinLoader");
const SlotKeypad_1 = require("../../../../SlotKeypad");
const SlotKeypadViewSettings_1 = require("../../../SlotKeypadViewSettings");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const BonusBuyPopUpContent_1 = require("./BonusBuyPopUpContent");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const CheckBoxButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/CheckBoxButton");
/**
 * Created by jonas on 2023-09-13.
 */
class ConfirmBetPopUpView extends PIXI.Container {
    get isOpen() {
        return this.visible;
    }
    constructor() {
        super();
        this.init();
    }
    resize() {
        this.position.set(NolimitApplication_1.NolimitApplication.screenBounds.left, NolimitApplication_1.NolimitApplication.screenBounds.top);
        this._background.width = NolimitApplication_1.NolimitApplication.screenBounds.width;
        this._background.height = NolimitApplication_1.NolimitApplication.screenBounds.height;
        const popupY = NolimitApplication_1.NolimitApplication.isLandscape ? 0 : NolimitApplication_1.NolimitApplication.screenBounds.height - this._popUpPlate.height;
        this._popUpPlate.position.set(NolimitApplication_1.NolimitApplication.screenBounds.width * 0.5, popupY * 0.5);
    }
    buttonClicked(btn) {
        SlotKeypad_1.SlotKeypad.playButtonSound(btn.name);
        if (this._buttonClickCallback) {
            this._buttonClickCallback(btn.name);
        }
    }
    open(name) {
        return new Promise((resolve, reject) => {
            const featureData = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getFeatureData(name);
            if (!featureData) {
                throw new Error("Feature does not exist");
            }
            let content = new BonusBuyPopUpContent_1.BonusBuyPopUpContent(featureData);
            if (featureData.displayConfig.replacePopUpContent) {
                content = featureData.displayConfig.replacePopUpContent(content);
            }
            this._contentContainer.addChild(content);
            this.show();
            this._buttonClickCallback = (name) => {
                const data = {
                    confirmed: false,
                    dontShowNextTime: this.checkBox.toggled
                };
                if (name == "ok") {
                    data.confirmed = true;
                }
                this.close();
                resolve(data);
            };
        });
    }
    close() {
        this._contentContainer.removeChildren();
        this.hide();
    }
    init() {
        this._background = new PIXI.Sprite(PIXI.Texture.WHITE);
        this._background.tint = 0;
        this._background.alpha = 0.6;
        this._background.interactive = true;
        this._background.name = "_background";
        this._popUpPlate = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.CONFIRM_POP_UP), 64, 64, 64, 64);
        this._popUpPlate.width = 640;
        this._popUpPlate.height = 700;
        this._popUpPlate.pivot.set(this._popUpPlate.width * 0.5, 0);
        this._popUpPlate.name = "_popUpPlate";
        this.mainContainer = new PIXI.Container();
        this.mainContainer.position.set(50, 30);
        this.mainWidth = 540;
        const buttons = this.createButtons();
        buttons.position.set(0, 490);
        this._contentContainer = new PIXI.Container();
        this._contentContainer.name = "content";
        this._contentContainer.position.set(this.mainWidth * 0.5, 50);
        this.mainContainer.addChild(buttons, this._contentContainer);
        this._popUpPlate.addChild(this.mainContainer);
        this.addChild(this._background, this._popUpPlate);
        this.close();
    }
    createButtons() {
        const buttons = new PIXI.Container();
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let activeColors = new PointerStateColorSet_1.PointerStateColorSet(0xFF000000, 0xFF000000, 0xFF000000, 0x33000000);
        let style = ConfirmBetPopUpView.GAME_FEATURE_OK_TEXT;
        this._cancelButton = new LabelButton_1.LabelButton("cancel", SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("CANCEL"), style, activeColors, normalNonEmphasisColors);
        this._cancelButton.resizeButtonToLabelWithMargin(10, 10, 10, 10);
        this._cancelButton.enable(true);
        this._cancelButton.addClickCallback(() => {
            this.buttonClicked(this._cancelButton);
        });
        this._okButton = new LabelButton_1.LabelButton("ok", SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("OK"), style, activeColors, normalNonEmphasisColors);
        this._okButton.resizeButtonToLabelWithMargin(10, 10, 10, 10);
        this._okButton.enable(true);
        this._okButton.addClickCallback(() => {
            this.buttonClicked(this._okButton);
        });
        const maxSize = Math.max(this._cancelButton.width, this._okButton.width);
        this._cancelButton.setSize(maxSize, this._cancelButton.height);
        this._okButton.setSize(maxSize, this._okButton.height);
        this._okButton.pivot.set(0, 0);
        this._cancelButton.pivot.set(0, 0);
        const radioStyle = GuiDefaults_1.GuiDefaults.DEFAULT_CHECKBOX_BUTTON_LABEL.clone();
        radioStyle.padding = 20;
        radioStyle.fill = "#000000";
        this.checkBox = new CheckBoxButton_1.CheckBoxButton("dontShow", SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate("Don't show again"), radioStyle, activeColors, activeColors);
        this.checkBox.toggled = false;
        this.checkBox.enable(true);
        this.checkBox.addClickCallback(() => {
            this.checkBox.toggled = !this.checkBox.toggled;
        });
        this.checkBox.position.set(Math.floor((this.mainWidth - this.checkBox.width) * 0.5), 0);
        const okCancleBtns = new PIXI.Container();
        okCancleBtns.addChild(this._cancelButton, this._okButton);
        GuiLayout_1.GuiLayout.align([this._cancelButton, this._okButton], 30, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.HORIZONTAL);
        okCancleBtns.position.set((this.mainWidth - okCancleBtns.width) * 0.5, 50);
        buttons.addChild(this.checkBox, okCancleBtns);
        return buttons;
    }
    show() {
        this.resize();
        this.checkBox.toggled = false;
        this.visible = true;
        this._background.alpha = 0.6;
    }
    hide() {
        this.visible = false;
    }
}
ConfirmBetPopUpView.GAME_FEATURE_OK_TEXT = new PIXI.TextStyle({
    fill: "#000000",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 38,
    fontStyle: FontStatics_1.FontStyle.ITALIC,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    padding: 59
});
exports.ConfirmBetPopUpView = ConfirmBetPopUpView;
//# sourceMappingURL=ConfirmBetPopUpView.js.map