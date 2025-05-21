"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitBonusIntroPage = void 0;
/**
 * Created by Jonas Wålekvist on 2024-02-08.
 */
const SlideShowPage_1 = require("@nolimitcity/slot-launcher/bin/gui/views/slideshow/SlideShowPage");
const SlotKeypadViewSettings_1 = require("../SlotKeypadViewSettings");
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const Label_1 = require("@nolimitcity/slot-launcher/bin/gui/labels/Label");
const GuiLayout_1 = require("@nolimitcity/slot-launcher/bin/gui/utils/GuiLayout");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontStatics_1 = require("@nolimitcity/slot-launcher/bin/loader/font/FontStatics");
const SkinLoader_1 = require("../../SkinLoader");
const gsap_1 = require("gsap");
const SlotKeypad_1 = require("../../SlotKeypad");
const GuiDefaults_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaults");
const NLCStaticText_1 = require("@nolimitcity/slot-launcher/bin/display/NLCStaticText");
const GuiDefaultTextures_1 = require("@nolimitcity/slot-launcher/bin/gui/default/GuiDefaultTextures");
const NolimitBonusFeatureTicket_1 = require("@nolimitcity/slot-launcher/bin/gui/buttons/concretebuttons/parts/NolimitBonusFeatureTicket");
class NolimitBonusIntroPage extends SlideShowPage_1.SlideShowPage {
    constructor() {
        super(undefined, undefined, SlotKeypadViewSettings_1.SlotKeypadViewSettings.BOOSTED_BET_COLOR);
        const headline = this.createHeader("Nolimit Bonus", GuiDefaultTextures_1.GuiDefaultTextures.NOLIMIT_BONUS_ICON, NolimitBonusIntroPage.HEADER_STYLE);
        this.addChild(headline);
        let data = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures().reverse();
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].type !== "FREESPIN") {
                data.splice(i, 1);
            }
        }
        const yPos = data.length > 1 ? 0 : 23;
        const ticketContainer = this.createTickets(data);
        ticketContainer.position.set(20, yPos);
        //ticketContainer.scale.set(0.65, 0.65);
        this.addChild(ticketContainer);
        const textIndex = Math.min(1, data.length - 1);
        const texts = [
            "Buy your way into the most exciting feature of the game!",
            "Buy your way into the most exciting features of the game!"
        ];
        const textField = new Label_1.Label(SlotKeypad_1.SlotKeypad.apiPlugIn.translations.translate(texts[textIndex]), GuiDefaults_1.GuiDefaults.INTRO_PAGE_TEXT);
        textField.anchor.x = 1;
        textField.anchor.y = 0.5;
        textField.position.x = -10;
        textField.position.y = 35;
        this.addChild(textField);
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
        return container;
    }
    createTickets(data) {
        const container = new PIXI.Container();
        const tickets = [];
        for (let item of data) {
            tickets.push(this.createTicket(item));
        }
        const totalRot = 0.25;
        const totalXDistance = 23;
        const totalYDistance = 78;
        let rotIncrement = 0;
        let rotOffset = 0;
        let test = 0;
        let incrementX = 0;
        let incrementY = 0;
        if (tickets.length > 1) {
            rotIncrement = totalRot / (tickets.length - 1); //Spread between the tickets
            test = -(rotIncrement * (tickets.length - 1)) * 0.5; //Rotation of the whole fan, so the center one is has rot = 0
            rotOffset = -0.05; //Offset so we get a slight tilt to the whole fan.
            incrementX = totalXDistance / (tickets.length - 1);
            incrementY = totalYDistance / (tickets.length - 1);
        }
        const ticketAnimations = [];
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            const tl = new gsap_1.TimelineLite();
            const endRotation = rotIncrement * i + test + rotOffset;
            tl.add(new gsap_1.TweenLite(ticket, 0.5, {
                x: incrementX * i,
                y: incrementY * i,
                rotation: endRotation,
                ease: gsap_1.Elastic.easeOut.config(1, 0.75)
            }));
            /*    ticket.rotation =  rotIncrement * i + test + rotOffset;
                ticket.x = incrementX * i;
                ticket.y = incrementY * i;
                */
            const priceTag = ticket.getChildByName("priceTag");
            if (priceTag) {
                tl.add(new gsap_1.TweenLite(priceTag, 0.5, {
                    rotation: -endRotation,
                    ease: gsap_1.Elastic.easeOut.config(1, 0.75)
                }), 0);
                priceTag.rotation = -ticket.rotation;
            }
            ticketAnimations.push(tl);
            container.addChild(ticket);
        }
        this._fanAnimation = new gsap_1.TimelineLite({ paused: true });
        this._fanAnimation.add(ticketAnimations, 0);
        return container;
    }
    createTicket(data) {
        const cont = new PIXI.Container();
        const ticket = new NolimitBonusFeatureTicket_1.NolimitBonusFeatureTicket(data.name);
        const priceTag = this.makePriceTag(data.price);
        priceTag.name = "priceTag";
        priceTag.position.set(200, 10);
        cont.addChild(ticket);
        cont.pivot.set(-33, cont.height * 0.5);
        cont.addChild(priceTag);
        return cont;
    }
    makePriceTag(value) {
        const container = new PIXI.Container();
        const text = new NLCStaticText_1.NLCStaticText("x " + value, NolimitBonusIntroPage.PRICE_TAG_STYLE);
        text.anchor.set(0.5, 0.5);
        text.position.set(0, 0);
        const tag = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(SkinLoader_1.SkinLoader.NOLIMIT_BONUS_PRICE_TAG));
        tag.anchor.set(0.5, 0.4);
        container.addChild(tag, text);
        return container;
    }
    enable(enable) {
        super.enable(enable);
        if (this._fanAnimation) {
            if (enable) {
                this._fanAnimation.play(0);
            }
            else {
                this._fanAnimation.pause(0);
            }
        }
    }
}
NolimitBonusIntroPage.HEADER_STYLE = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 50,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.SEMI_BOLD,
    dropShadow: true,
    dropShadowAngle: -1,
    dropShadowDistance: -3,
    dropShadowColor: "#b62449",
    padding: 50
});
NolimitBonusIntroPage.PRICE_TAG_STYLE = new PIXI.TextStyle({
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 20,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD,
    dropShadow: true,
    dropShadowAngle: 1.57,
    dropShadowColor: "#ef9720",
    dropShadowDistance: 2,
    fill: "#f4f2f3",
    padding: 3,
    stroke: "#FFAA05",
    strokeThickness: 2,
    lineJoin: "round"
});
exports.NolimitBonusIntroPage = NolimitBonusIntroPage;
//# sourceMappingURL=NolimitBonusIntroPage.js.map