"use strict";
/**
 * Created by jonas on 2020-04-06.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlTopLabel = void 0;
class HtmlTopLabel {
    get element() {
        return this._element;
    }
    constructor(query, createNewElement = false) {
        if (createNewElement) {
            this._element = document.createElement("div");
            this._element.innerText = "";
            this._element.id = query;
        }
        else {
            const element = document.querySelector(query);
            this._element = element != undefined ? element : new HTMLElement();
        }
        this._element.classList.add("top-bar-item");
    }
    update(value) {
        this._element.innerText = value;
    }
    show() {
        this._element.style.display = "block";
    }
    hide() {
        this._element.style.display = "none";
    }
}
exports.HtmlTopLabel = HtmlTopLabel;
//# sourceMappingURL=HtmlTopLabel.js.map