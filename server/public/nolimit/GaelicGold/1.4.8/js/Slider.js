"use strict";
/**
 * Created by Jerker Nord on 2016-04-18.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slider = void 0;
const MathHelper_1 = require("../utils/MathHelper");
class Slider extends PIXI.Container {
    constructor(text, minValue, maxValue, initValue, callback) {
        super();
        this._sliderWidth = 200;
        this._sliderHeight = 3;
        this._isDragging = false;
        this._noOfDecimals = 2;
        this._sliderTextStyle = {
            fontFamily: "Arial",
            fontSize: 20,
            fill: '#FFFFFF'
        };
        this._text = text;
        this._minValue = minValue;
        this._maxValue = maxValue;
        this._initValue = initValue;
        this._changeCallback = callback;
        this._sliderNumber = this._initValue;
        this.init();
    }
    init() {
        this.createSliderBackground();
        this.createSliderButton();
        this.makeButtonDraggable();
    }
    scaleTextToComponentWidth() {
        let decimalString = "?";
        for (let i = 0; i < this._noOfDecimals; i++) {
            decimalString += "?";
        }
        while (new PIXI.Text(this._text + " " + this._maxValue.toString() + decimalString, this._sliderTextStyle).width > this.parent.parent.width) {
            if ((0, MathHelper_1.isNumber)(this._sliderTextStyle.fontSize)) {
                this._sliderTextStyle.fontSize--;
            }
            else {
                debugger;
                throw new Error(`Slider.scaleTextToComponentWidth():Please use number for fontSize!`);
            }
        }
        this.createText();
    }
    createText() {
        this._componentText = new PIXI.Text(this._text + " " + this._sliderNumber.toString(), this._sliderTextStyle);
        this._componentText.x = Slider.TEXT_POSITION.x;
        this._componentText.y = Slider.TEXT_POSITION.y;
        this.addChild(this._componentText);
    }
    getSliderValues() {
        return {
            name: this._text,
            value: this._sliderNumber
        };
    }
    updateText() {
        let percent = (this._sliderButton.position.x / this._sliderWidth);
        let newSliderValue = this._minValue + ((this._maxValue - this._minValue) * percent);
        this._sliderNumber = MathHelper_1.MathHelper.roundToDecimals(newSliderValue, this._noOfDecimals);
        this._componentText.text = this._text + " " + this._sliderNumber.toString();
        this._changeCallback(this._text, this._sliderNumber);
    }
    createSliderBackground() {
        let graphics = new PIXI.Graphics();
        graphics.beginFill(0xF0F0F0, 1);
        graphics.drawRect(0, 0, this._sliderWidth, this._sliderHeight);
        graphics.endFill();
        this.addChild(graphics);
    }
    createSliderButton() {
        this._sliderButton = new PIXI.Graphics();
        this._sliderButton.lineStyle(1, 0xA0A0FF);
        this._sliderButton.beginFill(0xF0FFFF, 1);
        this._sliderButton.drawCircle(0, 0, 9);
        this._sliderButton.endFill();
        this._sliderButton.position.y = 1;
        let range = (this._maxValue - this._minValue);
        let rangeInit = (this._initValue - this._minValue);
        let percent = (rangeInit / range);
        this._sliderButton.position.x = (this._sliderWidth * percent);
        this.addChild(this._sliderButton);
        this._sliderButton.interactive = true;
    }
    makeButtonDraggable() {
        let onDragStartCallback = (event) => this.onDragStart(event);
        let onDragEndCallback = () => this.onDragEnd();
        let onDragMoveCallback = () => this.onDragMove();
        // Events for drag start
        this._sliderButton.on('mousedown', onDragStartCallback);
        this._sliderButton.on('touchstart', onDragStartCallback);
        // Events for drag end
        this._sliderButton.on('mouseup', onDragEndCallback);
        this._sliderButton.on('mouseupoutside', onDragEndCallback);
        this._sliderButton.on('touchend', onDragEndCallback);
        this._sliderButton.on('touchendoutside', onDragEndCallback);
        // Events for drag move
        this._sliderButton.on('mousemove', onDragMoveCallback);
        this._sliderButton.on('touchmove', onDragMoveCallback);
    }
    onDragStart(event) {
        // store a reference to the data
        // the reason for this is because of multitouch
        // we want to track the movement of this particular touch
        this._dragData = event.data;
        this._isDragging = true;
    }
    onDragEnd() {
        this._isDragging = false;
        // set the interaction data to null
        this._dragData = null;
    }
    onDragMove() {
        if (this._isDragging == true) {
            let newPosition = this._dragData.getLocalPosition(this._sliderButton.parent);
            if (newPosition.x < 0) {
                newPosition.x = 0;
            }
            else if (newPosition.x > this._sliderWidth) {
                newPosition.x = this._sliderWidth;
            }
            this._sliderButton.position.x = newPosition.x;
            this.updateText();
        }
    }
}
Slider.TEXT_POSITION = new PIXI.Point(-2, -30);
exports.Slider = Slider;
//# sourceMappingURL=Slider.js.map