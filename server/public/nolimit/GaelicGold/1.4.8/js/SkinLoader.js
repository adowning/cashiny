"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkinLoader = void 0;
const ImgLoader_1 = require("@nolimitcity/slot-launcher/bin/loader/ImgLoader");
const NolimitApplication_1 = require("@nolimitcity/slot-launcher/bin/NolimitApplication");
/**
 * Created by jonas on 2023-03-28.
 */
class SkinLoader {
    constructor() {
        this._animationAssets = new Map();
        this._introAssets = new Map();
        this._imgAssets = new Map();
        this._guideAssets = new Map();
        this._introLoadCallbacks = [];
        this._introLoadStarted = false;
        this._isIntroLoaded = false;
        this._isLoaded = false;
        this._defaultImgUrl = "/node_modules/@nolimitcity/slot-keypad/resources/default/icons/";
        this._defaultGuideUrl = "/node_modules/@nolimitcity/slot-keypad/resources/default/gui_guide_images/";
        this._loader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        this._introLoader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        this._introAssets.set(SkinLoader.NOLIMIT_BONUS_PRICE_TAG, this.makeImgUrl("keypad_icons/" + SkinLoader.NOLIMIT_BONUS_PRICE_TAG));
        //Animations
        this._imgAssets.set(SkinLoader.X_BET_ANIMATION, this._defaultImgUrl + "keypad_icons/" + SkinLoader.X_BET_ANIMATION);
        //Keypad icons
        this._imgAssets.set(SkinLoader.AUTO_PLAY_ON, this.makeImgUrl("keypad_icons/" + SkinLoader.AUTO_PLAY_ON));
        this._imgAssets.set(SkinLoader.AUTO_PLAY_OFF, this.makeImgUrl("keypad_icons/" + SkinLoader.AUTO_PLAY_OFF));
        this._imgAssets.set(SkinLoader.BACK, this.makeImgUrl("keypad_icons/" + SkinLoader.BACK));
        this._imgAssets.set(SkinLoader.BET_LEVELS_BUTTON, this.makeImgUrl("keypad_icons/" + SkinLoader.BET_LEVELS_BUTTON));
        this._imgAssets.set(SkinLoader.DEMO_ICON, this.makeImgUrl("keypad_icons/" + SkinLoader.DEMO_ICON));
        this._imgAssets.set(SkinLoader.FAST_SPIN, this.makeImgUrl("keypad_icons/" + SkinLoader.FAST_SPIN));
        this._imgAssets.set(SkinLoader.MENU, this.makeImgUrl("keypad_icons/" + SkinLoader.MENU));
        this._imgAssets.set(SkinLoader.RING_LOADER, this.makeImgUrl("keypad_icons/" + SkinLoader.RING_LOADER));
        this._imgAssets.set(SkinLoader.SOUND_ON, this.makeImgUrl("keypad_icons/" + SkinLoader.SOUND_ON));
        this._imgAssets.set(SkinLoader.SOUND_OFF, this.makeImgUrl("keypad_icons/" + SkinLoader.SOUND_OFF));
        this._imgAssets.set(SkinLoader.X_BET_BUTTON, this.makeImgUrl("keypad_icons/" + SkinLoader.X_BET_BUTTON));
        this._imgAssets.set(SkinLoader.X_BET_BUTTON_BUBBLE, this.makeImgUrl("keypad_icons/" + SkinLoader.X_BET_BUTTON_BUBBLE));
        this._imgAssets.set(SkinLoader.NOLIMIT_BONUS_BTN, this.makeImgUrl("keypad_icons/" + SkinLoader.NOLIMIT_BONUS_BTN));
        this._imgAssets.set(SkinLoader.BET_UP, this.makeImgUrl("keypad_icons/" + SkinLoader.BET_UP));
        this._imgAssets.set(SkinLoader.BET_DOWN, this.makeImgUrl("keypad_icons/" + SkinLoader.BET_DOWN));
        this._imgAssets.set(SkinLoader.BONUS_ARROW, this.makeImgUrl("keypad_icons/" + SkinLoader.BONUS_ARROW));
        this._imgAssets.set(SkinLoader.BONUS_ARROW_STROKE, this.makeImgUrl("keypad_icons/" + SkinLoader.BONUS_ARROW_STROKE));
        this._imgAssets.set(SkinLoader.CONFIRM_POP_UP, this.makeImgUrl("keypad_icons/" + SkinLoader.CONFIRM_POP_UP));
        this._imgAssets.set(SkinLoader.CONFIRM_POP_UP_WARNING, this.makeImgUrl("keypad_icons/" + SkinLoader.CONFIRM_POP_UP_WARNING));
        //Menu icons
        this._imgAssets.set(SkinLoader.EXIT_LOBBY, this.makeImgUrl("menu_icons/" + SkinLoader.EXIT_LOBBY));
        this._imgAssets.set(SkinLoader.HISTORY, this.makeImgUrl("menu_icons/" + SkinLoader.HISTORY));
        this._imgAssets.set(SkinLoader.INFO, this.makeImgUrl("menu_icons/" + SkinLoader.INFO));
        this._imgAssets.set(SkinLoader.SETTINGS, this.makeImgUrl("menu_icons/" + SkinLoader.SETTINGS));
        this._imgAssets.set(SkinLoader.MENU_CLOSE, this.makeImgUrl("menu_icons/" + SkinLoader.MENU_CLOSE));
        //Spin button
        this._imgAssets.set(SkinLoader.SPIN_BUTTON_PLATE, this.makeImgUrl("spinbutton/" + SkinLoader.SPIN_BUTTON_PLATE));
        this._imgAssets.set(SkinLoader.SPIN_ARROW, this.makeImgUrl("spinbutton/" + SkinLoader.SPIN_ARROW));
        this._imgAssets.set(SkinLoader.SPIN_PLAY, this.makeImgUrl("spinbutton/" + SkinLoader.SPIN_PLAY));
        this._imgAssets.set(SkinLoader.SPIN_SKIP, this.makeImgUrl("spinbutton/" + SkinLoader.SPIN_SKIP));
        this._imgAssets.set(SkinLoader.SPIN_STOP, this.makeImgUrl("spinbutton/" + SkinLoader.SPIN_STOP));
        this._imgAssets.set(SkinLoader.COLLECT_ICON, this.makeImgUrl("spinbutton/" + SkinLoader.COLLECT_ICON));
        this._imgAssets.set(SkinLoader.BOOST_ICON, this.makeImgUrl("spinbutton/" + SkinLoader.BOOST_ICON));
        //other
        this._imgAssets.set(SkinLoader.PROMO_BUTTON, this.makeImgUrl(SkinLoader.PROMO_BUTTON));
        this._imgAssets.set(SkinLoader.LABEL_PLATE_22, this.makeImgUrl(SkinLoader.LABEL_PLATE_22));
        this._imgAssets.set(SkinLoader.BUTTON_PLATE_20, this.makeImgUrl(SkinLoader.BUTTON_PLATE_20));
        this._imgAssets.set(SkinLoader.BUTTON_STROKE_20, this.makeImgUrl(SkinLoader.BUTTON_STROKE_20));
        //GUI GUIDE
        //They are not loaded directly here, but are referenced in the gui-guide.mustache file.
        //These are images that can not be displayed directly from the loaded sources. They need some sort of composition.
        this._guideAssets.set(SkinLoader.GUIDE_AUTO_PLAY_STOP_YELLOW, this.makeGuideUrl(SkinLoader.GUIDE_AUTO_PLAY_STOP_YELLOW));
        this._guideAssets.set(SkinLoader.GUIDE_BOOSTED_BET, this.makeGuideUrl(SkinLoader.GUIDE_BOOSTED_BET));
        this._guideAssets.set(SkinLoader.GUIDE_COLLECT_AND_SPIN, this.makeGuideUrl(SkinLoader.GUIDE_COLLECT_AND_SPIN));
        this._guideAssets.set(SkinLoader.GUIDE_SPIN_BUTTON, this.makeGuideUrl(SkinLoader.GUIDE_SPIN_BUTTON));
        this._guideAssets.set(SkinLoader.GUIDE_SPIN_BUTTON_X, this.makeGuideUrl(SkinLoader.GUIDE_SPIN_BUTTON_X));
        this._guideAssets.set(SkinLoader.GUIDE_REPLAY, this.makeGuideUrl(SkinLoader.GUIDE_REPLAY));
        this._guideAssets.set(SkinLoader.GUIDE_CHECKBOX, this.makeGuideUrl(SkinLoader.GUIDE_CHECKBOX));
    }
    makeImgUrl(name) {
        const resolution = "@2x";
        return this._defaultImgUrl + name + resolution + ".png";
    }
    makeGuideUrl(name) {
        return this._defaultGuideUrl + name + ".png";
    }
    overrideAssetByName(name, newSrc) {
        if (this._isLoaded) {
            console.warn("You need to override skin assets before loading.");
            return;
        }
        if (this._imgAssets.has(name)) {
            this._imgAssets.set(name, newSrc);
        }
        else {
            console.warn("Trying to override source for non existing icon");
        }
    }
    loadIntroAssets() {
        if (this._isIntroLoaded) {
            return Promise.resolve(true);
        }
        if (this._introLoadStarted) {
            return new Promise((resolve, reject) => {
                this._introLoadCallbacks.push(() => {
                    resolve(true);
                });
            });
        }
        this._introLoadStarted = true;
        this._introAssets.forEach((value, key) => {
            this._introLoader.add(key, value);
        });
        return this._introLoader.load().then(value => {
            this._isIntroLoaded = value;
            for (let cb of this._introLoadCallbacks) {
                cb();
            }
            return value;
        });
    }
    load() {
        this._imgAssets.forEach((value, key) => {
            this._loader.add(key, value);
        });
        return this._loader.load().then(value => {
            this._isLoaded = value;
            return value;
        });
    }
    getSkinTexture(name) {
        return ImgLoader_1.ImgLoader.getImgTexture(name);
    }
    static getTexture(name) {
        return ImgLoader_1.ImgLoader.getImgTexture(name);
    }
    getSkinData() {
        const obj = {};
        this._imgAssets.forEach((value, key) => {
            obj[key] = value;
        });
        this._guideAssets.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
}
SkinLoader.NOLIMIT_BONUS_PRICE_TAG = "introSplashxBet";
SkinLoader.AUTO_PLAY_ON = "autoPlayStop";
SkinLoader.AUTO_PLAY_OFF = "autoPlay";
SkinLoader.BACK = "back";
SkinLoader.BET_LEVELS_BUTTON = "bet";
SkinLoader.DEMO_ICON = "diamond";
SkinLoader.FAST_SPIN = "fastSpin";
SkinLoader.MENU = "menu";
SkinLoader.RING_LOADER = "ringLoader";
SkinLoader.SOUND_ON = "soundOn";
SkinLoader.SOUND_OFF = "soundOff";
SkinLoader.X_BET_BUTTON = "xBetButton";
SkinLoader.X_BET_BUTTON_BUBBLE = "xBetButtonBubble";
SkinLoader.X_BET_ANIMATION = "xBetAttention.json";
SkinLoader.BET_DOWN = "minus";
SkinLoader.BET_UP = "plus";
SkinLoader.BONUS_ARROW = "bonusArrow";
SkinLoader.BONUS_ARROW_STROKE = "bonusArrowStroke";
SkinLoader.NOLIMIT_BONUS_BTN = "nolimitBonusBtn";
SkinLoader.NOLIMIT_BOOSTER_BTN = "nolimitBonusBtn";
SkinLoader.CONFIRM_POP_UP = "popUpBackground";
SkinLoader.CONFIRM_POP_UP_WARNING = "warning";
SkinLoader.EXIT_LOBBY = "exitToLobby";
SkinLoader.HISTORY = "history";
SkinLoader.INFO = "info";
SkinLoader.SETTINGS = "settings";
SkinLoader.MENU_CLOSE = "menuClose";
SkinLoader.SPIN_BUTTON_PLATE = "spinBg";
SkinLoader.SPIN_ARROW = "spinArrow";
SkinLoader.SPIN_PLAY = "spinArrow";
SkinLoader.SPIN_SKIP = "spinX";
SkinLoader.SPIN_STOP = "spinX";
SkinLoader.COLLECT_ICON = "collectIcon";
SkinLoader.BOOST_ICON = "boostIcon";
SkinLoader.PROMO_BUTTON = "nolimitPromotions";
SkinLoader.LABEL_PLATE_22 = "labelPlate22";
SkinLoader.BUTTON_PLATE_20 = "buttonPlate20";
SkinLoader.BUTTON_STROKE_20 = "buttonStroke20";
SkinLoader.GUIDE_AUTO_PLAY_STOP_YELLOW = "autoPlayStopYellow";
SkinLoader.GUIDE_BOOSTED_BET = "boostedBet";
SkinLoader.GUIDE_COLLECT_AND_SPIN = "collectAndSpin";
SkinLoader.GUIDE_SPIN_BUTTON = "spinButton";
SkinLoader.GUIDE_SPIN_BUTTON_X = "spinButtonX";
SkinLoader.GUIDE_REPLAY = "replay";
SkinLoader.GUIDE_CHECKBOX = "checkBox";
exports.SkinLoader = SkinLoader;
//# sourceMappingURL=SkinLoader.js.map