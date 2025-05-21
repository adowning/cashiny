"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitBonusMenu = void 0;
/**
 * Created by jonas on 2024-01-18.
 */
const SlotKeypad_1 = require("../../../SlotKeypad");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const SkinLoader_1 = require("../../../SkinLoader");
const GuiDefaultTextures_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaultTextures");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const IconButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconButton");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const SlotKeypadViewSettings_1 = require("../../SlotKeypadViewSettings");
const MiniBetSelector_1 = require("./MiniBetSelector");
const APIEventSystem_1 = require("@nolimitcity/slot-launcher/bin/interfaces/APIEventSystem");
const SelectedBuyFeatureButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/SelectedBuyFeatureButton");
const BuyFeatureButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/BuyFeatureButton");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
class NolimitBonusMenu extends PIXI.Container {
    constructor(controller, clickerContainer) {
        super();
        this.isOpen = false;
        this.boxSize = new PIXI.Point();
        this.onMiniTicketClick = (subBtn) => {
            if (this._interactionEnabled) {
                if (subBtn == "open") {
                    this._controller.openNolimitBonusMenu();
                    SlotKeypad_1.SlotKeypad.playButtonSound("MiniTicket");
                }
                else {
                    this.setFeature();
                    SlotKeypad_1.SlotKeypad.playButtonSound("RemoveSelectedFeature");
                }
            }
        };
        this.onOpenClick = (event) => {
            if (this._interactionEnabled) {
                this._controller.openNolimitBonusMenu();
            }
        };
        this.onCloseClick = (event) => {
            if (this._interactionEnabled) {
                this._controller.closeNolimitBonusMenu();
                if (event == undefined) {
                    //The event only comes from the fullscreen click thing
                    SlotKeypad_1.SlotKeypad.playButtonSound("NLBonusMenu_" + this.closeButton.name);
                }
            }
        };
        this.onFeatureBtnClick = (btn) => {
            if (this._interactionEnabled) {
                SlotKeypad_1.SlotKeypad.playButtonSound("NLBonusMenu_" + btn.name);
                this.setFeature(btn.name);
            }
        };
        this.updateState = () => {
            const activeBetFeature = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature();
            if (this.isOpen) {
                for (let button of this.buttons) {
                    if ((activeBetFeature === null || activeBetFeature === void 0 ? void 0 : activeBetFeature.name) == button.name) {
                        button.toggled = true;
                    }
                    else {
                        button.toggled = false;
                    }
                }
            }
            else {
                this.selectVisibleButtonWhenClosed();
            }
        };
        this._controller = controller;
        this._clickerParent = clickerContainer;
        this.name = "NolimitBonusMenu";
        this._miniBetSelector = new MiniBetSelector_1.MiniBetSelector(this._controller);
        let normalNonEmphasisColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalNonEmphasisPointerStateColors.clone();
        let onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.NOLIMIT_BONUS_BTN)));
        this._nolimitBonusButton = new IconButton_1.IconButton(SlotKeypad_1.KeypadButtonIDs.NOLIMIT_BONUS_MENU, onIcons, normalNonEmphasisColors);
        this._nolimitBonusButton.addClickCallback(() => this._controller.buttonClick(this._nolimitBonusButton));
        this._nolimitBonusButton.enable(true);
        this._nolimitBonusButton.pivot.set(this._nolimitBonusButton.width * 0.5, this._nolimitBonusButton.height * 0.5);
        this._miniTicketContainer = new PIXI.Container();
        this._fullscreenClick = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this._fullscreenClick.name = "clickOutSide";
        this._fullscreenClick.interactive = true;
        this._fullscreenClick.buttonMode = true;
        this._fullscreenClick.on('pointerup', this.onCloseClick);
        this.popUpMenu = new PIXI.Container();
        this.popUpMenu.name = "popUpMenu";
        let datas = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures();
        this.buttons = [];
        this.bonusButtons = [];
        this.boosterButtons = [];
        this._miniTickets = new Map();
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            const btn = this.createBetFeatureBtn(data);
            this.buttons.push(btn);
            if (data.type === "FREESPIN") {
                this.bonusButtons.push(btn);
            }
            else {
                this.boosterButtons.push(btn);
            }
            const miniTicket = new SelectedBuyFeatureButton_1.SelectedBuyFeatureButton(data.name, this.onMiniTicketClick);
            miniTicket.pivot.set(miniTicket.width * 0.5, miniTicket.height * 0.5);
            miniTicket.enable(true);
            this._miniTickets.set(data.name, miniTicket);
        }
        this.contentContainer = this.createContent();
        this._backgroundPlate = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_BASE_20), 20, 20, 20, 20);
        this._backgroundPlate.alpha = 1;
        this._backgroundPlate.tint = 0xEE2653;
        this._backgroundPlate.width = 350;
        this._backgroundPlate.height = 200;
        this._backgroundPlate.position.set(0, 0);
        this._shadowPlate = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_BASE_20_BLUR_40), 60, 60, 60, 60);
        this._shadowPlate.alpha = 1;
        this._shadowPlate.tint = 0x000000;
        this._shadowPlate.width = 350;
        this._shadowPlate.height = 200;
        this._shadowPlate.position.set(0, 0);
        this._backgroundStroke = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_STROKE_20), 20, 20, 20, 20);
        this._backgroundStroke.alpha = 1;
        this._backgroundStroke.tint = 0x9b1b43;
        this._backgroundStroke.width = 350;
        this._backgroundStroke.height = 200;
        this._backgroundStroke.position.set(0, 0);
        this._backgroundStroke.interactive = true;
        const icon = new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BONUS_CLOSE_BUTTON));
        this.closeButton = new IconButton_1.IconButton("close", new PointerStateIconSet_1.PointerStateIconSet(icon, icon, icon, icon), normalNonEmphasisColors);
        this.closeButton.enable(true);
        this.closeButton.addClickCallback(this.onCloseClick);
        this.closeButton.scale.set(0.5, 0.5);
        this.arrow = new PIXI.Container();
        const arrow = new PIXI.Sprite(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.BONUS_ARROW));
        const arrowStroke = new PIXI.Sprite(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.BONUS_ARROW_STROKE));
        arrow.tint = 0xEE2653;
        arrowStroke.tint = 0x9b1b43;
        this.arrow.addChild(arrow, arrowStroke);
        this.arrow.pivot.set(this.arrow.width * 0.5, 1);
        this.popUpMenu.addChild(this._shadowPlate, this._backgroundPlate, this._backgroundStroke, this.arrow, this.contentContainer, this.closeButton);
        SlotKeypad_1.SlotKeypad.apiPlugIn.events.on(APIEventSystem_1.APIEvent.SELECTED_FEATURE_BET_CHANGED, this.updateState);
        this.addChild(this._nolimitBonusButton, this._miniTicketContainer);
    }
    createHeader(headerText, iconTexture) {
        const container = new PIXI.Container();
        const headerStyle = new PIXI.TextStyle({
            fill: "#ffffff",
            fontFamily: OpenSans_1.OpenSans.FAMILY,
            fontSize: 50,
            fontStyle: FontStatics_1.FontStyle.NORMAL,
            fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
            dropShadow: true,
            dropShadowAngle: -1,
            dropShadowDistance: -3,
            dropShadowColor: "#b62449",
            padding: 50
        });
        const headerIcon = new PIXI.Sprite(iconTexture);
        const headerLabel = new Label_1.Label(headerText, headerStyle);
        headerLabel.position.set(headerIcon.width + 10, 0);
        container.addChild(headerIcon, headerLabel);
        container.pivot.set(container.width * 0.5, 0);
        return container;
    }
    enable(value) {
        this._interactionEnabled = value;
        this._nolimitBonusButton.enable(value);
    }
    setVisible(value) {
        this._nolimitBonusButton.visible = value;
    }
    hideForGamble() {
        this._prevButtonVisibility = this._nolimitBonusButton.visible;
        this._prevMiniTicketVisibility = this._miniTicketContainer.visible;
        this.setVisible(false);
        this._miniTicketContainer.visible = false;
    }
    showForGamble() {
        this.setVisible(this._prevButtonVisibility || true);
        this._miniTicketContainer.visible = this._prevMiniTicketVisibility;
    }
    setFeature(name) {
        const activeBetFeature = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature();
        if (name != undefined && (activeBetFeature === null || activeBetFeature === void 0 ? void 0 : activeBetFeature.name) != name) {
            if (SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.shouldShowWarningPopUp(name)) {
                SlotKeypad_1.SlotKeypad.showConfirmFeatureBetPopUp(name).then((data) => {
                    if (data.confirmed) {
                        SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.setActiveBetFeature(name);
                        if (data.dontShowNextTime) {
                            SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.dontShowWarningNextTime(name);
                        }
                    }
                    else {
                        SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.setActiveBetFeature();
                    }
                });
            }
            else {
                SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.setActiveBetFeature(name);
            }
        }
        else {
            SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.setActiveBetFeature();
        }
    }
    createBetFeatureBtn(data) {
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 20;
        const btn = new BuyFeatureButton_1.BuyFeatureButton(data);
        btn.addClickCallback(() => this.onFeatureBtnClick(btn));
        btn.toggled = false;
        btn.enable(true);
        return btn;
    }
    createContent() {
        const container = new PIXI.Container();
        const bonusContainer = new PIXI.Container();
        const boosterContainer = new PIXI.Container();
        if (this.bonusButtons.length > 0) {
            const buttonsContainer = new PIXI.Container();
            buttonsContainer.addChild(...this.bonusButtons);
            NolimitBonusMenu.gridLayout(this.bonusButtons, 11, 20);
            this.bonusHeader = this.createHeader("Nolimit Bonus", SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BONUS_ICON));
            bonusContainer.addChild(this.bonusHeader, buttonsContainer);
            this.bonusHeader.scale.set(0.5, 0.5);
            this.bonusHeader.position.set(buttonsContainer.width * 0.5, 0);
            buttonsContainer.position.set(0, this.bonusHeader.height + 10);
            container.addChild(bonusContainer);
        }
        if (this.boosterButtons.length > 0) {
            const buttonsContainer = new PIXI.Container();
            buttonsContainer.addChild(...this.boosterButtons);
            NolimitBonusMenu.gridLayout(this.boosterButtons, 11, 20);
            this.boosterHeader = this.createHeader("Nolimit Booster", SkinLoader_1.SkinLoader.getTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BOOSTER_ICON));
            boosterContainer.addChild(this.boosterHeader, buttonsContainer);
            this.boosterHeader.scale.set(0.5, 0.5);
            this.boosterHeader.position.set(buttonsContainer.width * 0.5, 0);
            buttonsContainer.position.set(0, this.boosterHeader.height + 10);
            container.addChild(boosterContainer);
        }
        if (this.bonusButtons.length > 0 && this.boosterButtons.length > 0) {
            GuiLayout_1.GuiLayout.align([bonusContainer, boosterContainer], 20, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
        }
        //Re center headers
        if (this.bonusHeader) {
            this.bonusHeader.position.set(Math.floor(container.width * 0.5), 0);
        }
        if (this.boosterHeader) {
            this.boosterHeader.position.set(Math.floor(container.width * 0.5), 0);
        }
        return container;
    }
    calculateSize() {
        this.popUpMenu.scale.set(1, 1);
        this.boxSize = new PIXI.Point(this.contentContainer.width + 30, this.contentContainer.height + 35);
        this.boxSize.x = Math.max(this.boxSize.x, 280);
        this._shadowPlate.width = this.boxSize.x;
        this._shadowPlate.height = this.boxSize.y;
        this._shadowPlate.position.y = 10;
        this._backgroundPlate.width = this.boxSize.x;
        this._backgroundPlate.height = this.boxSize.y;
        this._backgroundStroke.width = this.boxSize.x;
        this._backgroundStroke.height = this.boxSize.y;
        //this.contentContainer.position.set(15, 15);
        const contentX = Math.floor((this.boxSize.x - this.contentContainer.width) * 0.5);
        this.contentContainer.position.set(contentX, 15);
        this.closeButton.position.set(Math.floor(this.boxSize.x - this.closeButton.width + 10), -10);
        this.onResize();
    }
    onOrientationChanged() {
    }
    onResize() {
        this.popUpMenu.scale.set(1, 1);
        this._fullscreenClick.width = NolimitApplication_1.NolimitApplication.screenBounds.width;
        this._fullscreenClick.height = NolimitApplication_1.NolimitApplication.screenBounds.height;
        this._fullscreenClick.position.set(NolimitApplication_1.NolimitApplication.screenBounds.left, NolimitApplication_1.NolimitApplication.screenBounds.top);
        const spinCenter = SlotKeypad_1.SlotKeypad.self.getSpinButtonCenter();
        let bonusCenter = new PIXI.Point();
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            bonusCenter.set(spinCenter.x, spinCenter.y - 160);
            this._nolimitBonusButton.position.set(bonusCenter.x, bonusCenter.y);
            this._miniTicketContainer.position.set(bonusCenter.x + 5, bonusCenter.y + 20);
            this.setPivotByAnchorPoint(this._miniBetSelector, 0.5, 0.5);
            this._miniBetSelector.position.set(bonusCenter.x, bonusCenter.y - 20);
            this.arrow.angle = -90;
            this.arrow.position.set(bonusCenter.x - 130, bonusCenter.y);
            this.popUpMenu.pivot.set(this.boxSize.x, this.boxSize.y * 0.5);
            if (this.buttons.length < 4) {
                this.popUpMenu.position.set(this.arrow.x + 2, this.arrow.y);
            }
            else {
                this.popUpMenu.position.set(this.arrow.x + 2, 350);
            }
        }
        else {
            bonusCenter.set(spinCenter.x + 160, spinCenter.y);
            this._nolimitBonusButton.position.set(bonusCenter.x, bonusCenter.y - 24);
            this._miniTicketContainer.position.set(bonusCenter.x + 40, bonusCenter.y - 32);
            this.setPivotByAnchorPoint(this._miniBetSelector, 0.5, 0.5);
            this._miniBetSelector.position.set(bonusCenter.x + 60, bonusCenter.y);
            this.arrow.angle = 0;
            this.arrow.position.set(bonusCenter.x, bonusCenter.y - 110);
            this.popUpMenu.pivot.set(this.boxSize.x * 0.5, this.boxSize.y);
            this.popUpMenu.position.set(360, this.arrow.y + 2);
        }
        this.floorPoint(this.popUpMenu.pivot);
        this.floorPoint(this.popUpMenu.position);
        this.floorPoint(this.arrow.pivot);
        this.floorPoint(this.arrow.position);
        //Check scale
        let calculatedRatios = new PIXI.Point(1, 1);
        if (NolimitApplication_1.NolimitApplication.isLandscape) {
            const arrowDistance = NolimitApplication_1.NolimitApplication.screenBounds.right - this.arrow.x;
            calculatedRatios = new PIXI.Point(Math.min(1, (NolimitApplication_1.NolimitApplication.screenBounds.width - arrowDistance) / this.popUpMenu.width), Math.min(1, (NolimitApplication_1.NolimitApplication.screenBounds.height - 30) / this.popUpMenu.height));
        }
        else {
            const arrowDistance = NolimitApplication_1.NolimitApplication.screenBounds.bottom - this.arrow.y;
            calculatedRatios = new PIXI.Point(Math.min(1, NolimitApplication_1.NolimitApplication.screenBounds.width / this.popUpMenu.width), Math.min(1, (NolimitApplication_1.NolimitApplication.screenBounds.height - arrowDistance) / this.popUpMenu.height));
        }
        const scale = Math.min(calculatedRatios.x, calculatedRatios.y);
        this.popUpMenu.scale.set(scale, scale);
        //Prevent the pop-up to be disconnected from arrow.
        if (!NolimitApplication_1.NolimitApplication.isLandscape) {
            const menuXPos = Math.max(360, (this.arrow.x + 50) - this.popUpMenu.width * 0.5);
            this.popUpMenu.position.set(menuXPos, this.arrow.y + 2);
            /*if(this.popUpMenu.width <= 320) {
                this.popUpMenu.position.set(this.arrow.x, this.arrow.y + 2)
            }*/
        }
        //Prevents the pop-up to stick out of screen on top in landscape.
        // this.popUpMenu.position.y = this.popUpMenu.position.y + Math.max(this.popUpMenu.height * 0.5 - this.popUpMenu.position.y, 0);
    }
    static gridLayout(objects, marginH, marginV) {
        //Find largest size
        let largestWidth = 0;
        let largestHeight = 0;
        for (let obj of objects) {
            const bounds = obj.getBounds();
            largestWidth = bounds.width > largestWidth ? bounds.width : largestWidth;
            largestHeight = bounds.height > largestHeight ? bounds.height : largestHeight;
        }
        let maxButtonsInRow = 3;
        if (objects.length == 4) {
            //two rows x 2 cols
            maxButtonsInRow = 2;
        }
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            obj.x = Math.floor(i % maxButtonsInRow) * largestWidth;
            obj.y = Math.floor(i / maxButtonsInRow) * largestHeight;
            if (obj.x > 0) {
                obj.x += marginH * Math.floor(i % maxButtonsInRow);
            }
            if (obj.y > 0) {
                obj.y += marginV * Math.floor(i / maxButtonsInRow);
            }
        }
    }
    open() {
        this.isOpen = true;
        this.setFeature();
        this.updateState();
        this.updateBetLevel(SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.getLevel());
        this.calculateSize();
        this._clickerParent.addChild(this._fullscreenClick);
        this.addChild(this.popUpMenu);
        this.addChild(this.arrow);
        this.addChild(this._miniBetSelector);
        this._nolimitBonusButton.visible = false;
        this._miniTicketContainer.removeChildren();
        this.onResize();
    }
    close() {
        this._clickerParent.removeChild(this._fullscreenClick);
        this.removeChild(this.popUpMenu);
        this.removeChild(this.arrow);
        this.removeChild(this._miniBetSelector);
        this.selectVisibleButtonWhenClosed();
        this.isOpen = false;
    }
    selectVisibleButtonWhenClosed() {
        const activeBetFeature = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature();
        if (activeBetFeature && this._miniTickets.has(activeBetFeature.name)) {
            this._miniTicketContainer.addChild(this._miniTickets.get(activeBetFeature.name));
            this._miniTicketContainer.visible = true;
            this._nolimitBonusButton.visible = false;
        }
        else {
            this._miniTicketContainer.removeChildren();
            this._miniTicketContainer.visible = false;
            this._nolimitBonusButton.visible = true;
        }
    }
    updateBetLevel(betLevel) {
        if (this.isOpen) {
            const betLevelNumber = parseFloat(betLevel);
            const activeBetFeature = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getActiveBetFeature();
            for (let button of this.buttons) {
                const validBet = button.updateCostAndValidate(betLevelNumber);
                if (!validBet) {
                    button.enable(false);
                    if (button.featureData.name == (activeBetFeature === null || activeBetFeature === void 0 ? void 0 : activeBetFeature.name)) {
                        this.setFeature();
                    }
                }
                else {
                    button.enable(true);
                }
            }
            this._miniBetSelector.updateBetLevel(betLevel);
        }
    }
    setPivotByAnchorPoint(target, x, y) {
        target.pivot.set(target.width * x, target.height * y);
    }
    floorPoint(p) {
        p.x = Math.floor(p.x);
        p.y = Math.floor(p.y);
    }
}
exports.NolimitBonusMenu = NolimitBonusMenu;
//# sourceMappingURL=NolimitBonusMenu.js.map