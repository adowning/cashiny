"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroBetCounter = void 0;
/**
 * Created by Jonas Wålekvist on 2019-11-04.
 */
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const SkinLoader_1 = require("../../../SkinLoader");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
class ZeroBetCounter extends PIXI.Container {
    constructor() {
        super();
        this.name = "ZeroBetCounter";
        this._backPlate = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_BUTTON_PLATE), 40, 40, 40, 40);
        this._backPlate.width = 110;
        this._backPlate.height = 95;
        this._label = new Label_1.Label("99", GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE);
        this._label.anchor.set(0.5, 0.5);
        this._label.position.set(this._backPlate.width * 0.5, this._backPlate.height * 0.5);
        this.addChild(this._backPlate);
        this.addChild(this._label);
        this.hide();
    }
    setCount(count) {
        this._label.text = "" + count;
    }
    show() {
        this.visible = true;
    }
    hide() {
        this.visible = false;
    }
}
exports.ZeroBetCounter = ZeroBetCounter;
//# sourceMappingURL=ZeroBetCounter.js.map