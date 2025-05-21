/**
 * Created by Jie Gao on 2018-12-12.
 */
import {BetLineEvent} from "@nolimitcity/slot-game/bin/core/betline/event/BetLineEvent";

export class LeprechaunBetlineEvent extends BetLineEvent{
    public static readonly SHOW_WIN_BET_LINE_WINS:string = "betLineEvent_showBetLineWinWinAmount";
    public static readonly SHOW_RAINBOW_NUMBER:string = "betLineEvent_showRainbowNumber";
    public static readonly HIDE_RAINBOW_NUMBER:string = "betLineEvent_hideRainbowNumber";
    public static readonly BET_LINE_SHOWN:string = "betLineEvent_betlineShown";
}