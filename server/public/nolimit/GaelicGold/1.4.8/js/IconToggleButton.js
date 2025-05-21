"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconToggleButton = void 0;
/**
 * Created by jonas on 2019-09-19.
 */
const GuiToggleButton_1 = require("./GuiToggleButton");
const ToggleState_1 = require("./states/ToggleState");
class IconToggleButton extends GuiToggleButton_1.GuiToggleButton {
    constructor(name, onIcons, onColors, offIcons, offColors) {
        super(name, () => this.toggleCallback());
        this.onPointerStateUpdate = (state) => {
            this.setIcon();
        };
        this._iconSets = new ToggleState_1.ToggleStateSet(onIcons, offIcons);
        this._colorSets = new ToggleState_1.ToggleStateSet(onColors, offColors);
    }
    getIconSet() {
        return this._iconSets.getItem(this.toggleState);
    }
    getIconColorSet() {
        return this._colorSets.getItem(this.toggleState);
    }
    setIcon() {
        const currentIconSet = this.getIconSet();
        const currentColorSet = this.getIconColorSet();
        const icon = currentIconSet.getItem(this.pointerState);
        const color = currentColorSet.getItem(this.pointerState);
        icon.setColor(color);
        if (icon != this._icon) {
            this.addChild(icon);
            this.removeChild(this._icon);
            this._icon = icon;
        }
    }
    addSubComponent(component, placement, margin) {
        this.addChild(component);
        if (!this._icon) {
            this.setIcon();
        }
        component.position.set(this._icon.width * placement.x + margin.x, this._icon.height * placement.y + margin.y);
    }
    removeSubComponent(component) {
        this.removeChild(component);
    }
    toggleCallback() {
        this.setIcon();
    }
    hide() {
        this.visible = false;
    }
    show() {
        this.visible = true;
    }
}
exports.IconToggleButton = IconToggleButton;
//# sourceMappingURL=IconToggleButton.js.map