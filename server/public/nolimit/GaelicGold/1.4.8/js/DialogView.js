"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogView = void 0;
const SlotKeypad_1 = require("../../../SlotKeypad");
const ScreenBounds_1 = require("@nolimitcity/slot-launcher/bin/display/ScreenBounds");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const SlotKeypadViewSettings_1 = require("../../SlotKeypadViewSettings");
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const KeypadDefault_1 = require("../../config/KeypadDefault");
const SlotKeypadUtils_1 = require("../../utils/SlotKeypadUtils");
const SkinLoader_1 = require("../../../SkinLoader");
/**
 * Created by jonas on 2019-10-23.
 */
class DialogView extends PIXI.Container {
    get isOpen() {
        return this._isOpen;
    }
    constructor(controller, api, name, closeButton = false) {
        super();
        this._init = false;
        this._isOpen = false;
        this.bottomMargin = 0;
        this.name = name;
        this.api = api;
        this._controller = controller;
        this._shouldHaveCloseButton = closeButton;
        this.bottomMargin = this._controller.getBalanceBarHeight();
    }
    onInteraction(name, value) {
    }
    init() {
        this._backPlate = new PIXI.Graphics();
        this._backPlate.name = "backplate";
        this.addChild(this._backPlate);
        const onColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalPointerStateColors.clone();
        const onIcons = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.MENU_CLOSE)));
        this.closeButton = new IconToggleButton_1.IconToggleButton("CLOSE", onIcons, onColors, onIcons);
        this.closeButton.addClickCallback(() => this.close());
        this.closeButton.enable(true);
        this.addChild(this.closeButton);
        if (!this._shouldHaveCloseButton) {
            SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this.closeButton);
        }
        this._bottomSeparator = new PIXI.Graphics();
        this._bottomSeparator.name = "_bottomSeparator";
        this.addChild(this._bottomSeparator);
    }
    drawBackPlate(bounds) {
        this._backPlate.clear();
        this._backPlate.beginFill(0x000000, 0.1);
        this._backPlate.drawRect(0, 0, bounds.width, bounds.height);
        this._backPlate.position.set(bounds.left, bounds.top);
    }
    drawBottomSeparator(bounds) {
        this._bottomSeparator.clear();
        this._bottomSeparator.lineStyle(2, 0xFFFFFF, 0.6);
        this._bottomSeparator.moveTo(0, 0);
        this._bottomSeparator.lineTo(bounds.width, 0);
        this._bottomSeparator.position.set(bounds.left, bounds.bottom + 1);
    }
    close() {
        SlotKeypad_1.SlotKeypad.playButtonSound("DialogClosed");
        NolimitApplication_1.NolimitApplication.removeDialog(this);
        this._isOpen = false;
    }
    open() {
        if (!this._init) {
            this.init();
            this._init = true;
        }
        this._isOpen = true;
        NolimitApplication_1.NolimitApplication.addDialog(this, true);
    }
    shouldResize() {
        return (this._init && this._isOpen);
    }
    onResize() {
        if (this.shouldResize()) {
            const bounds = (0, ScreenBounds_1.cloneScreenBounds)(NolimitApplication_1.NolimitApplication.screenBounds);
            bounds.bottom -= this.bottomMargin;
            this.closeButton.position.set(bounds.right - this.closeButton.width - KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT, bounds.top - 11 + (NolimitApplication_1.NolimitApplication.isLandscape ? KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_TOP_LANDSCAPE : KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_TOP));
            this.drawBackPlate(bounds);
            this.drawBottomSeparator(bounds);
        }
    }
}
exports.DialogView = DialogView;
//# sourceMappingURL=DialogView.js.map