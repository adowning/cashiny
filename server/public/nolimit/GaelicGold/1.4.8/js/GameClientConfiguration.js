"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameClientConfiguration = exports.JurisdictionNames = void 0;
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const APISettingsSystem_1 = require("../../interfaces/APISettingsSystem");
const NolimitApplication_1 = require("../../NolimitApplication");
var JurisdictionNames;
(function (JurisdictionNames) {
    JurisdictionNames["DEFAULT"] = "DEFAULT";
    JurisdictionNames["MALTA"] = "MT";
    JurisdictionNames["UKGC"] = "UKGC";
    JurisdictionNames["SWEDEN_LINKS"] = "SE";
    JurisdictionNames["SWEDEN_EVENTS"] = "SE";
    JurisdictionNames["SWEDEN_NO_LINKS"] = "SE";
    JurisdictionNames["DENMARK"] = "DK";
    JurisdictionNames["ESTONIA"] = "EE";
    JurisdictionNames["GERMANY"] = "DE";
    JurisdictionNames["ITALY"] = "IT";
    JurisdictionNames["LATVIA"] = "LV";
    JurisdictionNames["LITHUANIA"] = "LT";
    JurisdictionNames["NETHERLANDS"] = "NL";
    JurisdictionNames["NORSKTIPPING"] = "NORSKTIPPING";
    JurisdictionNames["ONTARIO"] = "ON";
    JurisdictionNames["PORTUGAL"] = "PT";
    JurisdictionNames["ROMANIA"] = "RO";
    JurisdictionNames["SOUTH_AFRICA"] = "ZA";
    JurisdictionNames["SPAIN"] = "ES";
    JurisdictionNames["USA"] = "US";
    JurisdictionNames["COLOMBIA"] = "CO";
    JurisdictionNames["GREECE"] = "GR";
    JurisdictionNames["BULGARIA"] = "BG";
})(JurisdictionNames = exports.JurisdictionNames || (exports.JurisdictionNames = {}));
class GameClientConfiguration {
    get isSet() {
        return this._isSet;
    }
    constructor(api) {
        this._api = api;
        this._isSet = false;
        // #478
        api.events.once(APIEventSystem_1.APIEvent.SERVER_VERSION, (data) => {
            this.serverVersion = data;
        });
        api.events.once(APIEventSystem_1.APIEvent.GAME_CLIENT_CONFIGURATION, (data) => this.onGameClientConfiguration(data));
    }
    updateScreen(screen) {
        const gambleGameRoundCloseIntervalHours = screen.find('span.gambleGameRoundCloseIntervalHours');
        for (let element of gambleGameRoundCloseIntervalHours) {
            element.innerHTML = this.gambleGameRoundCloseIntervalHours;
        }
        let gambleGameRoundCloseIntervalHoursTypeString = this._api.translations.translate("hour");
        if (this.gambleGameRoundCloseIntervalHours > 1) {
            gambleGameRoundCloseIntervalHoursTypeString = this._api.translations.translate("hours");
        }
        const gambleGameRoundCloseIntervalHoursType = screen.find('span.gambleGameRoundCloseIntervalHoursType');
        for (let element of gambleGameRoundCloseIntervalHoursType) {
            element.innerHTML = gambleGameRoundCloseIntervalHoursTypeString;
        }
        const gameRoundCloseInterval = screen.find('span.gameRoundCloseInterval');
        for (let element of gameRoundCloseInterval) {
            element.innerHTML = this.gameRoundCloseInterval;
        }
        const gameRoundCloseIntervalType = screen.find('span.gameRoundCloseIntervalType');
        for (let element of gameRoundCloseIntervalType) {
            element.innerHTML = this._api.translations.translate(this.gameRoundCloseIntervalType.toLowerCase());
        }
        if (this.hideRtp) {
            // remove main game and all FS rtp
            screen.find('.rtp').forEach(function (c) {
                c.style.display = 'none';
            });
        }
        //Check if gamble rules should be removed
        let showGambleRules = false;
        for (let i = 0; i < GameClientConfiguration.SHOW_GAMBLE_RULES_GAME_NAMES.length; i++) {
            if (GameClientConfiguration.SHOW_GAMBLE_RULES_GAME_NAMES[i] == NolimitApplication_1.NolimitApplication.apiPlugin.gameInfo.displayName) {
                if (this.gambleFiftyFiftyAllowed == true || this.gambleIntoBonusAllowed == true) {
                    showGambleRules = true;
                }
            }
        }
        if (showGambleRules == false) {
            // remove gambleGameRoundCloseIntervalHours statement(s)
            screen.find('.gambleGameRoundCloseIntervalHours').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.cryptoCurrencyRules) {
            // remove crypto currency statement(s)
            screen.find('.crypto-currency').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.fastSpinEnabled) {
            // remove fast spin statement(s) and/or gui-guide element(s)
            screen.find('.fastspin').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.autoPlaySettings.autoplayAllowed || this._api.options.autoplay === false) {
            // remove autoplay statement(s) and/or gui-guide element(s)
            screen.find('.autoplay').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.featureBuyEnabled) {
            // remove bonus buy statement(s)
            screen.find('.bonusBuy').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.boostedBetAllowed) {
            // remove boosted bets related statement(s) and/or gui-guide element(s)
            screen.find('.boostedBetAllowed').forEach((c) => {
                c.style.display = 'none';
            });
        }
        // NOTE: this is ugly for BOS to lock all .boostedBet, so I did temp fix above. Need to do better fix later.
        if (!this.boostedBetExtraRows && !this.boostedBetLockedReels) {
            // remove boosted bets related statement(s) and/or gui-guide element(s)
            screen.find('.boostedBet').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.boostedBetExtraRows) {
            // remove boosted bet extra rows only
            screen.find('.boostedBetXRows').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.boostedBetLockedReels) {
            // remove locked reels only
            screen.find('.boostedBetLockedReels').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.gambleFiftyFiftyAllowed && !this.gambleIntoBonusAllowed) {
            // remove both gamble related statement(s) and/or gui-guide element(s)
            screen.find('.gamble').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.gambleFiftyFiftyAllowed) {
            // remove gamble fifty fifty only
            screen.find('.gambleFiftyFifty').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.gambleIntoBonusAllowed) {
            // remove gamble into bonus only
            screen.find('.gambleIntoBonus').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.clockSettings.allowSetting) {
            screen.find('.clockSetting').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (this.jurisdictionName !== JurisdictionNames.NORSKTIPPING) {
            screen.find('.norsktipping-rtp').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.showSimulatedMaximumPayout) {
            screen.find('.simulated-maximum-payout').forEach((c) => {
                c.style.display = 'none';
            });
        }
        if (!this.featureBuyEnabled) {
            screen.find('.rtp-feature').forEach((c) => c.style.display = 'none');
        }
        for (let data of this._api.betFeatureController.getNotAllowedFeatures()) {
            screen.find('.' + data.name).forEach((c) => c.style.display = 'none');
        }
    }
    onGameClientConfiguration(config) {
        var _a;
        this.active = config.active;
        this.actionSpin = config.actionSpin;
        this.autoPlaySettings = config.autoPlaySettings;
        this.belowStakeWinRestriction = config.belowStakeWinRestriction;
        this.boostedBetAllowed = config.boostedBetAllowed;
        this.boostedBetExtraRows = config.boostedBetExtraRows;
        this.boostedBetLockedReels = config.boostedBetLockedReels;
        this.clockSettings = config.clockSettings;
        this.cryptoCurrencyRules = config.cryptoCurrencyRules;
        this.fastSpinEnabled = config.fastSpinEnabled;
        this.featureBuyEnabled = config.featureBuyEnabled;
        this.gambleFiftyFiftyAllowed = config.gambleFiftyFiftyAllowed;
        this.gambleGameRoundCloseIntervalHours = config.gambleGameRoundCloseIntervalHours;
        this.gambleIntoBonusAllowed = config.gambleIntoBonusAllowed;
        this.gameRoundCloseInterval = config.gameRoundCloseInterval;
        this.gameRoundCloseIntervalType = config.gameRoundCloseIntervalType;
        this.jurisdictionName = config.jurisdictionName;
        this.maxInactivityInMinutes = config.maxInactivityInMinutes;
        this.minimumSpinTime = config.minimumSpinTime;
        this.nolimitWinnersEnabled = config.nolimitWinnersEnabled;
        this.operator = config.operator;
        this.showGameVersionInGuiGuide = config.showGameVersionInGuiGuide;
        this.showGameClientBuiltDate = config.showGameClientBuiltDate;
        this.showSimulatedMaximumPayout = config.showSimulatedMaximumPayout;
        this.hideRtp = config.hideRtp;
        this.hideTicketLowBalance = config.hideTicketLowBalance;
        this.showRtpWatermark = config.showRtpWatermark;
        this.showMaxWinProbabilityWatermark = config.showMaxWinProbabilityWatermark;
        this.showNetPosition = config.showNetPosition;
        this.replaceSlotsInGameRules = config.replaceSlotsInGameRules;
        this.showMinBet = config.showMinBet;
        this.showMaxBet = config.showMaxBet;
        this.showMaxBetLevelInGameRules = config.showMaxBetLevelInGameRules;
        this.showServerVersion = config.showServerVersion;
        // For US jurisdiction - showLowProbabilityGfx will be false, for Rest it will be true.
        // For US jurisdiction - config value is false, for rest - it is (undefined, null).
        this.showLowProbabilityGfx = config.showLowProbabilityGfx === false ? false : true;
        this.showNearMissGfx = config.showNearMissGfx === false ? false : true;
        this.useCensoredGfx = config.useCensoredGfx;
        // QA/issues/532
        this.showBaseGameHighestWinInRules = config.showBaseGameHighestWinInRules;
        // slot-launcher/issues/551
        this.replaceWincapInfo = config.replaceWincapInfo;
        this.explicitContentWarning = config.explicitContentWarning || false;
        this.showOnlyMaxRTPForRange = config.showOnlyMaxRTPForRange;
        this.showVolatilityInGameRules = config.showVolatilityInGameRules; // QA/issues/601
        this.useCensoredGfxUS = config.useCensoredGfxUS; // slot-launcher/issue603
        this.useCensoredSoundUS = config.useCensoredSoundUS; // slot-launcher/issue 603
        this.displayIndividualWinsInGame = config.displayIndividualWinsInGame; // slot-launcher/issue 607
        this.spacebarSpinAllowed = config.spacebarSpinAllowed === false ? false : true; //slot-launcher/issue 627
        if (this._api.options.clock !== undefined && !this._api.options.clock) {
            this.clockSettings.allowSetting = false;
            this.clockSettings.show = false;
        }
        this.gameVersion = this._api.options.version;
        if (this.showGameClientBuiltDate) {
            this.gameVersionDate = ((_a = this._api.options.info) === null || _a === void 0 ? void 0 : _a.date) || undefined;
            if (this.gameVersionDate) {
                this.gameVersionDate = this.gameVersionDate.split("T")[0];
            }
        }
        this._isSet = true;
        this.applyRules();
    }
    applyRules() {
        this._api.settings.set(APISettingsSystem_1.APISetting.CLOCK, this.clockSettings.show);
        if (!this.fastSpinEnabled) {
            this._api.settings.set(APISettingsSystem_1.APISetting.FAST_SPIN, this.fastSpinEnabled);
        }
        this._api.clock.onGameClientConfigurationApplied();
        this._api.events.trigger(APIEventSystem_1.APIEvent.GAME_CLIENT_CONFIGURATION_APPLIED);
        this._api.events.trigger(APIEventSystem_1.APIEvent.MINIMUM_SPIN_TIME, this.minimumSpinTime);
    }
}
GameClientConfiguration.SHOW_GAMBLE_RULES_GAME_NAMES = ["Book of Shadows", "Immortal Fruits"];
exports.GameClientConfiguration = GameClientConfiguration;
//# sourceMappingURL=GameClientConfiguration.js.map