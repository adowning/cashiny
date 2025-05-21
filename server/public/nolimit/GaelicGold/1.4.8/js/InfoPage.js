"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoPage = exports.SettingSectionIDs = void 0;
const HtmlBasePage_1 = require("./HtmlBasePage");
const SlotKeypad_1 = require("../../../../SlotKeypad");
const GamePlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/GamePlugin");
const GamblePlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/GamblePlugin");
const NolimitLauncher_1 = require("@nolimitcity/slot-launcher/bin/NolimitLauncher");
const TemplateLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/TemplateLoader");
const GameMenuDialogView_1 = require("../GameMenuDialogView");
const KeypadPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/KeypadPlugin");
const ApiPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/ApiPlugin");
/**
 * Created by Jonas Wålekvist on 2019-11-25.
 */
var SettingSectionIDs;
(function (SettingSectionIDs) {
    SettingSectionIDs["GUIDE"] = "guide";
    SettingSectionIDs["RULES"] = "rules";
    SettingSectionIDs["PAYTABLE"] = "paytable";
})(SettingSectionIDs = exports.SettingSectionIDs || (exports.SettingSectionIDs = {}));
class InfoPage extends HtmlBasePage_1.HtmlBasePage {
    constructor(parentDiv, screenSystem, name, parentView, header) {
        super(parentDiv, screenSystem, name, parentView, header);
        this.removeHeader();
    }
    goToSection(toSection) {
        const sectionHtmlClasses = {
            guide: ".gui-guide",
            rules: ".rules",
            paytable: ".paytable"
        };
        let section;
        switch (toSection) {
            case SettingSectionIDs.GUIDE:
                section = this.screen.find(sectionHtmlClasses.guide)[0];
                break;
            case SettingSectionIDs.RULES:
                section = this.screen.find(sectionHtmlClasses.rules)[0];
                break;
            case SettingSectionIDs.PAYTABLE:
                section = this.screen.find(sectionHtmlClasses.paytable)[0];
                break;
        }
        section.scrollIntoView();
    }
    activate() {
        super.activate();
        SlotKeypad_1.SlotKeypad.apiPlugIn.payoutMultiplier.updateScreen(this.screen);
        SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.updateScreen(this.screen);
        SlotKeypad_1.SlotKeypad.apiPlugIn.maximumWinCap.updateScreen(this.screen);
        SlotKeypad_1.SlotKeypad.apiPlugIn.rtp.updateScreen(this.screen);
        SlotKeypad_1.SlotKeypad.apiPlugIn.gameInfo.updateScreen(this.screen);
        this.updateGamble();
        this.updateBoost();
        this.updateBetFeatures();
        this.updateBetRules();
        this.screen.show();
    }
    deactivate() {
        super.deactivate();
        this.screen.hide();
    }
    load() {
        const templateLoader = new TemplateLoader_1.TemplateLoader(SlotKeypad_1.SlotKeypad.apiPlugIn.resources.getStaticRoot());
        templateLoader.add({
            name: GameMenuDialogView_1.MenuButtonIDs.INFO,
            url: "node_modules/@nolimitcity/slot-keypad/resources/default/templates/game-info.mustache"
        });
        return templateLoader.load()
            .then((assets) => this.addLoadedScreenTemplates(assets))
            .then(() => this.assembleInfoPage());
    }
    assembleInfoPage() {
        const promises = [];
        let data = this.prepareDataForHTMLInfo();
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if (plugin.getGameRules != undefined) {
                if ((0, GamePlugin_1.isGamePlugin)(plugin)) {
                    promises.push(plugin.getGameRules().then((value) => this.addHtmlToInfoSection(value, "rules", data, "game")));
                }
                else if ((0, GamblePlugin_1.isGamblePlugin)(plugin)) {
                    promises.push(plugin.getGameRules().then((value) => this.addHtmlToInfoSection(value, "rules", data, "gamble")));
                }
                else if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                    promises.push(plugin.getGameRules().then((value) => this.addHtmlToInfoSection(value, "rules", data, "common")));
                }
                else {
                    promises.push(plugin.getGameRules().then((value) => this.addHtmlToInfoSection(value, "rules", data)));
                }
            }
            if (plugin.getKeypadGuide) {
                if ((0, KeypadPlugin_1.isKeypadPlugin)(plugin)) {
                    data = SlotKeypad_1.SlotKeypad.getGuiGuideData(data);
                }
                promises.push(plugin.getKeypadGuide().then((value) => this.addHtmlToInfoSection(value, "gui-guide", data)));
            }
            if ((0, GamePlugin_1.isGamePlugin)(plugin)) {
                promises.push(plugin.getPaytable().then((value) => this.addHtmlToInfoSection(value, "paytable", data)));
            }
        }
        return Promise.all(promises);
    }
    updateBoost() {
        const allowed = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures();
        let hasBoost = false;
        for (let feature of allowed) {
            if (feature.type == "BOOSTED_BET") {
                hasBoost = true;
                break;
            }
        }
        if (!hasBoost) {
            this.screen.find('.boostedBet').forEach((e) => e.style.display = 'none');
        }
    }
    updateGamble() {
        // find -> gamble
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if ((0, GamblePlugin_1.isGamblePlugin)(plugin)) {
                return;
            }
        }
        this.screen.find('.gamble').forEach((e) => e.style.display = 'none');
    }
    updateBetFeatures() {
        const allowed = SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures();
        const bonus = [];
        const booster = [];
        for (let feature of allowed) {
            if (feature.type == "FREESPIN") {
                bonus.push(feature);
            }
            else {
                booster.push(feature);
            }
        }
        const nolimitBonus = this.screen.find("tr.noLimitBonus")[0];
        if (nolimitBonus != undefined) {
            for (let bonusFeature of bonus) {
                const buyFeature = nolimitBonus.querySelector("th #" + bonusFeature.name);
                if (buyFeature != undefined) {
                    buyFeature.innerHTML = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.render('<p id="{{name}}">{{#tr}}Bonus can be activated for {{price}} times the base bet, maximum possible base bet is {{maxBet}}.{{/tr}}</p>', {
                        name: bonusFeature.name,
                        maxBet: SlotKeypad_1.SlotKeypad.apiPlugIn.currency.format(bonusFeature.getMaxBet()),
                        price: bonusFeature.price
                    });
                }
            }
        }
        const nolimitBooster = this.screen.find("tr.noLimitBooster")[0];
        if (nolimitBooster != undefined) {
            for (let bonusFeature of booster) {
                const buyFeature = nolimitBooster.querySelector("th #" + bonusFeature.name);
                if (buyFeature != undefined) {
                    buyFeature.innerHTML = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.render('<p id="{{name}}">{{#tr}}Booster can be activated for {{price}} times the base bet, maximum possible base bet is {{maxBet}}.{{/tr}}</p>', {
                        name: bonusFeature.name,
                        maxBet: SlotKeypad_1.SlotKeypad.apiPlugIn.currency.format(bonusFeature.getMaxBet()),
                        price: bonusFeature.price
                    });
                }
            }
        }
    }
    updateBetRules() {
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.showMinBet) {
            const value = SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.getBetLevels()[0];
            const valueString = SlotKeypad_1.SlotKeypad.apiPlugIn.currency.format(value);
            this.screen.find(".rules #common .minBet .value").forEach((e) => e.innerText = valueString);
        }
        else {
            this.screen.find(".rules #common .minBet").forEach((e) => e.style.display = 'none');
        }
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.showMaxBet) {
            let maxCost = +SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.getBetLevels()[SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.getBetLevels().length - 1];
            for (let feature of SlotKeypad_1.SlotKeypad.apiPlugIn.betFeatureController.getAllowedFeatures()) {
                maxCost = Math.max(maxCost, feature.getMaxCost());
            }
            const maxCostString = SlotKeypad_1.SlotKeypad.apiPlugIn.currency.format(maxCost);
            this.screen.find(".rules #common .maxBet .value").forEach((e) => e.innerText = maxCostString);
        }
        else {
            this.screen.find(".rules #common .maxBet").forEach((e) => e.style.display = 'none');
        }
        if (SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration.showMaxBetLevelInGameRules) {
            const value = SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.getBetLevels()[SlotKeypad_1.SlotKeypad.apiPlugIn.betLevel.getBetLevels().length - 1];
            const valueString = SlotKeypad_1.SlotKeypad.apiPlugIn.currency.format(value);
            this.screen.find(".rules #common .maxBetLevel .value").forEach((e) => e.innerText = valueString);
        }
        else {
            this.screen.find(".rules #common .maxBetLevel").forEach((e) => e.style.display = 'none');
        }
    }
    addHtmlToInfoSection(value, sectionId, data, insertInDivWithId = undefined) {
        return new Promise((resolve, reject) => {
            const section = this.screen.find("#" + sectionId)[0];
            if (section) {
                if (insertInDivWithId != undefined) {
                    const fetchedDiv = this.screen.find("#" + insertInDivWithId)[0];
                    if (fetchedDiv) {
                        fetchedDiv.innerHTML = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.render(value, data);
                    }
                }
                else {
                    let div = document.createElement("div");
                    section.append(div);
                    div.innerHTML = SlotKeypad_1.SlotKeypad.apiPlugIn.translations.render(value, data);
                }
            }
            resolve();
        });
    }
    prepareDataForHTMLInfo() {
        const gcc = SlotKeypad_1.SlotKeypad.apiPlugIn.gameClientConfiguration;
        const dx1 = !!(SlotKeypad_1.SlotKeypad.apiPlugIn.options && SlotKeypad_1.SlotKeypad.apiPlugIn.options.game && SlotKeypad_1.SlotKeypad.apiPlugIn.options.game.indexOf("DX1") > -1);
        const data = {
            dx1: dx1,
            fastSpinEnabled: gcc.fastSpinEnabled,
            replaceSlotsInGameRules: gcc.replaceSlotsInGameRules,
            showGameVersionInGuiGuide: gcc.showGameVersionInGuiGuide,
            gameVersion: gcc.gameVersion,
            showGameClientBuiltDate: gcc.showGameClientBuiltDate,
            gameVersionDate: gcc.gameVersionDate,
            showServerVersion: gcc.showServerVersion,
            serverVersion: gcc.serverVersion,
            showNearMissGfx: gcc.showNearMissGfx,
            showBaseGameHighestWinInRules: gcc.showBaseGameHighestWinInRules,
            replaceWincapInfo: gcc.replaceWincapInfo,
            showOnlyMaxRTPForRange: gcc.showOnlyMaxRTPForRange,
            showLowProbabilityGfx: gcc.showLowProbabilityGfx,
            gambleFiftyFiftyAllowed: gcc.gambleFiftyFiftyAllowed,
            canShowVolatilityInCommonRules: gcc.showVolatilityInGameRules // https://github.com/nolimitcity/QA/issues/601
        };
        return data;
    }
}
exports.InfoPage = InfoPage;
//# sourceMappingURL=InfoPage.js.map