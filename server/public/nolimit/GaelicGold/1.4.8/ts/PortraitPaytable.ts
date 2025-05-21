/**
 * Created by Jie Gao on 2018-11-09.
 */
import {IResizeData, StageManager} from "@nolimitcity/slot-game/bin/core/stage/StageManager";
import {GameResources} from "@nolimitcity/slot-game/bin/core/resource/GameResources";
import {Helper} from "@nolimitcity/slot-game/bin/core/utils/Helper";
import {GameConfig} from "@nolimitcity/slot-game/bin/core/gameconfig/GameConfig";
import {LeprechaunGameConfig} from "../../LeprechaunGameConfig";
import {Orientation} from "@nolimitcity/slot-game/bin/core/stage/Orientation";
import {MathHelper} from "@nolimitcity/slot-game/bin/core/utils/MathHelper";
import {MiniPayTable, miniPaytableSymbol} from "./MiniPayTable";

export class PortraitPaytable extends MiniPayTable {

    constructor(config:any) {
        super(config);
    }

    protected onResize(data:IResizeData):void {
        super.onResize(data);
        if(data.orientation != Orientation.PORTRAIT) {
            StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.FOREGROUND.name).removeChild(this);
            return;
        }
        this._wrapper.scale.set(1,1);
        const isIPad:boolean = data.width / data.height >= 0.73;
        const scale:number = (isIPad ? 0.8 : 1);
        StageManager.getLayer(LeprechaunGameConfig.instance.LAYERS.FOREGROUND.name).addChild(this);
        const width:number = GameConfig.instance.SYMBOL_WIDTH;
        const height:number = GameConfig.instance.SYMBOL_HEIGHT;
        const x0:number = Helper.getSymbolPositions(0, 0)[0];
        const y0:number = Helper.getSymbolPositions(0, 0)[1];
        this._wrapper.scale.set(scale, scale);
        this._wrapper.x = x0 - width * 0.87 + (isIPad ? 70 : 0) + 6;
        this._wrapper.y = y0 - 1.8 * height + (isIPad ? 40 : 0);
        this._panel.y = 0;
        this._symbolSprites.forEach((symbolSprite:miniPaytableSymbol, i:number) => {
            symbolSprite.symbol.x = 70 + i * 120;
            symbolSprite.symbol.y = 60;
        });
    }
}