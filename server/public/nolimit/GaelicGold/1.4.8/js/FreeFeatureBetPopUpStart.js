"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreeFeatureBetPopUpStart = void 0;
const pixi_js_1 = require("pixi.js");
const TextLabel_1 = require("./TextLabel");
const Label_1 = require("../../../gui/labels/Label");
const OpenSans_1 = require("../../../loader/font/OpenSans");
const IconToggleButton_1 = require("../../../gui/buttons/IconToggleButton");
const PointerStateColorSet_1 = require("../../../gui/buttons/states/sets/PointerStateColorSet");
const PointerStateIconSet_1 = require("../../../gui/buttons/states/sets/PointerStateIconSet");
const Icon_1 = require("../../../gui/displayobjects/Icon");
const NolimitApplication_1 = require("../../../NolimitApplication");
const FontStatics_1 = require("../../../loader/font/FontStatics");
const ImgLoader_1 = require("../../../loader/ImgLoader");
/**
 * Created by Jerker Nord on 2022-02-18.
 */
class FreeFeatureBetPopUpStart extends PIXI.Container {
    constructor(okCallBack) {
        super();
        this._onOkClickedCallBack = okCallBack;
    }
    createPopUpView(data) {
        this._mainContainer = new pixi_js_1.Container();
        this.addChild(this._mainContainer);
        this._ticketContainer = new pixi_js_1.Container();
        this._mainContainer.addChild(this._ticketContainer);
        this._betContainer = new PIXI.Container();
        this._congratsText = new Label_1.Label(NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("Congratulations!"), FreeFeatureBetPopUpStart.GAME_FEATURE_CONGRATS_TEXT);
        this._congratsText.anchor.set(0.5, 0.5);
        this._congratsText.position.y = 0;
        this._mainContainer.addChild(this._congratsText);
        this._awardedText = new Label_1.Label(NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("You have been awarded a Nolimit Bonus!"), FreeFeatureBetPopUpStart.GAME_FEATURE_AWARDED_TEXT);
        this._awardedText.anchor.set(0.5, 0.5);
        this._awardedText.position.y = this._congratsText.height + 10;
        this._mainContainer.addChild(this._awardedText);
        this._ticketContainer.position.y = this._awardedText.position.y + this._awardedText.height + 10;
        this._featureBG = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(FreeFeatureBetPopUpStart.TICKET_ASSET_NAME));
        this._ticketContainer.addChild(this._featureBG);
        this._ticketContainer.addChild(this._betContainer);
        this._featureImg = new PIXI.Sprite(ImgLoader_1.ImgLoader.getImgTexture(data.featureName));
        this._featureImg.position.x = 250 + (((this._featureBG.width - 250) / 2) - (this._featureImg.width / 2));
        this._featureImg.position.y = Math.floor((this._featureBG.height - this._featureImg.height) / 2) - 3;
        this._ticketContainer.addChild(this._featureImg);
        this._valueLabel = new Label_1.Label(NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("VALUE"), FreeFeatureBetPopUpStart.GAME_FEATURE_BET_TEXT);
        this._valueLabel.anchor.set(0, 0.5);
        this._betContainer.addChild(this._valueLabel);
        this._currencyLabel = new Label_1.Label(" " + NolimitApplication_1.NolimitApplication.apiPlugin.currency.getCode(), FreeFeatureBetPopUpStart.GAME_FEATURE_CURRANCY_STYLE);
        this._currencyLabel.anchor.set(0, 0.5);
        this._currencyLabel.visible = (!NolimitApplication_1.NolimitApplication.apiPlugin.options.hideCurrency); //#108
        this._betContainer.addChild(this._currencyLabel);
        this._currencyLabel.position.y = this._valueLabel.position.y;
        this._currencyLabel.position.x = this._valueLabel.position.x + this._valueLabel.width;
        this._betContainer.position.x = (230 / 2) - (this._betContainer.width / 2);
        this._betContainer.position.y = 50;
        this._totalAmountLabel = new TextLabel_1.TextLabel("", FreeFeatureBetPopUpStart.GAME_FEATURE_PRICE_STYLE, {
            landscapeMaxWidth: 190,
            portraitMaxWith: 190
        });
        const minimumPrecision = (data.bet < 10 || data.bet % 1 != 0) ? 2 : 0;
        const formatted = NolimitApplication_1.NolimitApplication.apiPlugin.currency.formatValue(data.totalAmount, { minimumPrecision: minimumPrecision });
        this._totalAmountLabel.value = formatted;
        this._totalAmountLabel.position.x = (230 / 2);
        this._totalAmountLabel.position.y = this._betContainer.position.y + this._betContainer.height + 10;
        this._ticketContainer.addChild(this._totalAmountLabel);
        const colors = new PointerStateColorSet_1.PointerStateColorSet(0xffffffff);
        let onIcons1 = new PointerStateIconSet_1.PointerStateIconSet(new Icon_1.Icon(ImgLoader_1.ImgLoader.getImgTexture(FreeFeatureBetPopUpStart.BUY_BTN_ASSET_NAME)));
        this._okButton = new IconToggleButton_1.IconToggleButton("ok_btn", onIcons1, colors);
        this._okButton.addClickCallback(() => this.onOkButtonClicked());
        this._okButton.toggled = false;
        this._okButton.enable(true);
        this._okButton.position.x = Math.floor(204 / 2 - (this._okButton.width / 2) + 12);
        this._okButton.position.y = this._featureBG.height - this._okButton.height - 12;
        this._ticketContainer.addChild(this._okButton);
        this._okLabel = new TextLabel_1.TextLabel(NolimitApplication_1.NolimitApplication.apiPlugin.translations.translate("OK"), FreeFeatureBetPopUpStart.GAME_FEATURE_OK_TEXT, {
            landscapeMaxWidth: this._okButton.width - 30,
            portraitMaxWith: this._okButton.width - 30
        });
        this._okLabel.anchor.set(0.5, 0.5);
        this._okLabel.position.set(this._okButton.x + this._okButton.width * 0.5, this._okButton.y + this._okButton.height * 0.5 - 4);
        this._ticketContainer.addChild(this._okLabel);
        this._awardedText.position.x = this._ticketContainer.width / 2;
        this._congratsText.position.x = this._ticketContainer.width / 2;
        this.onResize();
    }
    onOkButtonClicked() {
        NolimitApplication_1.NolimitApplication.removeDialog(this);
        this._onOkClickedCallBack();
    }
    onResize() {
        this._mainContainer.position.y = (720 - this._mainContainer.height) * 0.5;
        this._mainContainer.position.x = (720 - this._mainContainer.width) * 0.5;
        this._totalAmountLabel.onResize();
        this._okLabel.onResize();
    }
}
FreeFeatureBetPopUpStart.TICKET_ASSET_NAME = "nolimitBonus/ticket@2x.png";
FreeFeatureBetPopUpStart.BUY_BTN_ASSET_NAME = "nolimitBonus/buyBtn@2x.png";
FreeFeatureBetPopUpStart.GAME_FEATURE_OK_TEXT = new PIXI.TextStyle({
    fill: "#fff500",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 30,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
});
FreeFeatureBetPopUpStart.GAME_FEATURE_PRICE_STYLE = new PIXI.TextStyle({
    fill: "#a76f00",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 35,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
FreeFeatureBetPopUpStart.GAME_FEATURE_BET_TEXT = new PIXI.TextStyle({
    fill: "#a76f00",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
FreeFeatureBetPopUpStart.GAME_FEATURE_CONGRATS_TEXT = new PIXI.TextStyle({
    fill: "#ffffff",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 36,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
FreeFeatureBetPopUpStart.GAME_FEATURE_AWARDED_TEXT = new PIXI.TextStyle({
    fill: "#7eff00",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.LIGHT
});
FreeFeatureBetPopUpStart.GAME_FEATURE_CURRANCY_STYLE = new PIXI.TextStyle({
    fill: "#a76f00",
    fontFamily: OpenSans_1.OpenSans.FAMILY,
    fontSize: 24,
    fontStyle: FontStatics_1.FontStyle.NORMAL,
    fontWeight: FontStatics_1.FontWeight.EXTRA_BOLD
});
exports.FreeFeatureBetPopUpStart = FreeFeatureBetPopUpStart;
//# sourceMappingURL=FreeFeatureBetPopUpStart.js.map