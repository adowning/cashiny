"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASMainGameActionButtonView = void 0;
const PromoPanelButtonIDs_1 = require("../../../enums/PromoPanelButtonIDs");
const ActionSpinsController_1 = require("../ActionSpinsController");
const StopOnBonusTriggeredToggleBtn_1 = require("../settings/StopOnBonusTriggeredToggleBtn");
const ActionSpinsStartButton_1 = require("./ActionSpinsStartButton");
const NolimitPromotionPlugin_1 = require("../../../NolimitPromotionPlugin");
const PromoPanelLabelIDs_1 = require("../../../enums/PromoPanelLabelIDs");
class ASMainGameActionButtonView extends PIXI.Container {
    get stopSpinOnBonusBtn() {
        return this._stopSpinOnBonusBtn;
    }
    get startButton() {
        return this._startButton;
    }
    constructor(controller) {
        super();
        this._controller = controller;
        this.initAnimation();
    }
    resize(isLandscapeLayout) {
        if (isLandscapeLayout) {
            this._startButton.position.set(177, 0);
            this._stopOnBonusContainer.position.set(-177, -51);
        }
        else {
            this._startButton.position.set(177, 0);
            this._stopOnBonusContainer.position.set(-177, -51);
        }
    }
    initAnimation() {
        this._stopOnBonusContainer = new PIXI.Container();
        this._stopSpinOnBonusBtn = new StopOnBonusTriggeredToggleBtn_1.StopOnBonusTriggeredToggleBtn(PromoPanelButtonIDs_1.PromoPanelButtonIDs.ACTION_SPIN_STOP_ON_BONUS_TRIGGERED, NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.STOP_ON_BONUS));
        this._stopSpinOnBonusBtn.pivot.set(50, 0); //50 is half the size of the icon.
        this._stopSpinOnBonusBtn.position.set(0, 38);
        this._stopOnBonusContainer.addChild(this._stopSpinOnBonusBtn);
        const separator = new PIXI.Sprite(PIXI.Texture.WHITE);
        separator.anchor.set(0.5, 0.5);
        separator.tint = PIXI.utils.string2hex("#f57f20");
        separator.height = 90;
        separator.width = 2;
        this._startButton = new ActionSpinsStartButton_1.ActionSpinsStartButton(this._controller);
        this.addChild(this._stopOnBonusContainer, separator, this._startButton);
        this._stopSpinOnBonusBtn.toggled = ActionSpinsController_1.ActionSpinsController.settings.stopOnBonus;
    }
}
exports.ASMainGameActionButtonView = ASMainGameActionButtonView;
//# sourceMappingURL=ASMainGameActionButtonView.js.map