"use strict";
/**
 * Created by Pankaj on 2019-12-26.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayURLConfig = void 0;
class ReplayURLConfig {
}
ReplayURLConfig.BASE_PATH = "api/top10/";
ReplayURLConfig.BASE_URL_DEFAULT = "https://replay.nolimitcity.com/";
ReplayURLConfig.TOP_X_BET_URL = "multiplier";
ReplayURLConfig.TOP_MONETARY_URL = "monetary";
ReplayURLConfig.GAME_SPECIFIC_URL = "/game/";
ReplayURLConfig.OPERATOR_SPECIFIC_URL = "/operator/";
exports.ReplayURLConfig = ReplayURLConfig;
/*
Top xbet for all games: https://replay.nolimitcity.com/api/top10/multiplier
Top monetary for all games: https://replay.nolimitcity.com/api/top10/monetary
Top xbet for specific game: https://replay.nolimitcity.com/api/top10/multiplier/game/<game name>
Top monetary for specific game: https://replay.nolimitcity.com/api/top10/monetary/game/<game name>

If it needs to be filtered on operator level as well add a /operator/<operator name> after multiplier or monetary. E.g https://replay.nolimitcity.com/api/top10/multiplier/operator/<operator name>/game/<game name>.
* */
//https://replay-test.nolimitcity.com/api/top10/multiplier
//https://replay-test.nolimitcity.com/api/top10/player/
//# sourceMappingURL=ReplayURLConfig.js.map