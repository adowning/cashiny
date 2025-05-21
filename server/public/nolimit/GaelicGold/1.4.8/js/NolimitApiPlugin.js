"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NolimitApiPlugin = void 0;
const ClockModel_1 = require("./ClockModel");
const SlotStateHandler_1 = require("./SlotStateHandler");
const APIEventSystem_1 = require("../../interfaces/APIEventSystem");
const APISettingsSystem_1 = require("../../interfaces/APISettingsSystem");
const APIErrorSystem_1 = require("../../interfaces/APIErrorSystem");
const Rtp_1 = require("./Rtp");
const MaximumWinCap_1 = require("./MaximumWinCap");
const PayoutMultiplier_1 = require("./PayoutMultiplier");
const Fullscreen_1 = require("./Fullscreen");
const WinTracker_1 = require("./WinTracker");
const ReplayController_1 = require("./ReplayController");
const TemplateLoader_1 = require("../../loader/TemplateLoader");
const FreeBetsHandler_1 = require("./freebets/FreeBetsHandler");
const BonusFeatureHandler_1 = require("./BonusFeatureHandler");
const BetHandler_1 = require("./bethandler/BetHandler");
const DialogHandler_1 = require("./DialogHandler");
const GameInfo_1 = require("./GameInfo");
const GameClientConfiguration_1 = require("./GameClientConfiguration");
const FreeFeatureBetHandler_1 = require("./freefeaturebet/FreeFeatureBetHandler");
const NolimitApplication_1 = require("../../NolimitApplication");
const NetPosition_1 = require("./NetPosition");
const NolimitLauncher_1 = require("../../NolimitLauncher");
const GamePlugin_1 = require("../GamePlugin");
const BalanceIdHandler_1 = require("./bethandler/BalanceIdHandler");
const BetFeatureController_1 = require("./bethandler/BetFeatureController");
const BetLevelHandler_1 = require("./BetLevelHandler");
const gameApi = require('@nolimitcity/game-api');
const eventSystemFactory = require('@nolimitcity/core/api/event-system');
class NolimitApiPlugin {
    constructor() {
        this.name = "ApiPlugin";
        this.remainingFreeSpins = 0;
        this.gameName = "";
        this.screenSystem = require('@nolimitcity/core/api/screen-system');
        this.onErrorHandler = (event, source, lineno, colno, error) => {
            this.onGeneralError(event.toString(), source, lineno, colno, error);
        };
        this._gameApi = gameApi;
        this._gameApi.init();
        this._gameApi.events.on(APIEventSystem_1.APIEvent.INIT, (data) => {
            this._initData = data;
        });
        this._gameApi.options.quality = this._gameApi.settings.get('quality', this._gameApi.options.quality);
        this._gameApi.log('Slot options', this._gameApi.options);
        this.eventSystemFactory = eventSystemFactory;
        if (this._gameApi.options.replay !== undefined) {
            window.nolimit = window.nolimit || {};
            window.nolimit.api = window.nolimit.api || {};
            window.nolimit.options = this._gameApi.options;
        }
    }
    openReplay(gameRoundIdOrReplayUrl) {
        this.replayController.openReplay(gameRoundIdOrReplayUrl);
    }
    destroy() {
        this._gameApi.events.shutdown();
        this._gameApi = undefined;
        window.removeEventListener("error", this.onErrorHandler);
        window.nolimit = undefined;
    }
    get isReplay() {
        return this.options.replay != undefined;
    }
    log(message, ...obj) {
        this._gameApi.log(message, obj);
    }
    warn(message, ...obj) {
        this._gameApi.warn(message, obj);
    }
    getGameElement() {
        return this._gameApi.getGameElement();
    }
    fetchPlugins() {
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if ((0, GamePlugin_1.isGamePlugin)(plugin)) {
                this.gamePlugin = plugin;
            }
        }
    }
    init() {
        return new Promise((resolve, reject) => {
            this.events = this._gameApi.events;
            this.fetchPlugins();
            this.addEventListeners();
            this.betHandler = new BetHandler_1.BetHandler(this);
            this._gameApi.bet = this.betHandler.bet.bind(this.betHandler);
            this.lastBet = this._gameApi.lastBet;
            this.css = this._gameApi.css;
            this.overlay = this._gameApi.overlay;
            this.resize = this._gameApi.resize;
            this.messages = this._gameApi.messages;
            this.loaderInteraction = this._gameApi.loaderInteraction;
            this.time = this._gameApi.time;
            this.visibilityDetector = this._gameApi.visibilityDetector;
            this.realityCheck = this._gameApi.realityCheck;
            this.maxWinCap = this._gameApi.maxWinCap;
            this.gameMode = this._gameApi.gameMode;
            this.analytics = this._gameApi.analytics;
            this.error = this._gameApi.error;
            this.communication = this._gameApi.communication;
            this.externalApi = this._gameApi.externalApi;
            this.resources = this._gameApi.resources;
            this.balance = this._gameApi.balance;
            this.betLevel = new BetLevelHandler_1.BetLevelHandler(this, this.gamePlugin); //this._gameApi.betLevel;
            this.translations = this._gameApi.translations;
            this.currency = this._gameApi.currency;
            this.log = this._gameApi.log;
            this.options = this._gameApi.options;
            this.settings = this._gameApi.settings;
            this.dialog = new DialogHandler_1.DialogHandler(this, this._gameApi.dialog);
            this.winTracker = new WinTracker_1.WinTracker(this);
            this.clock = new ClockModel_1.ClockModel(this);
            this.balanceIdHandler = new BalanceIdHandler_1.BalanceIdHandler(this);
            this.freeBets = new FreeBetsHandler_1.FreeBetsHandler(this);
            this.freeFeatureBet = new FreeFeatureBetHandler_1.FreeFeatureBetHandler(this);
            this.rtp = new Rtp_1.Rtp(this);
            this.maximumWinCap = new MaximumWinCap_1.MaximumWinCap(this);
            this.payoutMultiplier = new PayoutMultiplier_1.PayoutMultiplier(this);
            this.fullscreen = new Fullscreen_1.Fullscreen(this);
            this.slotStates = new SlotStateHandler_1.SlotStateHandler(this);
            this.gameClientConfiguration = new GameClientConfiguration_1.GameClientConfiguration(this);
            this.bonusFeatures = new BonusFeatureHandler_1.BonusFeatureHandler(this);
            this.gameInfo = new GameInfo_1.GameInfo(this);
            this.netPosition = new NetPosition_1.NetPosition(this);
            this.replayController = new ReplayController_1.ReplayController(this);
            this.betFeatureController = new BetFeatureController_1.BetFeatureController(this, this.gamePlugin);
            this.gameName = this._gameApi.options.game.replace(/(\B[A-Z][a-z])/g, ' $1');
            if (this.options.version && this.options.version.startsWith('0.')) {
                this.gameName = this.gameName + " (BETA)";
            }
            return this.getInitData().then(value => {
                resolve(this);
            });
        });
    }
    getReady() {
        return new Promise((resolve, reject) => {
            this._gameApi.loaded();
            resolve(this);
        });
    }
    getReadyToStart() {
        return new Promise((resolve, reject) => {
            this._gameApi.ready();
            //This forces the betLevel api to save the restored betLevel as lastBet in localStorage. This prevents weird bet changes when switching browsers or clearing cache while you have an open game round.
            if (this.slotStates.checkState(SlotStateHandler_1.SlotState.RESTORE) && NolimitApplication_1.NolimitApplication.apiPlugin.freeFeatureBet.hasFreeFeatureBet() == false) {
                const currentBetLevel = this.betLevel.getLevel(); //Is set correctly by restore init response. But not saved to localStorage
                this.betLevel.setLevel(currentBetLevel); //Explicitly set the value, this saves it to local storage.
            }
            this.betFeatureController.start();
            resolve(this);
        });
    }
    start() {
        return new Promise((resolve, reject) => {
            this.freeBets.start();
            this.freeFeatureBet.start();
            resolve(this);
        });
    }
    startGame() {
        this._gameApi.start();
    }
    getGameRules() {
        const templateLoader = new TemplateLoader_1.TemplateLoader(this.resources.getStaticRoot());
        templateLoader.add({
            name: "common-rules",
            url: "node_modules/@nolimitcity/slot-launcher/resources/default/templates/common-rules.mustache"
        });
        return templateLoader.load().then((assets) => {
            for (let asset of assets) {
                if (asset.name == "common-rules" && asset.loadedData) {
                    return asset.loadedData;
                }
            }
            throw new Error("NolimitApiPlugin could not load Rules");
        });
    }
    getInitData() {
        if (this._initData != undefined) {
            return Promise.resolve(this._initData);
        }
        else {
            return new Promise((resolve, reject) => {
                this.events.on(APIEventSystem_1.APIEvent.INIT, (data) => {
                    this._initData = data;
                    // If any other module has code that is listening to INIT data and handle it locally, use setTimeout
                    // to ensure all other unknown handling is completed.
                    setTimeout(() => resolve(data));
                });
            });
        }
    }
    addEventListeners() {
        this.events.on("remainingFreeSpins", (freespins) => {
            this.remainingFreeSpins = freespins;
        });
        window.addEventListener("error", this.onErrorHandler);
        if (this.gamePlugin) {
            this.events.on(APIEventSystem_1.APIEvent.SOFT_RESET, () => this.onSoftReset());
        }
    }
    onSoftReset() {
        let sfx = this.settings.get(APISettingsSystem_1.APISetting.SFX, false);
        let music = this.settings.get(APISettingsSystem_1.APISetting.MUSIC, false);
        this.settings.set(APISettingsSystem_1.APISetting.SFX, false);
        this.settings.set(APISettingsSystem_1.APISetting.MUSIC, false);
        const gameData = this.gamePlugin != undefined ? this.gamePlugin.getNoWinGameData() : undefined;
        gameData.isFakeData = true; //Promo-panel #215
        if (gameData != undefined) {
            this.events.trigger(APIEventSystem_1.APIEvent.GAME, gameData);
        }
        this.slotStates.stateIsReady().then(value => {
            this.settings.set(APISettingsSystem_1.APISetting.SFX, sfx);
            this.settings.set(APISettingsSystem_1.APISetting.MUSIC, music);
        });
    }
    onGeneralError(message, source, lineno, colno, error) {
        console.log(message, source, lineno, colno, error);
        this.error.trigger(message, APIErrorSystem_1.APIErrorCode.JAVASCRIPT);
    }
}
exports.NolimitApiPlugin = NolimitApiPlugin;
//# sourceMappingURL=NolimitApiPlugin.js.map