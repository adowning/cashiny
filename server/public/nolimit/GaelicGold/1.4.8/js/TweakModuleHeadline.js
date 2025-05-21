"use strict";
/**
 * Created by Jerker Nord on 2016-04-25.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweakModuleHeadline = void 0;
class TweakModuleHeadline extends PIXI.Container {
    constructor(headlineTextString) {
        super();
        this._headlineTextString = headlineTextString;
        this.init();
    }
    init() {
        this.addChild(this.createHeadlineBackground());
        this.addChild(this.createHeadlineText());
    }
    createHeadlineBackground() {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x537467, 0.5);
        graphics.drawRect(1, 1, TweakModuleHeadline.HEADLINE_WIDTH, TweakModuleHeadline.HEADLINE_HEIGHT);
        graphics.endFill();
        return graphics;
    }
    createHeadlineText() {
        const headline = new PIXI.Text(this._headlineTextString, this.getHeadlineTextStyle());
        headline.position.x = 3;
        headline.position.y = 1;
        return headline;
    }
    getHeadlineTextStyle() {
        return {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#FFFFFF'
        };
    }
}
TweakModuleHeadline.HEADLINE_WIDTH = 400;
TweakModuleHeadline.HEADLINE_HEIGHT = 30;
exports.TweakModuleHeadline = TweakModuleHeadline;
//# sourceMappingURL=TweakModuleHeadline.js.map