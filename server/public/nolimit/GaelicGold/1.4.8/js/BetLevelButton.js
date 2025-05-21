"use strict";
/**
* Created by jonas on 2020-04-21.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetLevelButton = void 0;
const IconToggleButton_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/IconToggleButton");
class BetLevelButton extends IconToggleButton_1.IconToggleButton {
    constructor(name, onIcons, onColors, offIcons, offColors) {
        super(name, onIcons, onColors, offIcons, offColors);
        this._buttonSlaves = [];
        this.onSlaveClick = (event) => {
            if (this.worldVisible && this.interactive) {
                this.onClick(event);
            }
        };
    }
    addButtonSlave(slave) {
        slave.on('pointertap', this.onSlaveClick);
        this._buttonSlaves.push(slave);
    }
    enable(enable) {
        super.enable(enable);
        for (let slave of this._buttonSlaves) {
            slave.interactive = enable;
            slave.buttonMode = enable;
            slave.hitArea = slave.getLocalBounds();
        }
    }
}
exports.BetLevelButton = BetLevelButton;
//# sourceMappingURL=BetLevelButton.js.map