"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsConfig = void 0;
const Asset_1 = require("./Asset");
const TextureAsset_1 = require("./assettypes/TextureAsset");
class AssetsConfig {
    static addToAssetsConfig(value) {
        for (let resourceGroupName in value) {
            if (AssetsConfig._assetsConfig[resourceGroupName]) {
                AssetsConfig._assetsConfig[resourceGroupName] = AssetsConfig._assetsConfig[resourceGroupName].concat(value[resourceGroupName]);
            }
            else {
                AssetsConfig._assetsConfig[resourceGroupName] = value[resourceGroupName];
            }
        }
    }
    static get instance() {
        return AssetsConfig._assetsConfig;
    }
    static getResourcesGroup(resourceGroup) {
        return AssetsConfig._assetsConfig[resourceGroup];
    }
}
AssetsConfig._defaultResources = {
    intro: [
        {
            name: "defaultIntro",
            autoLoad: [Asset_1.AssetQualityLevel.HIGH],
            assets: [
                new TextureAsset_1.TextureAsset("slotGameIntro0", "../node_modules/@nolimitcity/slot-game/resources/sheets/intro/intro0.json")
            ],
            animations: {
                "missingResource": "missing",
                "volatilityExtreme": "volatility_extreme",
                "volatilityHigh": "volatility_high",
                "volatilityMed": "volatility_medium",
                "xNudge": "x_nudge",
                "xWays": "x_ways"
            }
        }
    ],
    main: [
        {
            name: "defaultMain",
            assets: [
                new TextureAsset_1.TextureAsset("slotGameMain0", "../node_modules/@nolimitcity/slot-game/resources/sheets/main/main0.json")
            ],
            animations: {
                "button": "ui/gameTweakerButton/button",
                "button-disabled": "ui/gameTweakerButton/button-disabled"
            }
        }
    ]
};
AssetsConfig._assetsConfig = {
    main: [],
    intro: []
};
exports.AssetsConfig = AssetsConfig;
//# sourceMappingURL=AssetsConfig.js.map