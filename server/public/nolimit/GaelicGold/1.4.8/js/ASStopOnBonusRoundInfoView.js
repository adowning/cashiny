"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASStopOnBonusRoundInfoView = void 0;
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const PromoPanelAssetConfig_1 = require("../../../config/PromoPanelAssetConfig");
const PromoPanelButtonIDs_1 = require("../../../enums/PromoPanelButtonIDs");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelTextStyles_1 = require("../../../config/PromoPanelTextStyles");
const PromoPanelLabelIDs_1 = require("../../../enums/PromoPanelLabelIDs");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const GameOptionSelectorComponent_1 = require("../subViews/GameOptionSelectorComponent");
class ASStopOnBonusRoundInfoView extends PIXI.Container {
    constructor(controller, featureName, nextMode) {
        super();
        this.createInfo(featureName);
        this.createPlayInGameBtn(controller);
        const actionSpinOptions = NolimitPromotionPlugin_1.NolimitPromotionPlugin.ASOptionsData;
        if (actionSpinOptions.bonusGame && actionSpinOptions.bonusGame.pickNeededForModes.indexOf(nextMode) > -1) {
            const callback = (selector1) => {
                controller.asController.view.gameOptionsView.selectedOptions.set(selector.type, selector1.getSelection());
                controller.playContinueBonusInReplay();
            };
            const selector = new GameOptionSelectorComponent_1.GameOptionSelectorComponent(actionSpinOptions.bonusGame.type, callback, actionSpinOptions.bonusGame.options, "", "");
            selector.position.set(0, 35);
            selector.updateLayout(true, 618);
            selector.addContinueButtonGraphics();
            this.addChild(selector);
        }
        else {
            this.createContinueBtn(controller);
        }
    }
    createContinueBtn(controller) {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        let onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_GAME_CONTINUE)));
        let offIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_GAME_CONTINUE)));
        const continueBtn = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_GAME_CONTINUE_BUTTON, onIcons, colors, offIcons);
        continueBtn.addClickCallback(() => controller.playContinueBonusInReplay());
        continueBtn.toggled = false;
        continueBtn.enable(true);
        continueBtn.pivot.set(continueBtn.width * 0.5, continueBtn.height * 0.5);
        continueBtn.position.set(295, 105);
        this.addChild(continueBtn);
        const label = new Label_1.Label(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.CONTINUE), PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_CONTINUE_STYLE);
        label.pivot.x = label.width * 0.5;
        label.position.set(continueBtn.position.x, continueBtn.position.y + continueBtn.height * 0.5 + 5);
        this.addChild(label);
    }
    createPlayInGameBtn(controller) {
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        let onIcons1 = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_GAME_PLAY_BTN)));
        const playBtn = new IconToggleButton_1.IconToggleButton(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPINS_GAME_PLAY_BUTTON, onIcons1, colors);
        playBtn.addClickCallback(() => controller.playBonusInGame());
        playBtn.toggled = false;
        playBtn.enable(true);
        playBtn.pivot.set(playBtn.width / 2, playBtn.height / 2);
        playBtn.position.set(562, 30);
        this.addChild(playBtn);
        const label = new Label_1.Label(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.PLAY_BONUS_IN_GAME), PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_PLAY_BONUS_IN_GAME_STYLE);
        if (label.width >= 145) {
            const scale = 145 / label.width;
            const style = label.getStyleClone();
            style.fontSize = Number(style.fontSize) * scale;
            label.setStyle(style);
        }
        label.pivot.x = label.width;
        label.pivot.y = label.height * 0.5;
        label.position.set(530, 30);
        this.addChild(label);
    }
    /**
     * To create game info for a game round
     */
    createInfo(featureName) {
        /*
                const featureNameLabel = new Label(featureName, PromoPanelTextStyles.AS_ROUND_INFO_RE_SPIN_STYLE);
                featureNameLabel.anchor.set(0, 0.5);
        
                if (featureNameLabel.width >= 330) {
                    const scale = 330 / featureNameLabel.width;
                    const style = featureNameLabel.getStyleClone();
                    style.fontSize = Number(style.fontSize) * scale;
                    featureNameLabel.setStyle(style);
                }
        */
        const line = new PIXI.Sprite(NolimitPromotionPlugin_1.NolimitPromotionPlugin.imgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.BONUS_ROUND_BONUS_SUMMARY));
        line.position.set(30, 60);
        //featureNameLabel.position.set(55, 30);
        // this.addChild(featureNameLabel);
        this.addChild(line);
    }
}
exports.ASStopOnBonusRoundInfoView = ASStopOnBonusRoundInfoView;
//# sourceMappingURL=ASStopOnBonusRoundInfoView.js.map