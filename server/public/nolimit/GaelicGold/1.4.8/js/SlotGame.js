"use strict";
/**
 * Created by Ning Jiang on 3/21/2016.
 * Refactored by Ning Jiang on 2016-11-30.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotGame = void 0;
require("gsap");
const TemplateLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/TemplateLoader");
const NolimitLauncher_1 = require("@nolimitcity/slot-launcher/bin/NolimitLauncher");
const ApiPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/ApiPlugin");
const AutoPlayPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/AutoPlayPlugin");
const NolimitGameIntroPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/concreteplugins/NolimitGameIntroPlugin");
const JackpotPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/JackpotPlugin");
const GamblePlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/GamblePlugin");
const KeypadPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/KeypadPlugin");
const SoundPlugin_1 = require("@nolimitcity/slot-launcher/bin/plugins/SoundPlugin");
const Logger_1 = require("@nolimitcity/slot-launcher/bin/utils/Logger");
const PerformanceLogger_1 = require("../dev/performancelogger/PerformanceLogger");
const GameTweaker_1 = require("../dev/tweaker/GameTweaker");
const Currency_1 = require("./balance/Currency");
const BeforeSpinStopPresentationManager_1 = require("./beforespinstoppresentation/BeforeSpinStopPresentationManager");
const EventHandler_1 = require("./event/EventHandler");
const GameEvent_1 = require("./event/GameEvent");
const GameConfig_1 = require("./gameconfig/GameConfig");
const NolimitConfig_1 = require("./gameconfig/NolimitConfig");
const GameIntroController_1 = require("./gameintro/GameIntroController");
const GameIntroView_1 = require("./gameintro/GameIntroView");
const GameModeEvent_1 = require("./gamemode/event/GameModeEvent");
const GameModuleConfig_1 = require("./gamemoduleconfig/GameModuleConfig");
const Reels_1 = require("./reel/reelarea/Reels");
const ReelStopPresentationManager_1 = require("./reelstoppresentation/ReelStopPresentationManager");
const AssetsConfig_1 = require("./resource/asset/AssetsConfig");
const LoaderEvent_1 = require("./resource/event/LoaderEvent");
const GameResources_1 = require("./resource/GameResources");
const ResourcesGroupName_1 = require("./resource/ResourcesGroupName");
const SoundConfig_1 = require("./resource/sound/SoundConfig");
const ScreenEvent_1 = require("./screen/event/ScreenEvent");
const ServerEvent_1 = require("./server/event/ServerEvent");
const ServerController_1 = require("./server/ServerController");
const GameSetting_1 = require("./setting/GameSetting");
const SlotApiAdapter_1 = require("./slotapiadapter/SlotApiAdapter");
const SpinController_1 = require("./spin/SpinController");
const StageManager_1 = require("./stage/StageManager");
const Translation_1 = require("./translation/Translation");
const UserAgent_1 = require("./useragent/UserAgent");
const WinFieldController_1 = require("./winpresentation/WinFieldController");
const WinPresentationManager_1 = require("./winpresentation/WinPresentationManager");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
const StageEvent_1 = require("./stage/event/StageEvent");
class SlotGame {
    constructor(gameModuleConfig) {
        this._resourcesLoaded = false; // TODO: use promise to replace all the booleans.
        this._initDataParsed = false;
        this._isRestoreState = false;
        //private _introController:GameIntro;
        this.name = "SlotGame";
        this.legacyIntro = true;
        GameSetting_1.GameSetting.isDevMode = NolimitConfig_1.NolimitConfig.isDevMode;
        GameModuleConfig_1.GameModuleConfig.instance = gameModuleConfig;
    }
    getNoWinGameData() {
        console.warn("GamePlugin.getNoWinData is not overridden in concrete game plugin, unable to soft reset");
        return undefined;
    }
    fetchPlugins() {
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if ((0, KeypadPlugin_1.isKeypadPlugin)(plugin)) {
                SlotGame.keypad = plugin;
            }
            if ((0, SoundPlugin_1.isSoundPlugin)(plugin)) {
                SlotGame.sound = plugin.player;
            }
            if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                SlotGame.api = plugin;
            }
            if ((0, AutoPlayPlugin_1.isAutoPlayPlugin)(plugin)) {
                SlotGame.autoPlay = plugin;
            }
            if ((0, JackpotPlugin_1.isJackpotPlugin)(plugin)) {
                SlotGame.jackpot = plugin;
            }
            if ((0, GamblePlugin_1.isGamblePlugin)(plugin)) {
                SlotGame.gamblePlugin = plugin;
            }
            if ((0, NolimitGameIntroPlugin_1.isNolimitGameIntroPlugin)(plugin)) {
                this.legacyIntro = false;
            }
        }
        if (SlotGame.keypad == undefined) {
            return Promise.reject(new Error("SlotGame is missing KeypadPlugin"));
        }
        if (SlotGame.sound == undefined) {
            return Promise.reject(new Error("SlotGame is missing SoundPlugin"));
        }
        if (SlotGame.api == undefined) {
            return Promise.reject(new Error("SlotGame is missing ApiPlugin"));
        }
        if (SlotGame.autoPlay == undefined) {
            return Promise.reject(new Error("SlotGame is missing AutoPlayPlugin"));
        }
        return Promise.resolve();
    }
    // Plugin interface methods
    init() {
        return new Promise((resolve, reject) => {
            this.fetchPlugins().catch((reason) => {
                return Promise.reject(reason);
            });
            SlotGame.model = this.initServer();
            EventHandler_1.EventHandler.addLastEventListener(this, ServerEvent_1.ServerEvent.INIT_DATA_PARSED, (event) => this.onInitDataParsed(event.params[0]));
            this.initGameBase(SlotGame.api);
            this.initStage();
            this.initDevTools();
            this.initGame();
            if (GameModuleConfig_1.GameModuleConfig.instance.GAME_FEATURE_CREATOR) {
                GameModuleConfig_1.GameModuleConfig.instance.GAME_FEATURE_CREATOR();
            }
            this.initGameResources();
            if (this.legacyIntro) {
                // helping in the hack to load translations before initializing legacy game intro.
                EventHandler_1.EventHandler.addEventListener(this, StageEvent_1.StageEvent.STAGE_RESIZED, (event) => this._legacyIntroResizeData = event.params[0]);
                const introAssetsPromise = new Promise((res) => {
                    EventHandler_1.EventHandler.addEventListener(this, "SlotGame.intro_loaded", () => {
                        res();
                    });
                });
                // code for loading translation before game intro
                const apiRes = SlotGame.api.resources, translations = SlotGame.api.translations, fileName = translations.language + '.json', translationsPromise = new Promise((res) => {
                    // https://github.com/nolimitcity/nolimit-game-api/issues/91
                    apiRes.loadJson('translations/' + fileName).then((gameTranslations) => {
                        this.loadTranslations(apiRes, translations, res, gameTranslations);
                    }, () => {
                        console.warn(translations.language + ' not found, defaulting to en');
                        translations.language = 'en';
                        // game specific translations
                        apiRes.loadJson('translations/en.json').then((gameTranslations) => {
                            this.loadTranslations(apiRes, translations, res, gameTranslations);
                        });
                    });
                    SlotGame.gameResource.loadImages(ResourcesGroupName_1.ResourcesGroupName.INTRO);
                });
                Promise.all([introAssetsPromise, translationsPromise]).then(() => {
                    this.introAssetsAndTranslationsLoaded();
                    resolve(this);
                });
            }
            else {
                resolve(this);
            }
        });
    }
    getReady() {
        return new Promise((resolve, reject) => {
            this._slotApiAdapter.getReady();
            EventHandler_1.EventHandler.addEventListener(this, "SlotGame.mainLoadedAndInitDataParsed", () => {
                resolve(this);
            });
            if (this.legacyIntro) {
                this._introController.show();
            }
            else {
                SlotGame.gameResource.loadImages(ResourcesGroupName_1.ResourcesGroupName.INTRO);
            }
            SlotGame.model.initComplete();
        });
    }
    getReadyToStart() {
        return new Promise((resolve, reject) => {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(GameModeEvent_1.GameModeEvent.CHANGE_MODE, { newMode: this._initMode }));
            if (this._isRestoreState) {
                this._isRestoreState = false;
                EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ScreenEvent_1.ScreenEvent.GAME_RESTORE));
            }
            if (this.legacyIntro) {
                this._introController.gameReady();
                EventHandler_1.EventHandler.addEventListener(this, "SlotGame.introClosed", () => {
                    resolve(this);
                });
            }
            else {
                resolve(this);
            }
        });
    }
    start() {
        return new Promise(resolve => {
            this.startMainAmbience();
            if (StageManager_1.StageManager.legacyScaling) {
                NolimitApplication_1.NolimitApplication.resize();
            }
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ScreenEvent_1.ScreenEvent.GAME_START));
            resolve(this);
        });
    }
    startMainAmbience() {
        const duration = SoundConfig_1.SoundConfig.instance.START_GAME_AMBIANCE_CROSS_FADE_DURATION != null ? SoundConfig_1.SoundConfig.instance.START_GAME_AMBIANCE_CROSS_FADE_DURATION : 1000;
        if (SoundConfig_1.SoundConfig.instance.MAIN_GAME_AMBIANCE) {
            SlotGame.sound.playAmbience(SoundConfig_1.SoundConfig.instance.MAIN_GAME_AMBIANCE, duration);
        }
    }
    getPaytable() {
        const templateLoader = new TemplateLoader_1.TemplateLoader(SlotGame.api.resources.getStaticRoot());
        templateLoader.add({
            name: "Paytable",
            url: "nolimit/screens/paytable.mustache"
        });
        return templateLoader.load().then((assets) => {
            for (let asset of assets) {
                if (asset.name == "Paytable" && asset.loadedData) {
                    return asset.loadedData;
                }
            }
            throw new Error("SlotGame could not load Paytable");
        });
    }
    getGameRules() {
        const templateLoader = new TemplateLoader_1.TemplateLoader(SlotGame.api.resources.getStaticRoot());
        templateLoader.add({
            name: "Rules",
            url: "nolimit/screens/rules.mustache"
        });
        return templateLoader.load().then((assets) => {
            for (let asset of assets) {
                if (asset.name == "Rules" && asset.loadedData) {
                    return asset.loadedData;
                }
            }
            throw new Error("SlotGame could not load Rules");
        });
    }
    initServer() {
        return new ServerController_1.ServerController();
    }
    initGameBase(api) {
        this._slotApiAdapter = new SlotApiAdapter_1.SlotApiAdapter(api);
        const setting = new GameSetting_1.GameSetting(this._slotApiAdapter);
        const userAgent = new UserAgent_1.UserAgent(this._slotApiAdapter);
        const currency = new Currency_1.Currency(this._slotApiAdapter);
        const translation = new Translation_1.Translation(this._slotApiAdapter);
        SlotGame.winFieldController = this.createWinFieldController();
    }
    createWinFieldController() {
        return new WinFieldController_1.WinFieldController();
    }
    initStage() {
        const stageManager = new StageManager_1.StageManager();
    }
    initDevTools() {
        if (GameSetting_1.GameSetting.isDevMode) {
            if (GameConfig_1.GameConfig.instance.GAME_TWEAKER_CONFIG != null) {
                const gameTweaker = new GameTweaker_1.GameTweaker(GameConfig_1.GameConfig.instance.GAME_TWEAKER_CONFIG);
            }
            if (GameConfig_1.GameConfig.instance.PERFORMANCE_LOGGER === true) {
                const performanceLogger = new PerformanceLogger_1.PerformanceLogger();
            }
            // add more tools here or by config.
            if (GameModuleConfig_1.GameModuleConfig.instance.GAME_DEV_TOOLS_CREATOR) {
                GameModuleConfig_1.GameModuleConfig.instance.GAME_DEV_TOOLS_CREATOR();
            }
        }
    }
    /**
     * @deprecated Since Launcher 1.3.x and the addition of NolimitGameIntroPlugin
     */
    initIntro() {
        Logger_1.Logger.deprecated("This game intro is deprecated, please use NolimitGameIntroPlugin instead", "slot-launcher 1.3.x");
        this._introController = this.createIntroController();
        EventHandler_1.EventHandler.addLastEventListener(this, GameIntroController_1.GameIntroController.CLOSE, () => this.onIntroClose());
    }
    // helping in the hack to load translations before initializing legacy game intro.
    introAssetsAndTranslationsLoaded() {
        this.initIntro();
        this._introController.introAssetsAndTranslationsLoaded(this._legacyIntroResizeData);
        EventHandler_1.EventHandler.removeEventListener(this, StageEvent_1.StageEvent.STAGE_RESIZED);
    }
    initGame() {
        if (!!GameModuleConfig_1.GameModuleConfig.instance.GAME_CONTROLLER) {
            GameModuleConfig_1.GameModuleConfig.instance.GAME_CONTROLLER();
            Logger_1.Logger.logDev("%c GameFlow: GameController ", `background-color:#777777;; color:white; font-size: 12px; padding: 4px;`);
        }
        else {
            const spinController = this.createSpinController();
            const reelAreaController = Reels_1.Reels.init();
            const beforeSpinStopPresentationManager = this.createBeforeSpinStopPresentationManager();
            const reelStopPresentationManager = this.createReelStopPresentationManager();
            const winPresentationManager = this.createWinPresentationManager();
            Logger_1.Logger.logDev("%c GameFlow: SpinController ", `background-color:#777777;; color:white; font-size: 12px; padding: 4px;`);
        }
    }
    /**
     * @deprecated Since Launcher 1.3.x and the addition of NolimitGameIntroPlugin
     */
    createIntroController() {
        const viewCreator = GameModuleConfig_1.GameModuleConfig.instance.INTRO_VIEW ?
            GameModuleConfig_1.GameModuleConfig.instance.INTRO_VIEW :
            (onClickCallback) => new GameIntroView_1.GameIntroView({
                layer: GameConfig_1.GameConfig.instance.LAYERS.INTRO.name,
                onButtonClickCallback: onClickCallback,
                resourceGroup: ResourcesGroupName_1.ResourcesGroupName.INTRO
            });
        return GameModuleConfig_1.GameModuleConfig.instance.INTRO_CONTROLLER ?
            GameModuleConfig_1.GameModuleConfig.instance.INTRO_CONTROLLER(viewCreator) :
            new GameIntroController_1.GameIntroController(viewCreator);
    }
    createSpinController() {
        return GameModuleConfig_1.GameModuleConfig.instance.SPIN_CONTROLLER ?
            GameModuleConfig_1.GameModuleConfig.instance.SPIN_CONTROLLER() :
            new SpinController_1.SpinController();
    }
    createBeforeSpinStopPresentationManager() {
        return new BeforeSpinStopPresentationManager_1.BeforeSpinStopPresentationManager();
    }
    createReelStopPresentationManager() {
        return new ReelStopPresentationManager_1.ReelStopPresentationManager();
    }
    createWinPresentationManager() {
        return new WinPresentationManager_1.WinPresentationManager();
    }
    initGameResources() {
        SlotGame.gameResource = new GameResources_1.GameResources();
        AssetsConfig_1.AssetsConfig.addToAssetsConfig(AssetsConfig_1.AssetsConfig._defaultResources);
        EventHandler_1.EventHandler.addLastEventListener(this, LoaderEvent_1.LoaderEvent.RESOURCES_LOADED, (event) => this.onInitResourcesLoaded(event));
        SlotGame.gameResource.loadFonts();
    }
    onInitDataParsed(data) {
        this._isRestoreState = data.isRestoreState;
        this._initDataParsed = true;
        this._initMode = data.mode;
        Logger_1.Logger.logDev("SlotGame.onInitDataParsed()");
        this.checkReady();
    }
    onInitResourcesLoaded(event) {
        Logger_1.Logger.logDev(`SlotGame.onInitResourcesLoaded: ${event.key}`);
        if (event.key == ResourcesGroupName_1.ResourcesGroupName.INTRO) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent("SlotGame.intro_loaded"));
        }
        else if (event.key == ResourcesGroupName_1.ResourcesGroupName.MAIN) {
            this._resourcesLoaded = true;
            this.checkReady();
        }
    }
    /**
     * @deprecated Since Launcher 1.3.x and the addition of NolimitGameIntroPlugin
     */
    onIntroClose() {
        Logger_1.Logger.logDev("SlotGame.onIntroClose():Game is Ready!");
        EventHandler_1.EventHandler.removeLastEventListener(this, GameIntroController_1.GameIntroController.CLOSE);
        EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent("SlotGame.introClosed"));
    }
    checkReady() {
        if (this._initDataParsed && this._resourcesLoaded) {
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent(ScreenEvent_1.ScreenEvent.GAME_READY));
            EventHandler_1.EventHandler.dispatchEvent(new GameEvent_1.GameEvent("SlotGame.mainLoadedAndInitDataParsed"));
        }
    }
    // https://github.com/nolimitcity/nolimit-game-api/issues/91
    loadTranslations(apiRes, translations, resolve, gameTranslations) {
        const fileName = translations.language + '.json', prefixGameApi = '/node_modules/@nolimitcity/game-api/resources/translations/', prefixSlotTranslations = '/node_modules/@nolimitcity/slot-translations/resources/translations/';
        // game-api translations
        apiRes.loadJson(fileName, prefixGameApi).then((val) => {
            translations.add(val);
            // slot-translations
            apiRes.loadJson(fileName, prefixSlotTranslations).then((val) => {
                translations.add(val);
                // game specific translations
                translations.add(gameTranslations);
                resolve();
            });
        });
    }
}
exports.SlotGame = SlotGame;
//# sourceMappingURL=SlotGame.js.map