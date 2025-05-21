"use strict";
/**
 * Created by Jonas Wålekvist on 2019-11-28.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlBasePage = void 0;
const ScreenBounds_1 = require("@nolimitcity/slot-launcher/bin/display/ScreenBounds");
const BasePage_1 = require("./BasePage");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const SlotKeypad_1 = require("../../../../SlotKeypad");
class HtmlBasePage extends BasePage_1.BasePage {
    get screen() {
        if (this._screen != undefined) {
            return this._screen;
        }
        const screen = this._screenSystem.get(this.name);
        if (screen == undefined) {
            throw new Error(`Missing screen: ${this.name}`);
        }
        this._screen = screen;
        return this._screen;
    }
    constructor(parentDiv, screenSystem, name, parentView, header) {
        super(name, parentView, header);
        this._active = false;
        this._parentDiv = parentDiv;
        this._screenSystem = screenSystem;
    }
    activate() {
        this._active = true;
        this._parentDiv.style.display = "block";
        this.resizeHtml(this._htmlBounds);
    }
    deactivate() {
        this._active = false;
        this._parentDiv.style.display = "none";
    }
    onResize(bounds) {
        super.onResize(bounds);
        this._htmlBounds = (0, ScreenBounds_1.cloneScreenBounds)(bounds);
        this._htmlBounds.height -= this.content.y;
        this._htmlBounds.top = this.content.y;
        this.resizeHtml(this._htmlBounds);
    }
    resizeHtml(bounds) {
        if (!this._active) {
            return;
        }
        /*      if(this._screen && this._screen.element.contentDocument != null) {
                  this.screen.element!.contentDocument!.documentElement.style.fontSize = (10 * NolimitApplication.globalScale) + "px";
              }
      */
        if (this._screen) {
            this.screen.element.style.fontSize = (20 * NolimitApplication_1.NolimitApplication.globalScale) + "px";
        }
        this._parentDiv.style.width = (bounds.width * NolimitApplication_1.NolimitApplication.globalScale) + "px";
        this._parentDiv.style.height = (bounds.height * NolimitApplication_1.NolimitApplication.globalScale) + "px";
        this._parentDiv.style.top = (bounds.top * NolimitApplication_1.NolimitApplication.globalScale) + "px";
    }
    init() { }
    load() {
        return Promise.resolve();
    }
    ;
    addLoadedScreenTemplates(assets) {
        const addedScreens = [];
        for (let asset of assets) {
            if (asset.loadedData) {
                let html = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.render(asset.loadedData);
                html = html.replace(/<html /i, `<html data-device="${SlotKeypad_1.SlotKeypad.apiPlugIn.options.device}" data-agent="${navigator.userAgent}" `);
                addedScreens.push(this._screenSystem.add(asset.name, html).then((iframe) => iframe.classList.add('screen')));
            }
        }
        return Promise.all(addedScreens);
    }
}
exports.HtmlBasePage = HtmlBasePage;
//# sourceMappingURL=HtmlBasePage.js.map