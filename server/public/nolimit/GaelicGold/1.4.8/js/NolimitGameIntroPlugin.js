"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNolimitGameIntroPlugin = exports.NolimitGameIntroPlugin = void 0;
const GameIntroView_1 = require("./nolimitgameintro/GameIntroView");
const SoundPlugin_1 = require("../SoundPlugin");
const ApiPlugin_1 = require("../ApiPlugin");
const NolimitLauncher_1 = require("../../NolimitLauncher");
const GamePlugin_1 = require("../GamePlugin");
const RatedRIntroPage_1 = require("./nolimitgameintro/RatedRIntroPage");
const ModalWindow_1 = require("../../gui/displayobjects/ModalWindow");
const APIExternalApi_1 = require("../../interfaces/APIExternalApi");
/**
 * Class description
 *
 * Created: 2020-03-16
 * @author jonas
 */
class NolimitGameIntroPlugin {
    constructor(config) {
        this.name = "NolimitGameIntro";
        this._viewConfig = config;
    }
    fetchPlugins() {
        for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
            if ((0, SoundPlugin_1.isSoundPlugin)(plugin)) {
                NolimitGameIntroPlugin.soundPlugin = plugin;
            }
            if ((0, ApiPlugin_1.isApiPlugin)(plugin)) {
                NolimitGameIntroPlugin.apiPlugin = plugin;
            }
            if ((0, GamePlugin_1.isGamePlugin)(plugin)) {
                NolimitGameIntroPlugin.gamePlugin = plugin;
            }
        }
        if (NolimitGameIntroPlugin.soundPlugin == undefined) {
            return Promise.reject(new Error("NolimitGameIntroPlugin is missing SoundPlugin"));
        }
        if (NolimitGameIntroPlugin.apiPlugin == undefined) {
            return Promise.reject(new Error("NolimitGameIntroPlugin is missing ApiPlugin"));
        }
        return Promise.resolve();
    }
    init() {
        return new Promise((resolve, reject) => {
            this.fetchPlugins().catch((reason) => {
                return Promise.reject(reason);
            });
            this.nonGameIntroPages = [];
            // code for loading translation before game intro
            const apiRes = NolimitGameIntroPlugin.apiPlugin.resources, translations = NolimitGameIntroPlugin.apiPlugin.translations, fileName = translations.language + '.json';
            // https://github.com/nolimitcity/nolimit-game-api/issues/91
            apiRes.loadJson('translations/' + fileName).then((gameTranslations) => {
                this.loadTranslations(translations, resolve, gameTranslations);
            }, () => {
                console.warn(translations.language + ' not found, defaulting to en');
                translations.language = 'en';
                // game specific translations
                apiRes.loadJson('translations/en.json').then((gameTranslations) => {
                    this.loadTranslations(translations, resolve, gameTranslations);
                });
            });
        });
    }
    getReady() {
        return new Promise((resolve, reject) => {
            if (this._viewConfig.gameClientConfigurationApplied !== undefined) {
                this._viewConfig.gameClientConfigurationApplied(NolimitGameIntroPlugin.apiPlugin.gameClientConfiguration);
            }
            this._viewConfig.pages = this._viewConfig.pages.concat(this.nonGameIntroPages);
            if (NolimitGameIntroPlugin.apiPlugin.gameClientConfiguration.explicitContentWarning) {
                this._viewConfig.pages.unshift(new RatedRIntroPage_1.RatedRIntroPage());
            }
            this._view = new GameIntroView_1.GameIntroView(this._viewConfig);
            this._view.show();
            const optOutOfRatedR = NolimitGameIntroPlugin.apiPlugin.settings.get("ratedRDontShowAgain", false);
            if (NolimitGameIntroPlugin.apiPlugin.gameClientConfiguration.explicitContentWarning && !optOutOfRatedR) {
                this.openRatedRModal();
            }
            resolve(this);
        });
    }
    openRatedRModal() {
        const onClick = (modal, buttonId) => {
            console.log(buttonId);
            console.log(modal.dontShowAgainChecked);
            if (buttonId == "exit") {
                NolimitGameIntroPlugin.apiPlugin.externalApi.trigger(APIExternalApi_1.APIExternalApiEvent.EXIT).or(history.back.bind(history));
            }
            else {
                NolimitGameIntroPlugin.apiPlugin.settings.set("ratedRDontShowAgain", modal.dontShowAgainChecked);
                this._view.resumeSlideShow();
                modal.close();
            }
        };
        const sprite = new RatedRIntroPage_1.RatedRIntroPage();
        sprite.scale.set(0.9, 0.9);
        const bounds = sprite.getLocalBounds();
        sprite.pivot.set(0, bounds.top);
        const content = new PIXI.Container();
        content.addChild(sprite);
        const modal = new ModalWindow_1.ModalWindow("RatedRModal", [
            {
                id: "exit",
                label: "EXIT",
                clickCallback: onClick,
            },
            {
                id: "ok",
                label: "OK",
                clickCallback: onClick,
            }
        ], content, true);
        this._view.pauseSlideShow();
        modal.open();
    }
    getReadyToStart() {
        return new Promise((resolve, reject) => {
            this._view.gameLoadComplete().then(value => {
                this._view.close();
                resolve(this);
            });
        });
    }
    start() {
        return new Promise((resolve, reject) => {
            resolve(this);
        });
    }
    // https://github.com/nolimitcity/nolimit-game-api/issues/91
    loadTranslations(translations, resolve, gameTranslations) {
        const apiRes = NolimitGameIntroPlugin.apiPlugin.resources, fileName = translations.language + '.json', prefixGameApi = '/node_modules/@nolimitcity/game-api/resources/translations/', prefixSlotTranslations = '/node_modules/@nolimitcity/slot-translations/resources/translations/';
        // game-api translations
        apiRes.loadJson(fileName, prefixGameApi).then((val) => {
            translations.add(val);
            // slot-translations
            apiRes.loadJson(fileName, prefixSlotTranslations).then((val) => {
                translations.add(val);
                // game specific translations
                translations.add(gameTranslations);
                // loading intro pages after translations promise
                this._viewConfig.init().then(() => {
                    let extraPagesPromises = [];
                    for (let plugin of NolimitLauncher_1.NolimitLauncher.plugins) {
                        if (plugin.getIntroPages != undefined) {
                            extraPagesPromises.push(plugin.getIntroPages());
                        }
                    }
                    const extraPages = Promise.all(extraPagesPromises);
                    extraPages.then((pageCollections) => {
                        for (let collection of pageCollections) {
                            this.nonGameIntroPages = this.nonGameIntroPages.concat(collection);
                        }
                        resolve(this);
                    });
                });
            });
        });
    }
}
exports.NolimitGameIntroPlugin = NolimitGameIntroPlugin;
function isNolimitGameIntroPlugin(value) {
    return value.name === "NolimitGameIntro";
}
exports.isNolimitGameIntroPlugin = isNolimitGameIntroPlugin;
//# sourceMappingURL=NolimitGameIntroPlugin.js.map