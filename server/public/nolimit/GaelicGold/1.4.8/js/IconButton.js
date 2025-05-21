"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconButton = void 0;
/**
 * Created by Jonas Wålekvist on 2020-01-20.
 */
const GuiButton_1 = require("./GuiButton");
class IconButton extends GuiButton_1.GuiButton {
    constructor(name, iconSet, colorSet, clickCallback) {
        super(name, clickCallback);
        this.onPointerStateUpdate = (state) => {
            this.setIcon();
        };
        this._iconSet = iconSet;
        this._colorSet = colorSet;
    }
    setIcon() {
        const icon = this._iconSet.getItem(this.pointerState);
        const color = this._colorSet.getItem(this.pointerState);
        icon.setColor(color);
        if (icon != this._icon) {
            this.addChild(icon);
            this.removeChild(this._icon);
            this._icon = icon;
        }
    }
}
exports.IconButton = IconButton;
//# sourceMappingURL=IconButton.js.map