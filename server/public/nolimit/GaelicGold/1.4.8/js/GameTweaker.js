"use strict";
/**
 * Created by Jerker Nord on 2016-04-22.
 * Refactored by Ning Jiang on 2016-12-5.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameTweaker = void 0;
const BaseView_1 = require("../../core/base/BaseView");
const TextButton_1 = require("../../core/component/TextButton");
const EventHandler_1 = require("../../core/event/EventHandler");
const GameResources_1 = require("../../core/resource/GameResources");
const StageManager_1 = require("../../core/stage/StageManager");
const TweakEvent_1 = require("./event/TweakEvent");
const TweakModule_1 = require("./tweakmodule/TweakModule");
class GameTweaker extends BaseView_1.BaseView {
    constructor(config) {
        super();
        this._baseWindowHeight = 0;
        this._modules = [];
        this._config = config;
        this._layer = StageManager_1.StageManager.getLayer(this._config.layer);
        this._layer.addChild(this);
        this.createBackground();
    }
    onResize(resizeData) {
        this.y = -this._layer.y / this._layer.scale.y;
    }
    createBackground() {
        this._backgroundContainer = new PIXI.Container();
        this.addChild(this._backgroundContainer);
        this.drawBackground();
    }
    initAnimations() {
        this.createCopyButton();
    }
    createCopyButton() {
        const textures = {
            idle: GameResources_1.GameResources.getTextures(this._config.buttonSkinIdle)[0],
            over: GameResources_1.GameResources.getTextures(this._config.buttonSkinOver)[0],
            down: GameResources_1.GameResources.getTextures(this._config.buttonSkinDown)[0],
            disabled: GameResources_1.GameResources.getTextures(this._config.buttonSkinDisabled)[0]
        };
        this._copyButton = new TextButton_1.TextButton(textures, () => this.onCopyClicked(), this._config.copyAllButtonText, this.getTextStyle());
        this._copyButton.x = this._config.baseWindowWidth - this._copyButton.width;
        this._copyButton.y = this._baseWindowHeight + this._copyButton.height + 4;
        this.addChild(this._copyButton);
    }
    onCopyClicked() {
        let copyText = "\r\n";
        for (let i = 0; i < this._modules.length; i++) {
            const module = this._modules[i].getModuleValues();
            copyText += module.name + "\r\n";
            for (let j = 0; j < module.sliders.length; j++) {
                copyText += module.sliders[j].name + "\r\n";
                copyText += module.sliders[j].value + "\r\n";
            }
            copyText += "\r\n";
        }
        this.copyText(copyText);
    }
    copyText(text) {
        const element = document.createElement('DIV');
        element.textContent = text;
        document.body.appendChild(element);
        this.selectElementText(element);
        document.execCommand('copy');
        element.remove();
    }
    selectElementText(element) {
        if (window.getSelection) {
            const range = document.createRange();
            range.selectNode(element);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        }
    }
    getTextStyle() {
        return {
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#000000',
            wordWrap: false
        };
    }
    addEventListeners() {
        EventHandler_1.EventHandler.addEventListener(this, TweakEvent_1.TweakEvent.ADD_MODULE, (evt) => this.addModule(evt.params[0]));
    }
    addModule(headline) {
        const module = new TweakModule_1.TweakModule(headline, (resizeConfig) => this.moduleResized(resizeConfig));
        module.y = ((this._modules.length * this._config.moduleHeight) + this._modules.length);
        this.addChild(module);
        this._modules.push(module);
        this._baseWindowHeight += this._config.moduleHeight;
        this.drawBackground();
    }
    moduleResized(resizeConfig) {
        if (resizeConfig.expanded == true) {
            for (let i = resizeConfig.index; i < this._modules.length; i++) {
                this._modules[i].y += resizeConfig.height;
            }
            this._baseWindowHeight += resizeConfig.height;
        }
        else {
            for (let i = resizeConfig.index; i < this._modules.length; i++) {
                this._modules[i].y -= resizeConfig.height;
            }
            this._baseWindowHeight -= resizeConfig.height;
        }
        this.drawBackground();
        this.updateButtonPosition();
    }
    drawBackground() {
        this._backgroundContainer.removeChildren();
        const background = new PIXI.Graphics();
        background.lineStyle(2, 0x537467, 1);
        background.beginFill(0x537467, 0.4);
        background.drawRect(1, 1, this._config.baseWindowWidth, this._baseWindowHeight);
        background.endFill();
        this._backgroundContainer.addChild(background);
    }
    updateButtonPosition() {
        this._copyButton.y = this._baseWindowHeight + 4;
    }
}
exports.GameTweaker = GameTweaker;
//# sourceMappingURL=GameTweaker.js.map