"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntroPageCreator = void 0;
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const PromoPanelAssetConfig_1 = require("../config/PromoPanelAssetConfig");
const OpenSans_1 = require("@nolimitcity/slot-launcher/bin/loader/font/OpenSans");
const FontLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/FontLoader");
const NolimitPromotionPlugin_1 = require("../NolimitPromotionPlugin");
const NolimitWinnersIntroPage_1 = require("./NolimitWinnersIntroPage");
const PromoPanelBaseIntroPage_1 = require("./PromoPanelBaseIntroPage");
const NolimitActionSpinIntroPage_1 = require("./NolimitActionSpinIntroPage");
const PromoPanelTextStyles_1 = require("../config/PromoPanelTextStyles");
const PromoPanelLabelIDs_1 = require("../enums/PromoPanelLabelIDs");
/**
 * Created by jonas on 2020-03-19.
 */
class IntroPageCreator {
    constructor() {
    }
    getIntroPages(promoPlugin) {
        const fontLoader = new FontLoader_1.FontLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_600);
        fontLoader.add(OpenSans_1.OpenSans.NORMAL_800);
        const imgLoader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        imgLoader.add("NolimitBonusAnimation", "/node_modules/@nolimitcity/promo-panel/resources/default/intro/NolimitBonusAnimation.json");
        for (let asset of PromoPanelAssetConfig_1.PromoPanelAssetConfig.getIntroAssets()) {
            imgLoader.add(asset.name, asset.url);
        }
        const loading = Promise.all([imgLoader.load(), fontLoader.load()]);
        return loading.then(value => {
            const pages = [];
            /*            if (promoPlugin.hasNolimitBonus()) {
                            const featureData = NolimitPromotionPlugin.apiPlugIn.betFeatureController.getAllFeatureData();
                            pages.push(new NolimitBonusIntroPage(
                                featureData,
                                0xee2952,
                                NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs.BUY_FEATURE_TITLE),
                                PromoPanelAssetConfig.NOLIMIT_BONUS_ICON,
                                PromoPanelTextStyles.FEATURE_BASE_BUY_FEATURE_TITLE
                            ));
                        }*/
            if (promoPlugin.hasActionSpin()) {
                pages.push(new NolimitActionSpinIntroPage_1.NolimitActionSpinIntroPage(0xfec20e, NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.ACTION_SPINS), PromoPanelAssetConfig_1.PromoPanelAssetConfig.ACTION_SPINS_ICON, PromoPanelTextStyles_1.PromoPanelTextStyles.FEATURE_ACTION_SPIN_REPLAY_TITLE));
            }
            if (promoPlugin.hasNolimitWinners()) {
                pages.push(new NolimitWinnersIntroPage_1.NolimitWinnersIntroPage(0x68a4d9, NolimitPromotionPlugin_1.NolimitPromotionPlugin.apiPlugIn.translations.translate(PromoPanelLabelIDs_1.PromoPanelLabelIDs.REPLAY_FEATURE_TITLE), PromoPanelAssetConfig_1.PromoPanelAssetConfig.NOLIMIT_WINNERS_ICON, PromoPanelTextStyles_1.PromoPanelTextStyles.FEATURE_BASE_REPLAY_TITLE));
            }
            if (promoPlugin.hasNolimitTournaments()) {
                pages.push(new PromoPanelBaseIntroPage_1.PromoPanelBaseIntroPage(0xff0000, "Nolimit Tournaments", PromoPanelAssetConfig_1.PromoPanelAssetConfig.NOLIMIT_BONUS_ICON));
            }
            if (promoPlugin.hasNolimitVoucher()) {
                pages.push(new PromoPanelBaseIntroPage_1.PromoPanelBaseIntroPage(0xff0000, "Nolimit Voucher", PromoPanelAssetConfig_1.PromoPanelAssetConfig.NOLIMIT_BONUS_ICON));
            }
            return pages;
        });
    }
}
exports.IntroPageCreator = IntroPageCreator;
//# sourceMappingURL=IntroPageCreator.js.map