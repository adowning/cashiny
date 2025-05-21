/**
 * Created by Jie Gao on 2019-11-22.
 */
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {LeprechaunGameConfig} from "../game/LeprechaunGameConfig";

export class LeprechaunHelper extends Helper {

    public static getBetlineNumerPos(index:number, side:number):number[] {
        const posY:number[] = [246, 110, 391, 59, 443, 245, 111, 391, 440, 60];
        const rainbowLineNumbersPosY:number[] = [24,  483, 289,206];
        const rightNumberOffset:number[][] = [[0,  0, 0,0,0],[2,-1,  3, 8,2]];
        const posX:number[] = [59, 670];
        const topOffset:number = LeprechaunGameConfig.instance.REEL_AREA_POS_Y;

        if(index < 6) {
            return [posX[side] + rightNumberOffset[side][index-1], topOffset + posY[index + side * 5 - 1]];
        } else {
            return [posX[side], topOffset + rainbowLineNumbersPosY[index - 6]];
        }
    debugger;
        throw new Error('Error: Helper.getBetlineNumerPos(): index ${index} does not contain any betline!');
    }
}