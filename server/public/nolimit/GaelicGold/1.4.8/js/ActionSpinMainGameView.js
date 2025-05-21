"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionSpinMainGameView = void 0;
const ASMainGameActionButtonView_1 = require("./mainGameView/ASMainGameActionButtonView");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const Helper_1 = require("../../utils/Helper");
class ActionSpinMainGameView extends PIXI.Container {
    get actionButtonView() {
        return this._actionButtonView;
    }
    constructor(controller) {
        super();
        this._controller = controller;
        this.init();
    }
    resize(landscapeLayout) {
        this._actionButtonView.resize(landscapeLayout);
        this._actionButtonView.position.set(0, Math.floor(this._actionButtonView.height * 0.5));
    }
    init() {
        this._actionButtonView = new ASMainGameActionButtonView_1.ASMainGameActionButtonView(this._controller);
        this.addChild(this._actionButtonView);
        this.resize(NolimitApplication_1.NolimitApplication.isLandscape && Helper_1.Helper.isDefaultScreenRatio(NolimitApplication_1.NolimitApplication.screenBounds));
    }
    setStopOnBonusEnableState(enabled) {
        this._actionButtonView.stopSpinOnBonusBtn.enable(enabled);
    }
}
exports.ActionSpinMainGameView = ActionSpinMainGameView;
//# sourceMappingURL=ActionSpinMainGameView.js.map