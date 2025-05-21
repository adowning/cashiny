"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuiDefaultTextures = void 0;
const ImgLoader_1 = require("../../loader/ImgLoader");
/**
 * Class description
 *
 * Created: 2020-03-09
 * @author jonas
 */
class GuiDefaultTextures {
    static makeAssetPath(assetName) {
        return "/node_modules/@nolimitcity/slot-launcher/resources/default/gui/" + assetName;
    }
    static getImgConfigs() {
        return [
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.SOUND_RING),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.SOUND_OFF),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.SOUND_ON),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.NOLIMIT_BONUS_ICON),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.NOLIMIT_BOOSTER_ICON),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.NOLIMIT_BONUS_BET_BACKPLATE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.NOLIMIT_BONUS_CLOSE_BUTTON),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.FEATURE_TICKET_BASE_GOLD),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.FEATURE_TICKET_GOLD),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.FEATURE_TICKET_BASE_SILVER),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.FEATURE_TICKET_SILVER),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.LIMIT_CAP_ON_AMOUNT),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.LIMIT_CAP_OFF_AMOUNT),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.LIMIT_CAP_ON),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.LIMIT_CAP_OFF),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.CHECK_BOX),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.CHECK_BOX_SMALL_EMPTY),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.CHECK_BOX_SMALL_CHECKED),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.MODAL_BACKGROUND),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.PLATE_BASE_9),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.PLATE_STROKE_9),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.PLATE_BASE_9_BLUR_40),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.PLATE_BASE_9_BLUR_20),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.PLATE_BASE_20),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.PLATE_STROKE_20),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.PLATE_BASE_20_BLUR_40),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.BULLET_SMALL),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.BULLET_LARGE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.NAV_ARROW),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.VOL_INSANE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.VOL_EXTREME),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.VOL_HIGH),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.VOL_MEDIUM),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_NUDGE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_WAYS),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_WAYS_INFECTIOUS),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_PAYS),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_BOMB),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_SPLIT),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_REEL_SPLIT),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_SIZE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_BET),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_CLUSTER),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_MOUNT),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_CAP),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_BIZARRE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_ZONE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_GOD),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_HOLE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_RIP),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.SNOW_FLAKE),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.RATED_R),
            new ImgLoader_1.ImgAssetConfig(GuiDefaultTextures.X_NUDGE_SUPER)
        ];
    }
}
GuiDefaultTextures.CHECK_BOX_SMALL_EMPTY = GuiDefaultTextures.makeAssetPath("checkBoxSmallEmpty@2x.png");
GuiDefaultTextures.CHECK_BOX_SMALL_CHECKED = GuiDefaultTextures.makeAssetPath("checkBoxSmallChecked@2x.png");
GuiDefaultTextures.CHECK_BOX = GuiDefaultTextures.makeAssetPath("checkBox@2x.png");
GuiDefaultTextures.SOUND_RING = GuiDefaultTextures.makeAssetPath("ringLoader@2x.png");
GuiDefaultTextures.SOUND_OFF = GuiDefaultTextures.makeAssetPath("soundOff@2x.png");
GuiDefaultTextures.SOUND_ON = GuiDefaultTextures.makeAssetPath("soundOn@2x.png");
//Modal
GuiDefaultTextures.MODAL_BACKGROUND = GuiDefaultTextures.makeAssetPath("modalBackground@2x.png");
//Buttons
GuiDefaultTextures.PLATE_BASE_9 = GuiDefaultTextures.makeAssetPath("plateBase9@2x.png");
GuiDefaultTextures.PLATE_BASE_9_BLUR_20 = GuiDefaultTextures.makeAssetPath("plateBase9blur20@2x.png");
GuiDefaultTextures.PLATE_BASE_9_BLUR_40 = GuiDefaultTextures.makeAssetPath("plateBase9blur40@2x.png");
GuiDefaultTextures.PLATE_STROKE_9 = GuiDefaultTextures.makeAssetPath("plateStroke9@2x.png");
GuiDefaultTextures.PLATE_BASE_20 = GuiDefaultTextures.makeAssetPath("plateBase20@2x.png");
GuiDefaultTextures.PLATE_BASE_20_BLUR_40 = GuiDefaultTextures.makeAssetPath("plateBase20blur40@2x.png");
GuiDefaultTextures.PLATE_STROKE_20 = GuiDefaultTextures.makeAssetPath("plateStroke20@2x.png");
GuiDefaultTextures.BULLET_SMALL = GuiDefaultTextures.makeAssetPath("bulletSmall@2x.png");
GuiDefaultTextures.BULLET_LARGE = GuiDefaultTextures.makeAssetPath("bulletLarge@2x.png");
GuiDefaultTextures.NAV_ARROW = GuiDefaultTextures.makeAssetPath("navArrow@2x.png");
GuiDefaultTextures.VOL_INSANE = GuiDefaultTextures.makeAssetPath("volInsane@2x.png");
GuiDefaultTextures.VOL_EXTREME = GuiDefaultTextures.makeAssetPath("volExtreme@2x.png");
GuiDefaultTextures.VOL_HIGH = GuiDefaultTextures.makeAssetPath("volHigh@2x.png");
GuiDefaultTextures.VOL_MEDIUM = GuiDefaultTextures.makeAssetPath("volMedium@2x.png");
GuiDefaultTextures.X_NUDGE = GuiDefaultTextures.makeAssetPath("xNudge@2x.png");
GuiDefaultTextures.X_WAYS = GuiDefaultTextures.makeAssetPath("xWays@2x.png");
GuiDefaultTextures.X_WAYS_INFECTIOUS = GuiDefaultTextures.makeAssetPath("xWaysInfectious@2x.png");
GuiDefaultTextures.X_PAYS = GuiDefaultTextures.makeAssetPath("xPays@2x.png");
GuiDefaultTextures.X_BOMB = GuiDefaultTextures.makeAssetPath("xBomb@2x.png");
GuiDefaultTextures.X_SPLIT = GuiDefaultTextures.makeAssetPath("xSplit@2x.png");
GuiDefaultTextures.X_REEL_SPLIT = GuiDefaultTextures.makeAssetPath("xReelSplit@2x.png");
GuiDefaultTextures.X_SIZE = GuiDefaultTextures.makeAssetPath("xSize@2x.png");
GuiDefaultTextures.X_BET = GuiDefaultTextures.makeAssetPath("xBet@2x.png");
GuiDefaultTextures.X_CLUSTER = GuiDefaultTextures.makeAssetPath("xCluster@2x.png");
GuiDefaultTextures.X_MOUNT = GuiDefaultTextures.makeAssetPath("xMount@2x.png");
GuiDefaultTextures.X_CAP = GuiDefaultTextures.makeAssetPath("xCap@2x.png");
GuiDefaultTextures.X_BIZARRE = GuiDefaultTextures.makeAssetPath("xBizarre@2x.png");
GuiDefaultTextures.X_ZONE = GuiDefaultTextures.makeAssetPath("xZone@2x.png");
GuiDefaultTextures.X_GOD = GuiDefaultTextures.makeAssetPath("xGod@2x.png");
GuiDefaultTextures.X_HOLE = GuiDefaultTextures.makeAssetPath("xHole@2x.png");
GuiDefaultTextures.X_RIP = GuiDefaultTextures.makeAssetPath("xRip@2x.png");
GuiDefaultTextures.X_NUDGE_SUPER = GuiDefaultTextures.makeAssetPath("xNudgeSuper@2x.png");
GuiDefaultTextures.SNOW_FLAKE = GuiDefaultTextures.makeAssetPath("censoredSnowFlake@2x.png");
GuiDefaultTextures.RATED_R = GuiDefaultTextures.makeAssetPath("ratedR.png");
GuiDefaultTextures.NOLIMIT_BONUS_ICON = GuiDefaultTextures.makeAssetPath("nolimitBonusIcon@2x.png");
GuiDefaultTextures.NOLIMIT_BOOSTER_ICON = GuiDefaultTextures.makeAssetPath("nolimitBoosterIcon@2x.png");
GuiDefaultTextures.NOLIMIT_BONUS_BET_BACKPLATE = GuiDefaultTextures.makeAssetPath("nolimitBonusBetBackPlate@2x.png");
GuiDefaultTextures.NOLIMIT_BONUS_CLOSE_BUTTON = GuiDefaultTextures.makeAssetPath("closeBtn@2x.png");
GuiDefaultTextures.FEATURE_TICKET_BASE_GOLD = GuiDefaultTextures.makeAssetPath("ticketBaseGold@2x.png");
GuiDefaultTextures.FEATURE_TICKET_GOLD = GuiDefaultTextures.makeAssetPath("ticketGold@2x.png");
GuiDefaultTextures.FEATURE_TICKET_BASE_SILVER = GuiDefaultTextures.makeAssetPath("ticketBaseSilver@2x.png");
GuiDefaultTextures.FEATURE_TICKET_SILVER = GuiDefaultTextures.makeAssetPath("ticketSilver@2x.png");
GuiDefaultTextures.LIMIT_CAP_ON_AMOUNT = GuiDefaultTextures.makeAssetPath("limitCapOnAmount@2x.png");
GuiDefaultTextures.LIMIT_CAP_OFF_AMOUNT = GuiDefaultTextures.makeAssetPath("limitCapOffAmount@2x.png");
GuiDefaultTextures.LIMIT_CAP_ON = GuiDefaultTextures.makeAssetPath("limitCapOn@2x.png");
GuiDefaultTextures.LIMIT_CAP_OFF = GuiDefaultTextures.makeAssetPath("limitCapOff@2x.png");
exports.GuiDefaultTextures = GuiDefaultTextures;
//# sourceMappingURL=GuiDefaultTextures.js.map