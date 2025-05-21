"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinButton = void 0;
/**
 * Class description
 *
 * Created: 2019-09-17
 * @author jonas
 */
const GuiButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/GuiButton");
const SlotKeypad_1 = require("../../../SlotKeypad");
const PointerState_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/PointerState");
const PointerStateIconSet_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("@nolimitcity/slot-launcher/bin/gui/displayobjects/Icon");
const SlotKeypadViewSettings_1 = require("../../SlotKeypadViewSettings");
const BetState_1 = require("./state/BetState");
const SpinButtonState_1 = require("./state/SpinButtonState");
const BetStateColorSet_1 = require("./state/sets/BetStateColorSet");
const GuiUtils_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiUtils");
const gsap_1 = require("gsap");
const KeypadSound_1 = require("../KeypadSound");
const SkinLoader_1 = require("../../../SkinLoader");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const GuiDefaultTextures_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaultTextures");
class SpinButton extends GuiButton_1.GuiButton {
    get betState() {
        return this._betState;
    }
    set betState(value) {
        this._betState = value;
        this.update();
    }
    get spinState() {
        return this._spinState;
    }
    set spinState(value) {
        this._spinState = value;
        this.update();
    }
    constructor() {
        super(SlotKeypad_1.KeypadButtonIDs.SPIN);
        this._betState = BetState_1.BetState.NORMAL;
        this._spinState = SpinButtonState_1.SpinButtonState.SPIN;
        this._backPlateColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalBackPlatePointerStateColors.clone();
        this._outlineColor = new BetStateColorSet_1.BetStateColorSet(SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR, SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR, SlotKeypadViewSettings_1.SlotKeypadViewSettings.NORMAL_COLOR, SlotKeypadViewSettings_1.SlotKeypadViewSettings.FREE_BETS_COLOR, SlotKeypadViewSettings_1.SlotKeypadViewSettings.BOOSTED_BET_COLOR);
        this._icons = new SpinButtonState_1.SpinButtonStateSet(new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_ARROW))), new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_STOP))), new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_SKIP))), new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_PLAY))), new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_ARROW))), new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_ARROW))));
        this._gambleIcon = new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.COLLECT_ICON));
        this._boostIcon = new Icon_1.Icon(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.BOOST_ICON));
        const colors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.normalPointerStateColors.clone();
        this._boostedColors = SlotKeypadViewSettings_1.SlotKeypadViewSettings.instance.boostedBetsPointerStateColors.clone();
        this._colorSets = new SpinButtonState_1.SpinButtonStateSet(colors, colors, colors, colors, colors, this._boostedColors);
        this._soundSet = new SpinButtonState_1.SpinButtonStateSet(KeypadSound_1.KeypadSound.SPIN_START, KeypadSound_1.KeypadSound.SPIN_STOP, KeypadSound_1.KeypadSound.SPIN_STOP, KeypadSound_1.KeypadSound.NONE, KeypadSound_1.KeypadSound.SPIN_START, KeypadSound_1.KeypadSound.SPIN_START);
        this._backPlate = new PIXI.NineSlicePlane(SkinLoader_1.SkinLoader.getTexture(SkinLoader_1.SkinLoader.SPIN_BUTTON_PLATE), 40, 40, 40, 40);
        this._backPlate.width = 200;
        this._backPlate.height = 180;
        this.addChild(this._backPlate);
        this._totalCostContainer = new PIXI.Container();
        const style = GuiDefaults_1.GuiDefaults.DEFAULT_BUTTON_LABEL_STYLE.clone();
        style.fontSize = 22;
        style.fill = "#FFFC00";
        style.fontWeight = FontStatics_1.FontWeight.BOLD;
        this._totalCostLabel = new Label_1.Label("-1", style);
        this._totalCostLabel.anchor.set(0.5, 1);
        this._totalCostLabel.position.set(100, 180);
        this._totalCostBackplate = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BONUS_BET_BACKPLATE), 36, 36, 36, 36);
        this._totalCostContainer.visible = false;
        this._totalCostContainer.addChild(this._totalCostBackplate, this._totalCostLabel);
        this.addChild(this._totalCostContainer);
        this.addClickCallback(() => this.playSound());
        this.update();
    }
    drawBackPlate(fillColor, outlineColor) {
        this._backPlate.tint = GuiUtils_1.GuiUtils.getColorFromARGB(outlineColor);
    }
    playClickedAnimation() {
        const tl = new gsap_1.TimelineLite();
        tl.set(this._icon, { rotation: 0 });
        tl.set(this._icon.scale, { x: 1.0, y: 1.0 });
        if (this._spinState == SpinButtonState_1.SpinButtonState.SPIN || this._spinState == SpinButtonState_1.SpinButtonState.GAMBLE || this._spinState == SpinButtonState_1.SpinButtonState.BOOST) {
            tl.add(new gsap_1.TweenLite(this._icon, 0.25, { rotation: Math.PI * 2 }));
        }
        else {
            tl.add(new gsap_1.TweenLite(this._icon.scale, 0.05, { x: 0.95, y: 0.95, ease: gsap_1.Linear.easeNone }));
            tl.add(new gsap_1.TweenLite(this._icon.scale, 0.05, { x: 1.0, y: 1.0 }));
        }
        return tl;
    }
    setIcon() {
        if (this._betState == BetState_1.BetState.ZERO_BET) {
            if (this._icon) {
                this._icon.visible = false;
            }
            this._backPlate.visible = false;
            return;
        }
        const currentIconSet = this._icons.getItem(this._spinState);
        const currentColorSet = this._colorSets.getItem(this._spinState);
        const icon = currentIconSet.getItem(this.pointerState);
        let color = currentColorSet.getItem(this.pointerState);
        if (this.betState == BetState_1.BetState.BOOSTED_BET) {
            color = this._boostedColors.getItem(this.pointerState);
        }
        icon.setColor(color);
        if (icon != this._icon) {
            this.addChild(icon);
            this.removeChild(this._icon);
            this._icon = icon;
        }
        this._backPlate.visible = true;
        this._icon.visible = true;
        this._icon.anchor.set(0.5, 0.5);
        this._icon.position.set(this._backPlate.width * 0.5, this._backPlate.height * 0.5);
        this.setGambleIconViability(color);
        this.setBoostIconViability(color);
    }
    setGambleIconViability(color) {
        if (this._spinState == SpinButtonState_1.SpinButtonState.GAMBLE) {
            this._gambleIcon.visible = true;
            this._gambleIcon.anchor.set(0.5, 0.6);
            this._gambleIcon.position.set(this._backPlate.width * 0.5, this._backPlate.height * 0.5);
            this._gambleIcon.setColor(color);
            this.addChild(this._gambleIcon);
        }
        else {
            this.removeChild(this._gambleIcon);
        }
    }
    setBoostIconViability(color) {
        if (this._spinState == SpinButtonState_1.SpinButtonState.BOOST) {
            this._boostIcon.visible = true;
            this._boostIcon.anchor.set(0.5, 0.6);
            this._boostIcon.position.set(this._backPlate.width * 0.5, this._backPlate.height * 0.5);
            this._boostIcon.setColor(color);
            this.addChild(this._boostIcon);
        }
        else {
            this.removeChild(this._boostIcon);
        }
    }
    onPointerStateUpdate(state) {
        this.update();
    }
    updateTotalCostSize() {
        this._totalCostBackplate.width = this._totalCostLabel.width + 50;
        this._totalCostBackplate.height = this._totalCostLabel.height + 32;
        this._totalCostBackplate.position.set(this._totalCostLabel.x, this._totalCostLabel.y - this._totalCostLabel.height * 0.5 + 5);
        this._totalCostBackplate.pivot.set(this._totalCostBackplate.width * 0.5, this._totalCostBackplate.height * 0.5);
    }
    setTotalCost(cost) {
        if (cost != undefined) {
            this._totalCostLabel.text = cost;
            this.updateTotalCostSize();
            this._totalCostContainer.visible = true;
        }
        else {
            this._totalCostLabel.text = "";
            this._totalCostContainer.visible = false;
        }
    }
    update() {
        this.drawBackPlate(this._backPlateColors.getItem(this.pointerState), this._outlineColor.getItem(this._betState));
        this.setIcon();
    }
    playSound() {
        const sound = this._soundSet.getItem(this.spinState);
        const defaultSound = sound ? sound : KeypadSound_1.KeypadSound.NONE;
        SlotKeypad_1.SlotKeypad.playButtonSound(this.name + "_" + this.spinState, defaultSound);
    }
    clickButton() {
        if (this.pointerState != PointerState_1.PointerState.DISABLED) {
            this.onClick();
        }
    }
}
exports.SpinButton = SpinButton;
//# sourceMappingURL=SpinButton.js.map