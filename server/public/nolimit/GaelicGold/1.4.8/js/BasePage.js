"use strict";
/**
 * Created by jonas on 2019-10-23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const KeypadDefault_1 = require("../../../config/KeypadDefault");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PageHeader_1 = require("../PageHeader");
const SlotKeypadUtils_1 = require("../../../utils/SlotKeypadUtils");
class BasePage extends PIXI.Container {
    constructor(name, parentView, header = "", headerYellow = "", maxWidth = 600) {
        super();
        this.name = name;
        this._parentView = parentView;
        this.header = new PageHeader_1.PageHeader(header, headerYellow);
        this.content = this.createContent();
        this.content.name = "content";
        this.addChild(this.header);
        this.addChild(this.content);
    }
    removeHeader() {
        SlotKeypadUtils_1.SlotKeypadUtils.disableElement(this.header);
    }
    onResize(bounds) {
        const topMargin = NolimitApplication_1.NolimitApplication.isLandscape ? KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_TOP_LANDSCAPE : KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_TOP;
        this.header.position.set(KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT, topMargin);
        this.header.resize(bounds.width - KeypadDefault_1.KeypadDefault.SCREEN_EDGE_MARGIN_LEFT * 2);
        this.onResizeContent(bounds);
    }
    getHeaderBottom() {
        if (this.header.parent != this) {
            return 0;
        }
        return this.header.y + this.header.height;
    }
    activate() {
    }
    deactivate() {
    }
    onResizeContent(bounds) {
        const headerBottom = this.getHeaderBottom();
        const topMargin = 0; //NolimitApplication.isLandscape ?  KeypadDefault.SCREEN_EDGE_MARGIN_TOP_LANDSCAPE :  KeypadDefault.SCREEN_EDGE_MARGIN_TOP;
        this.content.position.set(0, headerBottom + topMargin);
    }
    createContent() {
        return new PIXI.Container();
    }
}
exports.BasePage = BasePage;
//# sourceMappingURL=BasePage.js.map