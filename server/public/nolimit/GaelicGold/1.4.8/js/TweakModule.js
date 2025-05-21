"use strict";
/**
 * Created by Jerker Nord on 2016-04-22.
 * Refactored by Ning Jiang on 2016-12-5.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweakModule = void 0;
const Slider_1 = require("../../../core/component/Slider");
const EventHandler_1 = require("../../../core/event/EventHandler");
const TweakEvent_1 = require("../event/TweakEvent");
const TweakModuleHeadline_1 = require("./TweakModuleHeadline");
class TweakModule extends PIXI.Container {
    constructor(headline, resizeCallback) {
        super();
        this._moduleName = headline;
        this._sliders = [];
        this._expanded = false;
        this._contentContainer = new PIXI.Container();
        this._contentContainer.visible = false;
        this.addChild(this._contentContainer);
        this._resizeCallback = resizeCallback;
        this.createHeadLine();
        this.addEventListeners();
    }
    createHeadLine() {
        const newModule = new TweakModuleHeadline_1.TweakModuleHeadline(this._moduleName);
        newModule.interactive = true;
        newModule.on('click', () => this.onHeadlineClicked());
        this.addChild(newModule);
    }
    onHeadlineClicked() {
        if (this._expanded == false) {
            this._expanded = true;
            this.expand();
        }
        else {
            this._expanded = false;
            this.retract();
        }
    }
    expand() {
        this._contentContainer.visible = true;
        this.resize();
    }
    retract() {
        this._contentContainer.visible = false;
        this.resize();
    }
    resize() {
        const resizeConfig = {
            expanded: this._expanded,
            index: this.parent.getChildIndex(this),
            height: this._contentContainer.height + TweakModule.BOTTOM_PADDING
        };
        this._resizeCallback(resizeConfig);
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, TweakEvent_1.TweakEvent.ADD_SLIDER_TO_MODULE, (event) => this.addSlider(event.params[0], event.params[1]));
    }
    addSlider(moduleName, config) {
        if (this._moduleName != moduleName) {
            return;
        }
        const slider = new Slider_1.Slider(config.text, config.minValue, config.maxValue, config.startValue, config.onValueChangeCallback);
        slider.x = 12;
        slider.y = 65 + (50 * this._sliders.length);
        this._contentContainer.addChild(slider);
        slider.scaleTextToComponentWidth();
        this._sliders.push(slider);
    }
    getModuleValues() {
        const sliderData = [];
        for (let i = 0; i < this._sliders.length; i++) {
            sliderData.push(this._sliders[i].getSliderValues());
        }
        return {
            name: this._moduleName,
            sliders: sliderData
        };
    }
}
TweakModule.BOTTOM_PADDING = 12;
exports.TweakModule = TweakModule;
//# sourceMappingURL=TweakModule.js.map