"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetFeatureController = exports.BetFeature = void 0;
const APIEventSystem_1 = require("../../../interfaces/APIEventSystem");
const NolimitApplication_1 = require("../../../NolimitApplication");
const ImgLoader_1 = require("../../../loader/ImgLoader");
class BetFeature {
    get price() {
        return this._api.betLevel.getPriceForFeature(this.name);
    }
    constructor(api, data, displayConfig) {
        this._api = api;
        this.name = data.name;
        this.type = data.type;
        let image = "/nolimit/bonus/" + this.name + ".png";
        this.displayConfig = {
            name: (displayConfig === null || displayConfig === void 0 ? void 0 : displayConfig.displayName) || this.name,
            description: displayConfig === null || displayConfig === void 0 ? void 0 : displayConfig.displayDescription,
            order: (displayConfig === null || displayConfig === void 0 ? void 0 : displayConfig.displayOrder) == undefined ? Number.MAX_VALUE : displayConfig === null || displayConfig === void 0 ? void 0 : displayConfig.displayOrder,
            imageUrl: image,
            forceWarningPopUp: (displayConfig === null || displayConfig === void 0 ? void 0 : displayConfig.forceWarningPopUp) || (displayConfig === null || displayConfig === void 0 ? void 0 : displayConfig.replacePopUpContent) != undefined || false,
            replacePopUpContent: displayConfig === null || displayConfig === void 0 ? void 0 : displayConfig.replacePopUpContent
        };
    }
    /**
     * Returns max possible cost for feature.
     */
    getMaxCost() {
        return this.calculateCost(this.getMaxBet());
    }
    /**
     * Returns max allowed betLevel for this feature
     */
    getMaxBet() {
        return this._api.betLevel.getMaxBetLevelForFeature(this.name);
    }
    /**
     * Returns true if current betlevel is present in the allowedBetlevels for this feature.
     */
    isBetLevelValid() {
        if (this._api.isReplay) {
            return true;
        }
        return this._api.betLevel.isValidBetLevelForFeature(this.name);
    }
    /**
     * Validates both the betlevel and if player has balance for feature.
     */
    isBetLevelAndCostValid() {
        return this.isBetLevelValid() && this.getTotalCost() <= NolimitApplication_1.NolimitApplication.apiPlugin.balance.getAmount();
    }
    /**
     * Calculates total cost for current betlevel.
     */
    getTotalCost() {
        return this.calculateCost(this._api.betLevel.getLevel());
    }
    calculateCost(betLevel) {
        return +((parseFloat(betLevel) * this.price).toFixed(2));
    }
}
exports.BetFeature = BetFeature;
class BetFeatureController {
    get allowedFeatures() {
        const modeName = this._api.betLevel.getSelectedBetLevelModeName();
        const mode = this.gameModes.get(modeName);
        if (mode != undefined) {
            return mode.allowedFeatures;
        }
        throw new Error("Can't find allowedFeatures for mode: " + modeName);
    }
    get notAllowedFeatures() {
        const modeName = this._api.betLevel.getSelectedBetLevelModeName();
        const mode = this.gameModes.get(modeName);
        if (mode != undefined) {
            return mode.notAllowedFeatures;
        }
        throw new Error("Can't find notAllowedFeatures feature for mode: " + modeName);
    }
    constructor(api, gamePlugin) {
        this._hasInit = false;
        this.hasInitCallbacks = [];
        this._api = api;
        this._gamePlugin = gamePlugin;
        this._shouldShowWarning = new Map();
        this._shouldShowWarning.set("DEFAULT", true);
        //this.allowedFeatures = new Map<string,BetFeature>();
        //this.notAllowedFeatures = new Map<string,BetFeature>();
        this.gameModes = new Map();
        this._api.events.once(APIEventSystem_1.APIEvent.ALLOWED_FEATURE_BETS, (data) => {
            this._allowedFeaturesData = data;
            this.constructData();
        });
        this._api.events.once(APIEventSystem_1.APIEvent.INIT, (data) => {
            this._featureBuyTimesBetValue = data.featureBuyTimesBetValue || [];
            this._featureBuyTimesBetValueAll = data.featureBuyTimesBetValueAll || {};
            this._numberOfModes = 0;
            for (let key in this._featureBuyTimesBetValueAll) {
                this._numberOfModes += 1;
            }
            this.constructData();
        });
        this._api.events.once(APIEventSystem_1.APIEvent.PLATFORM_FEATURE_NAME, (data) => {
            this._featureNameOnInit = data;
        });
    }
    /**
     * Constructs the final BetFeature data for all collected data during star-up and initiates asset loading.
     * @private
     */
    constructData() {
        var _a, _b;
        if (this._allowedFeaturesData && this._featureBuyTimesBetValue && this._featureBuyTimesBetValueAll) {
            const gameConfig = ((_a = this._gamePlugin) === null || _a === void 0 ? void 0 : _a.getNolimitBonusDisplayConfiguration) ? (_b = this._gamePlugin) === null || _b === void 0 ? void 0 : _b.getNolimitBonusDisplayConfiguration() : {};
            if (this._numberOfModes > 0 && !Array.isArray(this._allowedFeaturesData)) {
                for (let key in this._featureBuyTimesBetValueAll) {
                    if (this._allowedFeaturesData[key]) {
                        this.gameModes.set(key, this.createGameModeData(this._allowedFeaturesData[key], this._featureBuyTimesBetValueAll[key], gameConfig));
                    }
                }
            }
            else {
                this.gameModes.set("NORMAL", this.createGameModeData(this._allowedFeaturesData, this._featureBuyTimesBetValue, gameConfig));
            }
            this.loadAssets().then(value => {
                this._hasInit = true;
                for (let callback of this.hasInitCallbacks) {
                    callback();
                }
                this.hasInitCallbacks = [];
            });
            delete this._allowedFeaturesData;
            delete this._featureBuyTimesBetValue;
            delete this._featureBuyTimesBetValueAll;
        }
    }
    createGameModeData(allowedFeatures, featureBuyTimesBetValue, gameConfig) {
        const gameMode = {
            allowedFeatures: new Map(),
            notAllowedFeatures: new Map(),
        };
        for (let data of featureBuyTimesBetValue) {
            if (allowedFeatures.indexOf(data.name) > -1) {
                const betFeature = new BetFeature(this._api, data, gameConfig[data.name]);
                gameMode.allowedFeatures.set(data.name, betFeature);
                if (betFeature.displayConfig.forceWarningPopUp) {
                    this._shouldShowWarning.set(data.name, true);
                }
            }
            else {
                const betFeature = new BetFeature(this._api, data, gameConfig[data.name]);
                gameMode.notAllowedFeatures.set(data.name, betFeature);
            }
        }
        return gameMode;
    }
    /**
     * Loads feature images for allowed features.
     * @private
     */
    loadAssets() {
        const imgLoader = new ImgLoader_1.ImgLoader(NolimitApplication_1.NolimitApplication.resourcePath);
        const allAllowedFeatures = new Map();
        this.gameModes.forEach((mode) => {
            mode.allowedFeatures.forEach((feature, key) => {
                allAllowedFeatures.set(key, feature);
            });
        });
        const allSortedFeature = [...allAllowedFeatures.values()].sort((a, b) => {
            return a.displayConfig.order - b.displayConfig.order;
        });
        for (let feature of allSortedFeature) {
            imgLoader.add(feature.name, feature.displayConfig.imageUrl);
        }
        return imgLoader.load();
    }
    /**
     * Marks feature to not display warning again this session.
     * @param name
     */
    dontShowWarningNextTime(name) {
        if (this._shouldShowWarning.has(name)) {
            this._shouldShowWarning.set(name, false);
        }
        else {
            this._shouldShowWarning.set("DEFAULT", false);
        }
    }
    /**
     *
     * @param name
     * @returns if warning pop-up should be shown for feature with this name
     */
    shouldShowWarningPopUp(name) {
        let should = this._shouldShowWarning.get(name);
        if (should != undefined) {
            return should;
        }
        else {
            return this.shouldShowWarningPopUp("DEFAULT");
        }
    }
    /**
     *
     * @param name
     * @returns true if feature is allowed
     */
    isFeatureAllowed(name) {
        return this.allowedFeatures.has(name);
    }
    /**
     * @returns all NOT allowed features
     */
    getNotAllowedFeatures() {
        return [...this.notAllowedFeatures.values()];
    }
    /**
     * @returns all ALLOWED features sorted by displayOrder (if set in configuration, else it's the order it was served from platform)
     */
    getAllowedFeatures() {
        return [...this.allowedFeatures.values()].sort((a, b) => {
            return a.displayConfig.order - b.displayConfig.order;
        });
    }
    /**
     *
     * @param name
     * @return BetFeature if it is exist and is allowed. Else undefined
     */
    getFeatureData(name) {
        return this.allowedFeatures.get(name);
    }
    /**
     * @returns Currently active BetFeature if any. Otherwhise undefined.
     */
    getActiveBetFeature() {
        return this.activeBetFeature;
    }
    /**
     * Set the current active feature by name.
     * Will trigger APIEvent.SELECTED_FEATURE_BET_CHANGED if not this feature is already set.
     *
     * @param name Feature name
     */
    setActiveBetFeature(name = "") {
        const newFeature = this.allowedFeatures.get(name);
        if (this.activeBetFeature != newFeature) {
            if (newFeature == undefined || newFeature.isBetLevelAndCostValid()) {
                this.activeBetFeature = newFeature;
                this._api.events.trigger(APIEventSystem_1.APIEvent.SELECTED_FEATURE_BET_CHANGED);
            }
        }
    }
    /**
     * Called by Api when game starts. Sets current active if it's a restore state with a active bet feature.
     */
    start() {
        if (this._featureNameOnInit) {
            this.setActiveBetFeature(this._featureNameOnInit);
            delete this._featureNameOnInit;
        }
    }
    /**
     * @returns Promise that resolves when it's initiated and all data is collected and assets loaded.
     */
    hasInit() {
        if (this._hasInit) {
            return Promise.resolve(true);
        }
        return new Promise((resolve, reject) => {
            this.hasInitCallbacks.push(() => {
                resolve(true);
            });
        });
    }
}
exports.BetFeatureController = BetFeatureController;
//# sourceMappingURL=BetFeatureController.js.map