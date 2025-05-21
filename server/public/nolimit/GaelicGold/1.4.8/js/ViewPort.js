"use strict";
/**
 * Created by Jonas Wålekvist on 2020-02-10.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewPort = void 0;
class ViewPort {
    get confineToRatio() {
        return this._confineToRatio;
    }
    set confineToRatio(value) {
        this._confineToRatio = value;
    }
    get ratio() {
        return this._ratio;
    }
    set ratio(value) {
        this._ratio = value;
    }
    get element() {
        return this._element;
    }
    set element(value) {
        this._element = value;
    }
    static get instance() {
        if (this._instance == undefined) {
            this._instance = new ViewPort();
        }
        return this._instance;
    }
    constructor() {
        this._confineToRatio = false;
        this.onWindowResize = (event) => {
            const clientWidth = document.documentElement.clientWidth;
            const clientHeight = document.documentElement.clientHeight;
            let size = new PIXI.Rectangle(0, 0, clientWidth, clientHeight);
            if (ViewPort.instance.confineToRatio) {
                const viewportRatio = clientWidth / clientHeight;
                size = viewportRatio < ViewPort.instance.ratio ? ViewPort.fitWidth(ViewPort.instance.ratio) : ViewPort.fitHeight(ViewPort.instance.ratio);
                size.x = (clientWidth - size.width) / 2;
                size.y = (clientHeight - size.height) / 2;
                ViewPort.instance.element.style.width = size.width + 'px';
                ViewPort.instance.element.style.height = size.height + 'px';
                ViewPort.instance.element.style.left = size.x + 'px';
                ViewPort.instance.element.style.top = size.y + 'px';
            }
            if (ViewPort.instance._resizeCallback != undefined) {
                ViewPort.instance._resizeCallback(size.width, size.height);
            }
        };
        window.addEventListener('resize', this.onWindowResize);
    }
    static fitWidth(ratio) {
        return new PIXI.Rectangle(0, 0, document.documentElement.clientWidth, Math.round(document.documentElement.clientWidth / ratio));
    }
    static fitHeight(ratio) {
        return new PIXI.Rectangle(0, 0, Math.round(document.documentElement.clientHeight * ratio), document.documentElement.clientHeight);
    }
    static confineToRatio(element, ratio) {
        ViewPort.instance.confineToRatio = true;
        ViewPort.instance.element = element;
        ViewPort.instance.ratio = ratio;
    }
    static onResize(callback) {
        ViewPort.instance._resizeCallback = callback;
    }
    static shutDown() {
        window.removeEventListener('resize', ViewPort.instance.onWindowResize);
    }
    static triggerResize() {
        ViewPort.instance.onWindowResize(undefined);
    }
}
exports.ViewPort = ViewPort;
//# sourceMappingURL=ViewPort.js.map