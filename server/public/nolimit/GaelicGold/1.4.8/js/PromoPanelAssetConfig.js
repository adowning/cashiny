"use strict";
/**
 * Created by Pankaj on 2019-12-11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoPanelAssetConfig = exports.PromoAsset = exports.PromoPanelAsset = void 0;
class PromoPanelAsset {
    constructor(name, height, width, url) {
        this.name = name;
        this.url = url ? url : PromoPanelAssetConfig.makeAssetPath(name);
        this.height = height;
        this.width = width;
    }
}
exports.PromoPanelAsset = PromoPanelAsset;
class PromoAsset {
    constructor(name, url) {
        this.name = name;
        this.url = url ? url : PromoPanelAssetConfig.makeAssetPath(name);
    }
}
exports.PromoAsset = PromoAsset;
class PromoPanelAssetConfig {
    static getIntroAssets() {
        return [
            new PromoAsset(PromoPanelAssetConfig.INTRO_NOLIMIT_WINNERS),
            new PromoAsset(PromoPanelAssetConfig.INTRO_NOLIMIT_BONUS_PRICE_TAG),
            new PromoAsset(PromoPanelAssetConfig.INTRO_NOLIMIT_BONUS_TICKET),
            new PromoAsset(PromoPanelAssetConfig.INTRO_NO_LIMIT_PROMOTIONS_TAB),
            new PromoAsset(PromoPanelAssetConfig.INTRO_ACTION_SPINS),
        ];
    }
    static getNolimitBonusAssets() {
        return [
            new PromoAsset(PromoPanelAssetConfig.BET_DOWN),
            new PromoAsset(PromoPanelAssetConfig.BET_UP),
            new PromoAsset(PromoPanelAssetConfig.BET_PANEL_BG),
            new PromoAsset(PromoPanelAssetConfig.BUY_BTN),
            new PromoAsset(PromoPanelAssetConfig.TICKET),
        ];
    }
    static getNavigationAssets() {
        return [
            new PromoAsset(PromoPanelAssetConfig.NAV_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.NAV_NOLIMIT_BONUS),
            new PromoAsset(PromoPanelAssetConfig.NAV_NOLIMIT_WINNERS),
            new PromoAsset(PromoPanelAssetConfig.NAV_NOLIMIT_WINNERS_DISABLED),
            new PromoAsset(PromoPanelAssetConfig.NAV_ACTION_SPINS),
            new PromoAsset(PromoPanelAssetConfig.NAV_VOUCHER_DISABLED),
            new PromoAsset(PromoPanelAssetConfig.CLOSE),
            new PromoAsset(PromoPanelAssetConfig.CLOSE_BG_ICON),
            new PromoAsset(PromoPanelAssetConfig.NAV_BG_LANDSCAPE),
            new PromoAsset(PromoPanelAssetConfig.NAV_BG_PORTRAIT),
            new PromoAsset(PromoPanelAssetConfig.NOLIMIT_PROMOTIONS_LOGO),
            new PromoAsset(PromoPanelAssetConfig.TOP_BAR),
        ];
    }
    static getActionSpinsAssets() {
        return [
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_MASK),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_INACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_OUTLINE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_PLATE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_BUY_BTN),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_GAME_CHECK_BOX_INACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_GAME_CHECK_BOX_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_SETTING_BTN),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_PICK_POPUP_OPTION_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_PICK_POPUP_OPTION_IN_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_PICK_POPUP_MASK),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_MENU_BET),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_TOTAL_BET),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_WIN),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_PROFIT),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_BTN_PLAY),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_BTN_PAUSE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_FEED_BG),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_BG_LANDSCAPE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_REPLAY_BTN),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_REPLAY_DISABLED_BTN),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_GAME_PLAY_BTN),
            new PromoAsset(PromoPanelAssetConfig.GAME_FEED_OK),
            new PromoAsset(PromoPanelAssetConfig.GAME_FEED_CANCEL),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_GAME_CONTINUE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_GAME_CONTINUE_SMALL),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_EXPAND),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_INFO_BG_LANDSCAPE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_INFO_BG),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_REPLAY_INFO_BG_SMALL),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_SORT_ARROW_RIGHT),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_SORT_ARROW_DOWN),
        ];
    }
    static getActionSpinsGameFeedAssets() {
        return [
            new PromoAsset(PromoPanelAssetConfig.BONUS_ROUND_OUTLINE),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_ROUNDS_NUMBER_BG),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_PLAYED_ROUNDS_BG),
            new PromoAsset(PromoPanelAssetConfig.GAME_FEED_BONUS_INFO_BG),
            new PromoAsset(PromoPanelAssetConfig.BONUS_ROUND_BONUS_SUMMARY),
        ];
    }
    static getCommonAssets() {
        return [
            new PromoAsset(PromoPanelAssetConfig.GAME_TYPE_INACTIVE),
            new PromoAsset(PromoPanelAssetConfig.GAME_TYPE_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.NOLIMIT_BONUS_ICON),
            new PromoAsset(PromoPanelAssetConfig.ACTION_SPINS_ICON),
            new PromoAsset(PromoPanelAssetConfig.BUTTON_PLATE_20),
            new PromoAsset(PromoPanelAssetConfig.BUTTON_STROKE_20),
            new PromoAsset(PromoPanelAssetConfig.NOLIMIT_WINNERS_ICON),
            new PromoAsset(PromoPanelAssetConfig.LOADING_CIRCLE),
            new PromoAsset(PromoPanelAssetConfig.POP_UP_BG),
        ];
    }
    static getNolimitWinnersAssets() {
        return [
            new PromoAsset(PromoPanelAssetConfig.ALL_PLAYER_INACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ALL_PLAYER_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.PLAYER_ACTIVE),
            new PromoAsset(PromoPanelAssetConfig.PLAYER_INACTIVE),
            new PromoAsset(PromoPanelAssetConfig.ROUND_INFO_BONUS_BUY_ICON),
            new PromoAsset(PromoPanelAssetConfig.ROUND_INFO_ACTION_SPINS_ICON),
            new PromoAsset(PromoPanelAssetConfig.REPLAY_BUTTON),
            new PromoAsset(PromoPanelAssetConfig.TROPHY_BRONZE),
            new PromoAsset(PromoPanelAssetConfig.TROPHY_GOLD),
            new PromoAsset(PromoPanelAssetConfig.TROPHY_SILVER),
            new PromoAsset(PromoPanelAssetConfig.INFO_BG),
            new PromoAsset(PromoPanelAssetConfig.REPLAY_WIN_BUTTON),
            new PromoAsset(PromoPanelAssetConfig.REPLAY_WIN_BUTTON_ACTIVE),
        ];
    }
    static getIconResourcePath() {
        return "/node_modules/@nolimitcity/promo-panel/resources/default/";
    }
    static getGameResourcePath() {
        return "/nolimit/promo-panel/";
    }
    static getGameResourcePathForActionSpins() {
        return "/nolimit/promo-panel/action-spins/";
    }
    static makeAssetPath(asset) {
        return PromoPanelAssetConfig.getIconResourcePath() + "icons/" + asset;
    }
    static getConfigs() {
        return [];
    }
}
//Common assets
PromoPanelAssetConfig.NOLIMIT_BONUS_ICON = "nolimitBonus/nolimitBonusIcon@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_ICON = "nolimitActionSpins/actionSpinsIcon@2x.png";
PromoPanelAssetConfig.NOLIMIT_WINNERS_ICON = "nolimitWinners/nolimitWinnersIcon@2x.png";
PromoPanelAssetConfig.GAME_TYPE_INACTIVE = "common/gameTypeInactive@2x.png";
PromoPanelAssetConfig.GAME_TYPE_ACTIVE = "common/gameTypeActive@2x.png";
PromoPanelAssetConfig.BUTTON_PLATE_20 = "buttonPlate20@2x.png";
PromoPanelAssetConfig.BUTTON_STROKE_20 = "buttonStroke20@2x.png";
PromoPanelAssetConfig.LOADING_CIRCLE = "loadingCircle@2x.png";
PromoPanelAssetConfig.ALL_PLAYER_INACTIVE = "nolimitWinners/allPlayerInactive@2x.png";
PromoPanelAssetConfig.POP_UP_BG = "nolimitBonus/popUpBackground@2x.png";
//Intro assets
PromoPanelAssetConfig.INTRO_NOLIMIT_WINNERS = "introSplash/introSplashPrize@2x.png";
PromoPanelAssetConfig.INTRO_NOLIMIT_BONUS_PRICE_TAG = "introSplash/introSplashxBet@2x.png";
PromoPanelAssetConfig.INTRO_NOLIMIT_BONUS_TICKET = "introSplash/introSplashTicket@2x.png";
PromoPanelAssetConfig.INTRO_NO_LIMIT_PROMOTIONS_TAB = "introSplash/nolimitPromotionsTab@2x.png";
PromoPanelAssetConfig.INTRO_ACTION_SPINS = "introSplash/introSplashActionSpins@2x.png";
//Nolimit Bonus assets
PromoPanelAssetConfig.BET_DOWN = "nolimitBonus/betDown@2x.png";
PromoPanelAssetConfig.BET_UP = "nolimitBonus/betUp@2x.png";
PromoPanelAssetConfig.BET_PANEL_BG = "nolimitBonus/betPanelBackground@2x.png";
//public static NOLIMIT_BONUS_POP_UP_BG_FOOTER = "nolimitBonus/popUpFooterBonus@2x.png";
PromoPanelAssetConfig.BUY_BTN = "nolimitBonus/buyBtn@2x.png"; //used in launcher so have to place in icon folder TODO -fix this somehow.
PromoPanelAssetConfig.TICKET = "nolimitBonus/ticket@2x.png"; //used in Launcher so have to place in icon folder TODO -fix this somehow.
//Menu nav icons
PromoPanelAssetConfig.NAV_ACTIVE = "navigation/navActive@2x.png";
PromoPanelAssetConfig.NAV_NOLIMIT_BONUS = "navigation/featureIcons/navNolimitBonus@2x.png";
PromoPanelAssetConfig.NAV_NOLIMIT_WINNERS = "navigation/featureIcons/navNolimitWinners@2x.png";
PromoPanelAssetConfig.NAV_NOLIMIT_WINNERS_DISABLED = "navigation/featureIcons/navNolimitWinnersDisabled@2x.png";
PromoPanelAssetConfig.NAV_ACTION_SPINS = "navigation/featureIcons/navActionSpins@2x.png";
PromoPanelAssetConfig.NAV_VOUCHER_DISABLED = "navigation/featureIcons/navVoucherDisabled@2x.png";
//Unused but existing
//public static NAV_TOURNAMENTS = "navigation/featureIcons/navTournamentsDisabled@2x.png";
//public static NAV_ACTION_SPINS_DISABLED = "navigation/featureIcons/navActionSpinsDisabled@2x.png";
//Nav menu graphics
PromoPanelAssetConfig.CLOSE = "navigation/close@2x.png";
PromoPanelAssetConfig.CLOSE_BG_ICON = "navigation/closeBg@2x.png";
PromoPanelAssetConfig.NOLIMIT_PROMOTIONS_LOGO = "navigation/nolimitPromotion@2x.png";
PromoPanelAssetConfig.NAV_BG_LANDSCAPE = "navigation/navBarLandscape@2x.png";
PromoPanelAssetConfig.NAV_BG_PORTRAIT = "navigation/navBarPortrait@2x.png";
PromoPanelAssetConfig.TOP_BAR = "navigation/topBar@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_BUY_BTN = "nolimitActionSpins/buyBtn@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_GAME_CHECK_BOX_INACTIVE = "nolimitActionSpins/checkBoxInactive@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_GAME_CHECK_BOX_ACTIVE = "nolimitActionSpins/checkBoxActive@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_SETTING_BTN = "nolimitActionSpins/settings@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_PICK_POPUP_OPTION_ACTIVE = "nolimitActionSpins/optionActive@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_PICK_POPUP_OPTION_IN_ACTIVE = "nolimitActionSpins/optionInactive@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_PICK_POPUP_MASK = "nolimitActionSpins/popUpChoice@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_MENU_BET = "nolimitActionSpins/gameFeed/menuBet@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_TOTAL_BET = "nolimitActionSpins/gameFeed/menuTotalBet@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_WIN = "nolimitActionSpins/gameFeed/menuWin@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_MENU_PROFIT = "nolimitActionSpins/gameFeed/menuProfit@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_BTN_PLAY = "nolimitActionSpins/gameFeed/play@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_BTN_PAUSE = "nolimitActionSpins/gameFeed/pause@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_FEED_BG = "nolimitActionSpins/gameFeed/gameFeedBg@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_BG_LANDSCAPE = "nolimitActionSpins/gameFeed/gameFeedBgLandscape@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_REPLAY_BTN = "nolimitActionSpins/gameFeed/gameReplay@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_REPLAY_DISABLED_BTN = "nolimitActionSpins/gameFeed/gameReplayDisabled@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_GAME_PLAY_BTN = "nolimitActionSpins/gameFeed/gamePlay@2x.png";
PromoPanelAssetConfig.GAME_FEED_OK = "nolimitActionSpins/gameFeed/ok@2x.png";
PromoPanelAssetConfig.GAME_FEED_CANCEL = "nolimitActionSpins/gameFeed/cancel@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_GAME_CONTINUE = "nolimitActionSpins/gameFeed/gameContinue@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_GAME_CONTINUE_SMALL = "nolimitActionSpins/gameFeed/gameContinueSmall@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_GAME_EXPAND = "nolimitActionSpins/gameFeed/gameExpand@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_INFO_BG_LANDSCAPE = "nolimitActionSpins/gameFeed/infoBarLandscape@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_INFO_BG = "nolimitActionSpins/gameFeed/infoBarBg@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_REPLAY_INFO_BG_SMALL = "nolimitActionSpins/gameFeed/infoBarBgSmall@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_MASK = "nolimitActionSpins/gameOptionMask@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_ACTIVE = "nolimitActionSpins/gameOptionActive@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_INACTIVE = "nolimitActionSpins/gameOptionInactive@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_OUTLINE = "nolimitActionSpins/gameOptionOutline@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_OPTIONS_BUTTON_PLATE = "nolimitActionSpins/gameOptionPlate@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_SORT_ARROW_RIGHT = "nolimitActionSpins/gameFeed/sortArrowRight@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_SORT_ARROW_DOWN = "nolimitActionSpins/gameFeed/sortArrowDown@2x.png";
PromoPanelAssetConfig.BONUS_ROUND_OUTLINE = "nolimitActionSpins/gameFeed/bonusOutline@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_ROUNDS_NUMBER_BG = "nolimitActionSpins/gameFeed/spinNumberBg@2x.png";
PromoPanelAssetConfig.ACTION_SPINS_PLAYED_ROUNDS_BG = "nolimitActionSpins/gameFeed/playedRoundsBg@2x.png";
PromoPanelAssetConfig.GAME_FEED_BONUS_INFO_BG = "nolimitActionSpins/gameFeed/bonusInfoBg@2x.png";
PromoPanelAssetConfig.BONUS_ROUND_BONUS_SUMMARY = "nolimitActionSpins/gameFeed/lineBonusSummary@2x.png";
PromoPanelAssetConfig.ALL_PLAYER_ACTIVE = "nolimitWinners/allPlayersActive@2x.png";
PromoPanelAssetConfig.PLAYER_ACTIVE = "nolimitWinners/playerActive@2x.png";
PromoPanelAssetConfig.PLAYER_INACTIVE = "nolimitWinners/playerInactive@2x.png";
PromoPanelAssetConfig.ROUND_INFO_BONUS_BUY_ICON = "nolimitWinners/nolimitWinners_bonusIcon@2x.png";
PromoPanelAssetConfig.ROUND_INFO_ACTION_SPINS_ICON = "nolimitWinners/nolimitWinners_actionSpinsIcon@2x.png";
PromoPanelAssetConfig.REPLAY_BUTTON = "nolimitWinners/replayButton@2x.png";
PromoPanelAssetConfig.TROPHY_BRONZE = "nolimitWinners/trophyBronze@2x.png";
PromoPanelAssetConfig.TROPHY_GOLD = "nolimitWinners/trophyGold@2x.png";
PromoPanelAssetConfig.TROPHY_SILVER = "nolimitWinners/trophySilver@2x.png";
PromoPanelAssetConfig.INFO_BG = "nolimitWinners/infoBg@2x.png";
PromoPanelAssetConfig.REPLAY_WIN_BUTTON = "nolimitWinners/winBetBtn@2x.png";
PromoPanelAssetConfig.REPLAY_WIN_BUTTON_ACTIVE = "nolimitWinners/winBetBtnActive@2x.png";
PromoPanelAssetConfig.BET_PANEL_HEIGHT = 165;
PromoPanelAssetConfig.NO_LIMIT_PROMOTIONS_HEIGHT = 60;
PromoPanelAssetConfig.BET_BG_WIDTH = 632;
PromoPanelAssetConfig.GAME_FEATURE_MASK_WIDTH = 342;
exports.PromoPanelAssetConfig = PromoPanelAssetConfig;
//# sourceMappingURL=PromoPanelAssetConfig.js.map