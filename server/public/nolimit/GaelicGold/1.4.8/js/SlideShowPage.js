"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlideShowPage = void 0;
/**
 * Created by Jonas Wålekvist on 2020-03-10.
 */
const GuiDefaults_1 = require("../../default/GuiDefaults");
const gsap_1 = require("gsap");
const NLCText_1 = require("../../../display/NLCText");
class SlideShowPage extends PIXI.Container {
    constructor(texture, textString, backgroundColor, imageLeft = true) {
        super();
        this._snapBackDistance = 360;
        this.onDragStart = (event) => {
            this.data = event.data;
            this._startPos = new PIXI.Point(this.position.x, this.position.y);
            this._prevScrollTarget = this.data.getLocalPosition(this.parent);
            this.setScrollDelta(this._prevScrollTarget);
            this.on('pointermove', this.onDragMove);
            if (this._startDragCallback) {
                this._startDragCallback();
            }
        };
        this.onDragMove = (event) => {
            if (this.data) {
                const scrollTarget = this.data.getLocalPosition(this.parent);
                this.setScrollDelta(scrollTarget);
                const diffX = Math.abs(this.position.x) - Math.abs(this._startPos.x);
                if (diffX > this._snapBackDistance) {
                    this.onDragEnd();
                }
            }
        };
        this.onDragEnd = (event) => {
            if (this.data) {
                const scrollTarget = this.data.getLocalPosition(this.parent);
                this.setScrollDelta(scrollTarget);
                this.snap();
            }
            this.data = undefined;
            this._prevScrollTarget = undefined;
            this.removeListener('pointermove', this.onDragMove);
            if (this._endDragCallback) {
                this._endDragCallback();
            }
        };
        this.backgroundColor = backgroundColor;
        if (texture != undefined) {
            const image = new PIXI.Sprite(texture);
            image.anchor.x = imageLeft ? 1 : 0;
            image.anchor.y = 0.5;
            image.position.x = imageLeft ? -10 : 10;
            this.addChild(image);
        }
        if (textString != undefined) {
            const textField = new NLCText_1.NLCText(textString, GuiDefaults_1.GuiDefaults.INTRO_PAGE_TEXT);
            textField.anchor.x = imageLeft ? 0 : 1;
            textField.anchor.y = 0.5;
            textField.position.x = imageLeft ? 10 : -10;
            this.addChild(textField);
        }
        this.hitArea = new PIXI.Rectangle(-840, -195, 1680, 390);
    }
    resize() {
    }
    setSwipeCallbacks(startDragCallback, endDragCallback, prevCallback, nextCallback) {
        this._startDragCallback = startDragCallback;
        this._endDragCallback = endDragCallback;
        this._prevCallback = prevCallback;
        this._nextCallback = nextCallback;
    }
    enable(enable) {
        if (enable) {
            this.start();
        }
        else {
            this.stop();
        }
    }
    start() {
        if (this._enabled) {
            return;
        }
        this._enabled = true;
        this.interactive = true;
        this.buttonMode = true;
        this.on('pointerdown', this.onDragStart);
        this.on('pointerup', this.onDragEnd);
        this.on('pointerupoutside', this.onDragEnd);
    }
    stop() {
        this.interactive = false;
        this.buttonMode = false;
        this.removeListener('pointerdown', this.onDragStart);
        this.removeListener('pointerup', this.onDragEnd);
        this.removeListener('pointerupoutside', this.onDragEnd);
        this._enabled = false;
    }
    setScrollDelta(scrollTarget) {
        const delta = this.calculateDelta(scrollTarget, this._prevScrollTarget);
        this.position.x += delta.x;
        //  this.position.y += delta.y;
        this._prevScrollTarget = scrollTarget;
    }
    calculateDelta(scrollTarget, prevScrollTarget) {
        return new PIXI.Point(scrollTarget.x - prevScrollTarget.x, scrollTarget.y - prevScrollTarget.y);
    }
    snap() {
        const diffX = Math.abs(this.position.x) - Math.abs(this._startPos.x);
        if (diffX <= this._snapBackDistance) {
            //Snap back.
            /*this.position.x = this._startPos.x;
            this.position.y = this._startPos.y;*/
            new gsap_1.TweenLite(this.position, 0.2, { x: this._startPos.x, y: this._startPos.y });
            return;
        }
        if (this.position.x > this._startPos.x) {
            if (this._prevCallback) {
                this._prevCallback();
            }
        }
        else {
            if (this._nextCallback) {
                this._nextCallback();
            }
        }
    }
}
exports.SlideShowPage = SlideShowPage;
//# sourceMappingURL=SlideShowPage.js.map