"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseScroller = void 0;
/**
 * Created by jonas on 2019-12-10.
 */
var InteractionEvent = PIXI.InteractionEvent;
class MouseScroller {
    constructor(container) {
        this.onMouseScrollLocal = (e) => {
            const event = e;
            event.preventDefault();
            if (typeof event.deltaX !== "undefined")
                this._delta.set(event.deltaX, event.deltaY);
            else {
                //Firefox
                this._delta.set(event.axis == 1 ? event.detail * 60 : 0, event.axis == 2 ? event.detail * 60 : 0);
            }
            this._scrollContainer.setScrollDelta(this, -this._delta.x, -this._delta.y);
        };
        this.onHover = (event) => {
            if (!this._bound) {
                document.addEventListener("mousewheel", this.onMouseScrollLocal, { once: false, passive: false });
                document.addEventListener("DOMMouseScroll", this.onMouseScrollLocal, { once: false, passive: false });
                this._bound = true;
            }
        };
        this.onMouseOut = (event) => {
            if (this._bound) {
                document.removeEventListener("mousewheel", this.onMouseScrollLocal);
                document.removeEventListener("DOMMouseScroll", this.onMouseScrollLocal);
                this._bound = false;
            }
        };
        this.name = "MouseScroller";
        this._scrollContainer = container;
        this._delta = new PIXI.Point();
        this._bound = false;
    }
    //Promo panel fixes 239,#267
    reAddHoverListener() {
        this.onHover(new InteractionEvent());
    }
    enable(enable) {
        if (enable) {
            this.startEvent();
        }
        else {
            this.stopEvent();
        }
        this._enabled = enable;
    }
    stopEvent() {
        if (this._bound) {
            document.removeEventListener("mousewheel", this.onMouseScrollLocal);
            document.removeEventListener("DOMMouseScroll", this.onMouseScrollLocal);
            this._bound = false;
        }
        if (this._enabled) {
            this._scrollContainer.removeListener('mouseover', this.onHover);
            this._scrollContainer.removeListener('mouseout', this.onMouseOut);
        }
    }
    ;
    startEvent() {
        if (!this._enabled) {
            this._scrollContainer.on('mouseover', this.onHover);
            this._scrollContainer.on('mouseout', this.onMouseOut);
            this._scrollContainer.interactive = true;
        }
    }
    ;
}
exports.MouseScroller = MouseScroller;
//# sourceMappingURL=MouseScroller.js.map