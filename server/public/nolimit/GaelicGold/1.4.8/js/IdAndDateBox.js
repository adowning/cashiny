"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdAndDateBox = void 0;
/**
 * Created by jonas on 2023-10-11.
 */
const pixi_js_1 = require("pixi.js");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../../../../config/PromoPanelAssetConfig");
const PromoPanelTextStyles_1 = require("../../../../config/PromoPanelTextStyles");
const Helper_1 = require("../../../../utils/Helper");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
class IdAndDateBox extends pixi_js_1.Container {
    constructor(roundId, date) {
        super();
        this._bp = new PIXI.NineSlicePlane(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_ROUNDS_NUMBER_BG), 7, 7, 7, 7);
        this._id = new Label_1.Label(roundId, PromoPanelTextStyles_1.PromoPanelTextStyles.AS_ROUND_INFO_SPIN_NUMBER_TEXT_STYLE);
        this._id.anchor.set(0.5, 0.5);
        this._bp.addChild(this._id);
        this._date = new Label_1.Label(IdAndDateBox.formatTime(date), PromoPanelTextStyles_1.PromoPanelTextStyles.ROUND_INFO_DATE_TEXT);
        this.addChild(this._bp, this._date);
        this.resize();
    }
    static formatTime(time) {
        if (time == undefined || time == "") {
            return "";
        }
        const dateObj = new Date(time);
        return Helper_1.Helper.padZero(dateObj.getHours()) + ":" + Helper_1.Helper.padZero(dateObj.getMinutes()) + ":" + Helper_1.Helper.padZero(dateObj.getSeconds());
    }
    updateDate(time) {
        this._date.text = IdAndDateBox.formatTime(time);
    }
    updateId(roundNo) {
        const prevId = this._id.text.split("-")[0];
        this._id.text = prevId + "-" + roundNo;
        this.resize();
    }
    resize() {
        this._bp.width = Math.max(this._id.width + 10, 30);
        this._bp.height = 14;
        this._id.position.set(this._bp.width * 0.5, this._bp.height * 0.5);
        GuiLayout_1.GuiLayout.align([this._bp, this._date], 8, GuiLayout_1.Align.CENTER, GuiLayout_1.Direction.HORIZONTAL);
    }
}
exports.IdAndDateBox = IdAndDateBox;
//# sourceMappingURL=IdAndDateBox.js.map