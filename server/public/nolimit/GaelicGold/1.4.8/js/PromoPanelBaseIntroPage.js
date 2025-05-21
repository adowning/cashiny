"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoPanelBaseIntroPage = void 0;
const PromoPanelAssetConfig_1 = require("../config/PromoPanelAssetConfig");
const SlideShowPage_1 = require("@nolimitcity/slot-launcher/bin/gui/views/slideshow/SlideShowPage");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const gsap_1 = require("gsap");
const TimelineSprite_1 = require("../utils/TimelineSprite");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
/**
 * Created by jonas on 2020-04-02.
 */
class PromoPanelBaseIntroPage extends SlideShowPage_1.SlideShowPage {
    constructor(backgroundColor, header, headerIconName, headerStyle) {
        super(undefined, undefined, backgroundColor);
        const headline = this.createHeader(header, headerIconName, headerStyle || PromoPanelBaseIntroPage.HEADER_STYLE);
        this._tabTarget = new PIXI.Point(-(NolimitApplication_1.NolimitApplication.screenBounds.width * 0.5) - 40, -178);
        this._tab = this.createTab();
        this._tab.alpha = 0;
        this.addChild(this._tab, headline);
    }
    createHeader(text, iconName, headerStyle) {
        const container = new PIXI.Container();
        const icon = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(iconName));
        const header = new Label_1.Label(text, headerStyle);
        const scale = 65 / icon.height;
        icon.scale.set(scale, scale);
        container.addChild(icon, header);
        GuiLayout_1.GuiLayout.align([icon, header], 24, GuiLayout_1.Align.TOP, GuiLayout_1.Direction.HORIZONTAL);
        container.pivot.set(container.width * 0.5, container.height * 0.5);
        container.position.set(0, -139);
        this.icon = icon;
        return container;
    }
    createTab() {
        const container = new PIXI.Container();
        const tab = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(PromoPanelAssetConfig_1.PromoPanelAssetConfig.INTRO_NO_LIMIT_PROMOTIONS_TAB));
        tab.scale.set(0.8, 0.8);
        const frames = ["gamificationStar_00282.png", "gamificationStar_00283.png", "gamificationStar_00284.png", "gamificationStar_00285.png", "gamificationStar_00286.png", "gamificationStar_00287.png", "gamificationStar_00288.png", "gamificationStar_00289.png", "gamificationStar_00290.png", "gamificationStar_00291.png", "gamificationStar_00292.png", "gamificationStar_00293.png", "gamificationStar_00294.png", "gamificationStar_00295.png", "gamificationStar_00296.png", "gamificationStar_00297.png", "gamificationStar_00298.png", "gamificationStar_00299.png", "gamificationStar_00300.png", "gamificationStar_00301.png", "gamificationStar_00302.png", "gamificationStar_00303.png", "gamificationStar_00304.png", "gamificationStar_00305.png", "gamificationStar_00306.png", "gamificationStar_00307.png", "gamificationStar_00308.png", "gamificationStar_00309.png", "gamificationStar_00310.png", "gamificationStar_00311.png", "gamificationStar_00312.png", "gamificationStar_00313.png", "gamificationStar_00314.png", "gamificationStar_00315.png", "gamificationStar_00316.png", "gamificationStar_00317.png", "gamificationStar_00318.png", "gamificationStar_00319.png", "gamificationStar_00320.png", "gamificationStar_00321.png", "gamificationStar_00322.png", "gamificationStar_00323.png", "gamificationStar_00324.png", "gamificationStar_00325.png", "gamificationStar_00326.png", "gamificationStar_00327.png", "gamificationStar_00328.png", "gamificationStar_00329.png", "gamificationStar_00330.png", "gamificationStar_00331.png", "gamificationStar_00332.png", "gamificationStar_00333.png", "gamificationStar_00334.png", "gamificationStar_00335.png", "gamificationStar_00336.png", "gamificationStar_00337.png", "gamificationStar_00338.png", "gamificationStar_00339.png", "gamificationStar_00340.png", "gamificationStar_00341.png", "gamificationStar_00342.png", "gamificationStar_00343.png", "gamificationStar_00344.png", "gamificationStar_00345.png", "gamificationStar_00346.png", "gamificationStar_00347.png", "gamificationStar_00348.png", "gamificationStar_00349.png", "gamificationStar_00350.png", "gamificationStar_00351.png", "gamificationStar_00352.png", "gamificationStar_00353.png", "gamificationStar_00354.png", "gamificationStar_00355.png", "gamificationStar_00356.png", "gamificationStar_00357.png"];
        const textures = [];
        for (let frame of frames) {
            textures.push(ImgLoader_1.ImgLoader.getImgTexture(frame));
        }
        const animation = new TimelineSprite_1.TimelineSprite(textures, 30);
        animation.anchor.set(0.5, 0.5);
        animation.position.set(113, 56);
        animation.scale.set(0.53, 0.53);
        tab.addChild(animation);
        container.addChild(tab);
        this._starTween = new gsap_1.TimelineLite();
        this._starTween.add(animation.getAnimationAutoShowHide(true, false));
        this._starTween.add(animation.getAnimationAutoShowHide(true, false, [70, 50]), "+=0.9");
        this._starTween.add(animation.getAnimationAutoShowHide(true, false, [49]), "+=0.5");
        this._starTween.add(animation.getAnimationAutoShowHide(true, false, [70, 50]), "+=0.7");
        this._starTween.add(animation.getAnimationAutoShowHide(true, false, [49]), "+=0.9");
        return container;
    }
    resize() {
        this._tabTarget = new PIXI.Point(-(NolimitApplication_1.NolimitApplication.screenBounds.width * 0.5) - 40, -178);
        this._tab.position.set(-(NolimitApplication_1.NolimitApplication.screenBounds.width * 0.5) - 40, -178);
    }
    enable(enable) {
        super.enable(enable);
        if (enable) {
            this._starTween.play(0);
            gsap_1.TweenLite.fromTo(this._tab, 0.2, { x: this._tabTarget.x - 150 }, { x: this._tabTarget.x });
            gsap_1.TweenLite.to(this._tab, 0.2, { alpha: 1 });
        }
        else {
            this._starTween.pause(0);
            gsap_1.TweenLite.to(this._tab, 0.2, { alpha: 0 });
        }
    }
}
PromoPanelBaseIntroPage.HEADER_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 45,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    dropShadow: true,
    dropShadowAngle: 1.57,
    dropShadowDistance: 3,
    dropShadowColor: "#000000",
    dropShadowAlpha: 0.2,
    padding: 50
});
exports.PromoPanelBaseIntroPage = PromoPanelBaseIntroPage;
//# sourceMappingURL=PromoPanelBaseIntroPage.js.map