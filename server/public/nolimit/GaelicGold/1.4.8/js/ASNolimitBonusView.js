"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASNolimitBonusView = void 0;
/**
 * Created by jonas on 2024-02-29.
 */
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const BuyFeatureButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/BuyFeatureButton");
const GuiDefaultTextures_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaultTextures");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
class ASNolimitBonusView extends PIXI.Container {
    constructor(asController) {
        super();
        this.onFeatureBtnClick = (btn) => {
            this.setFeature(btn.name);
        };
        this.asController = asController;
        let datas = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betFeatureController.getAllowedFeatures();
        this.buttons = [];
        this.bonusButtons = [];
        this.boosterButtons = [];
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
        }
        this._backgroundPlate = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.PLATE_BASE_20), 20, 20, 20, 20);
        this._backgroundPlate.alpha = 1;
        this._backgroundPlate.tint = 0xEE2653;
        this._backgroundPlate.width = 350;
        this._backgroundPlate.height = 200;
        this._backgroundPlate.position.set(0, 0);
        this.contentContainer = this.createContent();
        this.addChild(this._backgroundPlate, this.contentContainer);
        const buttonsWidth = this.contentContainer.width + 30;
        if (buttonsWidth > 633) {
            let scale = 633 / buttonsWidth;
            this.contentContainer.scale.set(scale, scale);
        }
        this.boxSize = new PIXI.Point(this.contentContainer.width + 30, this.contentContainer.height + 35);
        this.boxSize.x = Math.max(this.boxSize.x, 280);
        this._backgroundPlate.width = this.boxSize.x;
        this._backgroundPlate.height = this.boxSize.y;
        const contentX = Math.floor((this.boxSize.x - this.contentContainer.width) * 0.5);
        this.contentContainer.position.set(contentX, 15);
        if (datas.length <= 0) {
            this.visible = false;
        }
    }
    createContent() {
        const bonusContainer = new PIXI.Container();
        const boosterContainer = new PIXI.Container();
        if (this.bonusButtons.length > 0) {
            const buttonsContainer = new PIXI.Container();
            buttonsContainer.addChild(...this.bonusButtons);
            ASNolimitBonusView.gridLayout(this.bonusButtons, 7, 18);
            this.bonusHeader = this.createHeader("Nolimit Bonus", ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BONUS_ICON));
            bonusContainer.addChild(this.bonusHeader, buttonsContainer);
            this.bonusHeader.scale.set(0.5, 0.5);
            this.bonusHeader.position.set(buttonsContainer.width * 0.5, 0);
            buttonsContainer.position.set(0, this.bonusHeader.height + 10);
        }
        if (this.boosterButtons.length > 0) {
            const buttonsContainer = new PIXI.Container();
            buttonsContainer.addChild(...this.boosterButtons);
            ASNolimitBonusView.gridLayout(this.boosterButtons, 7, 18);
            this.boosterHeader = this.createHeader("Nolimit Booster", ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BOOSTER_ICON));
            boosterContainer.addChild(this.boosterHeader, buttonsContainer);
            this.boosterHeader.scale.set(0.5, 0.5);
            this.boosterHeader.position.set(buttonsContainer.width * 0.5, 0);
            buttonsContainer.position.set(0, this.boosterHeader.height + 10);
        }
        if (this.bonusButtons.length > 0 && this.boosterButtons.length > 0) {
            GuiLayout_1.GuiLayout.align([bonusContainer, boosterContainer], 20, GuiLayout_1.Align.LEFT, GuiLayout_1.Direction.VERTICAL);
        }
        const container = new PIXI.Container();
        container.addChild(bonusContainer, boosterContainer);
        //Re center headers
        if (this.bonusHeader) {
            this.bonusHeader.position.set(Math.floor(container.width * 0.5), 0);
        }
        if (this.boosterHeader) {
            this.boosterHeader.position.set(Math.floor(container.width * 0.5), 0);
        }
        return container;
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
    updateBonusButtonStates() {
        const activeBetFeature = this.asController.selectedFeatureBet;
        for (let button of this.buttons) {
            if ((activeBetFeature === null || activeBetFeature === void 0 ? void 0 : activeBetFeature.name) == button.name) {
                button.toggled = true;
            }
            else {
                button.toggled = false;
            }
        }
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
    createBetFeatureBtn(data) {
        let style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 20;
        const btn = new BuyFeatureButton_1.BuyFeatureButton(data);
        btn.addClickCallback(() => this.onFeatureBtnClick(btn));
        btn.toggled = false;
        btn.enable(true);
        return btn;
    }
    updateBetLevel(betLevel) {
        const betLevelNumber = parseFloat(betLevel);
        const activeBetFeature = this.asController.selectedFeatureBet;
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
    }
    setFeature(name) {
        var _a;
        if (((_a = this.asController.selectedFeatureBet) === null || _a === void 0 ? void 0 : _a.name) == name) {
            this.asController.setFeatureBet();
            return;
        }
        const features = NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.betFeatureController.getAllowedFeatures();
        let selectedFeature = undefined;
        for (let feature of features) {
            if (feature.name == name) {
                selectedFeature = feature;
                break;
            }
        }
        this.asController.setFeatureBet(selectedFeature);
    }
}
exports.ASNolimitBonusView = ASNolimitBonusView;
//# sourceMappingURL=ASNolimitBonusView.js.map