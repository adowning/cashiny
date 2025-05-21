"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitWinnersIntroPage = void 0;
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const PromoPanelAssetConfig_1 = require("../config/PromoPanelAssetConfig");
const PromoPanelBaseIntroPage_1 = require("./PromoPanelBaseIntroPage");
const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
/**
 * Created by jonas on 2020-03-19.
 */
class NolimitWinnersIntroPage extends PromoPanelBaseIntroPage_1.PromoPanelBaseIntroPage {
    constructor(backgroundColor, header, headerIconName, headerStyle) {
        super(backgroundColor, header, headerIconName, headerStyle);
        const string = "Replay your own or others best game rounds for all Nolimit City games!";
        const textField = new Label_1.Label(NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(string), GuiDefaults_1.GuiDefaults.INTRO_PAGE_TEXT);
        textField.anchor.x = 1;
        textField.anchor.y = 0.5;
        textField.position.x = -10;
        textField.position.y = 35;
        const image = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.INTRO_NOLIMIT_WINNERS));
        image.anchor.set(0.5, 0.5);
        image.position.set(200, 62);
        this.addChild(image, textField);
    }
}
exports.NolimitWinnersIntroPage = NolimitWinnersIntroPage;
//# sourceMappingURL=NolimitWinnersIntroPage.js.map