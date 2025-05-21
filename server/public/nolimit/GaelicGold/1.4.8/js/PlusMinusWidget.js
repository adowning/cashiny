"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlusMinusWidget = void 0;
const PointerStateColorSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const SkinLoader_1 = require("../../../../SkinLoader");
/**
 * Created by jonas on 2023-05-05.
 *
 * Small widget with - | + buttons. Used for changing bet.
 */
class PlusMinusWidget extends PIXI.Container {
    constructor(upButtonId, downButtonId, buttonCallback) {
        super();
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        const upIcon = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.BET_UP)));
        this._upButton = new IconToggleButton_1.IconToggleButton(upButtonId, upIcon, colors);
        this._upButton.addClickCallback(() => buttonCallback(this._upButton));
        this._upButton.toggled = false;
        this._upButton.pivot.set(38, 35);
        this._upButton.position.set(46, 0);
        this._upButton.scale.set(0.8, 0.8);
        const divider = new PIXI.Sprite(PIXI.Texture.WHITE);
        divider.width = 2;
        divider.height = 44;
        divider.anchor.set(0.5, 0.5);
        divider.alpha = 0.5;
        divider.roundPixels = true;
        const downIcon = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.BET_DOWN)));
        this._downButton = new IconToggleButton_1.IconToggleButton(downButtonId, downIcon, colors);
        this._downButton.addClickCallback(() => buttonCallback(this._downButton));
        this._downButton.toggled = false;
        this._downButton.pivot.set(38, 35);
        this._downButton.position.set(-50, 0);
        this._downButton.scale.set(0.8, 0.8);
        this.addChild(this._upButton, divider, this._downButton);
    }
    enableUpButton(enable) {
        this._upButton.enable(enable);
        this._upButton.alpha = enable ? 1 : 0.4;
    }
    enableDownButton(enable) {
        this._downButton.enable(enable);
        this._downButton.alpha = enable ? 1 : 0.4;
    }
}
exports.PlusMinusWidget = PlusMinusWidget;
//# sourceMappingURL=PlusMinusWidget.js.map