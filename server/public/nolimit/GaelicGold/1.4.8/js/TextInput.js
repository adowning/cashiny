"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInput = void 0;
/**
 * Class description
 *
 * Created: 2019-10-22
 * @author jonas
 */
const GuiUtils_1 = require("../utils/GuiUtils");
const NolimitApplication_1 = require("../../NolimitApplication");
class TextInput extends PIXI.Container {
    constructor(name, onInputChangedCallback, width, textStyle = TextInput.DEFAULT_STYLE, inputType = "number") {
        super();
        this._elementInDom = false;
        this._value = 0;
        this._lastInput = "";
        this.hasAddedDeFocusListener = false;
        this.logData = [];
        this.onBlur = () => {
            this.log("onBlur");
            const autoplaySingleMaxWin = parseFloat(this._inputElement.value.replace(',', '.').replace(/[£$€]/, ''));
            if (isNaN(autoplaySingleMaxWin) || autoplaySingleMaxWin <= 0) {
                this._inputElement.value = '';
                //sessionStorage.removeItem('autoplaySingleMaxWin');
                this._onInputChangedCallback(this.name, undefined);
            }
            else {
                //sessionStorage.setItem('autoplaySingleMaxWin', JSON.stringify(autoplaySingleMaxWin));
                this._onInputChangedCallback(this.name, autoplaySingleMaxWin);
            }
            this.removeDeFocusListener();
        };
        this.deFocusElement = (e) => {
            this.log("onDeFocusElement");
            if (document.activeElement !== this._inputElement) {
                this.log("Do Blur!");
                this._inputElement.blur();
                this.onBlur();
            }
        };
        this.name = name;
        this._onInputChangedCallback = onInputChangedCallback;
        this._inputWidth = width;
        this._inputType = inputType;
        this._inputTextStyle = textStyle;
        this.createDOM();
        NolimitApplication_1.NolimitApplication.events.on(NolimitApplication_1.NolimitApplication.RESIZE, () => this.resize());
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get visible() {
        if (this._inputElement) {
            return (this._inputElement.style.display == 'block');
        }
        return true;
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    set visible(visible) {
        if (this._inputElement) {
            this._inputElement.style.display = visible ? 'block' : 'none';
        }
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    get alpha() {
        return parseFloat(this._inputElement.style.opacity) | 1;
    }
    // @ts-ignore - this is declared as a property in pixi ts definitions. But it is in fact accessors and should be overridable like this. But Typescript 5 complains
    set alpha(alpha) {
        if (this._inputElement) {
            this._inputElement.style.opacity = alpha.toString();
        }
    }
    getCss() {
        return `.pixiTextInput input {
            box-shadow:none;
        }

        .pixiTextInput input:focus {
            box-shadow:none !important;
        }

        .pixiTextInput input:invalid {
            box-shadow:none !important;
        }`;
    }
    log(data) {
        this.logData.push(data);
        while (this.logData.length > 15) {
            this.logData.shift();
        }
        this._debugElement.innerHTML = this.logData.join("<br>");
    }
    createDOM() {
        this._deFocusElement = document.createElement('div');
        this._deFocusElement.style.position = "absolute";
        this._deFocusElement.style.top = "0px";
        this._deFocusElement.style.left = "0px";
        this._deFocusElement.style.width = "100%";
        this._deFocusElement.style.height = "100%";
        this._deFocusElement.style.backgroundColor = "rgba(0,0,0,0.4)";
        this._deFocusElement.hidden = true;
        this._debugElement = document.createElement('p');
        this._debugElement.textContent = "DEBUG";
        this._debugElement.style.position = "absolute";
        this._debugElement.style.top = "110px";
        this._debugElement.style.width = "97%";
        this._debugElement.style.fontSize = "2em";
        this._debugElement.style.color = "white";
        this._debugElement.style.textAlign = "right";
        this._debugElement.hidden = true;
        this._inputElement = document.createElement('input');
        this._inputElement.type = this._inputType;
        this._inputElement.classList.add("pixiTextInput");
        this._inputElement.min = "0";
        this._inputElement.style.opacity = "1";
        this._inputElement.style.position = "absolute";
        this._inputElement.style.transformOrigin = "0 0";
        this._inputElement.style.lineHeight = "1";
        this._inputElement.style.backgroundColor = "transparent";
        this._inputElement.style.border = "1px solid";
        this._inputElement.style.borderRadius = "5px";
        this._inputElement.style.borderColor = "rgba(255,255,255,0.4)";
        this._inputElement.style.boxShadow = "none";
        this._inputElement.style.boxShadow = "none";
        const style = document.createElement("style");
        style.appendChild(document.createTextNode(this.getCss()));
        document.head.append(style);
        this.addEventListener(this._inputElement);
        this._inputElement.style.outline = "none";
        this._inputElement.style.color = (typeof this._inputTextStyle.fill === "string") ? this._inputTextStyle.fill : "#ffffff";
        this._inputElement.style.fontFamily = (typeof this._inputTextStyle.fontFamily === "string") ? this._inputTextStyle.fontFamily : this._inputTextStyle.fontFamily[0];
        this._inputElement.style.fontSize = this._inputTextStyle.fontSize + "px";
        this._inputElement.style.fontStyle = this._inputTextStyle.fontStyle;
        this._inputElement.style.fontWeight = this._inputTextStyle.fontWeight + "px";
        this._inputElement.style.width = this._inputWidth + "px";
        this._inputElement.style.padding = "4px";
        this._inputElement.style.textAlign = "right";
        let bounds = this.getDOMInputBounds();
        this._gfx = new PIXI.Graphics();
        this._gfx.beginFill(0xff0000, 1);
        this._gfx.drawRect(0, 0, bounds.width, bounds.height);
        this._gfx.endFill();
        this._gfx.alpha = 0;
        this.addChild(this._gfx);
    }
    addEventListener(input) {
        input.addEventListener('focus', () => {
            this.log("onFocus");
            input.style.borderColor = "rgba(255,255,255,0.6)";
            input.style.color = (typeof this._inputTextStyle.fill === "string") ? this._inputTextStyle.fill : "#ffffff";
            this.addDeFocusListener();
        });
        input.addEventListener('blur', () => {
            this.onBlur();
        });
        input.addEventListener('focusout', () => {
            this.onBlur();
        });
        input.addEventListener('keydown', e => {
            const keyCode = e.keyCode;
            const ctrlMeta = e.ctrlKey === true || e.metaKey === true;
            if (e.shiftKey || e.altKey) {
                e.preventDefault();
                return;
            }
            // backspace, delete, tab, escape, enter , and .
            if ([46, 8, 9, 27, 13, 110, 188, 190].includes(keyCode)) {
                return;
            }
            // select all, copy, paste, cut
            if (ctrlMeta && [65, 67, 86, 88]) {
                return;
            }
            // home, end, left, right
            if (keyCode >= 35 && keyCode <= 39) {
                return;
            }
            // number keys
            if ((keyCode < 48 || keyCode > 57) && (keyCode < 96 || keyCode > 105)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    addDeFocusListener() {
        this.log("addDeFocusListener");
        if (!this.hasAddedDeFocusListener) {
            window.document.body.addEventListener('click', this.deFocusElement);
            this._deFocusElement.style.cursor = "pointer";
            this._deFocusElement.hidden = false;
            this.hasAddedDeFocusListener = true;
        }
    }
    removeDeFocusListener() {
        this.log("removeDeFocusListener");
        window.document.body.removeEventListener('click', this.deFocusElement);
        this._deFocusElement.style.cursor = "default";
        this._deFocusElement.hidden = true;
        this.hasAddedDeFocusListener = false;
    }
    getDOMInputBounds() {
        let remove_after = false;
        if (!this._elementInDom) {
            document.body.appendChild(this._inputElement);
            remove_after = true;
        }
        let org_transform = this._inputElement.style.transform;
        let org_display = this._inputElement.style.display;
        this._inputElement.style.transform = '';
        this._inputElement.style.display = 'block';
        let bounds = this._inputElement.getBoundingClientRect();
        this._inputElement.style.transform = org_transform;
        this._inputElement.style.display = org_display;
        if (remove_after) {
            document.body.removeChild(this._inputElement);
        }
        return bounds;
    }
    setDomParent(parent) {
        this._domParent = parent;
    }
    addDom() {
        if (this._domParent) {
            this._domParent.appendChild(this._deFocusElement);
            this._domParent.appendChild(this._debugElement);
            this._domParent.appendChild(this._inputElement);
        }
        else {
            document.body.appendChild(this._deFocusElement);
            document.body.appendChild(this._debugElement);
            document.body.appendChild(this._inputElement);
        }
        this.visible = true;
        this._elementInDom = true;
        this.resize();
    }
    removeDom() {
        if (this._domParent) {
            this._domParent.removeChild(this._deFocusElement);
            this._domParent.removeChild(this._debugElement);
            this._domParent.removeChild(this._inputElement);
        }
        else {
            document.body.removeChild(this._deFocusElement);
            document.body.removeChild(this._debugElement);
            document.body.removeChild(this._inputElement);
        }
        this._elementInDom = false;
    }
    get valueString() {
        return this._value < 0 ? "" : this._value.toString();
    }
    get value() {
        return this._value;
    }
    set value(value) {
        if (!isNaN(value)) {
            this._value = value;
        }
    }
    setElementValue(value) {
        this.value = value;
        this._inputElement.value = this.valueString;
        if (this.value > 0) {
            this._inputElement.style.borderColor = "rgba(255,255,0,0.4)";
            this._inputElement.style.color = "#ffff00";
        }
        else {
            this._inputElement.style.borderColor = "rgba(255,255,255,0.4)";
            this._inputElement.style.color = (typeof this._inputTextStyle.fill === "string") ? this._inputTextStyle.fill : "#ffffff";
        }
    }
    resize() {
        if (!this._elementInDom) {
            return;
        }
        this.toGlobal(this.position); //This forces pixi to resolve all parent transforms, making this.worldTransform actually usable here.
        this._inputElement.style.top = "0px"; //bounds.top + 'px';
        this._inputElement.style.left = "0px"; //bounds.left + 'px';
        const matrix = this.worldTransform.clone();
        matrix.scale(NolimitApplication_1.NolimitApplication.globalScale / NolimitApplication_1.NolimitApplication.pixiApp.stage.scale.x, NolimitApplication_1.NolimitApplication.globalScale / NolimitApplication_1.NolimitApplication.pixiApp.stage.scale.y);
        this._inputElement.style.transform = GuiUtils_1.GuiUtils.pixiMatrixToCSSMatrix(matrix);
        //this._inputElement.style.transform = GuiUtils.pixiMatrixToCSSMatrix(this.worldTransform);
        //const matrix = this.worldTransform.clone();
        //matrix.scale(NolimitApplication.globalScale / NolimitApplication.pixiApp.stage.scale.x, NolimitApplication.globalScale/ NolimitApplication.pixiApp.stage.scale.y);
    }
}
TextInput.DEFAULT_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: "Open Sans",
    fontSize: 20,
    fontStyle: "normal",
    fontWeight: "300"
});
exports.TextInput = TextInput;
//# sourceMappingURL=TextInput.js.map